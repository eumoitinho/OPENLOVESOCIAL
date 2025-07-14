"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, X, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  created_at: string
  updated_at: string
  participants: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }[]
  last_message?: {
    content: string
    sender_name: string
    created_at: string
  }
  unread_count: number
}

interface ConversationListProps {
  conversations: Conversation[]
  activeConversation?: string | null
  onSelectConversation: (id: string) => void
  onClose?: () => void
}

export function ConversationList({ 
  conversations,
  activeConversation, 
  onSelectConversation,
  onClose 
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase()
    const name = conv.name || conv.participants[0]?.name || ""
    const lastMessage = conv.last_message?.content || ""
    
    return name.toLowerCase().includes(searchLower) || 
           lastMessage.toLowerCase().includes(searchLower)
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Agora"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString('pt-BR')
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Conversas
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
          </Button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Conversas */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? "Tente ajustar sua busca"
                  : "Comece uma nova conversa para mensagem"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      activeConversation === conversation.id 
                        ? 'bg-pink-50 dark:bg-pink-950/10 border border-pink-200 dark:border-pink-800' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {conversation.type === 'direct' ? (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.participants[0]?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                              {conversation.participants[0]?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                  <div className="relative">
                            <div className="grid grid-cols-2 gap-0.5 w-12 h-12">
                              {conversation.participants.slice(0, 4).map((participant, i) => (
                                <Avatar key={i} className="h-6 w-6">
                                  <AvatarImage src={participant.avatar_url} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                                    {participant.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                              ))}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-900"></div>
                          </div>
                        )}
                        
                        {/* Badge de mensagens não lidas */}
                        {conversation.unread_count > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                          </Badge>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm leading-5 ${
                              conversation.unread_count > 0 
                                ? 'text-gray-900 dark:text-gray-100' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {conversation.name || conversation.participants[0]?.name}
                            </h4>
                            
                            {conversation.last_message && (
                              <p className={`text-sm leading-5 mt-1 ${
                                conversation.unread_count > 0 
                                  ? 'text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <span className="font-medium">
                                  {conversation.last_message.sender_name}:
                                </span>{" "}
                                {truncateText(conversation.last_message.content)}
                      </p>
                    )}
                  </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-500">
                              {conversation.last_message 
                                ? formatTimeAgo(conversation.last_message.created_at)
                                : formatTimeAgo(conversation.updated_at)
                              }
                            </span>
                            
                            {conversation.type === 'group' && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                <span>{conversation.participants.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}