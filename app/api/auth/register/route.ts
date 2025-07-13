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

    // 1. Verificar se o username já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Nome de usuário já está em uso" },
        { status: 400 }
      )
    }

    // 2. Verificar se o email já existe
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    // 3. Criar usuário no Supabase Auth
    console.log("Criando usuário no Supabase Auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: `${firstName} ${lastName}`,
      }
    })

    if (authError) {
      console.error("Erro ao criar usuário no Auth:", authError)
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

    console.log("Usuário criado no Auth com sucesso:", authData.user.id)

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

    // 4. Criar perfil completo no banco de dados
    console.log("Criando perfil na tabela users...")
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

    // 5. Inserir perfil na tabela users usando service role
    const { data: insertResult, error: profileError } = await supabase
      .from('users')
      .insert([profileData])
      .select()

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError)
      // Se falhar ao criar perfil, deletar o usuário criado
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log("Usuário deletado do Auth após falha na criação do perfil")
      } catch (deleteError) {
        console.error("Erro ao deletar usuário após falha:", deleteError)
      }
      return NextResponse.json(
        { error: "Erro ao criar perfil do usuário: " + profileError.message },
        { status: 500 }
      )
    }

    console.log("Perfil criado com sucesso:", insertResult)

    // 6. Se for plano pago, criar registro de assinatura
    if (plan && plan !== "free") {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: authData.user.id,
          plan: plan,
          status: 'pending',
          created_at: new Date().toISOString()
        }])

      if (subscriptionError) {
        console.error("Erro ao criar assinatura:", subscriptionError)
        // Não falhar o cadastro por causa disso, apenas logar o erro
      }
    }

    // 7. Retornar sucesso
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        plan: plan || 'free',
        status_assinatura: plan === "free" ? "authorized" : "pending"
      },
      message: "Conta criada com sucesso!"
    })

  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    )
  }
} 