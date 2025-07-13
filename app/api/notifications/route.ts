import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar notificações do usuário
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Erro ao buscar notificações:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    return NextResponse.json({ data: notifications || [] })
  } catch (error) {
    console.error("Erro na API de notificações:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 