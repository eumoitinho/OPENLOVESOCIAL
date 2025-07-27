import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { messageId, reaction } = await request.json()

    if (!messageId || !reaction) {
      return NextResponse.json({ error: "ID da mensagem e reação são obrigatórios" }, { status: 400 })
    }

    // Verificar se a mensagem existe
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, conversation_id')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário participa da conversa
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: "Você não participa desta conversa" }, { status: 403 })
    }

    // Verificar se já existe uma reação do usuário para esta mensagem
    const { data: existingReaction, error: existingError } = await supabase
      .from('message_reactions')
      .select('id, reaction')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .single()

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        // Remover reação se for a mesma
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (deleteError) {
          console.error('Erro ao remover reação:', deleteError)
          return NextResponse.json({ error: "Erro ao remover reação" }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          action: 'removed',
          message: 'Reação removida com sucesso' 
        })
      } else {
        // Atualizar reação existente
        const { error: updateError } = await supabase
          .from('message_reactions')
          .update({ reaction })
          .eq('id', existingReaction.id)

        if (updateError) {
          console.error('Erro ao atualizar reação:', updateError)
          return NextResponse.json({ error: "Erro ao atualizar reação" }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          action: 'updated',
          message: 'Reação atualizada com sucesso' 
        })
      }
    } else {
      // Adicionar nova reação
      const { error: insertError } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction
        })

      if (insertError) {
        console.error('Erro ao adicionar reação:', insertError)
        return NextResponse.json({ error: "Erro ao adicionar reação" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        action: 'added',
        message: 'Reação adicionada com sucesso' 
      })
    }
  } catch (error) {
    console.error("Error handling reaction:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: "ID da mensagem é obrigatório" }, { status: 400 })
    }

    // Buscar reações da mensagem
    const { data: reactions, error } = await supabase
      .from('message_reactions')
      .select(`
        id,
        reaction,
        user_id,
        created_at,
        profiles!inner(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar reações:', error)
      return NextResponse.json({ error: "Erro ao buscar reações" }, { status: 500 })
    }

    // Agrupar reações por tipo
    const groupedReactions = reactions?.reduce((acc, reaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = []
      }
      acc[reaction.reaction].push({
        id: reaction.id,
        userId: reaction.user_id,
        userName: (reaction.profiles as any).full_name || (reaction.profiles as any).username,
        userAvatar: (reaction.profiles as any).avatar_url,
        createdAt: reaction.created_at
      })
      return acc
    }, {} as Record<string, any[]>) || {}

    return NextResponse.json({ 
      success: true, 
      data: groupedReactions 
    })
  } catch (error) {
    console.error("Error fetching reactions:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 
