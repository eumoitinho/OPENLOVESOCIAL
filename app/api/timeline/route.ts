// /app/api/timeline/route.ts - MELHORADO
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

    console.log("🚀 [Timeline] Iniciando busca de posts...")
    console.log("📊 [Timeline] Parâmetros:", { page, limit, offset })

    // Buscar usuário autenticado (opcional para posts públicos)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.log("⚠️ [Timeline] Usuário não autenticado, mas continuando...")
    } else {
      console.log("✅ [Timeline] Usuário autenticado:", user?.id)
    }

    // Step 1: Fetch ALL public posts from ALL users
    console.log("🔍 [Timeline] Buscando posts públicos...")
    
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        content,
        media_urls,
        media_types,
        poll_options,
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
      .eq("visibility", "public") // ✅ Apenas posts públicos
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error("❌ [Timeline] Erro ao buscar posts:", postsError)
      return NextResponse.json({ 
        error: "Failed to fetch posts", 
        details: postsError.message 
      }, { status: 500 })
    }

    console.log("✅ [Timeline] Posts encontrados:", (posts || []).length)

    if (!posts || posts.length === 0) {
      console.log("📭 [Timeline] Nenhum post encontrado")
      return NextResponse.json({
        data: [],
        hasMore: false,
        page,
        limit,
        total: 0
      })
    }

    // Step 2: Get all unique author IDs
    const authorIds = [...new Set((posts || []).map((post) => post.user_id))]
    console.log("👥 [Timeline] Autores únicos encontrados:", authorIds.length)

    // Step 3: Fetch author profiles
    console.log("👤 [Timeline] Buscando perfis dos autores...")
    const { data: authors, error: authorsError } = await supabase
      .from("users")
      .select("id, username, name, avatar_url, is_verified, is_premium, location, bio")
      .in("id", authorIds)

    if (authorsError) {
      console.error("❌ [Timeline] Erro ao buscar autores:", authorsError)
    } else {
      console.log("✅ [Timeline] Autores carregados:", (authors || []).length)
    }

    // Create author lookup map
    const authorMap = new Map()
    ;(authors || []).forEach((author: any) => {
      authorMap.set(author.id, {
        id: author.id,
        name: author.name || "Usuário",
        username: author.username || "unknown",
        avatar: author.avatar_url,
        verified: author.is_verified || false,
        type: "single",
        location: author.location || "Localização não informada",
        premium: author.is_premium || false,
        bio: author.bio || "",
        relationshipType: "single",
        isPrivate: false,
      })
    })

    // Step 4: Get post IDs for likes and comments
    const postIds = (posts || []).map((post) => post.id)
    console.log("💬 [Timeline] Buscando interações para", postIds.length, "posts")

    // Step 5: Fetch likes
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("target_id, user_id")
      .eq("target_type", "post")
      .in("target_id", postIds)

    if (likesError) {
      console.error("❌ [Timeline] Erro ao buscar likes:", likesError)
    } else {
      console.log("👍 [Timeline] Likes carregados:", (likes || []).length)
    }

    // Group likes by post
    const likesMap = new Map()
    ;(likes || []).forEach((like: any) => {
      if (!likesMap.has(like.target_id)) {
        likesMap.set(like.target_id, [])
      }
      likesMap.get(like.target_id).push(like.user_id)
    })

    // Step 6: Fetch comments with author info
    console.log("💭 [Timeline] Buscando comentários...")
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        stats,
        users!comments_user_id_fkey (
          id,
          name,
          username,
          avatar_url,
          is_verified
        )
      `)
      .in("post_id", postIds)
      .order("created_at", { ascending: true })

    if (commentsError) {
      console.error("❌ [Timeline] Erro ao buscar comentários:", commentsError)
    } else {
      console.log("💬 [Timeline] Comentários carregados:", (comments || []).length)
    }

    // Group comments by post
    const commentsMap = new Map()
    ;(comments || []).forEach((comment: any) => {
      if (!commentsMap.has(comment.post_id)) {
        commentsMap.set(comment.post_id, [])
      }
      commentsMap.get(comment.post_id).push({
        id: comment.id,
        content: comment.content,
        createdAt: typeof comment.created_at === 'string' ? comment.created_at : new Date(comment.created_at).toISOString(),
        author: {
          id: comment.users.id,
          name: comment.users.name || "Usuário",
          username: comment.users.username || "unknown",
          avatar: comment.users.avatar_url,
          verified: comment.users.is_verified || false,
        },
        likes: comment.stats?.likes || 0,
      })
    })

    // Step 7: Combine all data
    console.log("🔧 [Timeline] Processando dados dos posts...")
    const timelinePosts = (posts || []).map((post) => {
      const author = authorMap.get(post.user_id)
      const postLikes = likesMap.get(post.id) || []
      const postComments = commentsMap.get(post.id) || []

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.media_urls?.[0] || null,
        mediaType: post.media_types?.[0] || null,
        mediaUrls: post.media_urls || [],
        visibility: post.visibility,
        createdAt: typeof post.created_at === 'string' ? post.created_at : new Date(post.created_at).toISOString(),
        user: author || {
          id: post.user_id,
          name: "Usuário",
          username: "unknown",
          avatar: null,
          verified: false,
          type: "single",
          location: "Localização não informada",
          premium: false,
          bio: "",
          relationshipType: "single",
          isPrivate: false,
        },
        likes: postLikes.length,
        likesCount: postLikes.length,
        liked: user ? postLikes.includes(user.id) : false,
        comments: postComments.length,
        commentsCount: postComments.length,
        images: post.media_urls?.filter((_: any, index: number) => post.media_types?.[index] === 'image') || [],
        video: post.media_urls?.find((_: any, index: number) => post.media_types?.[index] === 'video') || null,
        audio: post.media_urls?.find((_: any, index: number) => post.media_types?.[index] === 'audio') || null,
        poll: post.poll_options ? {
          id: post.id,
          question: "Enquete",
          options: post.poll_options.map((option: string, index: number) => ({
            id: `${post.id}-${index}`,
            text: option,
            votes: 0,
            percentage: 0
          })),
          totalVotes: 0,
          userVote: null,
          expiresAt: null
        } : null,
        event: post.is_event ? post.event_details : null,
        shares: (post.stats?.shares) || 0,
        reposts: 0,
        saved: false,
        timestamp: typeof post.created_at === 'string' ? post.created_at : new Date(post.created_at).toISOString(),
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        location: post.location,
        isPremium: post.is_premium_content || false,
        price: post.price || null,
      }
    })

    const result = {
      data: timelinePosts,
      hasMore: (posts || []).length === limit,
      page,
      limit,
      total: timelinePosts.length,
      debug: {
        postsFound: (posts || []).length,
        authorsFound: (authors || []).length,
        likesFound: (likes || []).length,
        commentsFound: (comments || []).length,
        userAuthenticated: !!user
      }
    }

    console.log("✅ [Timeline] Retornando", timelinePosts.length, "posts processados")
    console.log("📊 [Timeline] Debug info:", result.debug)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ [Timeline] Erro geral:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}