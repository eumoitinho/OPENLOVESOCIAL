"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"

interface Notification {
  id: string
  recipient_id: string
  sender_id?: string
  title: string
  type: 'follow' | 'unfollow' | 'friend_request' | 'friend_accept' | 'post_like' | 'post_comment' | 'comment_like' | 'comment_reply' | 'post_share' | 'mention' | 'event_invitation' | 'event_reminder' | 'community_invitation' | 'community_post' | 'message' | 'payment_success' | 'payment_failed' | 'subscription_expiring' | 'verification_approved' | 'verification_rejected' | 'system'
  content?: string
  icon?: string
  is_read: boolean
  related_data?: any
  action_text?: string
  action_url?: string
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
  messages: number
  system: number
  premium: number
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    mentions: 0,
    events: 0,
    interactions: 0,
    messages: 0,
    system: 0,
    premium: 0
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
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])

      // Calcular estatísticas
      const unread = data?.filter((n: Notification) => !n.is_read).length || 0
      const mentions = data?.filter((n: Notification) => n.type === 'mention').length || 0
      const events = data?.filter((n: Notification) => ['event_invitation', 'event_reminder'].includes(n.type)).length || 0
      const interactions = data?.filter((n: Notification) => ['post_like', 'post_comment', 'comment_like', 'comment_reply', 'post_share', 'follow'].includes(n.type)).length || 0
      const messages = data?.filter((n: Notification) => n.type === 'message').length || 0
      const system = data?.filter((n: Notification) => ['system', 'verification_approved', 'verification_rejected'].includes(n.type)).length || 0
      const premium = data?.filter((n: Notification) => ['payment_success', 'payment_failed', 'subscription_expiring'].includes(n.type)).length || 0

      setStats({
        total: data?.length || 0,
        unread,
        mentions,
        events,
        interactions,
        messages,
        system,
        premium
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
        .eq('recipient_id', userId)

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
        .eq('recipient_id', userId)
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
        .eq('recipient_id', userId)

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
          filter: `recipient_id=eq.${userId}`
        },
        (payload: any) => {
          const newNotification = payload.new as Notification
          
          setNotifications(prev => [newNotification, ...prev])
          
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            unread: prev.unread + 1,
            mentions: newNotification.type === 'mention' ? prev.mentions + 1 : prev.mentions,
            events: ['event_invitation', 'event_reminder'].includes(newNotification.type) ? prev.events + 1 : prev.events,
            interactions: ['post_like', 'post_comment', 'comment_like', 'comment_reply', 'post_share', 'follow'].includes(newNotification.type) 
              ? prev.interactions + 1 
              : prev.interactions,
            messages: newNotification.type === 'message' ? prev.messages + 1 : prev.messages,
            system: ['system', 'verification_approved', 'verification_rejected'].includes(newNotification.type) ? prev.system + 1 : prev.system,
            premium: ['payment_success', 'payment_failed', 'subscription_expiring'].includes(newNotification.type) ? prev.premium + 1 : prev.premium
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
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
          filter: `recipient_id=eq.${userId}`
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
