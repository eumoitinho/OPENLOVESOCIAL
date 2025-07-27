"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Info, Heart, ThumbsUp, Laugh, Frown, Angry, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWebRTC } from "./WebRTCContext"
import CallModal from "./CallModal"

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

const REACTIONS = [
  { emoji: "❤️", name: "heart", icon: Heart },
  { emoji: "👍", name: "thumbsup", icon: ThumbsUp },
  { emoji: "😂", name: "laugh", icon: Laugh },
  { emoji: "😢", name: "sad", icon: Frown },
  { emoji: "😠", name: "angry", icon: Angry },
]

const Chat: React.FC<ChatProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMoreMessages,
  isLoading = false }) => {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { startCall } = useWebRTC()

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
      minute: "2-digit" })
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
        year: "numeric" })
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

  const handleStartCall = (type: 'audio' | 'video') => {
    if (conversation && conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
      if (otherParticipant) {
        startCall(otherParticipant.id, otherParticipant.name, type)
      }
    }
  }

  const handleViewProfile = () => {
    if (conversation) {
      window.open(`/profile/${conversation.participants[0]?.id}`, '_blank')
    }
  }

  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          reaction
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Erro ao adicionar reação:', result.error)
        return
      }

      // Atualizar mensagens com a nova reação
      // Aqui você pode implementar uma atualização otimista ou buscar as reações novamente
      console.log('Reação processada:', result)
      setShowReactions(null)
    } catch (error) {
      console.error('Erro ao processar reação:', error)
    }
  }

  const getReactionCount = (message: Message, reaction: string) => {
    return message.reactions?.[reaction]?.length || 0
  }

  const hasUserReacted = (message: Message, reaction: string) => {
    return message.reactions?.[reaction]?.includes(currentUserId) || false
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-chat-textSecondary-light dark:text-chat-textSecondary-dark bg-chat-bg-light dark:bg-chat-bg-dark">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="text-6xl mb-4">💬</div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-openlove-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-lg font-medium mb-2 text-chat-text-light dark:text-chat-text-dark">Selecione uma conversa</h3>
          <p className="text-chat-textSecondary-light dark:text-chat-textSecondary-dark">Escolha uma conversa para começar a trocar mensagens</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-chat-bg-light dark:bg-chat-bg-dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-chat-border-light dark:border-chat-border-dark bg-chat-bgSecondary-light dark:bg-chat-bgSecondary-dark">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-chat-border-light dark:ring-chat-border-dark">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-openlove-500 to-purple-500 text-white">
              {conversation.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium text-chat-text-light dark:text-chat-text-dark">{conversation.name}</h3>
            <p className="text-sm text-chat-textSecondary-light dark:text-chat-textSecondary-dark">
              {conversation.type === "direct"
                ? getOnlineParticipants().length > 0
                  ? "🟢 Online"
                  : "⚪ Offline"
                : `${getOnlineParticipants().length} online de ${conversation.participants.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.type === 'direct' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStartCall('audio')}
                title="Chamada de voz"
                className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStartCall('video')}
                title="Chamada de vídeo"
                className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewProfile} 
            title="Ver perfil"
            className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
          >
            <Info className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-chat-bg-light dark:bg-chat-bg-dark border-chat-border-light dark:border-chat-border-dark">
              <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark" onClick={handleViewProfile}>
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark">Silenciar notificações</DropdownMenuItem>
              <DropdownMenuItem className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark">Arquivar conversa</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Excluir conversa</DropdownMenuItem>
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
                    <div className="bg-chat-muted-light dark:bg-chat-muted-dark px-3 py-1 rounded-full text-xs text-chat-textSecondary-light dark:text-chat-textSecondary-dark">
                      {formatDateSeparator(message.timestamp)}
                    </div>
                  </div>
                )}
                <div className={`flex gap-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!message.isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.senderAvatar || '/placeholder.svg'} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-openlove-500 to-purple-500 text-white">
                        {message.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] ${message.isOwn ? 'order-first' : ''}`}>
                    {!message.isOwn && conversation.type === 'group' && (
                      <p className="text-xs text-chat-textSecondary-light dark:text-chat-textSecondary-dark mb-1 ml-1">{message.senderName}</p>
                    )}
                    <div className="relative group">
                      <div
                        className={`
                          px-4 py-3 rounded-2xl relative
                          ${message.isOwn 
                            ? 'bg-gradient-to-r from-openlove-500 to-purple-500 text-white rounded-br-md' 
                            : 'bg-chat-muted-light dark:bg-chat-muted-dark text-chat-text-light dark:text-chat-text-dark rounded-bl-md'
                          }
                        `}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* Reactions */}
                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(message.reactions).map(([reaction, users]) => (
                              <div
                                key={reaction}
                                className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                                  hasUserReacted(message, reaction)
                                    ? 'bg-white/20 text-white'
                                    : 'bg-black/10 text-white'
                                }`}
                              >
                                <span>{REACTIONS.find(r => r.name === reaction)?.emoji}</span>
                                <span>{users.length}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Reaction Button */}
                      <div className={`absolute ${message.isOwn ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <Popover open={showReactions === message.id} onOpenChange={(open) => setShowReactions(open ? message.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-chat-bg-light dark:bg-chat-bg-dark border border-chat-border-light dark:border-chat-border-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2 bg-chat-bg-light dark:bg-chat-bg-dark border border-chat-border-light dark:border-chat-border-dark">
                            <div className="flex gap-1">
                              {REACTIONS.map((reaction) => (
                                <Button
                                  key={reaction.name}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark"
                                  onClick={() => handleReaction(message.id, reaction.name)}
                                >
                                  <span className="text-lg">{reaction.emoji}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-chat-textSecondary-light dark:text-chat-textSecondary-dark ${
                        message.isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.isOwn && (
                        <span className="ml-1">
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-chat-muted-light dark:bg-chat-muted-dark">...</AvatarFallback>
              </Avatar>
              <div className="bg-chat-muted-light dark:bg-chat-muted-dark px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-chat-text-light dark:bg-chat-text-dark rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-chat-text-light dark:bg-chat-text-dark rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-chat-text-light dark:bg-chat-text-dark rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-chat-border-light dark:border-chat-border-dark bg-chat-bgSecondary-light dark:bg-chat-bgSecondary-dark">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
          >
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
              className="bg-chat-bg-light dark:bg-chat-bg-dark border-chat-border-light dark:border-chat-border-dark text-chat-text-light dark:text-chat-text-dark placeholder-chat-textSecondary-light dark:placeholder-chat-textSecondary-dark focus:border-openlove-500 dark:focus:border-openlove-400 focus:ring-openlove-500/20 dark:focus:ring-openlove-400/20 transition-all rounded-full"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-chat-text-light dark:text-chat-text-dark hover:bg-chat-muted-light dark:hover:bg-chat-muted-dark hover:text-openlove-600 dark:hover:text-openlove-400 transition-colors"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="bg-gradient-to-r from-openlove-500 to-purple-500 hover:from-openlove-600 hover:to-purple-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Call Modal */}
      <CallModal />
    </div>
  )
}

export default Chat
