import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      birthDate,
      profileType,
      seeking,
      interests,
      otherInterest,
      bio,
      city,
      uf,
      latitude,
      longitude,
      plan,
      partner
    } = await req.json()

    // Validar dados obrigatórios
    if (!email || !password || !username || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      )
    }

    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variáveis de ambiente do Supabase não configuradas")
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: `${firstName} ${lastName}`,
      },
    })

    if (authError) {
      console.error("Erro ao criar usuário:", authError)
      return NextResponse.json(
        { error: "Erro ao criar usuário: " + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Falha ao criar usuário" },
        { status: 500 }
      )
    }

    // Função para garantir que arrays sejam válidos
    const ensureArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          // Tenta fazer parse se for uma string JSON
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // Se não for JSON válido, trata como string simples
          return [value];
        }
      }
      return [];
    };

    // 2. Criar perfil completo no banco de dados - inserção direta
    const profileData = {
      id: authData.user.id,
      email,
      username,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate || null,
      profile_type: profileType || 'single',
      seeking: ensureArray(seeking),
      interests: ensureArray(interests),
      other_interest: otherInterest || null,
      bio: bio || null,
      location: city || null,
      uf: uf ? uf.substring(0, 2).toUpperCase() : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      plano: plan || 'free',
      status_assinatura: plan === "free" ? "authorized" : "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partner: profileType === "couple" && partner ? partner : null,
      // Campos obrigatórios da tabela users
      is_premium: false,
      is_verified: false,
      is_active: true,
      last_seen: new Date().toISOString(),
      privacy_settings: {
        profile_visibility: "public",
        show_age: true,
        show_location: true,
        allow_messages: "everyone",
        show_online_status: true
      },
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        likes_received: 0,
        comments_received: 0,
        profile_views: 0,
        earnings: 0
      }
    }

    // Usar função com permissões adequadas para inserir usuário
    const { data: insertResult, error: profileError } = await supabase
      .from('users')
      .insert([profileData])
      .select()

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError)
      // Se falhar ao criar perfil, deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Erro ao criar perfil do usuário: " + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        plan: plan || 'free',
        status_assinatura: plan === "free" ? "authorized" : "pending"
      }
    })

  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 