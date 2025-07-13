import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const notificationId = params.id

    // Marcar notificação como lida
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erro na API de marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 