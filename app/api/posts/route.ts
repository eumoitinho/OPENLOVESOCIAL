import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase"
import { verifyAuth } from "@/app/lib/auth-helpers"
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando criação de post...")
    const supabase = await createRouteHandlerClient()
    const supabaseStorage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Verificar autenticação e timeout de sessão
    const { user, error: authError } = await verifyAuth()
    
    console.log("Usuário atual:", user?.id, "Erro:", authError)
    
    if (authError || !user) {
      console.log("Usuário não autenticado ou sessão expirada:", authError)
      return NextResponse.json({ 
        error: authError === "Session expired" ? "Session expired" : "Unauthorized" 
      }, { status: 401 })
    }

    // Garantir que o usuário existe na tabela users
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("id, plano")
      .eq("id", user.id)
      .single()
    
    if (!userRow) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user_" + user.id.substring(0, 8),
          name: user.user_metadata?.full_name || "Usuário",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plano: 'free'
        })
      if (insertError) {
        console.error("Erro ao criar perfil na tabela users:", insertError)
        return NextResponse.json({ error: "Erro ao criar perfil de usuário", details: insertError }, { status: 500 })
      }
      console.log("Perfil criado automaticamente na tabela users para:", user.id)
    }

    let content = ""
    let visibility = "public"
    let mediaUrls: string[] = []
    let mediaTypes: string[] = []

    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData()
      content = formData.get("content")?.toString() || ""
      visibility = formData.get("visibility")?.toString() || "public"

      const userPlan = userRow?.plano || 'free'
      const maxImages = userPlan === 'gold' ? 5 : userPlan === 'diamond' ? 10 : 0
      const maxVideoSize = userPlan === 'gold' ? 25 * 1024 * 1024 : userPlan === 'diamond' ? 50 * 1024 * 1024 : 0

      // Processar arquivos de imagem
      const images = formData.getAll("images")
      if (images.length > maxImages) {
        return NextResponse.json({ error: `Máximo de ${maxImages} imagens permitido` }, { status: 400 })
      }
      for (const img of images) {
        if (typeof img === "object" && "name" in img && "type" in img) {
          if (!['image/jpeg', 'image/png'].includes(img.type)) {
            return NextResponse.json({ error: "Apenas imagens JPEG e PNG são aceitas" }, { status: 400 })
          }
          // Limite de 10MB para imagens em todos os planos
          if (img.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Imagem muito grande. Máximo 10MB por arquivo." }, { status: 400 })
          }
          const fileExt = img.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
          const { data, error } = await supabaseStorage.storage
            .from('media')
            .upload(fileName, img, { upsert: false, contentType: img.type })
          if (error) {
            console.error("Erro ao enviar imagem:", error)
            continue
          }
          const publicUrl = supabaseStorage.storage.from('media').getPublicUrl(fileName).data.publicUrl
          if (publicUrl) {
            mediaUrls.push(publicUrl)
            mediaTypes.push("image")
          }
        }
      }

      // Processar vídeo
      const video = formData.get("video")
      if (video && typeof video === "object" && "name" in video && "type" in video) {
        if (video.type !== 'video/mp4') {
          return NextResponse.json({ error: "Apenas vídeos MP4 são aceitos" }, { status: 400 })
        }
        if (video.size > maxVideoSize) {
          return NextResponse.json({ error: `Vídeo muito grande. Máximo ${maxVideoSize / (1024 * 1024)}MB` }, { status: 400 })
        }
        const fileExt = video.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const { data, error } = await supabaseStorage.storage
          .from('media')
          .upload(fileName, video, { upsert: false, contentType: video.type })
        if (error) {
          console.error("Erro ao enviar vídeo:", error)
          return NextResponse.json({ error: "Erro ao enviar vídeo" }, { status: 500 })
        }
        const publicUrl = supabaseStorage.storage.from('media').getPublicUrl(fileName).data.publicUrl
        if (publicUrl) {
          mediaUrls.push(publicUrl)
          mediaTypes.push("video")
        }
      }
    } else {
      const body = await request.json()
      content = body.content
      visibility = body.visibility || "public"
      if (body.mediaUrl) mediaUrls.push(body.mediaUrl)
      if (body.mediaType) mediaTypes.push(body.mediaType)
    }

    console.log("Dados do post:", { content, mediaUrls, mediaTypes, visibility })

    if (!content?.trim() && mediaUrls.length === 0) {
      console.log("Conteúdo vazio")
      return NextResponse.json({ error: "Content or media is required" }, { status: 400 })
    }

    // Create post
    console.log("Criando post no banco...")
    const postData = {
      user_id: user.id,
      content: content.trim(),
      media_urls: mediaUrls,
      media_types: mediaTypes,
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
      .select("username, name, avatar_url, is_verified")
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
        name: profile?.name || "Usuário",
        username: profile?.username || "unknown",
        avatar: profile?.avatar_url,
        verified: profile?.is_verified || false,
        type: "single",
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
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Verificar autenticação e timeout de sessão
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json({ 
        error: authError === "Session expired" ? "Session expired" : "Unauthorized" 
      }, { status: 401 })
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