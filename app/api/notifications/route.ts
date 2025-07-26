import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from "../../lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Parâmetros de consulta
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type')

    // Construir query
    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        content,
        icon,
        related_data,
        action_text,
        action_url,
        is_read,
        is_deleted,
        created_at,
        sender:users!sender_id (
          id,
          username,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('recipient_id', currentUser.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    // Filtrar por tipo se especificado
    if (type) {
      query = query.eq('type', type)
    }

    // Filtrar apenas não lidas se solicitado
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Aplicar paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: notifications, error } = await query

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar notificações' },
        { status: 500 }
      )
    }

    // Buscar contador de não lidas
    const { data: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: 'exact' })
      .eq("recipient_id", currentUser.id)
      .eq("is_read", false)
      .eq("is_deleted", false)

    // Formatar notificações
    const formattedNotifications = notifications?.map((notif: any) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      content: notif.content,
      icon: notif.icon,
      isRead: notif.is_read,
      createdAt: notif.created_at,
      actionText: notif.action_text,
      actionUrl: notif.action_url,
      relatedData: notif.related_data,
      sender: notif.sender ? {
        id: notif.sender.id,
        username: notif.sender.username,
        name: notif.sender.name,
        avatar: notif.sender.avatar_url,
        verified: notif.sender.is_verified || false
      } : null
    })) || []

    return NextResponse.json({ 
      data: formattedNotifications,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil((unreadCount?.length || 0) / limit),
        has_next: formattedNotifications.length === limit
      },
      unread_count: unreadCount?.length || 0
    })

  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { action, notificationIds, settings, type, title, content, targetUserId, relatedPostId, relatedCommentId, relatedUserId } = body

    switch (action) {
      case 'create':
        if (!type || !title || !targetUserId) {
          return NextResponse.json(
            { error: "Tipo, título e usuário de destino são obrigatórios" },
            { status: 400 }
          )
        }

        // Não criar notificação se o usuário está notificando a si mesmo
        if (targetUserId === user.id) {
          return NextResponse.json({ success: true, message: "Não criou notificação para si mesmo" })
        }

        // Buscar ID do usuário de destino se foi passado username
        let finalTargetUserId = targetUserId
        if (typeof targetUserId === 'string' && targetUserId.includes('@')) {
          const { data: targetUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', targetUserId.replace('@', ''))
            .single()
          
          if (targetUser) {
            finalTargetUserId = targetUser.id
          }
        }

        const { error: createError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: finalTargetUserId,
            sender_id: currentUser.id,
            type: type,
            title: title,
            content: content,
            related_data: {
              post_id: relatedPostId,
              comment_id: relatedCommentId,
              user_id: relatedUserId
            },
            is_read: false
          })

        if (createError) {
          console.error("Erro ao criar notificação:", createError)
          return NextResponse.json(
            { error: "Erro ao criar notificação" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, message: "Notificação criada" })

      case 'mark_read':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { error: "IDs de notificação necessários" },
            { status: 400 }
          )
        }

        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', notificationIds)
          .eq('recipient_id', currentUser.id)

        if (updateError) {
          console.error("Erro ao marcar notificações como lidas:", updateError)
          return NextResponse.json(
            { error: "Erro ao atualizar notificações" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, message: "Notificações marcadas como lidas" })

      case 'mark_all_read':
        const { error: markAllError } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('recipient_id', currentUser.id)
          .eq('is_read', false)

        if (markAllError) {
          console.error("Erro ao marcar todas como lidas:", markAllError)
          return NextResponse.json(
            { error: "Erro ao atualizar notificações" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, message: "Todas as notificações marcadas como lidas" })

      case 'delete':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { error: "IDs de notificação necessários" },
            { status: 400 }
          )
        }

        const { error: deleteError } = await supabase
          .from('notifications')
          .update({ is_deleted: true })
          .in('id', notificationIds)
          .eq('recipient_id', currentUser.id)

        if (deleteError) {
          console.error("Erro ao deletar notificações:", deleteError)
          return NextResponse.json(
            { error: "Erro ao deletar notificações" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, message: "Notificações deletadas" })

      case 'update_settings':
        if (!settings) {
          return NextResponse.json(
            { error: "Configurações necessárias" },
            { status: 400 }
          )
        }

        const { error: settingsError } = await supabase
          .from('users')
          .update({
            notification_settings: {
              ...settings,
              updated_at: new Date().toISOString()
            }
          })
          .eq('id', currentUser.id)

        if (settingsError) {
          console.error("Erro ao atualizar configurações:", settingsError)
          return NextResponse.json(
            { error: "Erro ao atualizar configurações" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, message: "Configurações atualizadas" })

      default:
        return NextResponse.json(
          { error: "Ação inválida" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Erro no endpoint de notificações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 