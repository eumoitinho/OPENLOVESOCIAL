import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { verifyAuth } from '@/app/lib/auth-helpers'
import { planValidator } from '@/lib/plans/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const verified = searchParams.get('verified') === 'true'
    
    let query = supabase
      .from('communities')
      .select(`
        id,
        name,
        slug,
        description,
        category_id,
        image_url,
        banner_url,
        is_private,
        is_verified,
        member_count,
        created_by,
        created_at,
        updated_at
      `)
      .order('member_count', { ascending: false })
    
    // Filtros
    if (category) {
      query = query.eq('category_id', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (verified) {
      query = query.eq('is_verified', true)
    }
    
    const { data: communities, error } = await query.limit(50)
    
    if (error) {
      console.error('Erro ao buscar comunidades:', error)
      return NextResponse.json({ error: 'Erro ao buscar comunidades' }, { status: 500 })
    }
    
    return NextResponse.json({ communities })
  } catch (error) {
    console.error('Erro na API de comunidades:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verificar se o usuário pode criar comunidades
    const { allowed, reason } = await planValidator.canCreateCommunity(user.id)
    
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 })
    }
    
    const { name, slug, description, category_id, image_url, banner_url, is_private } = await request.json()
    
    // Validações básicas
    if (!name || !slug || !description) {
      return NextResponse.json({ error: 'Nome, slug e descrição são obrigatórios' }, { status: 400 })
    }
    
    const supabase = createSupabaseAdmin()
    
    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'Slug já está em uso' }, { status: 400 })
    }
    
    // Criar comunidade
    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name,
        slug,
        description,
        category_id,
        image_url,
        banner_url,
        is_private: is_private || false,
        is_verified: false,
        member_count: 1,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar comunidade:', error)
      return NextResponse.json({ error: 'Erro ao criar comunidade' }, { status: 500 })
    }
    
    // Adicionar criador como admin da comunidade
    await supabase
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: user.id,
        role: 'admin',
        status: 'active'
      })
    
    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar comunidade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}