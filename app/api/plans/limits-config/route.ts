import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planType = searchParams.get('planType')

    if (!planType) {
      return NextResponse.json(
        { error: 'Tipo de plano é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Buscar configuração de limites do plano
    const { data: config, error } = await supabase
      .from('plan_limits_config')
      .select('*')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Erro ao buscar configuração de limites:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configuração de limites' },
        { status: 500 }
      )
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração de limites não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      config
    })

  } catch (error) {
    console.error('Erro na API de configuração de limites:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 