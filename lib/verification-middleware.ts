import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export interface VerificationContext {
  user: {
    id: string
    auth_id: string
    username: string
    is_verified: boolean
    is_premium: boolean
    role: string
  }
  isVerified: boolean
  canPerformAction: boolean
  restrictedActions: string[]
}

/**
 * Middleware to check user verification status and permissions
 */
export async function verifyUserForAction(
  request: NextRequest,
  requiredAction: string
): Promise<{ context: VerificationContext | null; error: NextResponse | null }> {
  try {
    const supabase = await createRouteHandlerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, username, is_verified, is_premium, role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
    }

    // Temporarily bypass verification system for basic operations
    const canPerform = true // Allow all actions for now
    const restrictedActions: string[] = [] // No restricted actions for now

    const context: VerificationContext = {
      user: {
        id: currentUser.id,
        auth_id: user.id,
        username: currentUser.username,
        is_verified: currentUser.is_verified,
        is_premium: currentUser.is_premium,
        role: currentUser.role
      },
      isVerified: currentUser.is_verified,
      canPerformAction: canPerform,
      restrictedActions
    }

    // If user cannot perform action, return verification error
    if (!canPerform) {
      const isActionRestricted = restrictedActions.includes(requiredAction)
      
      if (isActionRestricted && !currentUser.is_verified) {
        return {
          context,
          error: NextResponse.json(
            { 
              error: 'Perfil não verificado',
              message: 'Esta ação requer verificação de perfil',
              verification_required: true,
              restricted_action: requiredAction,
              verification_url: '/verification'
            },
            { status: 403 }
          )
        }
      }
    }

    return { context, error: null }

  } catch (error) {
    console.error('Verification middleware error:', error)
    return {
      context: null,
      error: NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Check if user is verified (simplified version)
 */
export async function requireVerification(
  request: NextRequest
): Promise<{ user: any; error: NextResponse | null }> {
  try {
    const supabase = await createRouteHandlerClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, username, is_verified, is_premium, role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
    }

    // Check if user is verified (admins bypass this check)
    if (!currentUser.is_verified && currentUser.role !== 'admin') {
      return {
        user: currentUser,
        error: NextResponse.json(
          { 
            error: 'Verificação de perfil necessária',
            message: 'Você precisa verificar seu perfil para realizar esta ação',
            verification_required: true,
            verification_url: '/verification'
          },
          { status: 403 }
        )
      }
    }

    return { user: currentUser, error: null }

  } catch (error) {
    console.error('Require verification error:', error)
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Get user verification status for frontend
 */
export async function getUserVerificationStatus(userId: string) {
  try {
    const supabase = await createRouteHandlerClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('id, is_verified, is_premium, role')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return null
    }

    // Get current verification request if exists
    const { data: currentRequest } = await supabase
      .from('verification_requests')
      .select('id, status, expires_at, attempt_number')
      .eq('user_id', userId)
      .in('status', ['pending', 'submitted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get total attempts
    const { count: totalAttempts } = await supabase
      .from('verification_requests')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    // Get restricted actions
    const { data: settings } = await supabase
      .from('verification_settings')
      .select('setting_value')
      .eq('setting_key', 'verification_required_actions')
      .single()

    const restrictedActions = settings?.setting_value ? 
      JSON.parse(settings.setting_value) : []

    return {
      is_verified: user.is_verified,
      is_premium: user.is_premium,
      role: user.role,
      current_request: currentRequest,
      total_attempts: totalAttempts || 0,
      max_attempts: 3,
      restricted_actions: restrictedActions,
      can_request_verification: (totalAttempts || 0) < 3 && !currentRequest
    }

  } catch (error) {
    console.error('Get verification status error:', error)
    return null
  }
}

/**
 * Utility function to check if action requires verification
 */
export function actionRequiresVerification(action: string, restrictedActions: string[]): boolean {
  return restrictedActions.includes(action)
}

/**
 * Generate verification error response
 */
export function createVerificationErrorResponse(action: string, redirectUrl = '/verification') {
  return NextResponse.json(
    {
      error: 'Verificação necessária',
      message: `Para ${getActionDescription(action)}, você precisa verificar seu perfil`,
      verification_required: true,
      restricted_action: action,
      verification_url: redirectUrl
    },
    { status: 403 }
  )
}

/**
 * Get user-friendly action descriptions
 */
function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    comment: 'comentar em posts',
    message: 'enviar mensagens',
    media_upload: 'fazer upload de fotos e vídeos',
    event_create: 'criar eventos',
    community_create: 'criar comunidades',
    post_media: 'postar mídia'
  }

  return descriptions[action] || `realizar a ação: ${action}`
}