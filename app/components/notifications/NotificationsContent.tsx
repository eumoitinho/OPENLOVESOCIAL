"use client"

import { useState } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useNotifications } from "@/app/hooks/useNotifications"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
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
      case "post_like": return <Heart className="w-4 h-4 text-pink-500" />
      case "comment_like": return <Heart className="w-4 h-4 text-pink-400" />
      case "post_comment": return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "comment_reply": return <MessageCircle className="w-4 h-4 text-blue-400" />
      case "follow": return <UserPlus className="w-4 h-4 text-green-500" />
      case "message": return <MessageCircle className="w-4 h-4 text-purple-500" />
      case "mention": return <AtSign className="w-4 h-4 text-orange-500" />
      case "post_share": return <div className="w-4 h-4 text-blue-600">🔄</div>
      case "event_invitation": return <Calendar className="w-4 h-4 text-indigo-500" />
      case "event_reminder": return <Calendar className="w-4 h-4 text-indigo-400" />
      case "community_post": return <div className="w-4 h-4 text-green-600">👥</div>
      case "community_invitation": return <div className="w-4 h-4 text-green-500">👥</div>
      case "subscription_expiring": return <div className="w-4 h-4 text-yellow-500">👑</div>
      case "payment_success": return <div className="w-4 h-4 text-green-500">💳</div>
      case "payment_failed": return <div className="w-4 h-4 text-red-500">💳</div>
      case "verification_approved": return <div className="w-4 h-4 text-green-500">✅</div>
      case "verification_rejected": return <div className="w-4 h-4 text-red-500">❌</div>
      case "system": return <Settings className="w-4 h-4 text-gray-500" />
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
    
    // Use action_url if available, otherwise fallback to data navigation
    if (notification.action_url) {
      window.location.href = notification.action_url
    } else if (notification.related_data?.post_id) {
      window.location.href = `/posts/${notification.related_data.post_id}`
    } else if (notification.related_data?.user_id || notification.sender_id) {
      const userId = notification.related_data?.user_id || notification.sender_id
      window.location.href = `/profile/${userId}`
    } else if (notification.related_data?.conversation_id) {
      window.location.href = `/messages/${notification.related_data.conversation_id}`
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
                {notification.content || notification.title}
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
                <button
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md inline-flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(notification.id)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
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
  const { notifications, stats, loading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user?.id)
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications = notifications.filter((notification: any) => {
    switch (activeTab) {
      case "unread":
        return !notification.is_read
      case "mentions":
        return notification.type === "mention"
      case "events":
        return ["event_invitation", "event_reminder"].includes(notification.type)
      case "interactions":
        return ["post_like", "post_comment", "comment_like", "comment_reply", "post_share", "follow"].includes(notification.type)
      case "messages":
        return notification.type === "message"
      case "premium":
        return ["payment_success", "payment_failed", "subscription_expiring"].includes(notification.type)
      case "system":
        return ["system", "verification_approved", "verification_rejected"].includes(notification.type)
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="p-4">
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
      <div className="p-4">
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
    <div className="h-full">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all" className="text-xs">
              Todas
              {stats.total > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Não lidas
              {stats.unread > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {stats.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="interactions" className="text-xs">
              Interações
              {stats.interactions > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.interactions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">
              Mensagens
              {stats.messages > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.messages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs">
              Menções
              {stats.mentions > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.mentions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-xs">
              Plano
              {stats.premium > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.premium}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs">
              Eventos
              {stats.events > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.events}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "all" 
                ? "Você não tem notificações ainda."
                : `Nenhuma notificação ${activeTab === "unread" ? "não lida" : activeTab}.`
              }
            </p>
          </div>
        ) : (
          <div>
            {stats.unread > 0 && activeTab === "all" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/10 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {stats.unread} notificação{stats.unread !== 1 ? 's' : ''} não lida{stats.unread !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 px-3 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              </div>
            )}
            
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
