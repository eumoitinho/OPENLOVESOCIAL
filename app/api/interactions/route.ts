import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { serverNotifications } from "@/lib/server-notifications"

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
    const { type, postId, commentId, content } = body

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

        // Buscar informações do post para notificação
        const { data: post } = await supabase
          .from("posts")
          .select("user_id, content")
          .eq("id", postId)
          .single()

        // Criar notificação se não for o próprio usuário
        if (post && post.user_id !== currentUser.id) {
          const postTitle = post.content ? post.content.substring(0, 50) : undefined
          await serverNotifications.postLiked(postId, post.user_id, currentUser.id, postTitle)
        }

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

      // Buscar informações do post para notificação
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

      // Criar notificação se não for o próprio usuário
      if (post && post.user_id !== currentUser.id) {
        await serverNotifications.postCommented(postId, post.user_id, currentUser.id, content.trim())
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

    if (type === "save") {
      // Check if already saved
      const { data: existingSave } = await supabase
        .from("saved_posts")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentUser.id)
        .single()

      if (existingSave) {
        // Unsave
        const { error: deleteError } = await supabase
          .from("saved_posts")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)

        if (deleteError) {
          console.error("Error unsaving post:", deleteError)
          return NextResponse.json({ error: "Failed to unsave post" }, { status: 500 })
        }

        console.log("[Interactions API] Post removido dos salvos")
        return NextResponse.json({ 
          action: "unsaved", 
          isSaved: false
        })
      } else {
        // Save
        const { error: insertError } = await supabase
          .from("saved_posts")
          .insert({
            post_id: postId,
            user_id: currentUser.id,
            folder_name: 'default'
          })

        if (insertError) {
          console.error("Error saving post:", insertError)
          return NextResponse.json({ error: "Failed to save post" }, { status: 500 })
        }

        console.log("[Interactions API] Post salvo")
        return NextResponse.json({ 
          action: "saved", 
          isSaved: true
        })
      }
    }

    if (type === "share") {
      // Create share record
      const { error: shareError } = await supabase
        .from("shares")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          shared_at: new Date().toISOString()
        })

      if (shareError) {
        console.error("Error sharing post:", shareError)
        return NextResponse.json({ error: "Failed to share post" }, { status: 500 })
      }

      // Buscar contador atualizado
      const { count: sharesCount } = await supabase
        .from("shares")
        .select("id", { count: "exact" })
        .eq("post_id", postId)

      // Buscar informações do post para notificação
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

      // Criar notificação se não for o próprio usuário
      if (post && post.user_id !== currentUser.id) {
        await serverNotifications.postShared(postId, post.user_id, currentUser.id)
      }

      console.log("[Interactions API] Post compartilhado")
      return NextResponse.json({ 
        action: "shared", 
        sharesCount: sharesCount || 0
      })
    }

    if (type === "comment_like") {
      if (!commentId) {
        return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("target_type", "comment")
        .eq("target_id", commentId)
        .eq("user_id", currentUser.id)
        .single()

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("target_type", "comment")
          .eq("target_id", commentId)
          .eq("user_id", currentUser.id)

        if (deleteError) {
          console.error("Error unliking comment:", deleteError)
          return NextResponse.json({ error: "Failed to unlike comment" }, { status: 500 })
        }

        console.log("[Interactions API] Comentário descurtido")
        return NextResponse.json({ 
          action: "unliked", 
          isLiked: false
        })
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("likes")
          .insert({
            target_type: "comment",
            target_id: commentId,
            user_id: currentUser.id,
          })

        if (insertError) {
          console.error("Error liking comment:", insertError)
          return NextResponse.json({ error: "Failed to like comment" }, { status: 500 })
        }

        // Buscar informações do comentário para notificação
        const { data: comment } = await supabase
          .from("comments")
          .select("user_id, post_id")
          .eq("id", commentId)
          .single()

        // Criar notificação se não for o próprio usuário
        if (comment && comment.user_id !== currentUser.id) {
          await serverNotifications.commentLiked(commentId, comment.user_id, currentUser.id, comment.post_id)
        }

        console.log("[Interactions API] Comentário curtido")
        return NextResponse.json({ 
          action: "liked", 
          isLiked: true
        })
      }
    }

    if (type === "comment_reply") {
      if (!commentId || !content?.trim()) {
        return NextResponse.json({ error: "Comment ID and content are required" }, { status: 400 })
      }

      // Create reply
      const { data: reply, error: replyError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: content.trim(),
          parent_id: commentId
        })
        .select()
        .single()

      if (replyError) {
        console.error("Error creating reply:", replyError)
        return NextResponse.json({ error: "Failed to create reply" }, { status: 500 })
      }

      // Buscar informações do comentário pai para notificação
      const { data: parentComment } = await supabase
        .from("comments")
        .select("user_id, post_id")
        .eq("id", commentId)
        .single()

      // Criar notificação se não for o próprio usuário
      if (parentComment && parentComment.user_id !== currentUser.id) {
        await serverNotifications.commentReplied(commentId, parentComment.user_id, currentUser.id, parentComment.post_id, content.trim())
      }

      const formattedReply = {
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        parentId: reply.parent_id,
        author: {
          id: currentUser.id,
          name: currentUser.name || "Usuário",
          username: currentUser.username || "unknown",
          avatar: currentUser.avatar_url || "/placeholder.svg",
          verified: currentUser.is_verified || false,
          premium: currentUser.is_premium || false,
        },
      }

      console.log("[Interactions API] Resposta criada:", reply.id)
      return NextResponse.json({ data: formattedReply })
    }

    return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 })
  } catch (error) {
    console.error("Interaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}