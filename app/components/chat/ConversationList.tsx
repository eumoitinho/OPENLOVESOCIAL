"use client"

import { useState, useEffect } from "react"
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
  VolumeX,
  Plus,
  MessageCircle
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
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
}

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  // Simular dados de conversas
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "1",
        name: "Maria & Carlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        lastMessage: "Oi! Como você está?",
        lastMessageTime: "14:30",
        unreadCount: 2,
        isOnline: true,
        participants: [
          { id: "1", name: "Maria", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png", isOnline: true },
          { id: "2", name: "Carlos", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png", isOnline: false }
        ]
      },
      {
        id: "2",
        name: "Ana Silva",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        lastMessage: "Vamos sair hoje?",
        lastMessageTime: "12:15",
        unreadCount: 0,
        isOnline: false,
        participants: [
          { id: "3", name: "Ana Silva", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png", isOnline: false }
        ]
      },
      {
        id: "3",
        name: "Rafael Alves",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        lastMessage: "Obrigado pela ajuda!",
        lastMessageTime: "Ontem",
        unreadCount: 1,
        isOnline: true,
        participants: [
          { id: "4", name: "Rafael Alves", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png", isOnline: true }
        ]
      },
      {
        id: "4",
        name: "Sofia Mendes",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        lastMessage: "Que foto linda!",
        lastMessageTime: "Segunda",
        unreadCount: 0,
        isOnline: false,
        participants: [
          { id: "5", name: "Sofia Mendes", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png", isOnline: false }
        ]
      }
    ]

    // Simular carregamento
    setTimeout(() => {
      setConversations(mockConversations)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (time: string) => {
    if (time === "Ontem" || time === "Segunda") return time
    return time
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    onDeleteConversation(conversationId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border h-full">
        <div className="p-4 border-b">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mensagens</h2>
          <Button variant="ghost" size="sm" className="p-2">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                    selectedConversationId === conversation.id && "bg-blue-50 border border-blue-200"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {conversation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime || "")}
                        </span>
                      </div>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Silenciar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
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