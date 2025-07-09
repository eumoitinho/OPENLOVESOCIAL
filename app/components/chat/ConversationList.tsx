"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, MessageCircle, Users, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  type: "direct" | "group"
  name: string
  avatar?: string
  lastMessage: {
    content: string
    timestamp: string
    sender: string
    isRead: boolean
  }
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
  unreadCount: number
}

interface ConversationListProps {
  conversations?: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation?: (conversationId: string) => void
  onArchiveConversation?: (conversationId: string) => void
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  onArchiveConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations)

  useEffect(() => {
    const filtered = conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredConversations(filtered)
  }, [conversations, searchTerm])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes < 1 ? "agora" : `${diffInMinutes}min`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }
  }

  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.type === "group") {
      return <Users className="h-4 w-4" />
    }
    return <MessageCircle className="h-4 w-4" />
  }

  const getOnlineParticipantsCount = (participants: Conversation["participants"]) => {
    return participants.filter((p) => p.isOnline).length
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversas</h2>
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Nova
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    hover:bg-muted/50
                    ${selectedConversationId === conversation.id ? "bg-muted" : ""}
                  `}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {conversation.type === "group" ? (
                          <Users className="h-6 w-6" />
                        ) : (
                          conversation.name.charAt(0).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Online indicator for direct messages */}
                    {conversation.type === "direct" && conversation.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        {conversation.type === "group" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getConversationIcon(conversation)}
                            <span>{getOnlineParticipantsCount(conversation.participants)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onArchiveConversation?.(conversation.id)}>
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteConversation?.(conversation.id)}
                              className="text-destructive"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.type === "group" && (
                          <span className="font-medium">{conversation.lastMessage.sender}: </span>
                        )}
                        {conversation.lastMessage.content}
                      </p>

                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
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
