import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Criar notificação de teste
    const { data: notification, error } = await supabase
      .rpc('create_test_notification', { p_user_id: user.id })

    if (error) {
      console.error('Erro ao criar notificação de teste:', error)
      return NextResponse.json({ error: "Erro ao criar notificação de teste" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notificação de teste criada com sucesso",
      notification_id: notification
    })

  } catch (error) {
    console.error('Erro no endpoint de teste:', error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}