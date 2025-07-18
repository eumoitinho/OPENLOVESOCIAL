import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: commentId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o comentário existe
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, stats")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    // Verificar se já existe like do usuário
    const { data: existingLike, error: likeCheckError } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    let isLiked = false
    let newLikeCount = comment.stats?.likes || 0

    if (existingLike) {
      // Remover like
      const { error: deleteError } = await supabase
        .from("comment_likes")
        .delete()
        .eq("id", existingLike.id)

      if (deleteError) {
        console.error("Erro ao remover like:", deleteError)
        return NextResponse.json({ error: "Erro ao remover like" }, { status: 500 })
      }

      newLikeCount = Math.max(0, newLikeCount - 1)
      isLiked = false
    } else {
      // Adicionar like
      const { error: insertError } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: user.id
        })

      if (insertError) {
        console.error("Erro ao adicionar like:", insertError)
        return NextResponse.json({ error: "Erro ao adicionar like" }, { status: 500 })
      }

      newLikeCount += 1
      isLiked = true
    }

    // Atualizar contador de likes no comentário
    const { error: updateError } = await supabase
      .from("comments")
      .update({
        stats: {
          ...comment.stats,
          likes: newLikeCount
        }
      })
      .eq("id", commentId)

    if (updateError) {
      console.error("Erro ao atualizar contador de likes:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar contador" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likes: newLikeCount
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
    const { id: commentId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário já curtiu o comentário
    const { data: like, error } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      isLiked: !!like && !error
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}