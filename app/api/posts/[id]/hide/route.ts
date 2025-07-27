import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function POST(
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

    // Verificar se o post existe
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não pode ocultar próprio post
    if (post.user_id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode ocultar seu próprio post' },
        { status: 400 }
      )
    }

    // Verificar se já ocultou este post
    const { data: existingHide } = await supabase
      .from('hidden_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single()

    if (existingHide) {
      return NextResponse.json(
        { error: 'Post já está oculto' },
        { status: 409 }
      )
    }

    // Ocultar o post
    const { data: hiddenPost, error: hideError } = await supabase
      .from('hidden_posts')
      .insert({
        user_id: user.id,
        post_id: id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (hideError) {
      console.error('Erro ao ocultar post:', hideError)
      return NextResponse.json(
        { error: 'Erro ao ocultar post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: hiddenPost,
      message: 'Post ocultado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao ocultar post:', error)
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

    // Remover o post da lista de ocultos
    const { error: unhideError } = await supabase
      .from('hidden_posts')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', id)

    if (unhideError) {
      console.error('Erro ao mostrar post:', unhideError)
      return NextResponse.json(
        { error: 'Erro ao mostrar post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Post exibido novamente'
    })

  } catch (error) {
    console.error('Erro ao mostrar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
