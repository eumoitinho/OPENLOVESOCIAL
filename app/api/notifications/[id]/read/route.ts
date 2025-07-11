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

    // Marcar notificação específica como lida
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na API de marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 