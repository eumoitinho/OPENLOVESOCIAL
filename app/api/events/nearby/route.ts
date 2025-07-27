import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { verifyAuth } from "@/app/lib/auth-helpers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar eventos próximos (por enquanto, todos os eventos)
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_date,
        location_name,
        max_participants,
        category,
        cover_image_url,
        created_by,
        created_at
      `)
      .gte('start_date', new Date().toISOString()) // Eventos futuros
      .order('start_date', { ascending: true })
      .limit(5)

    if (error) {
      console.error('Erro ao buscar eventos:', error)
      return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
    }

    // Buscar informações dos criadores dos eventos
    const creatorIds = events?.map(event => event.created_by).filter(Boolean) || []
    const { data: creators } = await supabase
      .from('users')
      .select('id, name, username, avatar_url')
      .in('id', creatorIds)

    const creatorsMap = new Map(creators?.map(creator => [creator.id, creator]) || [])

    // Formatar dados para o frontend
    const formattedEvents = events?.map(event => {
      const creator = creatorsMap.get(event.created_by)
      return {
        id: event.id,
        title: event.title || 'Evento',
        date: new Date(event.start_date).toLocaleDateString('pt-BR'),
        location: event.location_name || 'Local não informado',
        attendees: 0, // Será calculado separadamente
        maxAttendees: event.max_participants || 50,
        image: event.cover_image_url || '/placeholder.jpg',
        category: event.category || 'Geral',
        sharedBy: {
          name: creator?.name || 'Usuário',
          username: creator?.username || 'user',
          avatar: creator?.avatar_url || '/placeholder-user.jpg'
        },
        sharedAt: new Date(event.created_at).toLocaleDateString('pt-BR')
      }
    }) || []

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 
