"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"

interface Notification {
  id: string
  user_id: string
  sender_id?: string
  title: string
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'event' | 'system'
  is_read: boolean
  data?: any
  sender?: {
    id: string
    name: string
    username?: string
    avatar_url?: string
  }
  created_at: string
}

interface NotificationStats {
  total: number
  unread: number
  mentions: number
  events: number
  interactions: number
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    mentions: 0,
    events: 0,
    interactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!sender_id(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])

      // Calcular estatísticas
      const unread = data?.filter((n: Notification) => !n.is_read).length || 0
      const mentions = data?.filter((n: Notification) => n.type === 'mention').length || 0
      const events = data?.filter((n: Notification) => n.type === 'event').length || 0
      const interactions = data?.filter((n: Notification) => ['like', 'comment', 'follow'].includes(n.type)).length || 0

      setStats({
        total: data?.length || 0,
        unread,
        mentions,
        events,
        interactions
      })

    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }))

    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }, [userId, supabase])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        unread: 0
      }))

    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }, [userId, supabase])

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      // Atualizar estado local
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      )

      // Recalcular estatísticas
      await fetchNotifications()

    } catch (err) {
      console.error('Erro ao deletar notificação:', err)
    }
  }, [userId, supabase, fetchNotifications])

  // Configurar real-time
  useEffect(() => {
    if (!userId) return

    // Buscar notificações iniciais
    fetchNotifications()

    // Configurar subscription para novas notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const newNotification = payload.new as Notification
          
          setNotifications(prev => [newNotification, ...prev])
          
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            unread: prev.unread + 1,
            mentions: newNotification.type === 'mention' ? prev.mentions + 1 : prev.mentions,
            events: newNotification.type === 'event' ? prev.events + 1 : prev.events,
            interactions: ['like', 'comment', 'follow'].includes(newNotification.type) 
              ? prev.interactions + 1 
              : prev.interactions
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const updatedNotification = payload.new as Notification
          
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const deletedNotification = payload.old as Notification
          
          setNotifications(prev => 
            prev.filter(n => n.id !== deletedNotification.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchNotifications])

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
} 