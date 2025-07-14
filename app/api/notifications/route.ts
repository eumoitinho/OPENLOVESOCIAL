import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unread') === 'true'

    // Construir query
    let query = supabase
      .from('notifications')
      .select(`
        *,
        user:profiles!notifications_user_id_fkey(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filtrar por tipo se especificado
    if (type) {
      query = query.eq('type', type)
    }

    // Filtrar apenas não lidas se especificado
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Aplicar paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: notifications, error } = await query

    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
    }

    // Buscar estatísticas
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: (page * limit) < (totalCount || 0)
      },
      stats: {
        total: totalCount || 0,
        unread: unreadCount || 0
      }
    })

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, notification } = body

    if (action === 'create' && notification) {
      // Criar nova notificação
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          content: notification.content,
          related_id: notification.related_id
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar notificação:', error)
        return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
      }

      return NextResponse.json({ success: true, notification: data })
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })

  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 