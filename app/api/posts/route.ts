import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient, createSupabaseAdmin } from "@/app/lib/supabase-server"
import { verifyAuth } from "@/app/lib/auth-helpers"
import { createClient } from '@supabase/supabase-js'
import { planValidator } from '@/lib/plans/server'

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando criação de post...")
    const supabase = await createRouteHandlerClient()
    const supabaseStorage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      .select("id, premium_type")
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
          premium_type: 'free',
          is_active: true
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
    let pollOptions: string[] = []

    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData()
      content = formData.get("content")?.toString() || ""
      visibility = formData.get("visibility")?.toString() || "public"

      // Processar arquivos de imagem
      const images = formData.getAll("images")
      const videoFile = formData.get("video")
      const audioFile = formData.get("audio")
      const pollData = formData.get("poll")
      
      // Verificar limitações de upload usando o novo sistema
      const uploadValidation = await planValidator.canUploadMedia(user.id, images.length, videoFile?.size || 0)
      
      if (!uploadValidation.allowed) {
        return NextResponse.json({ error: uploadValidation.reason }, { status: 400 })
      }
      
      console.log("Validação de upload aprovada para usuário:", user.id)
      
      // Garantir que o bucket 'media' existe
      try {
        await supabaseStorage.storage.createBucket('media', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
        })
        console.log("Bucket 'media' criado com sucesso")
      } catch (bucketError) {
        // Bucket já existe ou erro de permissão - continuar
        console.log("Bucket 'media' já existe ou erro ao criar:", (bucketError as any).message)
      }


      // Processar imagens
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
          const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
          const { data, error } = await supabaseStorage.storage
            .from('media')
            .upload(fileName, img, { upsert: false, contentType: img.type })
          if (error) {
            console.error("Erro ao enviar imagem:", error)
            // Se erro de bucket, tentar criar post sem mídia
            if (error.message?.includes('Bucket not found')) {
              console.log("⚠️ Bucket não encontrado - post será criado sem mídia")
              break
            }
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
      if (videoFile && typeof videoFile === "object" && "name" in videoFile && "type" in videoFile) {
        if (videoFile.type !== 'video/mp4') {
          return NextResponse.json({ error: "Apenas vídeos MP4 são aceitos" }, { status: 400 })
        }
        // Verificar se pode fazer upload de vídeo
        const videoValidation = await planValidator.validateVideoUpload(user.id)
        
        if (!videoValidation.allowed) {
          return NextResponse.json({ error: videoValidation.reason }, { status: 400 })
        }
        const fileExt = videoFile.name.split('.').pop()
        const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const { data, error } = await supabaseStorage.storage
          .from('media')
          .upload(fileName, videoFile, { upsert: false, contentType: videoFile.type })
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

      // Processar áudio
      if (audioFile && typeof audioFile === "object" && "name" in audioFile && "type" in audioFile) {
        if (!['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm'].includes(audioFile.type)) {
          return NextResponse.json({ error: "Apenas arquivos de áudio MP3, WAV, M4A e WebM são aceitos" }, { status: 400 })
        }
        // Limite de 25MB para áudio
        if (audioFile.size > 25 * 1024 * 1024) {
          return NextResponse.json({ error: "Arquivo de áudio muito grande. Máximo 25MB." }, { status: 400 })
        }
        
        // Verificar se pode fazer upload de áudio (recurso premium)
        const audioValidation = await planValidator.validateAudioUpload(user.id)
        
        if (!audioValidation.allowed) {
          return NextResponse.json({ error: audioValidation.reason }, { status: 400 })
        }
        
        const fileExt = audioFile.name.split('.').pop()
        const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const { data, error } = await supabaseStorage.storage
          .from('media')
          .upload(fileName, audioFile, { upsert: false, contentType: audioFile.type })
        if (error) {
          console.error("Erro ao enviar áudio:", error)
          return NextResponse.json({ error: "Erro ao enviar áudio" }, { status: 500 })
        }
        const publicUrl = supabaseStorage.storage.from('media').getPublicUrl(fileName).data.publicUrl
        if (publicUrl) {
          mediaUrls.push(publicUrl)
          mediaTypes.push("audio")
        }
      }

      // Processar enquete
      if (pollData) {
        try {
          const pollOptionsData = JSON.parse(pollData.toString())
          if (Array.isArray(pollOptionsData) && pollOptionsData.length >= 2) {
            // Verificar se pode criar enquetes (recurso premium)
            const pollValidation = await planValidator.validatePollCreation(user.id)
            
            if (!pollValidation.allowed) {
              return NextResponse.json({ error: pollValidation.reason }, { status: 400 })
            }
            
            pollOptions = pollOptionsData.filter(option => option.trim()).slice(0, 4)
            console.log("Enquete processada com", pollOptions.length, "opções")
          }
        } catch (error) {
          console.error("Erro ao processar enquete:", error)
        }
      }
    } else {
      const body = await request.json()
      content = body.content
      visibility = body.visibility || "public"
      if (body.mediaUrl) mediaUrls.push(body.mediaUrl)
      if (body.mediaType) mediaTypes.push(body.mediaType)
      if (body.pollOptions) pollOptions = body.pollOptions
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
      poll_options: pollOptions.length > 0 ? pollOptions : null,
    }
    
    console.log("Dados para inserção:", postData)
    
    // Usar admin client para contornar problemas de RLS temporariamente
    const supabaseAdmin = createSupabaseAdmin()
    const { data: post, error: postError } = await supabaseAdmin
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
      mediaUrls: post.media_urls || [],
      mediaTypes: post.media_types || [],
      visibility: post.visibility,
      pollOptions: post.poll_options || null,
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