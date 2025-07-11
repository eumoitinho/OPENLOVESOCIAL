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

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    // 2. Criar perfil completo no banco de dados
    const profileData: any = {
      id: authData.user.id,
      username,
      email,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      profile_type: profileType,
      seeking: ensureArray(seeking),
      interests: ensureArray(interests),
      other_interest: otherInterest,
      bio,
      location: city,
      uf: uf ? uf.substring(0, 2).toUpperCase() : null, // Limitar a 2 caracteres e converter para maiúsculo
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      plano: plan,
      status_assinatura: plan === "free" ? "authorized" : "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Se for casal, adicionar dados do parceiro
    if (profileType === "couple" && partner) {
      profileData.partner = partner
    }

    // Usar função com permissões adequadas para inserir usuário
    const { data: insertResult, error: profileError } = await supabase
      .rpc('insert_user_with_auth', {
        user_data: profileData
      })

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError)
      // Se falhar ao criar perfil, deletar o usuário criado
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Erro ao criar perfil do usuário" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        plan,
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