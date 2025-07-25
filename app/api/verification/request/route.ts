import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, username, name, is_verified')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (currentUser.is_verified) {
      return NextResponse.json(
        { error: 'Usuário já está verificado' },
        { status: 400 }
      )
    }

    // Check for active requests
    const { data: activeRequest, error: activeError } = await supabase
      .from('verification_requests')
      .select('id, status, expires_at, attempt_number')
      .eq('user_id', currentUser.id)
      .in('status', ['pending', 'submitted'])
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (activeRequest && !activeError) {
      return NextResponse.json(
        { 
          error: 'Você já tem uma solicitação de verificação ativa',
          active_request: {
            id: activeRequest.id,
            status: activeRequest.status,
            expires_at: activeRequest.expires_at,
            attempt_number: activeRequest.attempt_number
          }
        },
        { status: 409 }
      )
    }

    // Check attempt limits
    const { data: attemptCount, error: countError } = await supabase
      .from('verification_requests')
      .select('id', { count: 'exact' })
      .eq('user_id', currentUser.id)

    if (countError) {
      console.error('Error checking attempt count:', countError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    const totalAttempts = attemptCount || 0
    if (totalAttempts >= 3) {
      return NextResponse.json(
        { 
          error: 'Limite de tentativas excedido. Entre em contato com o suporte.',
          max_attempts_reached: true
        },
        { status: 429 }
      )
    }

    // Generate verification code using database function
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_verification_code', { p_user_id: currentUser.id })

    if (codeError || !codeData) {
      console.error('Error generating verification code:', codeError)
      return NextResponse.json(
        { error: 'Erro ao gerar código de verificação' },
        { status: 500 }
      )
    }

    // Create verification request
    const { data: verificationRequest, error: createError } = await supabase
      .from('verification_requests')
      .insert({
        user_id: currentUser.id,
        verification_code: codeData.code,
        required_text: codeData.required_text,
        day_of_week: codeData.day_of_week,
        attempt_number: totalAttempts + 1,
        total_attempts: totalAttempts,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating verification request:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar solicitação de verificação' },
        { status: 500 }
      )
    }

    // Log verification request creation in history
    await supabase
      .from('verification_history')
      .insert({
        user_id: currentUser.id,
        request_id: verificationRequest.id,
        action: 'code_generated',
        details: {
          code_generated: codeData.code,
          required_text: codeData.required_text,
          day_of_week: codeData.day_of_week,
          attempt_number: totalAttempts + 1
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    // Return success response with instructions
    return NextResponse.json({
      success: true,
      data: {
        request_id: verificationRequest.id,
        verification_code: codeData.code,
        required_text: codeData.required_text,
        day_of_week: codeData.day_of_week,
        expires_at: verificationRequest.expires_at,
        attempt_number: totalAttempts + 1,
        instructions: [
          `1. Escreva o texto "${codeData.required_text}" em um papel ou cartão`,
          '2. Tire uma foto segurando o papel próximo ao seu rosto',
          '3. Certifique-se de que tanto você quanto o texto estejam claramente visíveis',
          '4. A foto deve ser nítida e bem iluminada',
          '5. Faça upload da foto usando o botão abaixo',
          '6. Aguarde a aprovação da nossa equipe (até 48 horas)'
        ],
        restrictions: [
          'Perfis não verificados não podem comentar em posts',
          'Perfis não verificados não podem enviar mensagens',
          'Perfis não verificados não podem postar fotos ou vídeos',
          'Apenas posts de texto são permitidos até a verificação'
        ]
      }
    })

  } catch (error) {
    console.error('Verification request error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user from database
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, is_verified')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Get user's verification requests
    const { data: requests, error: requestsError } = await supabase
      .from('verification_requests')
      .select(`
        id,
        verification_code,
        required_text,
        day_of_week,
        photo_url,
        status,
        attempt_number,
        total_attempts,
        created_at,
        expires_at,
        submitted_at,
        reviewed_at,
        rejection_reason
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching verification requests:', requestsError)
      return NextResponse.json(
        { error: 'Erro ao buscar solicitações de verificação' },
        { status: 500 }
      )
    }

    // Get verification settings
    const { data: settings, error: settingsError } = await supabase
      .from('verification_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'max_attempts_per_user',
        'code_expiry_hours',
        'require_verification_for_interactions',
        'verification_required_actions'
      ])

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, any>) || {}

    return NextResponse.json({
      success: true,
      data: {
        is_verified: currentUser.is_verified,
        requests: requests || [],
        settings: {
          max_attempts: parseInt(settingsMap.max_attempts_per_user) || 3,
          code_expiry_hours: parseInt(settingsMap.code_expiry_hours) || 24,
          require_verification: settingsMap.require_verification_for_interactions || true,
          restricted_actions: settingsMap.verification_required_actions || []
        }
      }
    })

  } catch (error) {
    console.error('Get verification requests error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}