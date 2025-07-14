import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const postId = params.id

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

    // Formatar comentários para o frontend
    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      timestamp: comment.created_at,
      likes: comment.stats?.likes || 0,
      isLiked: false, // Implementar depois se necessário
      author: {
        name: comment.users.name,
        username: comment.users.username,
        avatar: comment.users.avatar_url,
        verified: comment.users.is_verified || false,
        premium: comment.users.is_premium || false,
      }
    })) || []

    return NextResponse.json({ data: formattedComments })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}