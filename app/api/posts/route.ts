import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando criação de post...")
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    
    console.log("Usuário atual:", user?.id, "Erro:", userError)
    
    if (userError || !user) {
      console.log("Usuário não autenticado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Garantir que o usuário existe na tabela users
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()
    if (!userRow) {
      // Criar perfil mínimo
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user_" + user.id.substring(0, 8),
          full_name: user.user_metadata?.full_name || "Usuário",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      if (insertError) {
        console.error("Erro ao criar perfil na tabela users:", insertError)
        return NextResponse.json({ error: "Erro ao criar perfil de usuário", details: insertError }, { status: 500 })
      }
      console.log("Perfil criado automaticamente na tabela users para:", user.id)
    }

    const body = await request.json()
    const { content, mediaUrl, mediaType, visibility = "public" } = body
    
    console.log("Dados do post:", { content, mediaUrl, mediaType, visibility })

    if (!content?.trim()) {
      console.log("Conteúdo vazio")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Create post
    console.log("Criando post no banco...")
    const postData = {
      user_id: user.id,
      content: content.trim(),
      media_urls: mediaUrl ? [mediaUrl] : [],
      media_types: mediaType ? [mediaType] : [],
      visibility,
    }
    
    console.log("Dados para inserção:", postData)
    
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single()

    if (postError) {
      console.error("Post creation error:", postError)
      return NextResponse.json({ error: "Failed to create post", details: postError }, { status: 500 })
    }
    
    console.log("Post criado com sucesso:", post)

    // Get author profile
    const { data: profile } = await supabase
      .from("users")
      .select("username, full_name, avatar_url, is_verified, profile_type")
      .eq("id", user.id)
      .single()

    // Return formatted post
    const formattedPost = {
      id: post.id,
      content: post.content,
      mediaUrl: post.media_urls?.[0] || null,
      mediaType: post.media_types?.[0] || null,
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
      query = query.eq("user_id", userId)
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
