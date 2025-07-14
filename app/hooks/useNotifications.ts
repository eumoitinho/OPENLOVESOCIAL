import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean
  created_at: string
}

export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<string, { total: number; unread: number }>
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    by_type: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      updateStats(data || [])
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .rpc('get_notification_stats', { p_user_id: user.id })

      if (error) throw error

      setStats(data || { total: 0, unread: 0, by_type: {} })
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
    }
  }, [supabase])

  // Atualizar estatísticas baseado nas notificações locais
  const updateStats = useCallback((notifs: Notification[]) => {
    const total = notifs.length
    const unread = notifs.filter(n => !n.is_read).length
    const by_type: Record<string, { total: number; unread: number }> = {}

    notifs.forEach(notif => {
      if (!by_type[notif.type]) {
        by_type[notif.type] = { total: 0, unread: 0 }
      }
      by_type[notif.type].total++
      if (!notif.is_read) {
        by_type[notif.type].unread++
      }
    })

    setStats({ total, unread, by_type })
  }, [])

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      updateStats(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }, [supabase, notifications, updateStats])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      updateStats(notifications.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }, [supabase, notifications, updateStats])

  // Configurar real-time para novas notificações
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          // Adicionar nova notificação ao início da lista
          setNotifications(prev => [newNotification, ...prev])
          updateStats([newNotification, ...notifications])

          // Mostrar toast para notificações importantes
          if (['new_message', 'new_match', 'mention'].includes(newNotification.type)) {
            toast(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Aqui você pode navegar para a notificação ou abrir o centro de notificações
                  console.log('Navegar para notificação:', newNotification.id)
                }
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, notifications, updateStats])

  // Buscar dados iniciais
  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [fetchNotifications, fetchStats])

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
} 