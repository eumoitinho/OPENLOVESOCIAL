import { createRouteHandlerClient, createSupabaseAdmin } from '@/app/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export interface VerificationContext {
  user: {
    id: string
    auth_id: string
    username: string
    is_verified: boolean
    is_premium: boolean
    role: string
    premium_type?: string
    premium_status?: string
  }
  isVerified: boolean
  canPerformAction: boolean
  restrictedActions: string[]
}

// Default restricted actions that require verification
const DEFAULT_RESTRICTED_ACTIONS = [
  'post_media',
  'create_community', 
  'create_event',
  'premium_content',
  'monetization'
]

// Actions that are always allowed for authenticated users
const ALWAYS_ALLOWED_ACTIONS = [
  'comment',
  'message',
  'like',
  'save',
  'follow',
  'read'
]

/**
 * Middleware to check user verification status and permissions
 */
export async function verifyUserForAction(
  request: NextRequest,
  requiredAction: string
): Promise<{ context: VerificationContext | null; error: NextResponse | null }> {
  try {
    const supabase = await createRouteHandlerClient()
    const supabaseAdmin = createSupabaseAdmin()

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

    // Get current user from database using admin client to bypass RLS
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, is_verified, is_premium, role, premium_type, premium_status')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      console.error('User lookup error:', userError)
      return {
        context: null,
        error: NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
    }

    // Determine if action is allowed
    const isAlwaysAllowed = ALWAYS_ALLOWED_ACTIONS.includes(requiredAction)
    const isRestricted = DEFAULT_RESTRICTED_ACTIONS.includes(requiredAction)
    const isAdmin = currentUser.role === 'admin'
    const isVerified = currentUser.is_verified || false
    
    // Determine if user can perform action
    let canPerform = true
    
    if (!isAdmin && !isAlwaysAllowed && isRestricted && !isVerified) {
      canPerform = false
    }

    const context: VerificationContext = {
      user: {
        id: currentUser.id,
        auth_id: user.id,
        username: currentUser.username,
        is_verified: currentUser.is_verified || false,
        is_premium: currentUser.is_premium || false,
        role: currentUser.role || 'user',
        premium_type: currentUser.premium_type || null,
        premium_status: currentUser.premium_status || 'inactive'
      },
      isVerified: isVerified,
      canPerformAction: canPerform,
      restrictedActions: DEFAULT_RESTRICTED_ACTIONS
    }

    // If user cannot perform action, return verification error
    if (!canPerform) {
      return {
        context,
        error: NextResponse.json(
          { 
            error: 'Verificação necessária',
            message: `Para ${getActionDescription(requiredAction)}, você precisa verificar seu perfil`,
            verification_required: true,
            restricted_action: requiredAction,
            verification_url: '/verification',
            user_status: {
              is_verified: isVerified,
              is_premium: currentUser.is_premium,
              role: currentUser.role
            }
          },
          { status: 403 }
        )
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
    const supabaseAdmin = createSupabaseAdmin()

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

    // Get current user from database using admin client
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, is_verified, is_premium, role, premium_type, premium_status')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      console.error('User lookup error in requireVerification:', userError)
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
    }

    // Check if user is verified (admins bypass this check)
    const isVerified = currentUser.is_verified || false
    const isAdmin = currentUser.role === 'admin'
    
    if (!isVerified && !isAdmin) {
      return {
        user: currentUser,
        error: NextResponse.json(
          { 
            error: 'Verificação de perfil necessária',
            message: 'Você precisa verificar seu perfil para realizar esta ação',
            verification_required: true,
            verification_url: '/verification',
            user_status: {
              is_verified: isVerified,
              is_premium: currentUser.is_premium,
              role: currentUser.role
            }
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
    const supabaseAdmin = createSupabaseAdmin()

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, is_verified, is_premium, role, premium_type, premium_status')
      .eq('id', userId)
      .single()

    if (error || !user) {
      console.error('Error getting user verification status:', error)
      return {
        is_verified: false,
        is_premium: false,
        role: 'user',
        premium_type: null,
        premium_status: 'inactive',
        current_request: null,
        total_attempts: 0,
        max_attempts: 3,
        restricted_actions: DEFAULT_RESTRICTED_ACTIONS,
        can_request_verification: true
      }
    }

    // Try to get verification request info, but don't fail if table doesn't exist
    let currentRequest = null
    let totalAttempts = 0

    try {
      const { data: currentReq } = await supabaseAdmin
        .from('verification_requests')
        .select('id, status, expires_at, attempt_number')
        .eq('user_id', userId)
        .in('status', ['pending', 'submitted'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      currentRequest = currentReq

      const { count } = await supabaseAdmin
        .from('verification_requests')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      totalAttempts = count || 0
    } catch (verificationError) {
      console.log('Verification tables not available, using defaults')
    }

    return {
      is_verified: user.is_verified || false,
      is_premium: user.is_premium || false,
      role: user.role || 'user',
      premium_type: user.premium_type || null,
      premium_status: user.premium_status || 'inactive',
      current_request: currentRequest,
      total_attempts: totalAttempts,
      max_attempts: 3,
      restricted_actions: DEFAULT_RESTRICTED_ACTIONS,
      can_request_verification: totalAttempts < 3 && !currentRequest
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