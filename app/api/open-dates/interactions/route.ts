import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { card_id, action } = await request.json()

    if (!card_id || !action) {
      return NextResponse.json({ error: "card_id e action são obrigatórios" }, { status: 400 })
    }

    if (!['like', 'pass', 'super_like'].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }

    // Registrar a interação usando a função SQL
    const { data: result, error } = await supabase.rpc('register_open_dates_interaction', {
      p_viewer_id: user.id,
      p_card_id: card_id,
      p_action: action
    })

    if (error) {
      console.error("Erro ao registrar interação:", error)
      return NextResponse.json({ error: "Erro ao registrar interação" }, { status: 500 })
    }

    // Verificar se houve match
    let matchData = null
    if (action === 'like' || action === 'super_like') {
      // Buscar o usuário do card
      const { data: cardData } = await supabase
        .from('open_dates_cards')
        .select('user_id')
        .eq('id', card_id)
        .single()

      if (cardData) {
        // Verificar se o outro usuário também deu like
        const { data: mutualLike } = await supabase
          .from('open_dates_interactions')
          .select('*')
          .eq('viewer_id', cardData.user_id)
          .eq('card_id', card_id)
          .in('action', ['like', 'super_like'])
          .single()

        if (mutualLike) {
          // Buscar informações do match
          const { data: matchInfo } = await supabase
            .from('open_dates_matches')
            .select(`
              id,
              user1_id,
              user2_id,
              matched_at
            `)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .or(`user1_id.eq.${cardData.user_id},user2_id.eq.${cardData.user_id}`)
            .single()

          if (matchInfo) {
            // Buscar informações do outro usuário
            const otherUserId = matchInfo.user1_id === user.id ? matchInfo.user2_id : matchInfo.user1_id
            const { data: otherUser } = await supabase
              .from('users')
              .select('full_name, avatar_url')
              .eq('id', otherUserId)
              .single()

            matchData = {
              match_id: matchInfo.id,
              other_user_id: otherUserId,
              other_user_name: otherUser?.full_name || 'Usuário',
              other_user_avatar: otherUser?.avatar_url,
              matched_at: matchInfo.matched_at
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      match: matchData
    })

  } catch (error) {
    console.error("Erro na API de interações:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 