import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { verifyAuth } from '@/app/lib/auth-helpers'
import { planValidator } from '@/lib/plans/server'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = createSupabaseAdmin()
    
    // Buscar comunidades onde o usuário é membro ativo
    const { data: memberships, error } = await supabase
      .from('community_members')
      .select(`
        id,
        role,
        joined_at,
        status,
        communities:community_id (
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
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar comunidades do usuário:', error)
      return NextResponse.json({ error: 'Erro ao buscar suas comunidades' }, { status: 500 })
    }
    
    // Buscar informações de uso do usuário
    const usage = await planValidator.getPlanUsage(user.id)
    const { limits } = await planValidator.getUserPlan(user.id)
    
    const communities = memberships.map(membership => ({
      ...membership.communities,
      membership: {
        id: membership.id,
        role: membership.role,
        joined_at: membership.joined_at,
        status: membership.status
      }
    }))
    
    return NextResponse.json({ 
      communities,
      usage: {
        communitiesJoined: usage.communitiesJoined,
        maxCommunities: limits.maxCommunities,
        canJoinMore: limits.maxCommunities === -1 || usage.communitiesJoined < limits.maxCommunities
      }
    })
  } catch (error) {
    console.error('Erro ao buscar comunidades do usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}