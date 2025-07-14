// /app/api/timeline/route.ts - CORRIGIDO
import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Timeline auth error:", userError)
    }

    console.log("[Timeline] Buscando posts, página:", page, "limit:", limit)

    // Step 1: Fetch posts with basic data
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        content,
        media_urls,
        media_types,
        hashtags,
        mentions,
        visibility,
        location,
        is_event,
        event_details,
        is_premium_content,
        price,
        stats,
        created_at
      `)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error("Timeline posts error:", postsError)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    console.log("[Timeline] Posts encontrados:", (posts || []).length)

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        data: [],
        hasMore: false,
        page,
        limit,
      })
    }

    // Step 2: Get all unique author IDs
    const authorIds = [...new Set((posts || []).map((post) => post.user_id))]

    // Step 3: Fetch author profiles
    const { data: authors } = await supabase
      .from("users")
      .select("id, username, name, avatar_url, is_verified, is_premium, location")
      .in("id", authorIds)

    // Create author lookup map
    const authorMap = new Map()
    ;(authors || []).forEach((author: any) => {
      authorMap.set(author.id, {
        id: author.id,
        name: author.name || "Usuário",
        username: author.username || "unknown",
        avatar: author.avatar_url, // ✅ CORRIGIDO: usar avatar_url
        verified: author.is_verified || false,
        type: "single",
        location: author.location || "Localização não informada",
        premium: author.is_premium || false,
        relationshipType: "single",
        isPrivate: false,
      })
    })

    // Step 4: Get post IDs for likes and comments
    const postIds = (posts || []).map((post) => post.id)

    // Step 5: Fetch likes
    const { data: likes } = await supabase
      .from("likes")
      .select("target_id, user_id")
      .eq("target_type", "post")
      .in("target_id", postIds)

    // Group likes by post
    const likesMap = new Map()
    ;(likes || []).forEach((like: any) => {
      if (!likesMap.has(like.target_id)) {
        likesMap.set(like.target_id, [])
      }
      likesMap.get(like.target_id).push(like.user_id)
    })

    // Step 6: Fetch comments with author info using JOIN
    const { data: comments } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        stats,
        users!inner (
          id,
          name,
          username,
          avatar_url,
          is_verified
        )
      `)
      .in("post_id", postIds)
      .order("created_at", { ascending: true })

    // Group comments by post with correct author mapping
    const commentsMap = new Map()
    ;(comments || []).forEach((comment: any) => {
      if (!commentsMap.has(comment.post_id)) {
        commentsMap.set(comment.post_id, [])
      }
      commentsMap.get(comment.post_id).push({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: comment.users.id,
          name: comment.users.name || "Usuário",
          username: comment.users.username || "unknown",
          avatar: comment.users.avatar_url, // ✅ CORRIGIDO: usar avatar_url
          verified: comment.users.is_verified || false,
        },
        likes: comment.stats?.likes || 0,
      })
    })

    // Step 7: Combine all data
    const timelinePosts = (posts || []).map((post) => {
      const author = authorMap.get(post.user_id)
      const postLikes = likesMap.get(post.id) || []
      const postComments = commentsMap.get(post.id) || []

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_urls?.[0] || null,
        mediaType: post.media_types?.[0] || null,
        visibility: post.visibility,
        createdAt: post.created_at,
        user: author || {
          id: post.user_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
          verified: false,
          type: "single",
          location: "Localização não informada",
          premium: false,
          relationshipType: "single",
          isPrivate: false,
        },
        likes: postLikes,
        // ✅ CORRIGIDO: usar JavaScript em vez de SQL
        likesCount: (post.stats?.likes) || 0,
        isLiked: postLikes.includes(user?.id || ''),
        comments: postComments,
        // ✅ CORRIGIDO: usar JavaScript em vez de SQL
        commentsCount: (post.stats?.comments) || 0,
        images: post.media_urls || [],
        video: null,
        event: null,
        // ✅ CORRIGIDO: usar JavaScript em vez de SQL
        shares: (post.stats?.shares) || 0,
        reposts: 0,
        saved: false,
        timestamp: post.created_at,
      }
    })

    const result = {
      data: timelinePosts,
      hasMore: (posts || []).length === limit,
      page,
      limit,
    }

    console.log("[Timeline] Retornando", timelinePosts.length, "posts processados")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Timeline fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}