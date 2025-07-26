import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { request_id, accept } = await request.json()

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, username, name, avatar_url, stats")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar dados da solicitação
    const { data: friendRequest, error: requestError } = await supabase
      .from("friends")
      .select(`
        id, 
        user_id, 
        friend_id, 
        status,
        requester:users!friends_user_id_fkey (
          id, username, name, avatar_url, stats
        )
      `)
      .eq("id", request_id)
      .eq("friend_id", currentUser.id)
      .single()

    if (requestError || !friendRequest) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: "Solicitação já processada" }, { status: 400 })
    }

    if (accept) {
      // Aceitar a solicitação
      const { error: updateError } = await supabase
        .from("friends")
        .update({ 
          status: "accepted",
          accepted_at: new Date().toISOString()
        })
        .eq("id", request_id)

      if (updateError) {
        console.error("Erro ao aceitar solicitação de amizade:", updateError)
        return NextResponse.json({ error: "Falha ao aceitar solicitação" }, { status: 500 })
      }

      // Criar amizade recíproca
      await supabase.from("friends").insert({
        user_id: currentUser.id,
        friend_id: friendRequest.user_id,
        status: "accepted",
        accepted_at: new Date().toISOString()
      })

      // Fazer com que se sigam mutuamente automaticamente
      const followPromises = [
        // Usuário atual segue o solicitante
        supabase.from("follows").insert({
          follower_id: currentUser.id,
          following_id: friendRequest.user_id,
          status: "active"
        }),
        // Solicitante segue o usuário atual
        supabase.from("follows").insert({
          follower_id: friendRequest.user_id,
          following_id: currentUser.id,
          status: "active"
        })
      ]

      await Promise.all(followPromises)

      // Atualizar contadores de amigos
      const requesterStats = friendRequest.requester?.[0]?.stats || {}
      const currentUserStats = currentUser.stats || {}

      await Promise.all([
        // Atualizar stats do solicitante
        supabase
          .from("users")
          .update({
            stats: {
              ...requesterStats,
              friends: (requesterStats.friends || 0) + 1,
              following: (requesterStats.following || 0) + 1,
              followers: (requesterStats.followers || 0) + 1
            }
          })
          .eq("id", friendRequest.user_id),
        
        // Atualizar stats do usuário atual
        supabase
          .from("users")
          .update({
            stats: {
              ...currentUserStats,
              friends: (currentUserStats.friends || 0) + 1,
              following: (currentUserStats.following || 0) + 1,
              followers: (currentUserStats.followers || 0) + 1
            }
          })
          .eq("id", currentUser.id)
      ])

      // Criar notificação de confirmação para o solicitante
      await supabase
        .from("notifications")
        .insert({
          recipient_id: friendRequest.user_id,
          sender_id: currentUser.id,
          type: "friend_accept",
          title: "Solicitação de amizade aceita",
          content: `${currentUser.name || currentUser.username || 'Alguém'} aceitou sua solicitação de amizade`,
          icon: "UserCheck",
          related_data: {
            user_id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatar_url: currentUser.avatar_url
          },
          action_text: "Ver perfil",
          action_url: `/profile/${currentUser.username || currentUser.id}`
        })

      return NextResponse.json({ 
        message: "Solicitação de amizade aceita! Vocês agora se seguem mutuamente.",
        success: true,
        friendship_status: "accepted"
      })
    } else {
      // Rejeitar a solicitação
      const { error: deleteError } = await supabase
        .from("friends")
        .delete()
        .eq("id", request_id)

      if (deleteError) {
        console.error("Erro ao rejeitar solicitação de amizade:", deleteError)
        return NextResponse.json({ error: "Falha ao rejeitar solicitação" }, { status: 500 })
      }

      return NextResponse.json({ 
        message: "Solicitação de amizade rejeitada",
        success: true,
        friendship_status: "rejected"
      })
    }
  } catch (error) {
    console.error("Erro na API de resposta a amizade:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}