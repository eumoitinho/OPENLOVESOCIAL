"use client"

import { useState } from "react"
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

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "event" | "mention" | "system"
  title: string
  message: string
  user?: {
    name: string
    avatar: string
    username: string
  }
  timestamp: string
  isRead: boolean
  actionUrl?: string
  event?: {
    title: string
    date: string
    location: string
  }
}

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "like",
      title: "Amanda & Carlos curtiu seu post",
      message: "Eles curtiram sua publicação sobre o evento OpenLove",
      user: {
        name: "Amanda & Carlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        username: "@amandacarlos"
      },
      timestamp: "2 min",
      isRead: false
    },
    {
      id: "2",
      type: "comment",
      title: "Sofia Mendes comentou no seu post",
      message: "Que foto incrível! Adoraria participar do próximo evento!",
      user: {
        name: "Sofia Mendes",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        username: "@sofia_livre"
      },
      timestamp: "15 min",
      isRead: false
    },
    {
      id: "3",
      type: "follow",
      title: "Rafael Alves começou a seguir você",
      message: "Agora vocês podem ver as atualizações um do outro",
      user: {
        name: "Rafael Alves",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        username: "@rafael_livre"
      },
      timestamp: "1h",
      isRead: true
    },
    {
      id: "4",
      type: "event",
      title: "Novo evento próximo de você",
      message: "Workshop de Fotografia Íntima em São Paulo",
      timestamp: "2h",
      isRead: false,
      event: {
        title: "Workshop de Fotografia Íntima",
        date: "Sábado, 15 de Dezembro",
        location: "São Paulo, SP"
      }
    },
    {
      id: "5",
      type: "mention",
      title: "Você foi mencionado em um post",
      message: "Lisa & João mencionaram você em uma publicação sobre eventos",
      user: {
        name: "Lisa & João",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        username: "@lisajoao"
      },
      timestamp: "3h",
      isRead: true
    },
    {
      id: "6",
      type: "system",
      title: "Bem-vindo ao OpenLove!",
      message: "Sua conta foi criada com sucesso. Explore a comunidade!",
      timestamp: "1 dia",
      isRead: true
    }
  ])

  const [activeTab, setActiveTab] = useState("all")
  const [filter, setFilter] = useState("all")

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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "mentions") return notification.type === "mention"
    if (activeTab === "events") return notification.type === "event"
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
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
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1 py-0.5">
                {notifications.length}
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
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                  getNotificationColor(notification.type),
                  !notification.isRead && "ring-2 ring-blue-500"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.user.avatar} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.event && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-sm">{notification.event.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{notification.event.date}</span>
                                <MapPin className="w-3 h-3" />
                                <span>{notification.event.location}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp}
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
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
                      {notification.user ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.user.avatar} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.event && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-sm">{notification.event.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{notification.event.date}</span>
                                <MapPin className="w-3 h-3" />
                                <span>{notification.event.location}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp}
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentions" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                  getNotificationColor(notification.type),
                  !notification.isRead && "ring-2 ring-blue-500"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.user.avatar} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp}
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
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                  getNotificationColor(notification.type),
                  !notification.isRead && "ring-2 ring-blue-500"
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
                            {notification.message}
                          </p>
                          {notification.event && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-sm">{notification.event.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{notification.event.date}</span>
                                <MapPin className="w-3 h-3" />
                                <span>{notification.event.location}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp}
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 