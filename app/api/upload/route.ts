import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient} from "@/app/lib/supabase-server"
import { promises as fs } from "fs"
import path from "path"
import { validateMediaFile, generateFileName, getMediaUrl } from "@/app/lib/media-utils"
import type { Database } from "@/app/lib/database.types"
import { verifyAuth } from "@/app/lib/auth-helpers"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { user, error } = await verifyAuth()
    if (error || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do formulário
    const formData = await request.formData()
    const file = formData.get("file") as File
    const altText = formData.get("altText") as string
    const isProfilePicture = formData.get("isProfilePicture") === "true"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar arquivo
    const validation = validateMediaFile(file)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Se for foto de perfil, deve ser imagem
    if (isProfilePicture && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Foto de perfil deve ser uma imagem" }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const fileName = generateFileName(file.name, user.id)
    const storageDir = process.env.STORAGE_PATH || "/var/www/storage"
    const filePath = path.join(storageDir, fileName)

    // Criar diretório se não existir
    await fs.mkdir(storageDir, { recursive: true })

    // Salvar arquivo
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // Obter metadados adicionais
    const width: number | null = null
    const height: number | null = null
    const duration: number | null = null

    if (file.type.startsWith("image")) {
      try {
        // Para imagens, podemos usar uma biblioteca como sharp em produção
        // Por enquanto, vamos deixar null e obter via frontend
      } catch (error) {
        console.warn("Erro ao obter dimensões da imagem:", error)
      }
    }

    // Salvar metadados no banco
    const mediaData = {
      user_id: user.id,
      url: getMediaUrl(fileName),
      filename: fileName,
      original_name: file.name,
      file_type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other",
      mime_type: file.type,
      file_size: file.size,
      width,
      height,
      duration,
      alt_text: altText || null,
      is_profile_picture: isProfilePicture,
      is_public: true,
    }

    const { data: media, error: insertError } = await supabase.from("media").insert(mediaData).select().single()

    if (insertError) {
      // Remover arquivo se erro no banco
      try {
        await fs.unlink(filePath)
      } catch (unlinkError) {
        console.error("Erro ao remover arquivo:", unlinkError)
      }

      console.error("Erro ao salvar no banco:", insertError)
      return NextResponse.json({ error: "Erro ao salvar arquivo" }, { status: 500 })
    }

    // Se for foto de perfil, atualizar perfil do usuário
    if (isProfilePicture && media) {
      const { error: profileError } = await supabase.rpc("set_profile_picture", {
        media_id: media.id,
      })

      if (profileError) {
        console.error("Erro ao definir foto de perfil:", profileError)
      }
    }

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        filename: media.filename,
        fileType: media.file_type,
        fileSize: media.file_size,
      },
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { user, error } = await verifyAuth()
    if (error || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get("id")

    if (!mediaId) {
      return NextResponse.json({ error: "ID da mídia é obrigatório" }, { status: 400 })
    }

    // Buscar mídia no banco
    const { data: media, error: fetchError } = await supabase
      .from("media")
      .select("*")
      .eq("id", mediaId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !media) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    // Remover arquivo do sistema
    const storageDir = process.env.STORAGE_PATH || "/var/www/storage"
    const filePath = path.join(storageDir, media.filename)

    try {
      await fs.unlink(filePath)
    } catch (unlinkError) {
      console.warn("Arquivo não encontrado no sistema:", unlinkError)
    }

    // Remover do banco
    const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId).eq("user_id", user.id)

    if (deleteError) {
      console.error("Erro ao deletar do banco:", deleteError)
      return NextResponse.json({ error: "Erro ao deletar mídia" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar mídia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
