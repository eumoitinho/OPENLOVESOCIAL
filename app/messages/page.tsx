"use client"

import type React from "react"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import ConversationList from "@/components/chat/ConversationList"
import Chat from "@/components/chat/Chat"
import { useAuth } from "@/components/auth/AuthProvider"

interface SelectedConversation {
  id: string
  other_user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversation List */}
          <div className="lg:col-span-1">
            <ConversationList
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={setSelectedConversation}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Chat conversationId={selectedConversation.id} otherUser={selectedConversation.other_user} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Selecione uma conversa</h3>
                  <p className="mt-1 text-sm text-gray-500">Escolha uma conversa da lista para começar a conversar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
