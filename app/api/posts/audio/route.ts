import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar autenticação
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autenticação necessário" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Verificar se o usuário é assinante
    const { data: userProfile } = await supabase
      .from("users")
      .select("plano, status_assinatura")
      .eq("id", user.id)
      .single()

    if (!userProfile || userProfile.plano === "free") {
      return NextResponse.json(
        { error: "Posts de áudio disponíveis apenas para assinantes" },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const content = formData.get("content") as string
    const audioFile = formData.get("audio") as File
    const visibility = formData.get("visibility") as string || "public"

    if (!audioFile) {
      return NextResponse.json(
        { error: "Arquivo de áudio necessário" },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ["audio/wav", "audio/mp3", "audio/m4a", "audio/ogg"]
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado. Use WAV, MP3, M4A ou OGG" },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 25MB para Gold, 50MB para Diamante)
    const maxSize = userProfile.plano === "gold" ? 25 * 1024 * 1024 : 50 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo ${userProfile.plano === "gold" ? "25MB" : "50MB"} para seu plano` },
        { status: 400 }
      )
    }

    // Upload do arquivo de áudio
    const fileName = `${user.id}/audio/${Date.now()}-${audioFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("posts")
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
        cacheControl: "3600",
        upsert: false
      })

    if (uploadError) {
      console.error("Erro no upload:", uploadError)
      return NextResponse.json(
        { error: "Erro ao fazer upload do áudio" },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName)

    // Calcular duração do áudio (simulado - em produção você usaria uma biblioteca como ffmpeg)
    const audioDuration = Math.floor(audioFile.size / 16000) // Estimativa aproximada

    // Criar post no banco
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content || "",
        audio_url: publicUrl,
        audio_duration: audioDuration,
        post_type: "audio",
        visibility: visibility,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (postError) {
      console.error("Erro ao criar post:", postError)
      return NextResponse.json(
        { error: "Erro ao criar post de áudio" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: postData,
      message: "Post de áudio criado com sucesso!"
    })

  } catch (error) {
    console.error("Erro no processamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 