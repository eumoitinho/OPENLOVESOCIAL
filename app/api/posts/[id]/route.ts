import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()

    // Buscar o post
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          avatar_url,
          is_verified,
          is_premium
        )
      `)
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: post })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Conteúdo deve ter no máximo 280 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o post existe e pertence ao usuário
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode editar seus próprios posts' },
        { status: 403 }
      )
    }

    // Atualizar o post
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          avatar_url,
          is_verified,
          is_premium
        )
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar post:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data: updatedPost,
      message: 'Post atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao editar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o post existe e pertence ao usuário
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id, media_urls')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode excluir seus próprios posts' },
        { status: 403 }
      )
    }

    // Deletar curtidas e comentários relacionados primeiro
    await Promise.all([
      supabase.from('likes').delete().eq('post_id', id),
      supabase.from('comments').delete().eq('post_id', id),
      supabase.from('post_saves').delete().eq('post_id', id),
      supabase.from('post_shares').delete().eq('post_id', id)
    ])

    // Deletar o post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar post:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar post' },
        { status: 500 }
      )
    }

    // TODO: Deletar arquivos de mídia do storage se existirem
    if (existingPost.media_urls && existingPost.media_urls.length > 0) {
      try {
        const mediaFiles = existingPost.media_urls.map((url: string) => {
          const path = url.split('/').pop()
          return path
        }).filter(Boolean)

        if (mediaFiles.length > 0) {
          await supabase.storage
            .from('posts')
            .remove(mediaFiles)
        }
      } catch (storageError) {
        console.warn('Erro ao deletar arquivos de mídia:', storageError)
        // Não falhar a operação se não conseguir deletar os arquivos
      }
    }

    return NextResponse.json({ 
      message: 'Post excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}