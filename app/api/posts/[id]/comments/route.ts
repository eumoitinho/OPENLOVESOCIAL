import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { verifyUserForAction } from "@/lib/verification-middleware"

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  parent_id: z.string().uuid().optional()
})

const updateCommentSchema = z.object({
  content: z.string().min(1).max(500)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id: postId } = await params

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar comentários do post com informações do autor
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        updated_at,
        stats,
        users!inner (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          is_premium
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Erro ao buscar comentários:", error)
      return NextResponse.json({ error: "Erro ao buscar comentários" }, { status: 500 })
    }

    // Buscar likes do usuário atual para todos os comentários
    const commentIds = comments?.map(c => c.id) || []
    const { data: userLikes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", user.id)
      .in("comment_id", commentIds)

    const likedCommentIds = new Set(userLikes?.map(l => l.comment_id) || [])

    // Formatar comentários para o frontend
    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      timestamp: comment.created_at,
      likes: comment.stats?.likes || 0,
      isLiked: likedCommentIds.has(comment.id),
      author: {
        name: comment.users?.[0]?.name || '',
        username: comment.users?.[0]?.username || '',
        avatar: comment.users?.[0]?.avatar_url || '',
        verified: comment.users?.[0]?.is_verified || false,
        premium: comment.users?.[0]?.is_premium || false }
    })) || []

    return NextResponse.json({ data: formattedComments })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()

    // Validar dados
    const validatedData = createCommentSchema.parse(body)

    // Verificar autenticação e permissão para comentar
    const { context, error } = await verifyUserForAction(request, 'comment')
    if (error) {
      return error
    }

    const supabase = await createRouteHandlerClient()
    const user = { id: context!.user.id }

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Criar comentário
    const { data: comment, error: createError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: validatedData.content,
        parent_id: validatedData.parent_id || null,
        stats: { likes: 0 },
        is_edited: false
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        stats,
        users!inner (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          is_premium
        )
      `)
      .single()

    if (createError) {
      console.error("Erro ao criar comentário:", createError)
      return NextResponse.json({ error: "Erro ao criar comentário" }, { status: 500 })
    }

    // Atualizar contador de comentários do post
    await supabase.rpc("increment_post_comments", { post_id: postId })

    // Formatar resposta
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      timestamp: comment.created_at,
      likes: comment.stats?.likes || 0,
      isLiked: false,
      author: {
        name: comment.users?.[0]?.name || '',
        username: comment.users?.[0]?.username || '',
        avatar: comment.users?.[0]?.avatar_url || '',
        verified: comment.users?.[0]?.is_verified || false,
        premium: comment.users?.[0]?.is_premium || false }
    }

    return NextResponse.json({ data: formattedComment }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const url = new URL(request.url)
    const commentId = url.searchParams.get("commentId")
    
    if (!commentId) {
      return NextResponse.json({ error: "ID do comentário não fornecido" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o comentário pertence ao usuário
    const { data: existingComment, error: checkError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single()

    if (checkError || !existingComment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({ error: "Sem permissão para editar este comentário" }, { status: 403 })
    }

    // Atualizar comentário
    const { data: updatedComment, error: updateError } = await supabase
      .from("comments")
      .update({
        content: validatedData.content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", commentId)
      .select(`
        id,
        content,
        created_at,
        updated_at,
        stats,
        users!inner (
          id,
          name,
          username,
          avatar_url,
          is_verified,
          is_premium
        )
      `)
      .single()

    if (updateError) {
      console.error("Erro ao atualizar comentário:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar comentário" }, { status: 500 })
    }

    // Formatar resposta
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      timestamp: updatedComment.created_at,
      likes: updatedComment.stats?.likes || 0,
      isLiked: false,
      isEdited: true,
      author: {
        name: updatedComment.users?.[0]?.name || '',
        username: updatedComment.users?.[0]?.username || '',
        avatar: updatedComment.users?.[0]?.avatar_url || '',
        verified: updatedComment.users?.[0]?.is_verified || false,
        premium: updatedComment.users?.[0]?.is_premium || false }
    }

    return NextResponse.json({ data: formattedComment })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
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
    const url = new URL(request.url)
    const commentId = url.searchParams.get("commentId")
    const { id: postId } = await params
    
    if (!commentId) {
      return NextResponse.json({ error: "ID do comentário não fornecido" }, { status: 400 })
    }

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o comentário pertence ao usuário
    const { data: existingComment, error: checkError } = await supabase
      .from("comments")
      .select("user_id, post_id")
      .eq("id", commentId)
      .single()

    if (checkError || !existingComment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({ error: "Sem permissão para deletar este comentário" }, { status: 403 })
    }

    // Deletar comentário
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (deleteError) {
      console.error("Erro ao deletar comentário:", deleteError)
      return NextResponse.json({ error: "Erro ao deletar comentário" }, { status: 500 })
    }

    // Decrementar contador de comentários do post
    await supabase.rpc("decrement_post_comments", { post_id: postId })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
