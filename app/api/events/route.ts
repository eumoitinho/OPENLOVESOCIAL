import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"
import { planValidator } from "@/lib/plans/server"

export async function GET(request: Request) {
  const supabase = await createRouteHandlerClient()
  const { searchParams } = new URL(request.url)
  const verified = searchParams.get('verified') === 'true'
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  
  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      event_date,
      location,
      category,
      image_url,
      max_attendees,
      current_attendees,
      is_private,
      is_verified,
      price,
      creator_id,
      created_at,
      updated_at,
      profiles!events_creator_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .order('event_date', { ascending: true })
  
  // Filtros
  if (verified) {
    query = query.eq('is_verified', true)
  }
  
  if (category) {
    query = query.eq('category', category)
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  // Apenas eventos futuros
  query = query.gte('event_date', new Date().toISOString())
  
  const { data: events, error } = await query.limit(50)
  
  if (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
  }
  
  return NextResponse.json({ data: events })
}

export async function POST(request: Request) {
   const supabase = await createRouteHandlerClient()
  const {
    data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  // Verificar se o usuário pode criar eventos usando o sistema de planos
  const { allowed, reason } = await planValidator.canCreateEvent(user.id)
  
  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: reason }), { status: 403 })
  }

  const eventData = await request.json()

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...eventData,
      creator_id: user.id,
      is_verified: false, // Novos eventos não são verificados
      current_attendees: 0 })
    .select()
    .single()

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json(data)
}
