import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/app/lib/supabase-browser'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
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

export interface NotificationSettings {
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

export interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  notifications_by_type: Record<string, number>
  recent_notifications: Notification[]
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const supabase = createClient()
  const { toast } = useToast()
  const subscriptionRef = useRef<any>(null)

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
  const markAsRead = useCallback(async (notificationId: string) => {
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
  }, [supabase])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
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
  }, [supabase, toast])

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
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
        setSettings(prev => prev ? ({ ...prev, ...newSettings }) : null)
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
  }, [supabase, toast])

  // Carregar mais notificações
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, true)
    }
  }, [fetchNotifications, isLoading, hasMore, page])

  // Configurar subscription em tempo real
  const setupRealtimeSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Cancelar subscription anterior se existir
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }

      // Configurar subscription para novas notificações
      subscriptionRef.current = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification
            
            // Adicionar nova notificação no topo da lista
            setNotifications(prev => [newNotification, ...prev])
            
            // Incrementar contador de não lidas
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1)
            }
            
            // Mostrar toast para notificações importantes
            if (['message', 'mention', 'match'].includes(newNotification.type)) {
              toast({
                title: newNotification.title,
                description: newNotification.content,
                duration: 5000
              })
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const updatedNotification = payload.new as Notification
            
            // Atualizar notificação na lista
            setNotifications(prev => 
              prev.map(n => 
                n.id === updatedNotification.id ? updatedNotification : n
              )
            )
            
            // Recalcular contador de não lidas
            if (updatedNotification.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        )
        .subscribe()

    } catch (error) {
      console.error('Erro ao configurar subscription:', error)
    }
  }, [supabase, toast])

  // Verificar se está em horário silencioso
  const isQuietHours = useCallback(() => {
    if (!settings?.quiet_hours_enabled) return false
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMinute] = settings.quiet_hours_start.split(':').map(Number)
    const [endHour, endMinute] = settings.quiet_hours_end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Horário silencioso atravessa a meia-noite
      return currentTime >= startTime || currentTime <= endTime
    }
  }, [settings])

  // Inicializar
  useEffect(() => {
    fetchNotifications()
    fetchSettings()
    setupRealtimeSubscription()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [fetchNotifications, fetchSettings, setupRealtimeSubscription])

  return {
    notifications,
    unreadCount,
    isLoading,
    settings,
    stats,
    hasMore,
    markAsRead,
    markAllAsRead,
    updateSettings,
    loadMore,
    isQuietHours,
    refetch: () => fetchNotifications(1, false)
  }
} 