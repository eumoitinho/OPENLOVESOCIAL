// /app/api/interactions/route.ts - CORRIGIDO
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

    const body = await request.json()
    const { type, postId, content } = body

    if (type === "like") {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("target_type", "post")
        .eq("target_id", postId)
        .eq("user_id", user.id)
        .single()

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("target_type", "post")
          .eq("target_id", postId)
          .eq("user_id", user.id)

        if (deleteError) {
          console.error("Error unliking post:", deleteError)
          return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 })
        }

        return NextResponse.json({ action: "unliked" })
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("likes")
          .insert({
            target_type: "post",
            target_id: postId,
            user_id: user.id,
          })

        if (insertError) {
          console.error("Error liking post:", insertError)
          return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
        }

        return NextResponse.json({ action: "liked" })
      }
    }

    if (type === "comment") {
      if (!content?.trim()) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
      }

      // Create comment
      const { data: comment, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id, // ✅ CORRIGIDO: usar user_id
          content: content.trim(),
        })
        .select()
        .single()

      if (commentError) {
        console.error("Error creating comment:", commentError)
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
      }

      // Get author profile
      const { data: profile } = await supabase
        .from("users")
        .select("username, name, avatar_url") // ✅ CORRIGIDO: usar 'name' em vez de 'full_name'
        .eq("id", user.id)
        .single()

      const formattedComment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: user.id,
          name: profile?.name || "Usuário", // ✅ CORRIGIDO: usar 'name'
          username: profile?.username || "unknown",
          avatar: profile?.avatar_url, // ✅ CORRIGIDO: usar avatar_url
        },
      }

      return NextResponse.json({ data: formattedComment })
    }

    return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 })
  } catch (error) {
    console.error("Interaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}