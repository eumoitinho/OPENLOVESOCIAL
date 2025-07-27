import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { verifyUserForAction } from "@/lib/verification-middleware"

export const dynamic = 'force-dynamic'

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
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: "ID da conversa é obrigatório" }, { status: 400 })
    }

    // Verificar se o usuário participa da conversa
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar mensagens da conversa
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        type,
        is_read,
        users!inner(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error("Erro ao buscar mensagens:", error)
      return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 })
    }

    // Marcar mensagens como lidas
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    // Formatar mensagens
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.created_at,
      senderId: msg.sender_id,
      senderName: (msg.users as any).full_name || (msg.users as any).username,
      senderAvatar: (msg.users as any).avatar_url,
      type: msg.type,
      isOwn: msg.sender_id === user.id,
      isRead: msg.is_read
    })) || []

    return NextResponse.json({ data: formattedMessages })
  } catch (error) {
    console.error("Erro na API de mensagens:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão para enviar mensagens
    const { context, error } = await verifyUserForAction(request, 'message')
    if (error) {
      return error
    }

    const supabase = await createRouteHandlerClient()
    const userId = context!.user.id

    const { conversationId, content, type = 'text' } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: "ID da conversa e conteúdo são obrigatórios" }, { status: 400 })
    }

    // Verificar se o usuário participa da conversa
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Criar nova mensagem
    const { data: newMessage, error: createError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        type
      })
      .select(`
        id,
        content,
        created_at,
        sender_id,
        type,
        is_read,
        users!inner(
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error("Erro ao criar mensagem:", createError)
      return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
    }

    // Formatar mensagem
    const formattedMessage = {
      id: newMessage.id,
      content: newMessage.content,
      timestamp: newMessage.created_at,
      senderId: newMessage.sender_id,
      senderName: (newMessage.users as any).full_name || (newMessage.users as any).username,
      senderAvatar: (newMessage.users as any).avatar_url,
      type: newMessage.type,
      isOwn: true,
      isRead: false
    }

    return NextResponse.json({ data: formattedMessage })
  } catch (error) {
    console.error("Erro na API de mensagens:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 
