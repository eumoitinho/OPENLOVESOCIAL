// =============================================================================
// 1. COMPONENTE DE NOTIFICAÇÕES COMPLETO (NotificationsContent.tsx)
// =============================================================================

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useNotifications } from "@/app/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  Check,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Calendar,
  Settings,
  Trash2,
  Filter
} from "lucide-react"

interface NotificationItemProps {
  notification: any
  onMarkAsRead: (id: string) => void
  onDelete?: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
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

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    
    // Navegar baseado no tipo de notificação
    if (notification.data?.post_id) {
      window.location.href = `/posts/${notification.data.post_id}`
    } else if (notification.data?.user_id) {
      window.location.href = `/profile/${notification.data.user_id}`
    }
  }

  return (
    <div
      className={`
        relative p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer
        transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50
        ${!notification.is_read ? "bg-pink-50 dark:bg-pink-950/10 border-l-4 border-l-pink-500" : ""}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-medium leading-5 ${
                !notification.is_read 
                  ? "text-gray-900 dark:text-gray-100" 
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {notification.title}
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-5">
                {notification.content}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.created_at)}
                </span>
                
                {notification.sender && (
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={notification.sender.avatar_url} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        {notification.sender.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">
                      {notification.sender.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(notification.id)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsContent() {
  const { user } = useAuth()
  const { notifications, stats, loading, error, markAsRead, markAllAsRead } = useNotifications(user?.id)
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case "unread":
        return !notification.is_read
      case "mentions":
        return notification.type === "mention"
      case "events":
        return notification.type === "event"
      case "interactions":
        return ["like", "comment", "follow"].includes(notification.type)
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erro ao carregar notificações
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-t-lg border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Notificações
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.unread > 0 
                  ? `${stats.unread} não lida${stats.unread > 1 ? 's' : ''} de ${stats.total} total`
                  : `${stats.total} notificação${stats.total !== 1 ? 'ões' : ''}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {stats.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Marcar todas como lidas
              </Button>
            )}
            
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-transparent border-b-0 px-6">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
            >
              Todas
              {stats.total > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {stats.total}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="unread"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
            >
              Não lidas
              {stats.unread > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {stats.unread}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="interactions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
            >
              Interações
              {stats.byType && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {(stats.byType.like?.total || 0) + (stats.byType.comment?.total || 0) + (stats.byType.follow?.total || 0)}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="mentions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
            >
              Menções
              {stats.byType?.mention?.total > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {stats.byType.mention.total}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="events"
              className="data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
            >
              Eventos
              {stats.byType?.event?.total > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {stats.byType.event.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-b-lg">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {activeTab === "unread" ? "Todas as notificações foram lidas" : "Nenhuma notificação"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "unread" 
                ? "Parabéns! Você está em dia com suas notificações."
                : "Quando alguém interagir com você, as notificações aparecerão aqui."
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// 2. HOOK PARA GERENCIAMENTO DE CONVERSAS (useConversations.ts)
// =============================================================================

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name: string
  participants: User[]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  avatar?: string
}

interface User {
  id: string
  name: string
  username: string
  avatar_url?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  created_at: string
  sender?: User
}

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar conversas
  const fetchConversations = async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          name,
          avatar_url,
          created_at,
          conversation_participants!inner(
            user_id,
            user:users(
              id,
              name,
              username,
              avatar_url,
              status,
              last_seen
            )
          ),
          last_message:messages(
            content,
            created_at
          )
        `)
        .eq('conversation_participants.user_id', userId)
        .order('last_message.created_at', { ascending: false })

      if (error) throw error

      const formattedConversations = data?.map(conv => ({
        id: conv.id,
        type: conv.type,
        name: conv.name || (conv.type === 'direct' 
          ? conv.conversation_participants.find((p: any) => p.user_id !== userId)?.user?.name || 'Usuário'
          : `Grupo ${conv.id.slice(0, 8)}`
        ),
        participants: conv.conversation_participants.map((p: any) => ({
          id: p.user.id,
          name: p.user.name,
          username: p.user.username,
          avatar_url: p.user.avatar_url,
          status: p.user.status || 'offline',
          lastSeen: p.user.last_seen ? new Date(p.user.last_seen) : undefined
        })),
        lastMessage: conv.last_message?.[0]?.content,
        lastMessageTime: conv.last_message?.[0]?.created_at ? new Date(conv.last_message[0].created_at) : undefined,
        unreadCount: 0, // Calcular baseado em mensagens não lidas
        avatar: conv.avatar_url || conv.conversation_participants.find((p: any) => p.user_id !== userId)?.user?.avatar_url
      })) || []

      setConversations(formattedConversations)
    } catch (err) {
      console.error('Erro ao carregar conversas:', err)
      setError('Erro ao carregar conversas')
    } finally {
      setLoading(false)
    }
  }

  // Carregar mensagens de uma conversa
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          type,
          created_at,
          sender:users(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages = data?.map(msg => ({
        ...msg,
        isOwn: msg.sender_id === userId,
        senderName: msg.sender?.name || 'Usuário',
        senderAvatar: msg.sender?.avatar_url,
        timestamp: new Date(msg.created_at)
      })) || []

      setMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages
      }))

      return formattedMessages
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err)
      return []
    }
  }

  // Enviar mensagem
  const sendMessage = async (conversationId: string, content: string, type: string = 'text') => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          type
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          type,
          created_at,
          sender:users(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      const newMessage = {
        ...data,
        isOwn: true,
        senderName: data.sender?.name || 'Você',
        senderAvatar: data.sender?.avatar_url,
        timestamp: new Date(data.created_at)
      }

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }))

      return newMessage
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      throw err
    }
  }

  // Criar nova conversa
  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!userId) return

    try {
      // Verificar se conversa direta já existe
      if (type === 'direct' && participantIds.length === 1) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('type', 'direct')
          .in('conversation_participants.user_id', [userId, participantIds[0]])

        if (existing && existing.length > 0) {
          return existing[0].id
        }
      }

      // Criar nova conversa
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type,
          name: name || null
        })
        .select()
        .single()

      if (convError) throw convError

      // Adicionar participantes
      const participants = [userId, ...participantIds].map(id => ({
        conversation_id: conversation.id,
        user_id: id
      }))

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      await fetchConversations()
      return conversation.id
    } catch (err) {
      console.error('Erro ao criar conversa:', err)
      throw err
    }
  }

  // Configurar real-time
  useEffect(() => {
    if (!userId) return

    fetchConversations()

    // Subscrever a novas mensagens
    const messagesChannel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new
        
        // Buscar dados do sender
        const { data: sender } = await supabase
          .from('users')
          .select('id, name, username, avatar_url')
          .eq('id', newMessage.sender_id)
          .single()

        const formattedMessage = {
          ...newMessage,
          isOwn: newMessage.sender_id === userId,
          senderName: sender?.name || 'Usuário',
          senderAvatar: sender?.avatar_url,
          timestamp: new Date(newMessage.created_at),
          sender
        }

        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [
            ...(prev[newMessage.conversation_id] || []),
            formattedMessage
          ]
        }))
      })
      .subscribe()

    return () => {
      messagesChannel.unsubscribe()
    }
  }, [userId])

  return {
    conversations,
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    createConversation,
    refetch: fetchConversations
  }
}

// =============================================================================
// 3. API PARA CONVERSAS (/api/conversations/route.ts)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        name,
        avatar_url,
        created_at,
        conversation_participants!inner(
          user_id,
          user:users(
            id,
            name,
            username,
            avatar_url,
            status,
            last_seen
          )
        ),
        last_message:messages(
          content,
          created_at,
          sender:users(name)
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar conversas:', error)
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    const formattedConversations = conversations?.map(conv => ({
      id: conv.id,
      type: conv.type,
      name: conv.name || (conv.type === 'direct' 
        ? conv.conversation_participants.find((p: any) => p.user_id !== userId)?.user?.name || 'Usuário'
        : `Grupo ${conv.id.slice(0, 8)}`
      ),
      participants: conv.conversation_participants.map((p: any) => p.user),
      lastMessage: conv.last_message?.[0]?.content,
      lastMessageTime: conv.last_message?.[0]?.created_at,
      lastMessageSender: conv.last_message?.[0]?.sender?.name,
      unreadCount: 0, // TODO: Calcular mensagens não lidas
      avatar: conv.avatar_url || conv.conversation_participants.find((p: any) => p.user_id !== userId)?.user?.avatar_url
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedConversations
    })

  } catch (error) {
    console.error('Erro na API de conversas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { participantIds, type = 'direct', name } = await request.json()

    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { success: false, error: 'Participantes são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se conversa direta já existe
    if (type === 'direct' && participantIds.length === 1) {
      const { data: existing } = await supabase
        .rpc('find_direct_conversation', {
          user1_id: userId,
          user2_id: participantIds[0]
        })

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: true,
          data: { id: existing[0].id, exists: true }
        })
      }
    }

    // Criar nova conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: name || null
      })
      .select()
      .single()

    if (convError) {
      console.error('Erro ao criar conversa:', convError)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar conversa' },
        { status: 500 }
      )
    }

    // Adicionar participantes
    const participants = [userId, ...participantIds].map(id => ({
      conversation_id: conversation.id,
      user_id: id
    }))

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) {
      console.error('Erro ao adicionar participantes:', participantsError)
      return NextResponse.json(
        { success: false, error: 'Erro ao adicionar participantes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: conversation.id, exists: false }
    })

  } catch (error) {
    console.error('Erro na API de criação de conversa:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// =============================================================================
// 4. API PARA MENSAGENS (/api/messages/route.ts)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'ID da conversa é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se usuário tem acesso à conversa
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const offset = (page - 1) * limit

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        type,
        created_at,
        sender:users(
          id,
          name,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar mensagens:', error)
      return NextResponse.json(
        { success: false, error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    const formattedMessages = messages?.map(msg => ({
      ...msg,
      isOwn: msg.sender_id === session.user.id,
      senderName: msg.sender?.name || 'Usuário',
      senderAvatar: msg.sender?.avatar_url,
      timestamp: new Date(msg.created_at)
    })).reverse() || []

    return NextResponse.json({
      success: true,
      data: formattedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages?.length === limit
      }
    })

  } catch (error) {
    console.error('Erro na API de mensagens:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { conversationId, content, type = 'text' } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Conversa e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário tem acesso à conversa
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content,
        type
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        type,
        created_at,
        sender:users(
          id,
          name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao enviar mensagem:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }

    const formattedMessage = {
      ...message,
      isOwn: true,
      senderName: message.sender?.name || 'Você',
      senderAvatar: message.sender?.avatar_url,
      timestamp: new Date(message.created_at)
    }

    return NextResponse.json({
      success: true,
      data: formattedMessage
    })

  } catch (error) {
    console.error('Erro na API de envio de mensagem:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// =============================================================================
// 5. COMPONENTE DE UPLOAD DE ARQUIVOS (FileUpload.tsx)
// =============================================================================

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  X, 
  Check,
  AlertCircle 
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FileUploadProps {
  onFileUploaded: (url: string, type: string) => void
  maxSize?: number // em MB
  acceptedTypes?: string[]
  multiple?: boolean
  bucket?: string
}

export function FileUpload({ 
  onFileUploaded, 
  maxSize = 10, 
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  multiple = false,
  bucket = 'messages'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File) => {
    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`Arquivo muito grande. Máximo ${maxSize}MB`)
    }

    // Verificar tipo
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isAccepted) {
      throw new Error('Tipo de arquivo não suportado')
    }
  }

  const uploadFile = async (file: File) => {
    try {
      validateFile(file)
      setUploading(true)
      setError(null)
      setProgress(0)

      // Gerar nome único
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${bucket}/${fileName}`

      // Upload com progress
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setProgress(100)
      onFileUploaded(publicUrl, file.type)

      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 1000)

    } catch (err) {
      console.error('Erro no upload:', err)
      setError(err instanceof Error ? err.message : 'Erro no upload')
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    if (multiple) {
      Array.from(files).forEach(uploadFile)
    } else {
      uploadFile(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragOver 
            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-pink-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enviando... {progress}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium">
                Clique para selecionar ou arraste arquivos aqui
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {acceptedTypes.includes('image/*') && 'Imagens, '}
                {acceptedTypes.includes('video/*') && 'vídeos, '}
                {acceptedTypes.includes('application/pdf') && 'PDFs '}
                até {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-6 w-6" 
            onClick={() => setError(null)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Botões alternativos */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Imagem
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'video/*'
              fileInputRef.current.click()
              fileInputRef.current.accept = acceptedTypes.join(',')
            }
          }}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Vídeo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'application/pdf,.doc,.docx'
              fileInputRef.current.click()
              fileInputRef.current.accept = acceptedTypes.join(',')
            }
          }}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <File className="w-4 h-4" />
          Documento
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// 6. SCHEMA SQL COMPLETO PARA CHAT (chat_schema.sql)
// =============================================================================

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
  name VARCHAR(255),
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de participantes da conversa
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Tabela de status de leitura
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para encontrar conversa direta
CREATE OR REPLACE FUNCTION find_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id
  FROM conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
    )
    AND (
      SELECT COUNT(*) FROM conversation_participants cp 
      WHERE cp.conversation_id = c.id
    ) = 2;
END;
$$ LANGUAGE plpgsql;

-- Função para obter contagem de mensagens não lidas
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID, p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr 
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificação de mensagem
CREATE OR REPLACE FUNCTION notify_new_message() RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
  sender_name TEXT;
BEGIN
  -- Buscar nome do remetente
  SELECT name INTO sender_name
  FROM users
  WHERE id = NEW.sender_id;
  
  -- Notificar todos os participantes (exceto o remetente)
  FOR participant IN 
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id
      AND cp.user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(
      participant.user_id,
      NEW.sender_id,
      'message',
      sender_name || ' enviou uma mensagem',
      CASE 
        WHEN LENGTH(NEW.content) > 50 THEN LEFT(NEW.content, 50) || '...'
        ELSE NEW.content
      END,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Políticas RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Política para conversas: usuário pode ver conversas que participa
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversations.id 
        AND cp.user_id = auth.uid()
    )
  );

-- Política para criar conversas
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para participantes: usuário pode ver participantes das conversas que participa
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
CREATE POLICY "Users can view participants" ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

-- Política para adicionar participantes
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
CREATE POLICY "Users can add participants" ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para mensagens: usuário pode ver mensagens das conversas que participa
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

-- Política para enviar mensagens
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

-- Política para status de leitura
DROP POLICY IF EXISTS "Users can manage read status" ON message_reads;
CREATE POLICY "Users can manage read status" ON message_reads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());