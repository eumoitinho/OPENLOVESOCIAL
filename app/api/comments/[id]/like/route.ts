import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

const likeSchema = z.object({
  reaction_type: z.enum(['like', 'love', 'laugh', 'wow', 'sad', 'angry']).optional().default('like')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: commentId } = await params
    const body = await request.json()
    const { reaction_type } = likeSchema.parse(body)

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

    // Verificar se o comentário existe
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, user_id, stats, post_id")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    // Verificar se já curtiu
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id, reaction_type")
      .eq("user_id", currentUser.id)
      .eq("target_id", commentId)
      .eq("target_type", "comment")
      .single()

    // Se já curtiu com a mesma reação, remove a curtida
    if (existingLike && existingLike.reaction_type === reaction_type) {
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id)

      if (deleteError) {
        console.error("Erro ao remover curtida:", deleteError)
        return NextResponse.json({ error: "Erro ao remover curtida" }, { status: 500 })
      }

      // Atualizar contador do comentário
      const currentLikes = Math.max(0, (comment.stats?.likes || 1) - 1)
      await supabase
        .from("comments")
        .update({
          stats: {
            ...comment.stats,
            likes: currentLikes
          }
        })
        .eq("id", commentId)

      return NextResponse.json({
        message: "Curtida removida com sucesso",
        data: {
          isLiked: false,
          likesCount: currentLikes,
          reaction: null
        }
      })
    }

    // Se já curtiu com reação diferente, atualiza a reação
    if (existingLike && existingLike.reaction_type !== reaction_type) {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ reaction_type })
        .eq("id", existingLike.id)

      if (updateError) {
        console.error("Erro ao atualizar reação:", updateError)
        return NextResponse.json({ error: "Erro ao atualizar reação" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Reação atualizada com sucesso",
        data: {
          isLiked: true,
          likesCount: comment.stats?.likes || 1,
          reaction: reaction_type
        }
      })
    }

    // Criar nova curtida
    const { error: likeError } = await supabase
      .from("likes")
      .insert({
        user_id: currentUser.id,
        target_id: commentId,
        target_type: "comment",
        reaction_type
      })

    if (likeError) {
      console.error("Erro ao curtir comentário:", likeError)
      return NextResponse.json({ error: "Erro ao curtir comentário" }, { status: 500 })
    }

    // Atualizar contador do comentário
    const currentLikes = (comment.stats?.likes || 0) + 1
    await supabase
      .from("comments")
      .update({
        stats: {
          ...comment.stats,
          likes: currentLikes
        }
      })
      .eq("id", commentId)

    // Criar notificação se não for o próprio autor
    if (comment.user_id !== currentUser.id) {
      const { data: currentUserData } = await supabase
        .from("users")
        .select("username, name, avatar_url")
        .eq("id", currentUser.id)
        .single()

      await supabase
        .from("notifications")
        .insert({
          recipient_id: comment.user_id,
          sender_id: currentUser.id,
          type: "comment_like",
          title: "Curtida no comentário",
          content: `${currentUserData?.name || currentUserData?.username || 'Alguém'} curtiu seu comentário`,
          icon: reaction_type === 'like' ? 'Heart' : 'ThumbsUp',
          related_data: {
            comment_id: commentId,
            post_id: comment.post_id,
            user_id: currentUser.id,
            username: currentUserData?.username,
            name: currentUserData?.name,
            avatar_url: currentUserData?.avatar_url,
            reaction_type
          },
          action_url: `/posts/${comment.post_id}#comment-${commentId}`
        })
    }

    return NextResponse.json({
      message: "Comentário curtido com sucesso",
      data: {
        isLiked: true,
        likesCount: currentLikes,
        reaction: reaction_type
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
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
    const { id: commentId } = await params

    // Verificar se o comentário existe
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, stats")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    // Verificar autenticação (opcional para visualizar curtidas)
    const { data: { user } } = await supabase.auth.getUser()
    let userLike = null

    if (user) {
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single()

      if (currentUser) {
        const { data: like } = await supabase
          .from("likes")
          .select("reaction_type")
          .eq("user_id", currentUser.id)
          .eq("target_id", commentId)
          .eq("target_type", "comment")
          .single()

        userLike = like?.reaction_type || null
      }
    }

    // Buscar resumo das reações
    const { data: reactions, error: reactionsError } = await supabase
      .from("likes")
      .select("reaction_type")
      .eq("target_id", commentId)
      .eq("target_type", "comment")

    const reactionCounts = reactions?.reduce((acc: any, like) => {
      acc[like.reaction_type] = (acc[like.reaction_type] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      data: {
        isLiked: !!userLike,
        likesCount: comment.stats?.likes || 0,
        userReaction: userLike,
        reactions: reactionCounts
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
