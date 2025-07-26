import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'

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

    const body = await request.json()
    const { reason, description } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Motivo da denúncia é obrigatório' },
        { status: 400 }
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

    // Não pode denunciar próprio post
    if (post.user_id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode denunciar seu próprio post' },
        { status: 400 }
      )
    }

    // Verificar se já denunciou este post
    const { data: existingReport } = await supabase
      .from('post_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('post_id', id)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'Você já denunciou este post' },
        { status: 409 }
      )
    }

    // Criar a denúncia
    const { data: report, error: reportError } = await supabase
      .from('post_reports')
      .insert({
        reporter_id: user.id,
        post_id: id,
        reported_user_id: post.user_id,
        reason,
        description: description || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (reportError) {
      console.error('Erro ao criar denúncia:', reportError)
      return NextResponse.json(
        { error: 'Erro ao denunciar post' },
        { status: 500 }
      )
    }

    // Incrementar contador de denúncias do post usando RPC
    await supabase.rpc('increment_post_report_count', { post_id: id })

    return NextResponse.json({
      data: report,
      message: 'Post denunciado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao denunciar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}