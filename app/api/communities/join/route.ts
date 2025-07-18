import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { verifyAuth } from '@/app/lib/auth-helpers'
import { planValidator } from '@/lib/plans/server'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { communityId } = await request.json()
    
    if (!communityId) {
      return NextResponse.json({ error: 'Community ID é obrigatório' }, { status: 400 })
    }
    
    const supabase = createSupabaseAdmin()
    
    // Verificar se a comunidade existe
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name, is_private, is_verified')
      .eq('id', communityId)
      .single()
    
    if (communityError || !community) {
      return NextResponse.json({ error: 'Comunidade não encontrada' }, { status: 404 })
    }
    
    // Verificar se o usuário pode participar desta comunidade
    const { allowed, reason } = await planValidator.canJoinCommunity(user.id, communityId)
    
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 })
    }
    
    // Verificar se já é membro
    const { data: existingMember } = await supabase
      .from('community_members')
      .select('id, status')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()
    
    if (existingMember) {
      if (existingMember.status === 'active') {
        return NextResponse.json({ error: 'Você já é membro desta comunidade' }, { status: 400 })
      }
      
      // Reativar membership se estava inativo
      const { error: updateError } = await supabase
        .from('community_members')
        .update({ status: 'active', joined_at: new Date().toISOString() })
        .eq('id', existingMember.id)
      
      if (updateError) {
        console.error('Erro ao reativar membership:', updateError)
        return NextResponse.json({ error: 'Erro ao reativar participação' }, { status: 500 })
      }
    } else {
      // Criar nova membership
      const { error: insertError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
          status: 'active'
        })
      
      if (insertError) {
        console.error('Erro ao criar membership:', insertError)
        return NextResponse.json({ error: 'Erro ao participar da comunidade' }, { status: 500 })
      }
    }
    
    // Atualizar contador de membros
    const { error: updateCountError } = await supabase
      .rpc('increment_community_members', { community_id: communityId })
    
    if (updateCountError) {
      console.error('Erro ao atualizar contador:', updateCountError)
      // Não falhar por conta do contador, apenas logar
    }
    
    return NextResponse.json({ 
      message: 'Participação na comunidade realizada com sucesso',
      community: { id: communityId, name: community.name }
    })
  } catch (error) {
    console.error('Erro ao participar da comunidade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { communityId } = await request.json()
    
    if (!communityId) {
      return NextResponse.json({ error: 'Community ID é obrigatório' }, { status: 400 })
    }
    
    const supabase = createSupabaseAdmin()
    
    // Verificar se é membro
    const { data: membership } = await supabase
      .from('community_members')
      .select('id, role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (!membership) {
      return NextResponse.json({ error: 'Você não é membro desta comunidade' }, { status: 400 })
    }
    
    // Não permitir que o admin saia (deve transferir ownership primeiro)
    if (membership.role === 'admin') {
      return NextResponse.json({ error: 'Administradores não podem sair. Transfira a propriedade primeiro.' }, { status: 400 })
    }
    
    // Sair da comunidade
    const { error } = await supabase
      .from('community_members')
      .update({ status: 'left' })
      .eq('id', membership.id)
    
    if (error) {
      console.error('Erro ao sair da comunidade:', error)
      return NextResponse.json({ error: 'Erro ao sair da comunidade' }, { status: 500 })
    }
    
    // Decrementar contador de membros
    const { error: updateCountError } = await supabase
      .rpc('decrement_community_members', { community_id: communityId })
    
    if (updateCountError) {
      console.error('Erro ao atualizar contador:', updateCountError)
    }
    
    return NextResponse.json({ message: 'Saída da comunidade realizada com sucesso' })
  } catch (error) {
    console.error('Erro ao sair da comunidade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}