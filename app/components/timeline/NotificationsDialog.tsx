"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
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
  Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CardContent } from "@/components/ui/card"

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

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
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

  const unreadCount = (notifications || []).filter(n => !n.isRead).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 sm:p-6 bg-white dark:bg-gray-900">
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Mantenha-se atualizado com as atividades da comunidade
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Lidas</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mx-2 sm:mx-4 mt-2 sm:mt-4">
              <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
                Todas
                {(notifications || []).length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0.5">
                    {(notifications || []).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-1 text-xs">
                Não lidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1 py-0.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs">Menções</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Eventos</TabsTrigger>
            </TabsList>

            <div className="mt-2 sm:mt-4 overflow-y-auto max-h-[60vh] space-y-1 sm:space-y-2 px-2 sm:px-4">
              {(filteredNotifications || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-lg font-medium">Nenhuma notificação</p>
                  <p className="text-xs sm:text-sm">Você está em dia com tudo!</p>
                </div>
              ) : (
                (filteredNotifications || []).map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
                      getNotificationColor(notification.type),
                      !notification.isRead && "ring-2 ring-blue-200 dark:ring-blue-800"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {notification.user ? (
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                              <AvatarImage src={notification.user.avatar} />
                              <AvatarFallback className="text-xs sm:text-sm">
                                {notification.user.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm sm:text-base">
                                {notification.title}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {notification.event && (
                                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium text-xs sm:text-sm">{notification.event.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{notification.event.date}</span>
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{notification.event.location}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.timestamp}
                                </span>
                                {!notification.isRead && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0.5">
                                    Nova
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
