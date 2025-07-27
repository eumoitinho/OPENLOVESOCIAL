import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/app/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, actionType, points = 1, monthYear } = await request.json()

    if (!userId || !actionType) {
      return NextResponse.json(
        { error: 'ID do usuário e tipo de ação são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Mapear tipo de ação para nome do contador
    const actionToCounterMap: Record<string, string> = {
      'upload_image': 'images_uploaded',
      'upload_video': 'videos_uploaded',
      'upload_audio': 'audio_files_uploaded',
      'send_message': 'messages_sent',
      'create_event': 'events_created',
      'join_community': 'communities_joined',
      'create_community': 'communities_created',
      'create_poll': 'polls_created',
      'voice_call': 'voice_calls_made',
      'video_call': 'video_calls_made',
      'profile_view': 'profile_views_received',
      'create_post': 'posts_created',
      'give_like': 'likes_given',
      'receive_like': 'likes_received'
    }

    const counterName = actionToCounterMap[actionType]
    if (!counterName) {
      return NextResponse.json(
        { error: 'Tipo de ação inválido' },
        { status: 400 }
      )
    }

    // Incrementar contador
    const { data, error } = await supabase
      .rpc('increment_usage_counter', {
        p_user_id: userId,
        p_counter_name: counterName,
        p_increment: points,
        p_month_year: monthYear || new Date().toISOString().slice(0, 7)
      })

    if (error) {
      console.error('Erro ao incrementar contador:', error)
      return NextResponse.json(
        { error: 'Erro ao incrementar contador' },
        { status: 500 }
      )
    }

    // Registrar ação no histórico
    await supabase
      .from('usage_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        points_consumed: points,
        month_year: monthYear || new Date().toISOString().slice(0, 7),
        action_data: {
          counter_name: counterName,
          points: points,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Contador incrementado com sucesso',
      actionType,
      counterName,
      points
    })

  } catch (error) {
    console.error('Erro na API de incremento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 