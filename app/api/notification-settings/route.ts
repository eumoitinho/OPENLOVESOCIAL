import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

    // Buscar configurações do usuário
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Erro ao buscar configurações:", error)
      return NextResponse.json(
        { error: "Erro ao buscar configurações" },
        { status: 500 }
      )
    }

    // Se não existem configurações, criar com valores padrão
    if (!settings) {
      const defaultSettings = {
        user_id: user.id,
        likes_enabled: true,
        comments_enabled: true,
        follows_enabled: true,
        messages_enabled: true,
        mentions_enabled: true,
        saves_enabled: true,
        shares_enabled: true,
        events_enabled: true,
        communities_enabled: true,
        system_enabled: true,
        matches_enabled: true,
        open_dates_enabled: true,
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00'
      }

      const { data: newSettings, error: insertError } = await supabase
        .from('notification_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        console.error("Erro ao criar configurações padrão:", insertError)
        return NextResponse.json(
          { error: "Erro ao criar configurações" },
          { status: 500 }
        )
      }

      return NextResponse.json({ settings: newSettings })
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error("Erro no endpoint de configurações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

    const body = await req.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { error: "Configurações necessárias" },
        { status: 400 }
      )
    }

    // Atualizar configurações
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar configurações:", error)
      return NextResponse.json(
        { error: "Erro ao atualizar configurações" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Configurações atualizadas",
      settings: data
    })

  } catch (error) {
    console.error("Erro no endpoint de configurações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 