import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    console.log("=== INÍCIO DO REGISTRO ===")
    
    const body = await req.json()
    console.log("Dados recebidos:", { ...body, password: '[HIDDEN]' })
    
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
    } = body

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

    console.log("=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===")
    console.log("SUPABASE_URL configurado:", !!supabaseUrl)
    console.log("SERVICE_ROLE_KEY configurado:", !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variáveis de ambiente do Supabase não configuradas")
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Verificar se o username já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (checkError) {
      console.error("Erro ao verificar username:", checkError)
      return NextResponse.json(
        { error: "Erro ao verificar disponibilidade do username" },
        { status: 500 }
      )
    }

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
      .maybeSingle()

    if (emailCheckError) {
      console.error("Erro ao verificar email:", emailCheckError)
      return NextResponse.json(
        { error: "Erro ao verificar disponibilidade do email" },
        { status: 500 }
      )
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    // Função para garantir que arrays sejam válidos
    const ensureArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(item => item && typeof item === 'string');
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'string') : [];
        } catch {
          return value.trim() ? [value.trim()] : [];
        }
      }
      return [];
    };

    // Validar plano
    const validPlans = ['free', 'gold', 'diamante', 'diamante_anual'];
    const selectedPlan = plan && validPlans.includes(plan) ? plan : 'free';
    const subscriptionStatus = selectedPlan === 'free' ? 'authorized' : 'pending';

    // 3. Criar usuário no Supabase Auth com TODOS os dados nos metadados
    console.log("Criando usuário no Supabase Auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        // Dados básicos
        username,
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        
        // Dados do perfil (o trigger pode usar estes dados)
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
        plano: selectedPlan,
        status_assinatura: subscriptionStatus,
        partner: profileType === "couple" && partner ? partner : null,
        is_premium: selectedPlan !== 'free'
      }
    })

    if (authError) {
      console.error("Erro detalhado do Auth:", {
        message: authError.message,
        status: authError.status,
        code: authError.code
      })
      
      if (authError.message.includes('duplicate') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: "Email já está em uso" },
          { status: 400 }
        )
      }
      
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

    // 4. Aguardar um pouco para o trigger processar (opcional)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 5. Verificar se o perfil foi criado pelo trigger e atualizá-lo se necessário
    console.log("Verificando e atualizando perfil...")
    
    const updateData = {
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
      plano: selectedPlan,
      status_assinatura: subscriptionStatus,
      partner: profileType === "couple" && partner ? partner : null,
      is_premium: selectedPlan !== 'free',
      is_verified: false,
      is_active: true,
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
      },
      updated_at: new Date().toISOString()
    }

    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', authData.user.id)
      .select()

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError)
      
      // Tentar deletar o usuário criado no Auth
      try {
        console.log("Tentando deletar usuário do Auth devido ao erro...")
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log("Usuário deletado do Auth após falha na atualização do perfil")
      } catch (deleteError) {
        console.error("Erro ao deletar usuário após falha:", deleteError)
      }
      
      return NextResponse.json(
        { error: "Erro ao atualizar perfil do usuário: " + updateError.message },
        { status: 500 }
      )
    }

    console.log("Perfil atualizado com sucesso:", updateResult)

    // 6. Se for plano pago, criar registro de assinatura
    if (selectedPlan && selectedPlan !== "free") {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: authData.user.id,
          plan: selectedPlan,
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
        plan: selectedPlan,
        status_assinatura: subscriptionStatus
      },
      message: "Conta criada com sucesso!"
    })

  } catch (error) {
    console.error("=== ERRO NO REGISTRO ===")
    console.error("Tipo de erro:", typeof error)
    console.error("Mensagem:", (error as Error).message)
    console.error("Stack:", (error as Error).stack)
    
    // Garantir que sempre retornamos um JSON válido
    return NextResponse.json(
      { 
        error: "Erro interno do servidor: " + (error as Error).message,
        details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    )
  }
}