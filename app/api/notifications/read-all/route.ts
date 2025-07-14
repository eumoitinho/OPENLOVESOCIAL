import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST() {
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

    // Marcar todas as notificações como lidas
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      return NextResponse.json({ error: "Erro ao marcar notificações como lidas" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Todas as notificações foram marcadas como lidas" 
    })

  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 