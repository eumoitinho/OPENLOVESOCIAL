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

    // Primeiro, buscar os IDs dos usuários que o usuário atual já segue
    const { data: followingIds } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const excludeIds = [user.id, ...(followingIds?.map(f => f.following_id) || [])]

    // Buscar usuários que o usuário atual não segue
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        username,
        avatar_url,
        bio,
        location,
        is_verified,
        is_premium,
        interests,
        created_at
      `)
      .neq('id', user.id) // Excluir o próprio usuário
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // Se há usuários sendo seguidos, excluir da consulta
    if (followingIds && followingIds.length > 0) {
      const followingIdsList = followingIds.map(f => f.following_id)
      query = query.not('id', 'in', `(${followingIdsList.join(',')})`)
    }

    const { data: suggestedUsers, error } = await query

    if (error) {
      console.error('Erro ao buscar usuários sugeridos:', error)
      return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 })
    }

    // Formatar dados para o frontend
    const formattedUsers = suggestedUsers?.map(user => ({
      id: user.id,
      name: user.name || 'Usuário',
      username: user.username || user.name?.toLowerCase().replace(/\s+/g, '') || 'user',
      avatar: user.avatar_url || '/placeholder-user.jpg',
      location: user.location || 'Localização não informada',
      distance: 'Próximo', // Simulado por enquanto
      followers: 0, // Será calculado separadamente se necessário
      verified: user.is_verified || false,
      premium: user.is_premium || false,
      relationshipType: 'Solteiro', // Simulado
      tags: user.interests || [],
      mutualFriends: 0, // Será calculado se necessário
      followState: 'follow' as const
    })) || []

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 
