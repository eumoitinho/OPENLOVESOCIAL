import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
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
    const { blocked_user_id, blocked_username } = body

    if (!blocked_user_id && !blocked_username) {
      return NextResponse.json(
        { error: 'ID ou username do usuário a ser bloqueado é obrigatório' },
        { status: 400 }
      )
    }

    let targetUserId = blocked_user_id

    // Se não tiver ID, buscar pelo username
    if (!targetUserId && blocked_username) {
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', blocked_username)
        .single()

      if (userError || !targetUser) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      targetUserId = targetUser.id
    }

    // Não pode bloquear a si mesmo
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Você não pode bloquear a si mesmo' },
        { status: 400 }
      )
    }

    // Verificar se já está bloqueado
    const { data: existingBlock } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)
      .single()

    if (existingBlock) {
      return NextResponse.json(
        { error: 'Usuário já está bloqueado' },
        { status: 409 }
      )
    }

    // Criar o bloqueio
    const { data: block, error: blockError } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: targetUserId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (blockError) {
      console.error('Erro ao bloquear usuário:', blockError)
      return NextResponse.json(
        { error: 'Erro ao bloquear usuário' },
        { status: 500 }
      )
    }

    // Remover seguimentos mútuos se existirem
    await Promise.all([
      supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId),
      supabase
        .from('follows')
        .delete()
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
    ])

    return NextResponse.json({
      data: block,
      message: 'Usuário bloqueado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
    const { blocked_user_id, blocked_username } = body

    if (!blocked_user_id && !blocked_username) {
      return NextResponse.json(
        { error: 'ID ou username do usuário é obrigatório' },
        { status: 400 }
      )
    }

    let targetUserId = blocked_user_id

    // Se não tiver ID, buscar pelo username
    if (!targetUserId && blocked_username) {
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', blocked_username)
        .single()

      if (userError || !targetUser) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      targetUserId = targetUser.id
    }

    // Remover o bloqueio
    const { error: unblockError } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetUserId)

    if (unblockError) {
      console.error('Erro ao desbloquear usuário:', unblockError)
      return NextResponse.json(
        { error: 'Erro ao desbloquear usuário' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Usuário desbloqueado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
