import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    console.log("Iniciando busca de timeline...")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit



    // Step 1: Fetch all posts (simplified for now)
    console.log("Buscando posts...")
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return NextResponse.json({ error: "Failed to fetch posts", details: postsError }, { status: 500 })
    }
    
    console.log("Posts encontrados:", posts?.length || 0)

    if (!posts || posts.length === 0) {
      const emptyResult = {
        data: [],
        hasMore: false,
        message: "Nenhum post encontrado",
      }
      return NextResponse.json(emptyResult)
    }

    // Step 2: Get all unique author IDs
    const authorIds = [...new Set(posts.map((post) => post.user_id))]

    // Step 3: Fetch author profiles
    const { data: authors } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url, is_verified, profile_type")
      .in("id", authorIds)

    // Create author lookup map
    const authorMap = new Map()
    authors?.forEach((author) => {
      authorMap.set(author.id, {
        id: author.id,
        name: author.full_name,
        username: author.username,
        avatar: author.avatar_url,
        verified: author.is_verified,
        type: author.profile_type,
      })
    })

    // Step 4: Get post IDs for likes and comments
    const postIds = posts.map((post) => post.id)

    // Step 5: Fetch likes
    const { data: likes } = await supabase.from("likes").select("post_id, user_id").in("post_id", postIds)

    // Group likes by post
    const likesMap = new Map()
    likes?.forEach((like) => {
      if (!likesMap.has(like.post_id)) {
        likesMap.set(like.post_id, [])
      }
      likesMap.get(like.post_id).push(like.user_id)
    })

    // Step 6: Fetch comments with author info
    const { data: comments } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at
      `)
      .in("post_id", postIds)
      .order("created_at", { ascending: true })

    // Get comment author IDs
    const commentAuthorIds = [...new Set(comments?.map((comment) => comment.user_id) || [])]

    // Fetch comment authors
    const { data: commentAuthors } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url")
      .in("id", commentAuthorIds)

    // Create comment author lookup
    const commentAuthorMap = new Map()
    commentAuthors?.forEach((author) => {
      commentAuthorMap.set(author.id, {
        id: author.id,
        name: author.full_name,
        username: author.username,
        avatar: author.avatar_url,
      })
    })

    // Group comments by post
    const commentsMap = new Map()
    comments?.forEach((comment) => {
      if (!commentsMap.has(comment.post_id)) {
        commentsMap.set(comment.post_id, [])
      }
      commentsMap.get(comment.post_id).push({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: commentAuthorMap.get(comment.user_id) || {
          id: comment.user_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
        },
      })
    })

    // Step 7: Combine all data
    const timelinePosts = posts.map((post) => {
      const author = authorMap.get(post.user_id)
      const postLikes = likesMap.get(post.id) || []
      const postComments = commentsMap.get(post.id) || []

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_urls?.[0] || null, // Usar media_urls array
        mediaType: post.media_types?.[0] || null, // Usar media_types array
        visibility: post.visibility,
        createdAt: post.created_at,
        author: author || {
          id: post.user_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
          verified: false,
          type: "single",
        },
        likes: postLikes,
        likesCount: postLikes.length,
        isLiked: false, // Simplified for now
        comments: postComments,
        commentsCount: postComments.length,
      }
    })

    const result = {
      data: timelinePosts,
      hasMore: posts.length === limit,
      page,
      limit,
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Timeline fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
