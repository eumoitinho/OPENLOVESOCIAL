import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    const supabase = await createRouteHandlerClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o username já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Username já está em uso' }, { status: 400 })
    }

    // Atualizar o username
    const { error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar username:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar username' }, { status: 500 })
    }

    return NextResponse.json({ success: true, username })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 