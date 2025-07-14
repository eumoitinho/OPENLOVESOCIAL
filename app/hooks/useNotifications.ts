import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'post' | 'system'
  title: string
  content: string
  user_id: string
  related_id?: string
  is_read: boolean
  created_at: string
  user?: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Buscar notificações
  const fetchNotifications = useCallback(async (limit = 50) => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user:profiles!notifications_user_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erro ao buscar notificações:', error)
        return
      }

      setNotifications(data || [])
      
      // Calcular estatísticas
      const unread = data?.filter(n => !n.is_read).length || 0
      const byType = data?.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setStats({
        total: data?.length || 0,
        unread,
        byType
      })
      setUnreadCount(unread)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Erro ao marcar como lida:', error)
        return false
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }))

      return true
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      return false
    }
  }, [supabase])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false)

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error)
        return false
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      setStats(prev => ({
        ...prev,
        unread: 0
      }))

      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      })

      return true
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      return false
    }
  }, [user?.id, supabase, toast])

  // Configurar real-time para novas notificações
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          // Adicionar nova notificação ao topo
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            unread: prev.unread + 1,
            byType: {
              ...prev.byType,
              [newNotification.type]: (prev.byType[newNotification.type] || 0) + 1
            }
          }))

          // Mostrar toast para notificações importantes
          if (['like', 'comment', 'follow', 'mention', 'message'].includes(newNotification.type)) {
            toast({
              title: newNotification.title,
              description: newNotification.content,
              duration: 4000,
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
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          
          // Atualizar notificação existente
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, toast])

  // Buscar notificações iniciais
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
} 