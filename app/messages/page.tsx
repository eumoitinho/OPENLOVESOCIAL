"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import ConversationList from "../components/chat/ConversationList"
import Chat from "../components/chat/Chat"
import { useAuth } from "../components/auth/AuthProvider"
import { WebRTCProvider } from "../components/chat/WebRTCContext"

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
}

interface Conversation {
  id: string
  name: string
  avatar?: string
  type: "direct" | "group"
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
}

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Simular mensagens para a conversa selecionada
  useEffect(() => {
    if (selectedConversation) {
      setLoading(true)
      // Simular carregamento de mensagens
      setTimeout(() => {
        const mockMessages: Message[] = [
          {
            id: "1",
            content: "Oi! Como você está?",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
            senderId: selectedConversation.participants[0].id,
            senderName: selectedConversation.participants[0].name,
            senderAvatar: selectedConversation.participants[0].avatar,
            type: "text",
            isOwn: false,
            isRead: true
          },
          {
            id: "2",
            content: "Oi! Estou bem, obrigado! E você?",
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min atrás
            senderId: user?.id || "",
            senderName: user?.user_metadata?.full_name || "Você",
            senderAvatar: user?.user_metadata?.avatar_url,
            type: "text",
            isOwn: true,
            isRead: true
          },
          {
            id: "3",
            content: "Também estou bem! Quer sair hoje?",
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 min atrás
            senderId: selectedConversation.participants[0].id,
            senderName: selectedConversation.participants[0].name,
            senderAvatar: selectedConversation.participants[0].avatar,
            type: "text",
            isOwn: false,
            isRead: true
          },
          {
            id: "4",
            content: "Claro! Que tal irmos ao cinema?",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
            senderId: user?.id || "",
            senderName: user?.user_metadata?.full_name || "Você",
            senderAvatar: user?.user_metadata?.avatar_url,
            type: "text",
            isOwn: true,
            isRead: false
          }
        ]
        setMessages(mockMessages)
        setLoading(false)
      }, 500)
    } else {
      setMessages([])
    }
  }, [selectedConversation, user])

  const handleSelectConversation = (conversationId: string) => {
    // Converter o ID da conversa para o objeto de conversa
    const conversationMap: Record<string, Conversation> = {
      "1": {
        id: "1",
        name: "Maria & Carlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        type: "direct",
        participants: [
          { id: "1", name: "Maria", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png", isOnline: true },
          { id: "2", name: "Carlos", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png", isOnline: false }
        ]
      },
      "2": {
        id: "2",
        name: "Ana Silva",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        type: "direct",
        participants: [
          { id: "3", name: "Ana Silva", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png", isOnline: false }
        ]
      },
      "3": {
        id: "3",
        name: "Rafael Alves",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        type: "direct",
        participants: [
          { id: "4", name: "Rafael Alves", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png", isOnline: true }
        ]
      },
      "4": {
        id: "4",
        name: "Sofia Mendes",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        type: "direct",
        participants: [
          { id: "5", name: "Sofia Mendes", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png", isOnline: false }
        ]
      }
    }

    setSelectedConversation(conversationMap[conversationId] || null)
  }

  const handleSendMessage = (content: string, type: "text" | "image" | "file") => {
    if (!selectedConversation || !user) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      senderId: user.id,
      senderName: user.user_metadata?.full_name || "Você",
      senderAvatar: user.user_metadata?.avatar_url,
      type,
      isOwn: true,
      isRead: false
    }

    setMessages(prev => [...prev, newMessage])
  }

  const handleDeleteConversation = (conversationId: string) => {
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Acesso negado</h2>
          <p className="text-gray-600">Você precisa estar logado para ver suas mensagens.</p>
        </div>
      </div>
    )
  }

  return (
    <WebRTCProvider currentUserId={user?.id || ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              <ConversationList
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Chat 
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={user?.id || ""}
                  onSendMessage={handleSendMessage}
                  isLoading={loading}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Selecione uma conversa</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Escolha uma conversa da lista para começar a conversar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WebRTCProvider>
  )
}

export default MessagesPage
