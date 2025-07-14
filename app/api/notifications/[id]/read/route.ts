import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id

    // Verificar se a notificação pertence ao usuário
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('id, user_id')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
    }

    // Marcar notificação como lida
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notificação marcada como lida" 
    })

  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 