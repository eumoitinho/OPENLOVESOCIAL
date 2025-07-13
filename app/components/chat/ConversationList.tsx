"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Archive, 
  Volume2, 
  Plus,
  MessageCircle,
  Heart,
  Star
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline: boolean
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
}

interface ConversationListProps {
  selectedConversationId?: string
  conversations: Conversation[]
  loading?: boolean
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
}

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  conversations,
  loading = false,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (time: string) => {
    if (!time) return ''
    
    const date = new Date(time)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes < 1 ? 'agora' : `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Ontem'
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    onDeleteConversation(conversationId)
  }

  if (loading) {
    return (
      <div className="bg-chat-bg-light dark:bg-chat-bg-dark  h-full">
        <div className="p-4 border-b border-chat-border-light dark:border-chat-border-dark">
          <div className="animate-pulse">
            <div className="h-10 bg-chat-muted-light dark:bg-chat-muted-dark rounded-lg mb-4"></div>
            <div className="h-8 bg-chat-muted-light dark:bg-chat-muted-dark rounded-lg"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-chat-muted-light dark:bg-chat-muted-dark rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-chat-muted-light dark:bg-chat-muted-dark rounded w-3/4"></div>
                <div className="h-3 bg-chat-muted-light dark:bg-chat-muted-dark rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-chat-bg-light dark:bg-chat-bg-dark  h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-chat-border-light dark:border-chat-border-dark">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-chat-text-light dark:text-chat-text-dark bg-gradient-to-r from-openlove-600 to-purple-600 bg-clip-text text-transparent">
            Mensagens
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chat-textSecondary-light dark:text-chat-textSecondary-dark" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-chat-bgSecondary-light dark:bg-chat-bgSecondary-dark border-chat-border-light dark:border-chat-border-dark text-chat-text-light dark:text-chat-text-dark placeholder-chat-textSecondary-light dark:placeholder-chat-textSecondary-dark focus:border-openlove-500 dark:focus:border-openlove-400 focus:ring-openlove-500/20 dark:focus:ring-openlove-400/20 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="relative">
                <MessageCircle className="mx-auto h-12 w-12 text-chat-textSecondary-light dark:text-chat-textSecondary-dark mb-4" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-openlove-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-chat-textSecondary-light dark:text-chat-textSecondary-dark">
                {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
              </p>
              {!searchQuery && (
                <p className="text-xs text-chat-textSecondary-light dark:text-chat-textSecondary-dark mt-2">
                  Comece uma nova conversa para conectar-se
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:shadow-sm",
                    selectedConversationId === conversation.id && 
                    "bg-gradient-to-r from-openlove-50 to-purple-50 dark:from-openlove-950/30 dark:to-purple-950/30 border border-openlove-200 dark:border-openlove-800 shadow-sm"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-chat-border-light dark:ring-chat-border-dark group-hover:ring-openlove-300 dark:group-hover:ring-openlove-600 transition-all">
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-openlove-500 to-purple-500 text-white">
                        {conversation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-chat-bg-light dark:border-chat-bg-dark rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-chat-text-light dark:text-chat-text-dark truncate">
                        {conversation.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center bg-gradient-to-r from-openlove-500 to-purple-500 text-white animate-pulse">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-chat-textSecondary-light dark:text-chat-textSecondary-dark">
                          {formatTime(conversation.lastMessageTime || "")}
                        </span>
                      </div>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-chat-textSecondary-light dark:text-chat-textSecondary-dark truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-chat-bg-light dark:bg-chat-bg-dark border-chat-border-light dark:border-chat-border-dark shadow-lg"
                    >
                      <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark">
                        <Heart className="h-4 w-4 mr-2 text-openlove-500" />
                        Favoritar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Silenciar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark">
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-chat-border-light dark:bg-chat-border-dark" />
                      <DropdownMenuItem 
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeleteConversation(conversation.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default ConversationList 