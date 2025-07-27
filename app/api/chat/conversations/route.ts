import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

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

    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        participants:conversation_participants(
          user_id,
          users(
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('conversation_participants.user_id', user.id)

    if (error) {
      console.error("Erro ao buscar conversas:", error)
      return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 })
    }

    // Formatar dados para o frontend
    const formattedConversations = conversations?.map(conv => {
      const otherParticipant = conv.participants?.find((p: any) => p.user_id !== user.id)
      const userData = otherParticipant?.users as any
      return {
        id: conv.id,
        user: {
          name: userData?.full_name || 'Usuário',
          username: userData?.username || 'usuario',
          avatar: userData?.avatar_url || '/placeholder-user.jpg',
          isOnline: false // TODO: Implementar status online
        },
        lastMessage: {
          content: 'Nova conversa',
          timestamp: new Date(conv.created_at).toLocaleString('pt-BR'),
          isFromMe: false,
          isRead: true
        },
        unreadCount: 0
      }
    }) || []

    return NextResponse.json({ data: formattedConversations })
  } catch (error) {
    console.error("Erro na API de conversas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

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

    const { otherUserId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "ID do outro usuário é obrigatório" }, { status: 400 })
    }

    // Usar a função RPC para criar conversa
    const { data: conversationId, error } = await supabase.rpc("create_conversation", {
      other_user_id: otherUserId })

    if (error) {
      console.error("Erro ao criar conversa:", error)
      return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 })
    }

    return NextResponse.json({ conversationId })
  } catch (error) {
    console.error("Erro na API de conversas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
