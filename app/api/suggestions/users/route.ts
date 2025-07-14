import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { verifyAuth } from '@/app/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar usuários que o usuário atual não segue
    const { data: suggestedUsers, error } = await supabase
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
      .not('id', 'in', `(
        SELECT followed_id 
        FROM follows 
        WHERE follower_id = '${user.id}'
      )`) // Excluir usuários já seguidos
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

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