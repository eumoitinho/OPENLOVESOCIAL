"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardTitle, CardDescription } from "../../../components/ui/card"
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
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

export function MessagesContent() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <p>Carregando conversas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          <p>Erro ao carregar conversas: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex h-[calc(100vh-200px)] flex-col sm:flex-row bg-white dark:bg-gray-900 rounded-lg border">
        {/* Sidebar */}
        <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-white/10 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Mensagens
                  {totalUnread > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {totalUnread}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com a comunidade
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                <TabsTrigger value="chats">Conversas</TabsTrigger>
                <TabsTrigger value="groups">Grupos</TabsTrigger>
                <TabsTrigger value="requests">Solicitações</TabsTrigger>
              </TabsList>

              <TabsContent value="chats" className="flex-1 flex flex-col mt-4">
                <div className="px-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 px-4">
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
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.user.avatar} />
                              <AvatarFallback className="text-sm font-semibold">
                                {conversation.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.user.name}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessage.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.isFromMe ? "Você: " : ""}
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="groups" className="flex-1 flex flex-col mt-4">
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Grupos em breve</p>
                </div>
              </TabsContent>

              <TabsContent value="requests" className="flex-1 flex flex-col mt-4">
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Solicitações em breve</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.user.avatar} />
                      <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{selectedConversation.user.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.user.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.isFromMe
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.isFromMe && (
                          <span className="text-xs">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa para começar a trocar mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 