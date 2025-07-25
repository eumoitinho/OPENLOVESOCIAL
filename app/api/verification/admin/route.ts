import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user and check admin role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'submitted'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get verification requests with user details
    const { data: requests, error: requestsError } = await supabase
      .from('verification_requests')
      .select(`
        id,
        user_id,
        verification_code,
        required_text,
        day_of_week,
        photo_url,
        photo_metadata,
        status,
        attempt_number,
        total_attempts,
        created_at,
        expires_at,
        submitted_at,
        reviewed_at,
        reviewed_by,
        rejection_reason,
        admin_notes,
        users (
          id,
          username,
          name,
          avatar,
          email,
          is_verified,
          is_premium,
          created_at
        )
      `)
      .eq('status', status)
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (requestsError) {
      console.error('Error fetching verification requests:', requestsError)
      return NextResponse.json(
        { error: 'Erro ao buscar solicitações de verificação' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('verification_requests')
      .select('id', { count: 'exact' })
      .eq('status', status)

    if (countError) {
      console.error('Error counting verification requests:', countError)
    }

    // Get verification statistics
    const { data: stats, error: statsError } = await supabase
      .from('verification_requests')
      .select('status')

    const statistics = stats?.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      success: true,
      data: {
        requests: requests || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        },
        statistics: {
          pending: statistics.pending || 0,
          submitted: statistics.submitted || 0,
          approved: statistics.approved || 0,
          rejected: statistics.rejected || 0,
          expired: statistics.expired || 0,
          total: Object.values(statistics).reduce((sum, val) => sum + val, 0)
        }
      }
    })

  } catch (error) {
    console.error('Admin verification list error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user and check admin role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, role, username')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      )
    }

    const { request_id, action, rejection_reason, admin_notes } = await request.json()

    if (!request_id || !action) {
      return NextResponse.json(
        { error: 'ID da solicitação e ação são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação deve ser "approve" ou "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Razão da rejeição é obrigatória' },
        { status: 400 }
      )
    }

    // Get verification request
    const { data: verificationRequest, error: requestError } = await supabase
      .from('verification_requests')
      .select(`
        id,
        user_id,
        status,
        photo_url,
        users (
          id,
          username,
          name,
          email
        )
      `)
      .eq('id', request_id)
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json(
        { error: 'Solicitação de verificação não encontrada' },
        { status: 404 }
      )
    }

    if (verificationRequest.status !== 'submitted') {
      return NextResponse.json(
        { 
          error: 'Apenas solicitações enviadas podem ser aprovadas/rejeitadas',
          current_status: verificationRequest.status
        },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const reviewedAt = new Date().toISOString()

    // Update verification request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: newStatus,
        reviewed_by: currentUser.id,
        reviewed_at: reviewedAt,
        rejection_reason: action === 'reject' ? rejection_reason : null,
        admin_notes: admin_notes || null
      })
      .eq('id', request_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json(
        { error: 'Erro ao processar solicitação' },
        { status: 500 }
      )
    }

    // If approved, update user verification status
    if (action === 'approve') {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          verified_at: reviewedAt
        })
        .eq('id', verificationRequest.user_id)

      if (userUpdateError) {
        console.error('Error updating user verification:', userUpdateError)
        // Rollback the verification request update
        await supabase
          .from('verification_requests')
          .update({
            status: 'submitted',
            reviewed_by: null,
            reviewed_at: null,
            admin_notes: null
          })
          .eq('id', request_id)

        return NextResponse.json(
          { error: 'Erro ao atualizar status de verificação do usuário' },
          { status: 500 }
        )
      }
    }

    // Log admin action in history
    await supabase
      .from('verification_history')
      .insert({
        user_id: verificationRequest.user_id,
        request_id: request_id,
        action: newStatus,
        performed_by: currentUser.id,
        details: {
          admin_username: currentUser.username,
          action: action,
          rejection_reason: action === 'reject' ? rejection_reason : null,
          admin_notes: admin_notes || null,
          reviewed_at: reviewedAt
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    // Create notification for user
    const notificationContent = action === 'approve' 
      ? 'Parabéns! Seu perfil foi verificado com sucesso. Agora você pode usar todas as funcionalidades da plataforma.'
      : `Sua solicitação de verificação foi rejeitada. Motivo: ${rejection_reason}`

    await supabase
      .from('notifications')
      .insert({
        user_id: verificationRequest.user_id,
        type: `verification_${newStatus}`,
        title: action === 'approve' ? 'Perfil Verificado!' : 'Verificação Rejeitada',
        content: notificationContent,
        action_url: action === 'reject' ? '/verification' : '/profile',
        related_data: {
          verification_request_id: request_id,
          admin_username: currentUser.username,
          rejection_reason: action === 'reject' ? rejection_reason : null
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        request: updatedRequest,
        action: action,
        user_updated: action === 'approve',
        message: action === 'approve' 
          ? 'Usuário verificado com sucesso!'
          : 'Solicitação rejeitada com sucesso!'
      }
    })

  } catch (error) {
    console.error('Admin verification action error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get current user and check admin role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('request_id')

    if (!requestId) {
      return NextResponse.json(
        { error: 'ID da solicitação é obrigatório' },
        { status: 400 }
      )
    }

    // Get verification request to delete associated photo
    const { data: verificationRequest, error: requestError } = await supabase
      .from('verification_requests')
      .select('id, user_id, photo_url, status')
      .eq('id', requestId)
      .single()

    if (requestError || !verificationRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Delete photo from storage if exists
    if (verificationRequest.photo_url) {
      const photoPath = verificationRequest.photo_url.split('/').pop()
      if (photoPath) {
        await supabase.storage
          .from('verification-photos')
          .remove([`verification-photos/${photoPath}`])
      }
    }

    // Delete verification request (cascade will delete history)
    const { error: deleteError } = await supabase
      .from('verification_requests')
      .delete()
      .eq('id', requestId)

    if (deleteError) {
      console.error('Error deleting verification request:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar solicitação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de verificação deletada com sucesso'
    })

  } catch (error) {
    console.error('Admin verification delete error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}