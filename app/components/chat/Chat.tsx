"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

interface ChatProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string, type: "text" | "image" | "file") => void
  onLoadMoreMessages?: () => void
  isLoading?: boolean
}

const Chat: React.FC<ChatProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMoreMessages,
  isLoading = false,
}) => {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() && conversation) {
      onSendMessage(newMessage.trim(), "text")
      setNewMessage("")
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
  }

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true

    const currentDate = new Date(currentMessage.timestamp).toDateString()
    const previousDate = new Date(previousMessage.timestamp).toDateString()

    return currentDate !== previousDate
  }

  const getOnlineParticipants = () => {
    return conversation?.participants.filter((p) => p.isOnline) || []
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
          <p>Escolha uma conversa para começar a trocar mensagens</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback>{conversation.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium">{conversation.name}</h3>
            <p className="text-sm text-muted-foreground">
              {conversation.type === "direct"
                ? getOnlineParticipants().length > 0
                  ? "Online"
                  : "Offline"
                : `${getOnlineParticipants().length} online de ${conversation.participants.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
              <DropdownMenuItem>Silenciar notificações</DropdownMenuItem>
              <DropdownMenuItem>Arquivar conversa</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Excluir conversa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage)

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {formatDateSeparator(message.timestamp)}
                    </div>
                  </div>
                )}

                <div className={`flex gap-3 ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  {!message.isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{message.senderName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[70%] ${message.isOwn ? "order-first" : ""}`}>
                    {!message.isOwn && conversation.type === "group" && (
                      <p className="text-xs text-muted-foreground mb-1 ml-1">{message.senderName}</p>
                    )}

                    <div
                      className={`
                        px-3 py-2 rounded-lg
                        ${message.isOwn ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}
                      `}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.isOwn && <span>{message.isRead ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">...</AvatarFallback>
              </Avatar>
              <div className="bg-muted px-3 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>

          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>

          <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Chat
