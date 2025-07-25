import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const { data: currentUser, error: dbUserError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url, is_verified, is_premium')
      .eq('auth_id', user.id)
      .single()

    if (dbUserError || !currentUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    const body = await request.json()
    const { type, postId, content } = body

    console.log("[Interactions API] Tipo:", type, "PostId:", postId, "UserId:", currentUser.id)

    if (type === "like") {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("target_type", "post")
        .eq("target_id", postId)
        .eq("user_id", currentUser.id)
        .single()

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("target_type", "post")
          .eq("target_id", postId)
          .eq("user_id", currentUser.id)

        if (deleteError) {
          console.error("Error unliking post:", deleteError)
          return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 })
        }

        // Buscar contador atualizado
        const { count: likesCount } = await supabase
          .from("likes")
          .select("id", { count: "exact" })
          .eq("target_type", "post")
          .eq("target_id", postId)

        console.log("[Interactions API] Post descurtido")
        return NextResponse.json({ 
          action: "unliked", 
          likesCount: likesCount || 0,
          isLiked: false
        })
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("likes")
          .insert({
            target_type: "post",
            target_id: postId,
            user_id: currentUser.id,
          })

        if (insertError) {
          console.error("Error liking post:", insertError)
          return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
        }

        // Buscar contador atualizado
        const { count: likesCount } = await supabase
          .from("likes")
          .select("id", { count: "exact" })
          .eq("target_type", "post")
          .eq("target_id", postId)

        console.log("[Interactions API] Post curtido")
        return NextResponse.json({ 
          action: "liked", 
          likesCount: likesCount || 0,
          isLiked: true
        })
      }
    }

    if (type === "comment") {
      if (!content?.trim()) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
      }

      console.log("[Interactions API] Criando comentário")

      // Create comment
      const { data: comment, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content.trim(),
        })
        .select()
        .single()

      if (commentError) {
        console.error("Error creating comment:", commentError)
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
      }

      const formattedComment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: currentUser.id,
          name: currentUser.name || "Usuário",
          username: currentUser.username || "unknown",
          avatar: currentUser.avatar_url || "/placeholder.svg",
          verified: currentUser.is_verified || false,
          premium: currentUser.is_premium || false,
        },
      }

      console.log("[Interactions API] Comentário criado:", comment.id)
      return NextResponse.json({ data: formattedComment })
    }

    return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 })
  } catch (error) {
    console.error("Interaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}