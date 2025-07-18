import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { verifyAuth } from '@/app/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, entity_id, reason } = await request.json()
    
    if (!type || !entity_id || !reason) {
      return NextResponse.json({ error: 'Tipo, ID da entidade e razão são obrigatórios' }, { status: 400 })
    }

    if (!['community', 'event'].includes(type)) {
      return NextResponse.json({ error: 'Tipo deve ser "community" ou "event"' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    // Verificar se a entidade existe e pertence ao usuário
    const entityTable = type === 'community' ? 'communities' : 'events'
    const entityColumn = type === 'community' ? 'created_by' : 'creator_id'
    
    const { data: entity, error: entityError } = await supabase
      .from(entityTable)
      .select('id, is_verified, ' + entityColumn)
      .eq('id', entity_id)
      .single()
    
    if (entityError || !entity) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 })
    }
    
    if (entity[entityColumn] !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para solicitar verificação desta entidade' }, { status: 403 })
    }
    
    if (entity.is_verified) {
      return NextResponse.json({ error: 'Esta entidade já está verificada' }, { status: 400 })
    }
    
    // Verificar se já existe uma solicitação pendente
    const { data: existingRequest } = await supabase
      .from('verification_requests')
      .select('id, status')
      .eq('entity_type', type)
      .eq('entity_id', entity_id)
      .eq('user_id', user.id)
      .in('status', ['pending', 'under_review'])
      .single()
    
    if (existingRequest) {
      return NextResponse.json({ error: 'Já existe uma solicitação pendente para esta entidade' }, { status: 400 })
    }
    
    // Criar solicitação de verificação
    const { data: request_data, error: requestError } = await supabase
      .from('verification_requests')
      .insert({
        entity_type: type,
        entity_id: entity_id,
        user_id: user.id,
        reason: reason,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (requestError) {
      console.error('Erro ao criar solicitação de verificação:', requestError)
      return NextResponse.json({ error: 'Erro ao criar solicitação' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Solicitação de verificação enviada com sucesso',
      request: request_data 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de verificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const entity_id = searchParams.get('entity_id')
    
    const supabase = createSupabaseAdmin()
    
    let query = supabase
      .from('verification_requests')
      .select(`
        id,
        entity_type,
        entity_id,
        reason,
        status,
        admin_notes,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (type) {
      query = query.eq('entity_type', type)
    }
    
    if (entity_id) {
      query = query.eq('entity_id', entity_id)
    }
    
    const { data: requests, error } = await query
    
    if (error) {
      console.error('Erro ao buscar solicitações:', error)
      return NextResponse.json({ error: 'Erro ao buscar solicitações' }, { status: 500 })
    }
    
    return NextResponse.json({ requests })
    
  } catch (error) {
    console.error('Erro na API de verificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}