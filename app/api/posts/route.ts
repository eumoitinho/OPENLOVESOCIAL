import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, mediaUrl, mediaType, visibility = "public" } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        content: content.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
        visibility,
      })
      .select()
      .single()

    if (postError) {
      console.error("Post creation error:", postError)
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }

    // Get author profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url, is_verified, profile_type")
      .eq("id", user.id)
      .single()

    // Return formatted post
    const formattedPost = {
      id: post.id,
      content: post.content,
      mediaUrl: post.media_url,
      mediaType: post.media_type,
      visibility: post.visibility,
      createdAt: post.created_at,
      author: {
        id: user.id,
        name: profile?.full_name || "Usuário",
        username: profile?.username || "unknown",
        avatar: profile?.avatar_url,
        verified: profile?.is_verified || false,
        type: profile?.profile_type || "single",
      },
      likes: [],
      likesCount: 0,
      isLiked: false,
      comments: [],
      commentsCount: 0,
    }

    return NextResponse.json({ data: formattedPost })
  } catch (error) {
    console.error("Post creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
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

    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq("author_id", userId)
    }

    const { data: posts, error: postsError } = await query

    if (postsError) {
      console.error("Posts fetch error:", postsError)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    return NextResponse.json({
      data: posts || [],
      hasMore: (posts || []).length === limit,
      page,
      limit,
    })
  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
