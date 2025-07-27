import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: targetUserId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, username, name, avatar_url, stats")
      .eq("id", targetUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "Usuário alvo não encontrado" }, { status: 404 })
    }

    // Verificar se não está tentando seguir a si mesmo
    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: "Não é possível seguir a si mesmo" }, { status: 400 })
    }

    // Verificar se já está seguindo
    const { data: existingFollow, error: checkError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)
      .single()

    if (existingFollow) {
      return NextResponse.json({ error: "Já está seguindo este usuário" }, { status: 409 })
    }

    // Criar relacionamento de seguir
    const { error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUser.id,
        following_id: targetUserId,
        status: "active"
      })

    if (followError) {
      console.error("Erro ao seguir usuário:", followError)
      return NextResponse.json({ error: "Erro ao seguir usuário" }, { status: 500 })
    }

    // Verificar se seguir mutuamente resulta em sugestão de amizade
    const { data: mutualFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", targetUserId)
      .eq("following_id", currentUser.id)
      .eq("status", "active")
      .single()

    // Se há seguimento mútuo e ainda não são amigos, sugerir amizade
    if (mutualFollow) {
      const { data: existingFriendship } = await supabase
        .from("friends")
        .select("id")
        .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUser.id})`)
        .single()

      if (!existingFriendship) {
        // Criar notificação sugerindo amizade
        await supabase
          .from("notifications")
          .insert({
            recipient_id: currentUser.id,
            sender_id: null,
            type: "system",
            title: "Sugestão de amizade",
            content: `Você e ${targetUser.name || targetUser.username} se seguem mutuamente. Que tal enviar uma solicitação de amizade?`,
            icon: "Users",
            related_data: {
              suggested_friend_id: targetUserId,
              username: targetUser.username,
              name: targetUser.name,
              avatar_url: targetUser.avatar_url
            },
            action_text: "Enviar solicitação",
            action_url: `/profile/${targetUser.username || targetUserId}`
          })
      }
    }

    // Atualizar contadores
    const currentFollowers = targetUser.stats?.followers || 0
    await supabase
      .from("users")
      .update({
        stats: {
          ...targetUser.stats,
          followers: currentFollowers + 1
        }
      })
      .eq("id", targetUserId)

    // Buscar dados do usuário atual para a notificação
    const { data: currentUserData } = await supabase
      .from("users")
      .select("username, name, avatar_url, stats")
      .eq("id", currentUser.id)
      .single()

    if (currentUserData) {
      const currentFollowing = currentUserData.stats?.following || 0
      await supabase
        .from("users")
        .update({
          stats: {
            ...currentUserData.stats,
            following: currentFollowing + 1
          }
        })
        .eq("id", currentUser.id)
    }

    // Criar notificação
    await supabase
      .from("notifications")
      .insert({
        recipient_id: targetUserId,
        sender_id: currentUser.id,
        type: "follow",
        title: "Novo seguidor",
        content: `${currentUserData?.name || currentUserData?.username || 'Alguém'} começou a seguir você`,
        icon: "UserPlus",
        related_data: {
          user_id: currentUser.id,
          username: currentUserData?.username,
          name: currentUserData?.name,
          avatar_url: currentUserData?.avatar_url
        },
        action_url: `/profile/${currentUserData?.username || currentUser.id}`
      })

    return NextResponse.json({
      message: "Usuário seguido com sucesso",
      data: {
        isFollowing: true,
        followersCount: currentFollowers + 1,
        mutualFollow: !!mutualFollow
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: targetUserId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, stats")
      .eq("id", targetUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: "Usuário alvo não encontrado" }, { status: 404 })
    }

    // Verificar se está seguindo
    const { data: existingFollow, error: checkError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)
      .single()

    if (!existingFollow) {
      return NextResponse.json({ error: "Não está seguindo este usuário" }, { status: 404 })
    }

    // Remover relacionamento de seguir
    const { error: unfollowError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)

    if (unfollowError) {
      console.error("Erro ao deixar de seguir usuário:", unfollowError)
      return NextResponse.json({ error: "Erro ao deixar de seguir usuário" }, { status: 500 })
    }

    // Atualizar contadores
    const currentFollowers = Math.max(0, (targetUser.stats?.followers || 1) - 1)
    await supabase
      .from("users")
      .update({
        stats: {
          ...targetUser.stats,
          followers: currentFollowers
        }
      })
      .eq("id", targetUserId)

    // Atualizar contador do usuário atual
    const { data: currentUserData } = await supabase
      .from("users")
      .select("stats")
      .eq("id", currentUser.id)
      .single()

    if (currentUserData) {
      const currentFollowing = Math.max(0, (currentUserData.stats?.following || 1) - 1)
      await supabase
        .from("users")
        .update({
          stats: {
            ...currentUserData.stats,
            following: currentFollowing
          }
        })
        .eq("id", currentUser.id)
    }

    return NextResponse.json({
      message: "Usuário não seguido com sucesso",
      data: {
        isFollowing: false,
        followersCount: currentFollowers
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: targetUserId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se está seguindo
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)
      .single()

    // Buscar estatísticas do usuário alvo
    const { data: targetUser } = await supabase
      .from("users")
      .select("stats")
      .eq("id", targetUserId)
      .single()

    return NextResponse.json({
      data: {
        isFollowing: !!existingFollow,
        followersCount: targetUser?.stats?.followers || 0,
        followingCount: targetUser?.stats?.following || 0
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
