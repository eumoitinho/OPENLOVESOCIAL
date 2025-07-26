"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent } from "../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Check,
  Trash2,
  Settings,
  Filter,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface Notification {
  id: string
  user_id: string
  type: "like" | "comment" | "follow" | "event" | "mention" | "system"
  title: string
  content: string
  data?: any
  is_read: boolean
  created_at: string
}

export function NotificationsContent() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setError("Usuário não autenticado")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/notifications")
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Usuário não autenticado")
          }
          throw new Error("Erro ao buscar notificações")
        }
        const json = await res.json()
        setNotifications(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [user])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "event":
        return <Calendar className="w-4 h-4 text-purple-500" />
      case "mention":
        return <MessageCircle className="w-4 h-4 text-orange-500" />
      case "system":
        return <Bell className="w-4 h-4 text-gray-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20"
      case "comment":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
      case "follow":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20"
      case "event":
        return "border-l-purple-500 bg-purple-50 dark:bg-purple-950/20"
      case "mention":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
      case "system":
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20"
      default:
        return "border-l-gray-300"
    }
  }

  const markAsRead = async (id: string) => {
    if (!user) return
    
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      )
    } catch (err) {
      console.error("Erro ao marcar como lida:", err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      await fetch("/api/notifications/read-all", { method: 'POST' })
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      )
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err)
    }
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
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

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.is_read
    if (activeTab === "mentions") return notification.type === "mention"
    if (activeTab === "events") return notification.type === "event"
    return true
  })

  const unreadCount = (notifications || []).filter(n => !n.is_read).length

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <p>Faça login para ver suas notificações</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <p>Carregando notificações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground">
            Mantenha-se atualizado com as atividades da comunidade
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-1">
            Todas
            {(notifications || []).length > 0 && (
              <Badge variant="secondary" className="text-xs px-1 py-0.5">
                {(notifications || []).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-1">
            Não lidas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="flex items-center gap-1">
            Menções
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1">
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {(filteredNotifications || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma notificação encontrada
              </div>
            ) : (
              (filteredNotifications || []).map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                    getNotificationColor(notification.type),
                    !notification.is_read && "ring-2 ring-blue-500"
                  )}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="space-y-4">
            {(filteredNotifications || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma notificação não lida
              </div>
            ) : (
              (filteredNotifications || []).map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                    getNotificationColor(notification.type),
                    "ring-2 ring-blue-500"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="mentions" className="mt-6">
          <div className="space-y-4">
            {(filteredNotifications || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma menção encontrada
              </div>
            ) : (
              (filteredNotifications || []).map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                    getNotificationColor(notification.type),
                    !notification.is_read && "ring-2 ring-blue-500"
                  )}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {(filteredNotifications || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento encontrado
              </div>
            ) : (
              (filteredNotifications || []).map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                    getNotificationColor(notification.type),
                    !notification.is_read && "ring-2 ring-blue-500"
                  )}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 