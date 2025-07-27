import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar matches usando a função SQL
    const { data: matches, error } = await supabase.rpc('get_user_matches', {
      p_user_id: user.id
    })

    if (error) {
      console.error("Erro ao buscar matches:", error)
      return NextResponse.json({ error: "Erro ao buscar matches" }, { status: 500 })
    }

    // Formatar os dados para o frontend
    const formattedMatches = matches?.map((match: any) => ({
      match_id: match.match_id,
      other_user_id: match.other_user_id,
      other_user_name: match.other_user_name,
      other_user_avatar: match.other_user_avatar,
      matched_at: match.matched_at,
      last_message_at: match.last_message_at,
      unread_count: match.unread_count
    })) || []

    return NextResponse.json({ 
      matches: formattedMatches,
      total: (formattedMatches || []).length
    })

  } catch (error) {
    console.error("Erro na API de matches:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 
