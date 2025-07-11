import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import redis from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // CACHE KEY
    const cacheKey = `timeline:${user.id}:page:${page}:limit:${limit}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Get user profile to check if premium
    const { data: profile } = await supabase.from("profiles").select("is_premium, id").eq("id", user.id).single()
    const isPremium = profile?.is_premium || false

    // Step 1: Fetch posts based on user's subscription
    let postsQuery = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (!isPremium) {
      // Free users only see posts from friends
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id)
        .eq("status", "accepted")

      const friendIds = friends?.map((f) => f.friend_id) || []
      friendIds.push(user.id) // Include own posts

      if (friendIds.length > 0) {
        postsQuery = postsQuery.in("author_id", friendIds)
      } else {
        // No friends, only show own posts
        postsQuery = postsQuery.eq("author_id", user.id)
      }
    }

    const { data: posts, error: postsError } = await postsQuery

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      const emptyResult = {
        data: [],
        hasMore: false,
        message: isPremium ? "Nenhum post encontrado" : "Adicione amigos para ver posts na timeline",
      }
      await redis.set(cacheKey, JSON.stringify(emptyResult), "EX", 30)
      return NextResponse.json(emptyResult)
    }

    // Step 2: Get all unique author IDs
    const authorIds = [...new Set(posts.map((post) => post.author_id))]

    // Step 3: Fetch author profiles
    const { data: authors } = await supabase
      .from("profiles")
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
        author_id,
        content,
        created_at
      `)
      .in("post_id", postIds)
      .order("created_at", { ascending: true })

    // Get comment author IDs
    const commentAuthorIds = [...new Set(comments?.map((comment) => comment.author_id) || [])]

    // Fetch comment authors
    const { data: commentAuthors } = await supabase
      .from("profiles")
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
        author: commentAuthorMap.get(comment.author_id) || {
          id: comment.author_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
        },
      })
    })

    // Step 7: Combine all data
    const timelinePosts = posts.map((post) => {
      const author = authorMap.get(post.author_id)
      const postLikes = likesMap.get(post.id) || []
      const postComments = commentsMap.get(post.id) || []

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        visibility: post.visibility,
        createdAt: post.created_at,
        author: author || {
          id: post.author_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
          verified: false,
          type: "single",
        },
        likes: postLikes,
        likesCount: postLikes.length,
        isLiked: postLikes.includes(user.id),
        comments: postComments,
        commentsCount: postComments.length,
      }
    })

    const result = {
      data: timelinePosts,
      hasMore: posts.length === limit,
      isPremium,
      page,
      limit,
    }
    await redis.set(cacheKey, JSON.stringify(result), "EX", 30)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Timeline fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
