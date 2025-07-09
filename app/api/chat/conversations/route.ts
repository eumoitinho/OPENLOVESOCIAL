import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { otherUserId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "ID do outro usuário é obrigatório" }, { status: 400 })
    }

    // Usar a função RPC para criar conversa
    const { data: conversationId, error } = await supabase.rpc("create_conversation", {
      other_user_id: otherUserId,
    })

    if (error) {
      console.error("Erro ao criar conversa:", error)
      return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 })
    }

    return NextResponse.json({ conversationId })
  } catch (error) {
    console.error("Erro na API de conversas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
