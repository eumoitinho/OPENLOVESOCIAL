import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar preferências do usuário
    const { data: preferences, error } = await supabase
      .from('open_dates_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Erro ao buscar preferências:", error)
      return NextResponse.json({ error: "Erro ao buscar preferências" }, { status: 500 })
    }

    // Se não existem preferências, retornar padrões
    if (!preferences) {
      const defaultPreferences = {
        age_min: 18,
        age_max: 50,
        distance_max: 50,
        gender_preference: [],
        relationship_type_preference: [],
        interests_preference: [],
        is_active: true
      }
      return NextResponse.json({ preferences: defaultPreferences })
    }

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error("Erro na API de preferências:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const preferences = await request.json()

    // Validar dados
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Verificar se já existem preferências
    const { data: existingPreferences } = await supabase
      .from('open_dates_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPreferences) {
      // Atualizar preferências existentes
      const { error } = await supabase
        .from('open_dates_preferences')
        .update({
          age_min: preferences.age_min,
          age_max: preferences.age_max,
          distance_max: preferences.distance_max,
          gender_preference: preferences.gender_preference,
          relationship_type_preference: preferences.relationship_type_preference,
          interests_preference: preferences.interests_preference,
          is_active: preferences.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error("Erro ao atualizar preferências:", error)
        return NextResponse.json({ error: "Erro ao atualizar preferências" }, { status: 500 })
      }
    } else {
      // Criar novas preferências
      const { error } = await supabase
        .from('open_dates_preferences')
        .insert({
          user_id: user.id,
          age_min: preferences.age_min,
          age_max: preferences.age_max,
          distance_max: preferences.distance_max,
          gender_preference: preferences.gender_preference,
          relationship_type_preference: preferences.relationship_type_preference,
          interests_preference: preferences.interests_preference,
          is_active: preferences.is_active
        })

      if (error) {
        console.error("Erro ao criar preferências:", error)
        return NextResponse.json({ error: "Erro ao criar preferências" }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Preferências salvas com sucesso"
    })

  } catch (error) {
    console.error("Erro na API de preferências:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 