import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Marcar todas as notificações do usuário como lidas
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .select()

    if (error) {
      console.error("Erro ao marcar notificações como lidas:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${(data || []).length || 0} notificações marcadas como lidas` 
    })
  } catch (error) {
    console.error("Erro na API de marcar todas notificações como lidas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 