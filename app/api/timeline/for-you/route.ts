import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    console.log("🎯 [For You] Iniciando algoritmo de timeline personalizada...")
    console.log("📊 [For You] Parâmetros:", { page, limit, offset })
    console.log("🔍 [For You] Headers:", request.headers.get('cookie'))

    // Buscar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("❌ [For You] Usuário não autenticado")
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    console.log("✅ [For You] Usuário autenticado:", user.id)

    // Step 1: Buscar perfil do usuário para análise de interesses
    const { data: userProfile } = await supabase
      .from("users")
      .select("interests, location, id")
      .eq("id", user.id)
      .single()

    // Step 2: Buscar usuários que o usuário atual NÃO segue
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted")

    const followingIds = (following || []).map(f => f.following_id)
    followingIds.push(user.id) // Também excluir posts do próprio usuário

    console.log("👥 [For You] Usuários seguidos (excluindo):", followingIds.length)

    // Step 3: Buscar posts de usuários NÃO seguidos com dados para rankeamento
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
        created_at,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url,
          is_verified,
          is_premium,
          location,
          bio,
          interests,
          created_at
        )
      `)
      .eq("visibility", "public")
      .not("user_id", "in", `(${followingIds.join(',')})`)
      .order("created_at", { ascending: false })
      .limit(limit * 3) // Buscar mais posts para aplicar algoritmo

    if (postsError) {
      console.error("❌ [For You] Erro ao buscar posts:", postsError)
      return NextResponse.json({ 
        error: "Failed to fetch posts", 
        details: postsError.message 
      }, { status: 500 })
    }

    console.log("✅ [For You] Posts encontrados:", (posts || []).length)

    if (!posts || posts.length === 0) {
      console.log("📭 [For You] Nenhum post encontrado")
      return NextResponse.json({
        data: [],
        hasMore: false,
        page,
        limit,
        total: 0
      })
    }

    // Step 4: Buscar interações do usuário para análise de preferências
    const { data: userLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .limit(100)

    const { data: userComments } = await supabase
      .from("comments")
      .select("post_id")
      .eq("user_id", user.id)
      .limit(100)

    const likedPostIds = (userLikes || []).map(l => l.post_id)
    const commentedPostIds = (userComments || []).map(c => c.post_id)

    // Step 5: Aplicar algoritmo de rankeamento
    const rankedPosts = posts.map((post: any) => {
      let score = 0
      const now = new Date()
      const postDate = new Date(post.created_at)
      const hoursAgo = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60)

      // 1. Frescor do post (maior peso para posts mais recentes)
      if (hoursAgo < 1) score += 10
      else if (hoursAgo < 6) score += 8
      else if (hoursAgo < 24) score += 6
      else if (hoursAgo < 72) score += 4
      else score += 2

      // 2. Engajamento (likes, comentários, shares)
      const likes = post.stats?.likes || 0
      const comments = post.stats?.comments || 0
      const shares = post.stats?.shares || 0
      
      score += Math.min(likes * 0.1, 5)
      score += Math.min(comments * 0.3, 8)
      score += Math.min(shares * 0.5, 10)

      // 3. Compatibilidade de interesses
      const postHashtags = post.hashtags || []
      const userInterests = userProfile?.interests || []
      const commonInterests = postHashtags.filter((tag: string) => 
        userInterests.some((interest: string) => 
          interest.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      )
      score += commonInterests.length * 3

      // 4. Proximidade geográfica
      if (post.location && userProfile?.location) {
        // Bonus simples para posts da mesma localização
        if (post.location.toLowerCase().includes(userProfile.location.toLowerCase()) ||
            userProfile.location.toLowerCase().includes(post.location.toLowerCase())) {
          score += 5
        }
      }

      // 5. Qualidade do conteúdo
      const contentLength = post.content?.length || 0
      if (contentLength > 50 && contentLength < 500) score += 2
      if (post.media_urls?.length > 0) score += 3
      if (post.is_event) score += 4

      // 6. Qualidade do autor
      const author = post.users
      if (author.is_verified) score += 3
      if (author.is_premium) score += 2
      
      // Bonus para autores novos (usuários recentes)
      const authorDate = new Date(author.created_at)
      const authorDaysAgo = (now.getTime() - authorDate.getTime()) / (1000 * 60 * 60 * 24)
      if (authorDaysAgo < 30) score += 2

      // 7. Diversidade (evitar muitos posts do mesmo autor)
      // Será aplicado na seleção final

      return {
        ...post,
        algorithmScore: score,
        hoursAgo,
        engagementRate: (likes + comments + shares) / Math.max(hoursAgo, 1)
      }
    })

    // Step 6: Ordenar por score e aplicar diversidade
    rankedPosts.sort((a, b) => b.algorithmScore - a.algorithmScore)
    
    // Step 7: Aplicar diversidade (máximo 2 posts por autor na primeira página)
    const diversifiedPosts = []
    const authorCount = new Map()
    
    for (const post of rankedPosts) {
      const authorId = post.user_id
      const count = authorCount.get(authorId) || 0
      
      if (count < 2 || diversifiedPosts.length >= limit) {
        diversifiedPosts.push(post)
        authorCount.set(authorId, count + 1)
      }
      
      if (diversifiedPosts.length >= limit) break
    }

    // Step 8: Buscar dados complementares (likes, comentários)
    const finalPosts = diversifiedPosts.slice(offset, offset + limit)
    const postIds = finalPosts.map(p => p.id)

    // Buscar likes
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds)

    // Buscar comentários
    const { data: comments } = await supabase
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

    // Mapear dados
    const likesMap = new Map()
    const commentsMap = new Map()

    ;(likes || []).forEach(like => {
      if (!likesMap.has(like.post_id)) {
        likesMap.set(like.post_id, [])
      }
      likesMap.get(like.post_id).push(like.user_id)
    })

    ;(comments || []).forEach(comment => {
      if (!commentsMap.has(comment.post_id)) {
        commentsMap.set(comment.post_id, [])
      }
      commentsMap.get(comment.post_id).push({
        id: comment.id,
        content: comment.content,
        createdAt: typeof comment.created_at === 'string' ? comment.created_at : new Date(comment.created_at).toISOString(),
        author: {
          id: comment.users?.[0]?.id || '',
          name: comment.users?.[0]?.name || "Usuário",
          username: comment.users?.[0]?.username || "unknown",
          avatar: comment.users?.[0]?.avatar_url || '',
          verified: comment.users?.[0]?.is_verified || false,
        },
        likes: comment.stats?.likes || 0,
      })
    })

    // Step 9: Formatar resposta final
    const timelinePosts = finalPosts.map((post) => {
      const author = post.users
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
        user: {
          id: author.id,
          name: author.name || "Usuário",
          username: author.username || "unknown",
          avatar: author.avatar_url,
          verified: author.is_verified || false,
          premium: author.is_premium || false,
          location: author.location || "Localização não informada",
          bio: author.bio || "",
          relationshipType: "single",
          isPrivate: false,
        },
        likes: postLikes.length,
        likesCount: postLikes.length,
        liked: postLikes.includes(user.id),
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
        // Dados do algoritmo (para debug)
        _algorithmScore: post.algorithmScore,
        _hoursAgo: post.hoursAgo,
        _engagementRate: post.engagementRate
      }
    })

    console.log("🎯 [For You] Posts rankeados e retornados:", timelinePosts.length)
    console.log("📊 [For You] Scores médios:", {
      avgScore: timelinePosts.reduce((sum, p) => sum + p._algorithmScore, 0) / timelinePosts.length,
      topScore: timelinePosts[0]?._algorithmScore || 0
    })

    return NextResponse.json({
      data: timelinePosts,
      hasMore: rankedPosts.length > offset + limit,
      page,
      limit,
      total: rankedPosts.length,
      algorithm: {
        totalCandidates: posts.length,
        rankedPosts: rankedPosts.length,
        diversifiedPosts: diversifiedPosts.length,
        finalPosts: timelinePosts.length
      }
    })

  } catch (error) {
    console.error("❌ [For You] Erro interno:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}