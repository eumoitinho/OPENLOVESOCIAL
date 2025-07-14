import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const unreadOnly = url.searchParams.get('unread') === 'true'
    const type = url.searchParams.get('type')
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from('notifications')
      .select(`
        *,
        sender:users!notifications_sender_id_fkey(
          id,
          username,
          name,
          avatar_url
        ),
        related_post:posts!notifications_related_post_id_fkey(
          id,
          content,
          media_urls
        ),
        related_comment:comments!notifications_related_comment_id_fkey(
          id,
          content
        ),
        related_user:users!notifications_related_user_id_fkey(
          id,
          username,
          name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (type) {
      query = query.eq('type', type)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: notifications, error, count } = await query

    if (error) {
      console.error("Erro ao buscar notificações:", error)
      return NextResponse.json(
        { error: "Erro ao buscar notificações" },
        { status: 500 }
      )
    }

    // Buscar estatísticas
    const { data: stats } = await supabase
      .rpc('get_notification_stats', { user_id_param: user.id })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (notifications?.length || 0) === limit
      },
      stats
    })

  } catch (error) {
    console.error("Erro no endpoint de notificações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await req.json()
    const { action, notificationIds, settings } = body

    switch (action) {
      case 'mark_read':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { error: "IDs de notificação necessários" },
            { status: 400 }
          )
        }

        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', notificationIds)
          .eq('user_id', user.id)

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
          .update({ is_read: true })
          .eq('user_id', user.id)
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
          .delete()
          .in('id', notificationIds)
          .eq('user_id', user.id)

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
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            ...settings,
            updated_at: new Date().toISOString()
          })

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