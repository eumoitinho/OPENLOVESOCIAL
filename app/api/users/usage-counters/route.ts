import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/app/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const monthYear = searchParams.get('monthYear') || new Date().toISOString().slice(0, 7) // YYYY-MM

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Buscar contadores do usuário para o mês especificado
    const { data: counters, error } = await supabase
      .rpc('get_user_usage_counters', {
        p_user_id: userId,
        p_month_year: monthYear
      })

    if (error) {
      console.error('Erro ao buscar contadores:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar contadores de uso' },
        { status: 500 }
      )
    }

    // Se não há dados, retornar contadores zerados
    const defaultCounters = {
      images_uploaded: 0,
      videos_uploaded: 0,
      audio_files_uploaded: 0,
      total_storage_bytes: 0,
      messages_sent: 0,
      events_created: 0,
      communities_joined: 0,
      communities_created: 0,
      polls_created: 0,
      voice_calls_made: 0,
      video_calls_made: 0,
      total_call_minutes: 0,
      profile_views_received: 0,
      posts_created: 0,
      likes_given: 0,
      likes_received: 0
    }

    const resultCounters = counters && counters.length > 0 ? counters[0] : defaultCounters

    return NextResponse.json({
      success: true,
      counters: resultCounters,
      monthYear
    })

  } catch (error) {
    console.error('Erro na API de contadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 