"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardTitle, CardDescription } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
  Clock,
  UserPlus,
  Settings,
  Trash2,
  Archive,
  X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CardContent } from "@/components/ui/card"

interface Message {
  id: string
  content: string
  timestamp: string
  isFromMe: boolean
  isRead: boolean
  type: "text" | "image" | "video" | "audio"
  mediaUrl?: string
}

interface Conversation {
  id: string
  user: {
    name: string
    avatar: string
    username: string
    isOnline: boolean
    lastSeen?: string
  }
  lastMessage: {
    content: string
    timestamp: string
    isFromMe: boolean
    isRead: boolean
  }
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
}

interface MessagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MessagesDialog = function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
  // Remover MOCK_CONVERSATIONS
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchConversations = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/chat/conversations")
        if (!res.ok) throw new Error("Erro ao buscar conversas")
        const json = await res.json()
        setConversations(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [open])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "1",
        content: "Oi! Como você está?",
        timestamp: "10:30",
        isFromMe: false,
        isRead: true,
        type: "text"
      },
      {
        id: "2",
        content: "Oi! Tudo bem, e você?",
        timestamp: "10:32",
        isFromMe: true,
        isRead: true,
        type: "text"
      },
      {
        id: "3",
        content: "Vamos no evento de sábado?",
        timestamp: "10:35",
        isFromMe: false,
        isRead: false,
        type: "text"
      }
    ]
  })

  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isFromMe: true,
      isRead: false,
      type: "text"
    }

    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), message]
    }))

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: {
                content: newMessage,
                timestamp: "agora",
                isFromMe: true,
                isRead: false
              },
              unreadCount: 0
            }
          : conv
      )
    )

    setNewMessage("")
  }

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv
      )
    )
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 sm:p-6 bg-white dark:bg-gray-900">
        <div className="flex h-full flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-white/10 flex flex-col">
            <DialogHeader className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Mensagens
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Conecte-se com a comunidade
                  </DialogDescription>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-2 sm:mx-4 mt-2 sm:mt-4">
                  <TabsTrigger value="chats" className="text-xs">Conversas</TabsTrigger>
                  <TabsTrigger value="groups" className="text-xs">Grupos</TabsTrigger>
                  <TabsTrigger value="requests" className="text-xs">Solicitações</TabsTrigger>
                </TabsList>

                <TabsContent value="chats" className="flex-1 flex flex-col mt-2 sm:mt-4">
                  <div className="px-2 sm:px-4 mb-2 sm:mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar conversas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 px-2 sm:px-4">
                    {filteredConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedConversation?.id === conversation.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        )}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          markConversationAsRead(conversation.id)
                        }}
                      >
                        <CardContent className="p-2 sm:p-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                <AvatarImage src={conversation.user.avatar} />
                                <AvatarFallback className="text-sm font-semibold">
                                  {conversation.user.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.user.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {conversation.user.name}
                                </p>
                                <span className="text-xs text-gray-500 ml-1">
                                  {conversation.lastMessage.timestamp}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {conversation.lastMessage.isFromMe && "Você: "}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs px-1 py-0.5">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              {conversation.isPinned && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="groups" className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4">
                    <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Grupos em breve</p>
                  </div>
                </TabsContent>

                <TabsContent value="requests" className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 p-4">
                    <UserPlus className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Nenhuma solicitação pendente</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="sm:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                      <AvatarImage src={selectedConversation.user.avatar} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {selectedConversation.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{selectedConversation.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.user.isOnline ? "Online" : selectedConversation.user.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages[selectedConversation.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.isFromMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm",
                          message.isFromMe
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp}
                          </span>
                          {message.isFromMe && (
                            message.isRead ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        className="min-h-[40px] max-h-24 sm:max-h-32 resize-none text-sm"
                        rows={1}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hidden sm:flex">
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-lg font-medium">Selecione uma conversa</p>
                  <p className="text-xs sm:text-sm">Escolha uma conversa para começar a mensagem</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
