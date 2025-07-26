import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Pegar a imagem base64 do corpo da requisição
    const { avatar } = await req.json()
    
    if (!avatar) {
      return NextResponse.json({ error: "Nenhuma imagem fornecida" }, { status: 400 })
    }

    // Verificar se é uma URL base64 válida
    if (!avatar.startsWith('data:image/')) {
      return NextResponse.json({ error: "Formato de imagem inválido" }, { status: 400 })
    }

    // Remover o prefixo data:image/...;base64,
    const base64Data = avatar.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Converter base64 para buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Determinar extensão baseada no tipo de imagem
    let fileExt = 'jpg'
    if (avatar.startsWith('data:image/png')) {
      fileExt = 'png'
    } else if (avatar.startsWith('data:image/gif')) {
      fileExt = 'gif'
    } else if (avatar.startsWith('data:image/webp')) {
      fileExt = 'webp'
    }
    
    // Gerar nome único para o arquivo
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
    
    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error("Erro no upload:", uploadError)
      return NextResponse.json({ error: "Erro ao fazer upload da imagem" }, { status: 500 })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Atualizar o perfil do usuário com a nova URL do avatar
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', user.id)

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError)
      // Tentar deletar a imagem que foi feito upload
      await supabase.storage.from('avatars').remove([fileName])
      return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
    }

    // Retornar a nova URL do avatar
    return NextResponse.json({ 
      success: true, 
      avatar_url: publicUrl 
    })

  } catch (error) {
    console.error("Erro no upload do avatar:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}