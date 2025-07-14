// =============================================================================
// 1. FILTROS DE BUSCA COM SELEÇÃO MÚLTIPLA (FilterSelector.tsx)
// =============================================================================

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from 'lucide-react'
import { Button } from "../../../components/ui/button"

const filterOptions = {
  interests: [
    "Relacionamento", "Casual", "Amizade", "Aventura", "Viagem", "Música", 
    "Cinema", "Esportes", "Arte", "Gastronomia", "Natureza", "Tecnologia",
    "Literatura", "Dança", "Fotografia", "Yoga", "Academia", "Meditação"
  ],
  ageRanges: ["18-25", "26-35", "36-45", "46-55", "55+"],
  locations: [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Brasília",
    "Fortaleza", "Recife", "Porto Alegre", "Manaus", "Curitiba", "Goiânia"
  ],
  relationshipTypes: [
    "Relacionamento Sério", "Relacionamento Aberto", "Amizade Colorida",
    "Apenas Amizade", "Networking", "Sugar Dating", "Poliamor"
  ]
}

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

interface FilterSelectorProps {
  type: keyof typeof filterOptions
  selected: string[]
  onChange: (selected: string[]) => void
  title: string
  maxSelection?: number
}

export function FilterSelector({ type, selected, onChange, title, maxSelection }: FilterSelectorProps) {
  const options = filterOptions[type]

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      if (maxSelection && selected.length >= maxSelection) {
        return // Não permite mais seleções
      }
      onChange([...selected, option])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
      
      {maxSelection && (
        <p className="text-sm text-gray-500">
          Selecionados: {selected.length}/{maxSelection}
        </p>
      )}

      <motion.div 
        className="flex flex-wrap gap-2 overflow-visible"
        layout
        transition={transitionProps}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option)
          const isDisabled = maxSelection && !isSelected && selected.length >= maxSelection
          
          return (
            <motion.button
              key={option}
              onClick={() => !isDisabled && toggleOption(option)}
              layout
              initial={false}
              animate={{
                backgroundColor: isSelected 
                  ? "rgba(236, 72, 153, 0.1)" 
                  : isDisabled 
                    ? "rgba(107, 114, 128, 0.1)"
                    : "rgba(243, 244, 246, 1)",
                opacity: isDisabled ? 0.5 : 1
              }}
              whileHover={!isDisabled ? {
                backgroundColor: isSelected 
                  ? "rgba(236, 72, 153, 0.15)" 
                  : "rgba(243, 244, 246, 1)",
                scale: 1.02
              } : {}}
              whileTap={!isDisabled ? {
                scale: 0.98
              } : {}}
              transition={transitionProps}
              disabled={isDisabled}
              className={`
                inline-flex items-center px-3 py-2 rounded-full text-sm font-medium
                whitespace-nowrap overflow-hidden ring-1 ring-inset transition-all
                ${isSelected 
                  ? "text-pink-700 ring-pink-200 dark:text-pink-300 dark:ring-pink-800" 
                  : isDisabled
                    ? "text-gray-400 ring-gray-200 cursor-not-allowed"
                    : "text-gray-700 ring-gray-200 hover:text-gray-900 dark:text-gray-300 dark:ring-gray-700"}
                ${!isDisabled && "cursor-pointer"}
              `}
            >
              <motion.div 
                className="relative flex items-center"
                animate={{ 
                  paddingRight: isSelected ? "1.25rem" : "0",
                }}
                transition={{
                  ease: [0.175, 0.885, 0.32, 1.275],
                  duration: 0.3,
                }}
              >
                <span>{option}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={transitionProps}
                      className="absolute right-0"
                    >
                      <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={2} />
                      </div>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

// =============================================================================
// 2. SISTEMA DE CHAT MELHORADO (ChatInterface.tsx)
// =============================================================================

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Badge } from "../../../components/ui/badge"
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image as ImageIcon, 
  MoreVertical, 
  Phone, 
  Video,
  Search,
  ArrowLeft,
  Users,
  Settings,
  LogOut
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

// Tipos do chat
interface ChatUser {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
  lastSeen?: Date
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  timestamp: Date
  type: "text" | "image" | "file" | "system"
  isOwn: boolean
  senderName: string
  senderAvatar?: string
}

interface Conversation {
  id: string
  type: "direct" | "group"
  name: string
  participants: ChatUser[]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  avatar?: string
}

