import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { user_id: targetUserId } = await request.json()

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, username, name, avatar_url")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, username, name")
      .eq("id", targetUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "Usuário alvo não encontrado" }, { status: 404 })
    }

    // Verificar se não está tentando ser amigo de si mesmo
    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: "Não é possível ser amigo de si mesmo" }, { status: 400 })
    }

    // Verificar se já são amigos ou existe solicitação pendente
    const { data: existingFriendship } = await supabase
      .from("friends")
      .select("id, status")
      .or(
        `and(user_id.eq.${currentUser.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUser.id})`
      )
      .single()

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: "Vocês já são amigos" }, { status: 400 })
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: "Solicitação de amizade já enviada" }, { status: 400 })
      }
    }

    // Criar solicitação de amizade
    const { error: createError } = await supabase.from("friends").insert({
      user_id: currentUser.id,
      friend_id: targetUserId,
      status: "pending" })

    if (createError) {
      console.error("Erro ao criar solicitação de amizade:", createError)
      return NextResponse.json({ error: "Falha ao enviar solicitação" }, { status: 500 })
    }

    // Criar notificação para o usuário alvo
    await supabase
      .from("notifications")
      .insert({
        recipient_id: targetUserId,
        sender_id: currentUser.id,
        type: "friend_request",
        title: "Nova solicitação de amizade",
        content: `${currentUser.name || currentUser.username || 'Alguém'} enviou uma solicitação de amizade`,
        icon: "UserPlus",
        related_data: {
          user_id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          avatar_url: currentUser.avatar_url
        },
        action_text: "Ver solicitação",
        action_url: `/friends/requests`
      })

    return NextResponse.json({ 
      message: "Solicitação de amizade enviada com sucesso",
      success: true 
    })
  } catch (error) {
    console.error("Erro na API de solicitação de amizade:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
