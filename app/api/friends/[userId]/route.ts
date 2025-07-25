import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { userId: targetUserId } = await params

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
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

    // Usar a função do banco para verificar status de amizade
    const { data: friendshipStatus, error: statusError } = await supabase
      .rpc('get_friendship_status', {
        current_user_id: currentUser.id,
        target_user_id: targetUserId
      })

    if (statusError) {
      console.error("Erro ao buscar status de amizade:", statusError)
      return NextResponse.json({ error: "Erro ao verificar amizade" }, { status: 500 })
    }

    return NextResponse.json({
      data: friendshipStatus
    })

  } catch (error) {
    console.error("Erro na API de status de amizade:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { userId: targetUserId } = await params

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar ID do usuário atual na tabela users
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, username, name")
      .eq("auth_id", user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Remover amizade em ambas as direções
    const { error: deleteError } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${currentUser.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUser.id})`
      )

    if (deleteError) {
      console.error("Erro ao desfazer amizade:", deleteError)
      return NextResponse.json({ error: "Erro ao desfazer amizade" }, { status: 500 })
    }

    // Criar notificação informando sobre o fim da amizade
    await supabase
      .from("notifications")
      .insert({
        recipient_id: targetUserId,
        sender_id: currentUser.id,
        type: "system",
        title: "Amizade desfeita",
        content: `Você e ${currentUser.name || currentUser.username} não são mais amigos`,
        icon: "UserMinus",
        related_data: {
          user_id: currentUser.id
        }
      })

    return NextResponse.json({
      message: "Amizade desfeita com sucesso",
      success: true
    })

  } catch (error) {
    console.error("Erro ao desfazer amizade:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
