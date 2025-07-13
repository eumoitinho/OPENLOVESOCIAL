"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/components/auth/AuthProvider"
import ConversationList from "@/app/components/chat/ConversationList"
import Chat from "@/app/components/chat/Chat"
import { WebRTCProvider } from "@/app/components/chat/WebRTCContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  senderName: string
  senderAvatar?: string
  type: "text" | "image" | "file"
  isOwn: boolean
  isRead: boolean
  reactions?: {
    [key: string]: string[] // reaction: [userId1, userId2, ...]
  }
}

interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline: boolean
  type: "direct" | "group"
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
}

export function MessagesContent() {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Buscar conversas usando a API
      const response = await fetch('/api/chat/conversations')
      const result = await response.json()

      if (!response.ok) {
        console.error('Erro ao carregar conversas:', result.error)
        return
      }

      // Converter formato da API para o formato esperado pelos componentes
      const formattedConversations: Conversation[] = result.data?.map((conv: any) => ({
        id: conv.id,
        name: conv.user.name,
        avatar: conv.user.avatar,
        lastMessage: conv.lastMessage?.content,
        lastMessageTime: conv.lastMessage?.timestamp,
        unreadCount: conv.unreadCount || 0,
        isOnline: conv.user.isOnline,
        type: 'direct' as const,
        participants: [{
          id: conv.user.username,
          name: conv.user.name,
          avatar: conv.user.avatar,
          isOnline: conv.user.isOnline
        }]
      })) || []

      setConversations(formattedConversations)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      // Buscar mensagens usando a API
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      const result = await response.json()

      if (!response.ok) {
        console.error('Erro ao carregar mensagens:', result.error)
        return
      }

      setMessages(result.data || [])
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) {
        console.error('Erro ao deletar conversa:', error)
        return
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Erro ao deletar conversa:', error)
    }
  }

  const handleSendMessage = async (content: string, type: "text" | "image" | "file") => {
    if (!selectedConversationId || !user) return

    try {
      // Enviar mensagem usando a API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content,
          type
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Erro ao enviar mensagem:', result.error)
        return
      }

      setMessages(prev => [...prev, result.data])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-chat-bg-light dark:bg-chat-bg-dark rounded-lg border border-chat-border-light dark:border-chat-border-dark p-8 text-center shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <MessageCircle className="w-16 h-16 text-chat-textSecondary-light dark:text-chat-textSecondary-dark" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-openlove-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-chat-text-light dark:text-chat-text-dark mb-2 bg-gradient-to-r from-openlove-600 to-purple-600 bg-clip-text text-transparent">
                Faça login para ver suas mensagens
              </h2>
              <p className="text-chat-textSecondary-light dark:text-chat-textSecondary-dark mb-6">
                Entre na sua conta para acessar o sistema de mensagens.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-gradient-to-r from-openlove-500 to-purple-500 hover:from-openlove-600 hover:to-purple-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Entrar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WebRTCProvider currentUserId={user.id}>
      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-200px)] bg-chat-bg-light dark:bg-chat-bg-dark rounded-lg overflow-hidden border border-chat-border-light dark:border-chat-border-dark shadow-lg">
          {/* Sidebar com lista de conversas */}
          <div className={`${isMobile && selectedConversationId ? 'hidden' : 'block'} w-full md:w-80 border-r border-chat-border-light dark:border-chat-border-dark bg-chat-bg-light dark:bg-chat-bg-dark`}>
            <ConversationList
              selectedConversationId={selectedConversationId || undefined}
              conversations={conversations}
              loading={loading}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>

          {/* Área do chat */}
          <div className={`${isMobile && !selectedConversationId ? 'hidden' : 'block'} flex-1 flex flex-col`}>
            {isMobile && selectedConversationId && (
              <div className="p-4 border-b border-chat-border-light dark:border-chat-border-dark bg-chat-bgSecondary-light dark:bg-chat-bgSecondary-dark">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversationId(null)}
                  className="flex items-center gap-2 text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
            )}
            
            <Chat
              conversation={selectedConversation || null}
              messages={messages}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              isLoading={loading}
            />
          </div>

          {/* Estado vazio para desktop */}
          {!isMobile && !selectedConversationId && (
            <div className="flex-1 flex items-center justify-center text-chat-textSecondary-light dark:text-chat-textSecondary-dark">
              <div className="text-center">
                <div className="relative mb-6">
                  <MessageCircle className="mx-auto h-12 w-12 text-chat-textSecondary-light dark:text-chat-textSecondary-dark mb-4" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-openlove-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-chat-text-light dark:text-chat-text-dark">Selecione uma conversa</h3>
                <p className="text-chat-textSecondary-light dark:text-chat-textSecondary-dark">Escolha uma conversa para começar a trocar mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </WebRTCProvider>
  )
} 