"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Heart, MessageCircle, UserPlus, Calendar, Users, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'event' | 'mention' | 'system'
  title: string
  message: string
  is_read: boolean
  created_at: string
  data?: any
  user?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/notifications")
        if (!res.ok) throw new Error("Erro ao buscar notificações")
        const json = await res.json()
        setNotifications(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error("Erro ao marcar como lida:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />
      case 'event': return <Calendar className="w-4 h-4 text-purple-500" />
      case 'mention': return <Users className="w-4 h-4 text-orange-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read)

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {filter === 'all' ? 'Todas' : 'Não lidas'}
            </Button>
            
            {unreadCount > 0 && (
              <Button size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading && (
          <div className="text-center text-gray-400 py-8">
            Carregando notificações...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {filter === 'all' ? 'Nenhuma notificação encontrada.' : 'Nenhuma notificação não lida.'}
          </div>
        )}

        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                !notification.is_read && "border-l-4 border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/20"
              )}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notification.user?.avatar_url} />
                    <AvatarFallback>
                      {notification.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="font-medium text-sm">
                            {notification.user?.name || 'Sistema'}
                          </span>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {notification.user?.username && (
                            <span>@{notification.user.username}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 