interface ChatInterfaceProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  currentUserId: string
  isMobile?: boolean
}

export function ChatInterface({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  currentUserId,
  isMobile = false 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Filtrar conversas por busca
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !selectedConversationId) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      senderId: currentUserId,
      timestamp: new Date(),
      type: "text",
      isOwn: true,
      senderName: "Você",
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // Simular resposta automática (remover em produção)
    setIsTyping(true)
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Recebi sua mensagem: "${inputValue}"`,
        senderId: "other",
        timestamp: new Date(),
        type: "text",
        isOwn: false,
        senderName: selectedConversation?.name || "Usuário",
        senderAvatar: selectedConversation?.avatar,
      }
      setMessages(prev => [...prev, replyMessage])
      setIsTyping(false)
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Sidebar de conversas */}
      <div className={`${isMobile && selectedConversationId ? 'hidden' : 'block'} w-full md:w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900`}>
        {/* Header da sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Conversas
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`
                  w-full p-3 rounded-lg text-left transition-colors
                  ${selectedConversationId === conversation.id 
                    ? "bg-pink-100 dark:bg-pink-900/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        {conversation.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.type === "direct" && (
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(conversation.participants[0]?.status || "offline")}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{conversation.name}</span>
                      {conversation.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatLastSeen(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || "Nenhuma mensagem"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área do chat */}
      <div className={`${isMobile && !selectedConversationId ? 'hidden' : 'block'} flex-1 flex flex-col`}>
        {selectedConversation ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectConversation("")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                      {selectedConversation.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.type === "group" 
                        ? `${selectedConversation.participants.length} participantes`
                        : selectedConversation.participants[0]?.status === "online" 
                          ? "Online" 
                          : `Visto ${formatLastSeen(selectedConversation.participants[0]?.lastSeen || new Date())}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                      <DropdownMenuItem>Silenciar notificações</DropdownMenuItem>
                      <DropdownMenuItem>Arquivar conversa</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Excluir conversa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    {!message.isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${message.isOwn ? "order-first" : ""}`}>
                      {!message.isOwn && selectedConversation.type === "group" && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">
                          {message.senderName}
                        </p>
                      )}
                      
                      <div
                        className={`
                          px-4 py-3 rounded-2xl relative
                          ${message.isOwn 
                            ? "bg-pink-500 text-white rounded-br-sm" 
                            : "bg-gray-100 dark:bg-gray-800 rounded-bl-sm"}
                        `}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.isOwn ? "text-pink-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="pr-10 rounded-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="rounded-full bg-pink-500 hover:bg-pink-600"
                  disabled={inputValue.trim() === ""}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Estado vazio
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p>Escolha uma conversa para começar a trocar mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// 3. SISTEMA DE NOTIFICAÇÕES COM BADGES (NotificationSystem.tsx)
// =============================================================================

"use client"

import { useState, useEffect } from "react"
import { Bell, MessageCircle, Heart, UserPlus, AtSign, Calendar, Settings } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "message" | "mention" | "event"
  title: string
  content: string
  isRead: boolean
  createdAt: Date
  sender?: {
    name: string
    avatar?: string
  }
}

interface NotificationBadgeProps {
  count: number
  children: React.ReactNode
  onClick?: () => void
}

function NotificationBadge({ count, children, onClick }: NotificationBadgeProps) {
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
        {children}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1"
            >
              {count < 10 ? (
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
              ) : (
                <Badge variant="destructive" className="px-1.5 py-0.5 text-xs min-w-[18px] h-[18px]">
                  {count > 99 ? "99+" : count}
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "like": return <Heart className="w-4 h-4 text-pink-500" />
      case "comment": return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "follow": return <UserPlus className="w-4 h-4 text-green-500" />
      case "message": return <MessageCircle className="w-4 h-4 text-purple-500" />
      case "mention": return <AtSign className="w-4 h-4 text-orange-500" />
      case "event": return <Calendar className="w-4 h-4 text-indigo-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Agora"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div
      className={`
        p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer
        transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50
        ${!notification.isRead ? "bg-pink-50 dark:bg-pink-950/10" : ""}
      `}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${!notification.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.content}
          </p>
          
          {!notification.isRead && (
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
          )}
        </div>
      </div>
    </div>
  )
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Simular dados (substituir por dados reais)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "like",
        title: "Nova curtida",
        content: "Ana curtiu sua foto",
        isRead: false,
        createdAt: new Date(Date.now() - 300000), // 5 min atrás
      },
      {
        id: "2",
        type: "follow",
        title: "Novo seguidor",
        content: "Carlos começou a te seguir",
        isRead: false,
        createdAt: new Date(Date.now() - 900000), // 15 min atrás
      },
      {
        id: "3",
        type: "message",
        title: "Nova mensagem",
        content: "Você tem uma nova mensagem de Maria",
        isRead: true,
        createdAt: new Date(Date.now() - 1800000), // 30 min atrás
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const messageCount = notifications.filter(n => n.type === "message" && !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Badge de mensagens */}
      <NotificationBadge count={messageCount}>
        <MessageCircle className="h-5 w-5" />
      </NotificationBadge>

      {/* Badge de notificações */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div>
            <NotificationBadge count={unreadCount}>
              <Bell className="h-5 w-5" />
            </NotificationBadge>
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 max-h-96 overflow-hidden p-0"
          sideOffset={5}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// =============================================================================
// 4. TOAST PARA NOVOS POSTS DA TIMELINE (PostToast.tsx)
// =============================================================================

"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp, X, Eye } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

interface NewPost {
  id: string
  author: {
    name: string
    avatar?: string
  }
  content: string
  createdAt: Date
}

interface PostToastProps {
  newPosts: NewPost[]
  onViewPosts: () => void
  onDismiss: () => void
}

export function PostToast({ newPosts, onViewPosts, onDismiss }: PostToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (newPosts.length > 0) {
      setIsVisible(true)
      
      // Auto dismiss após 10 segundos
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Aguarda animação
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [newPosts, onDismiss])

  if (newPosts.length === 0) return null

  const latestPost = newPosts[0]
  const remainingCount = newPosts.length - 1

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {newPosts.length === 1 ? "Novo post" : `${newPosts.length} novos posts`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onDismiss, 300)
                }}
                className="h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={latestPost.author.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs">
                  {latestPost.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {latestPost.author.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {latestPost.content}
                </p>
                {remainingCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    e mais {remainingCount} {remainingCount === 1 ? "post" : "posts"}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                onViewPosts()
                setIsVisible(false)
                setTimeout(onDismiss, 300)
              }}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver {newPosts.length === 1 ? "post" : "posts"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// 5. PÁGINA DE PERFIL COMPLETA (UserProfile.tsx)
// =============================================================================

"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import {
  Settings,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Edit,
  Camera,
  Users,
  Image as ImageIcon,
  Video,
  Bookmark,
  Star,
  Gift,
  Shield,
  Lock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

interface UserProfileProps {
  user: {
    id: string
    name: string
    username: string
    avatar?: string
    coverImage?: string
    bio?: string
    location?: string
    joinedAt: Date
    verified?: boolean
    premium?: boolean
    interests: string[]
    stats: {
      posts: number
      followers: number
      following: number
      likes: number
    }
  }
  isOwnProfile: boolean
  isFollowing?: boolean
  onFollow?: () => void
  onMessage?: () => void
}

export function UserProfile({ user, isOwnProfile, isFollowing, onFollow, onMessage }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-t-lg overflow-hidden">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
          >
            <Camera className="w-4 h-4 mr-2" />
            Editar capa
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-b-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-900">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl md:text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h1>
                  {user.verified && (
                    <Shield className="w-5 h-5 text-blue-500" />
                  )}
                  {user.premium && (
                    <Star className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={onFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "" : "bg-pink-500 hover:bg-pink-600"}
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                    <Button variant="outline" onClick={onMessage}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensagem
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share className="w-4 h-4 mr-2" />
                          Compartilhar perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Gift className="w-4 h-4 mr-2" />
                          Enviar presente
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Lock className="w-4 h-4 mr-2" />
                          Bloquear usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Entrou em {formatJoinDate(user.joinedAt)}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(user.stats.posts)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center cursor-pointer hover:text-pink-500">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(user.stats.followers)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
              </div>
              <div className="text-center cursor-pointer hover:text-pink-500">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(user.stats.following)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(user.stats.likes)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Curtidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Interesses
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Mídia
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Curtidas
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Salvos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Posts grid - aqui você renderizaria os posts do usuário */}
              <Card className="aspect-square">
                <CardContent className="p-0 h-full">
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              {/* Repetir para mais posts */}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {/* Mídia grid */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-gray-400" />
              </div>
              {/* Repetir para mais mídias */}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Curtidas privadas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                As curtidas deste usuário são privadas
              </p>
            </div>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="mt-6">
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Itens salvos</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Salve posts que você gostou para vê-los depois
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

// =============================================================================
// 6. RIGHT SIDEBAR SEM DADOS MOCK (TimelineRightSidebar.tsx)
// =============================================================================

"use client"

import { useState, useEffect } from "react"
import { Search, TrendingUp, Users, Calendar, MapPin, Hash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"

interface TrendingTopic {
  id: string
  tag: string
  posts: number
  trend: "up" | "down" | "stable"
}

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatar?: string
  followers: number
  isVerified: boolean
  commonConnections: number
}

interface UpcomingEvent {
  id: string
  title: string
  date: Date
  location: string
  attendees: number
  isInterested: boolean
}

export function TimelineRightSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealData()
  }, [])

  const fetchRealData = async () => {
    try {
      setLoading(true)
      
      // Buscar trending topics
      const trendingResponse = await fetch('/api/trending')
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json()
        setTrendingTopics(trendingData.data || [])
      }

      // Buscar usuários sugeridos
      const usersResponse = await fetch('/api/suggestions/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setSuggestedUsers(usersData.data || [])
      }

      // Buscar eventos próximos
      const eventsResponse = await fetch('/api/events/upcoming')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setUpcomingEvents(eventsData.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados da sidebar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implementar busca real
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <aside className="hidden xl:block w-[350px] p-4 sticky top-0 h-screen overflow-y-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden xl:block w-[350px] p-4 sticky top-0 h-screen overflow-y-auto space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar no OpenLove"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {trendingTopics.slice(0, 5).map((topic, index) => (
                <li key={topic.id}>
                  <a href={`/explore/tags/${topic.tag}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-pink-500" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {topic.tag}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatNumber(topic.posts)} posts
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        topic.trend === "up" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : topic.trend === "down"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {topic.trend === "up" ? "↗" : topic.trend === "down" ? "↘" : "→"}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && (
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Users className="w-5 h-5 text-pink-500" />
              Sugestões para você
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {suggestedUsers.slice(0, 3).map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {user.name}
                        </span>
                        {user.isVerified && (
                          <Badge variant="secondary" className="text-xs px-1">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        @{user.username} • {formatNumber(user.followers)} seguidores
                      </div>
                      {user.commonConnections > 0 && (
                        <div className="text-xs text-pink-600 dark:text-pink-400">
                          {user.commonConnections} conexões em comum
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Seguir
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Calendar className="w-5 h-5 text-pink-500" />
              Eventos próximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <li key={event.id} className="border-l-2 border-pink-500 pl-3">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    {event.date.toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatNumber(event.attendees)} interessados
                    </span>
                    <Button 
                      size="sm" 
                      variant={event.isInterested ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {event.isInterested ? "Participando" : "Interessado"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* When no data is available */}
      {!loading && trendingTopics.length === 0 && suggestedUsers.length === 0 && upcomingEvents.length === 0 && (
        <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
          <CardContent className="text-center py-8">
            <TrendingUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Nada por aqui ainda
            </h3>
            <p className="text-sm text-gray-500">
              Siga algumas pessoas para ver sugestões e tendências
            </p>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}

// =============================================================================
// 7. EXEMPLO DE USO INTEGRADO (ExampleUsage.tsx)
// =============================================================================

"use client"

import { useState } from "react"
import { FilterSelector } from "./FilterSelector"
import { ChatInterface } from "./ChatInterface"
import { NotificationSystem } from "./NotificationSystem"
import { PostToast } from "./PostToast"
import { UserProfile } from "./UserProfile"
import { TimelineRightSidebar } from "./TimelineRightSidebar"

export function ExampleUsage() {
  // Estados para filtros
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedRelationshipTypes, setSelectedRelationshipTypes] = useState<string[]>([])

  // Estados para chat
  const [selectedConversationId, setSelectedConversationId] = useState<string>("")

  // Estados para toast
  const [newPosts, setNewPosts] = useState<any[]>([])

  // Dados de exemplo para chat
  const conversations = [
    {
      id: "1",
      type: "direct" as const,
      name: "Emma Thompson",
      participants: [
        {
          id: "user1",
          name: "Emma Thompson",
          avatar: "/avatar1.jpg",
          status: "online" as const,
          lastSeen: new Date()
        }
      ],
      lastMessage: "Oi! Como você está?",
      lastMessageTime: new Date(),
      unreadCount: 2,
      avatar: "/avatar1.jpg"
    },
    {
      id: "2",
      type: "group" as const,
      name: "Grupo dos Amigos",
      participants: [
        {
          id: "user2",
          name: "João Silva",
          avatar: "/avatar2.jpg",
          status: "away" as const
        },
        {
          id: "user3",
          name: "Maria Santos",
          avatar: "/avatar3.jpg",
          status: "online" as const
        }
      ],
      lastMessage: "Alguém quer sair hoje?",
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 0,
      avatar: "/group-avatar.jpg"
    }
  ]

  // Dados de exemplo para perfil
  const userProfile = {
    id: "current-user",
    name: "João Silva",
    username: "joaosilva",
    avatar: "/my-avatar.jpg",
    coverImage: "/my-cover.jpg",
    bio: "Desenvolvedor apaixonado por tecnologia e viagens. Sempre em busca de novas aventuras e conexões genuínas! 🚀✨",
    location: "São Paulo, Brasil",
    joinedAt: new Date(2023, 0, 15),
    verified: true,
    premium: true,
    interests: ["Tecnologia", "Viagens", "Fotografia", "Música", "Culinária"],
    stats: {
      posts: 156,
      followers: 2340,
      following: 892,
      likes: 12500
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com sistema de notificações */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-pink-500">OpenLove</h1>
          <NotificationSystem />
        </div>
      </header>

      {/* Toast para novos posts */}
      <PostToast
        newPosts={newPosts}
        onViewPosts={() => {
          console.log("Ver novos posts")
          setNewPosts([])
        }}
        onDismiss={() => setNewPosts([])}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Seção de Filtros */}
        <section className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Filtros de Busca</h2>
          <div className="space-y-8">
            <FilterSelector
              type="interests"
              selected={selectedInterests}
              onChange={setSelectedInterests}
              title="Interesses"
              maxSelection={5}
            />
            
            <FilterSelector
              type="ageRanges"
              selected={selectedAgeRanges}
              onChange={setSelectedAgeRanges}
              title="Faixa Etária"
              maxSelection={2}
            />
            
            <FilterSelector
              type="locations"
              selected={selectedLocations}
              onChange={setSelectedLocations}
              title="Localização"
              maxSelection={3}
            />
            
            <FilterSelector
              type="relationshipTypes"
              selected={selectedRelationshipTypes}
              onChange={setSelectedRelationshipTypes}
              title="Tipo de Relacionamento"
              maxSelection={3}
            />
          </div>
        </section>

        {/* Seção de Chat */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold">Sistema de Chat</h2>
          </div>
          <div className="h-96">
            <ChatInterface
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              currentUserId="current-user"
              isMobile={false}
            />
          </div>
        </section>

        {/* Seção de Perfil */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold">Perfil do Usuário</h2>
          </div>
          <div className="p-6">
            <UserProfile
              user={userProfile}
              isOwnProfile={true}
              onFollow={() => console.log("Seguir")}
              onMessage={() => console.log("Enviar mensagem")}
            />
          </div>
        </section>

        {/* Layout com Sidebar */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold">Sidebar da Timeline</h2>
          </div>
          <div className="flex">
            <div className="flex-1 p-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Conteúdo Principal</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aqui ficaria o feed principal da timeline
                </p>
              </div>
            </div>
            <TimelineRightSidebar />
          </div>
        </section>
      </div>

      {/* Botão para simular novos posts */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            const mockPosts = [
              {
                id: Date.now().toString(),
                author: {
                  name: "Ana Silva",
                  avatar: "/avatar-ana.jpg"
                },
                content: "Acabei de chegar em Paris! Que cidade incrível! 🇫🇷✨",
                createdAt: new Date()
              }
            ]
            setNewPosts(mockPosts)
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg"
        >
          Simular Novo Post
        </button>
      </div>
    </div>
  )
}