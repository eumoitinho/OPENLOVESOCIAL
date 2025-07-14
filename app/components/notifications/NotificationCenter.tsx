'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, Check, X, Settings, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/app/lib/supabase-browser'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    username: string
    name: string
    avatar_url?: string
  }
  related_post?: {
        id: string
        content: string
    media_urls?: string[]
  }
  related_comment?: {
    id: string
    content: string
  }
  notification_data?: any
}

interface NotificationSettings {
  likes_enabled: boolean
  comments_enabled: boolean
  follows_enabled: boolean
  messages_enabled: boolean
  mentions_enabled: boolean
  saves_enabled: boolean
  shares_enabled: boolean
  events_enabled: boolean
  communities_enabled: boolean
  system_enabled: boolean
  matches_enabled: boolean
  open_dates_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  in_app_notifications: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
}

interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  notifications_by_type: Record<string, number>
  recent_notifications: Notification[]
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  
  const { toast } = useToast()
  const supabase = createClient()

  // Buscar notificações
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }

      const data = await response.json()
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications])
      } else {
        setNotifications(data.notifications)
      }
      
      setUnreadCount(data.stats?.unread_notifications || 0)
      setStats(data.stats)
      setHasMore(data.pagination.hasMore)
      setPage(pageNum)
      
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  // Buscar configurações
  const fetchSettings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    }
  }, [supabase])

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast({
          title: "Sucesso",
          description: "Todas as notificações foram marcadas como lidas"
        })
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas",
        variant: "destructive"
      })
    }
  }

  // Atualizar configurações
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_settings',
          settings: newSettings
        })
      })

      if (response.ok) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null)
        toast({
          title: "Sucesso",
          description: "Configurações atualizadas"
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações",
        variant: "destructive"
      })
    }
  }

  // Carregar mais notificações
  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, true)
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Agora'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  // Obter ícone baseado no tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👥'
      case 'message':
        return '💌'
      case 'mention':
        return '📢'
      case 'save':
        return '🔖'
      case 'share':
        return '📤'
      case 'event_invite':
        return '📅'
      case 'match':
        return '💕'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchNotifications()
    fetchSettings()
  }, [fetchNotifications, fetchSettings])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Notificações
            </DialogTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {showSettings ? (
            <NotificationSettings
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          ) : (
            <ScrollArea className="flex-1 px-6 py-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação</p>
                  <p className="text-sm">Você está em dia!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      formatDate={formatDate}
                      getIcon={getNotificationIcon}
                    />
                  ))}
                  
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Carregando...' : 'Carregar mais'}
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente para item de notificação
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  formatDate, 
  getIcon 
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  formatDate: (date: string) => string
  getIcon: (type: string) => string
}) {
  return (
    <Card className={`transition-all duration-200 ${!notification.is_read ? 'bg-blue-50 border-blue-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {notification.sender?.avatar_url ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={notification.sender.avatar_url} />
                <AvatarFallback>
                  {notification.sender.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                {getIcon(notification.type)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">
                  {notification.title}
                </p>
                {notification.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.content}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.created_at)}
                </p>
              </div>
              
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para configurações de notificação
function NotificationSettings({ 
  settings, 
  onUpdate, 
  onClose 
}: {
  settings: NotificationSettings | null
  onUpdate: (settings: Partial<NotificationSettings>) => void
  onClose: () => void
}) {
  if (!settings) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Configurações</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-6">
          {/* Tipos de Notificação */}
          <div>
            <h4 className="font-medium mb-3">Tipos de Notificação</h4>
            <div className="space-y-3">
              {[
                { key: 'likes_enabled', label: 'Curtidas' },
                { key: 'comments_enabled', label: 'Comentários' },
                { key: 'follows_enabled', label: 'Novos seguidores' },
                { key: 'messages_enabled', label: 'Mensagens' },
                { key: 'mentions_enabled', label: 'Menções' },
                { key: 'saves_enabled', label: 'Posts salvos' },
                { key: 'shares_enabled', label: 'Compartilhamentos' },
                { key: 'events_enabled', label: 'Eventos' },
                { key: 'matches_enabled', label: 'Matches' },
                { key: 'system_enabled', label: 'Sistema' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <Switch
                    id={key}
                    checked={settings[key as keyof NotificationSettings] as boolean}
                    onCheckedChange={(checked) => 
                      onUpdate({ [key]: checked } as Partial<NotificationSettings>)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Canais de Notificação */}
          <div>
            <h4 className="font-medium mb-3">Canais</h4>
            <div className="space-y-3">
              {[
                { key: 'in_app_notifications', label: 'No aplicativo' },
                { key: 'push_notifications', label: 'Push notifications' },
                { key: 'email_notifications', label: 'Email' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <Switch
                    id={key}
                    checked={settings[key as keyof NotificationSettings] as boolean}
                    onCheckedChange={(checked) => 
                      onUpdate({ [key]: checked } as Partial<NotificationSettings>)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Horário Silencioso */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Horário Silencioso</h4>
              <Switch
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => 
                  onUpdate({ quiet_hours_enabled: checked })
                }
              />
            </div>
            
            {settings.quiet_hours_enabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Início</Label>
                    <input
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) => onUpdate({ quiet_hours_start: e.target.value })}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fim</Label>
                    <input
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) => onUpdate({ quiet_hours_end: e.target.value })}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 
