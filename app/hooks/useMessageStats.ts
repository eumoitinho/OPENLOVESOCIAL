"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase-browser"

interface MessageStats {
  unreadCount: number
  totalCount: number
}

export function useMessageStats(userId?: string) {
  const [stats, setStats] = useState<MessageStats>({
    unreadCount: 0,
    totalCount: 0
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchMessageStats = async () => {
      try {
        setLoading(true)
        
        // Buscar contagem de mensagens não lidas
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select(`
            id,
            last_message_id,
            messages!inner(
              id,
              user_id,
              is_read
            )
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

        if (error) throw error

        let unreadCount = 0
        let totalCount = 0

        conversations?.forEach(conversation => {
          const unreadMessages = conversation.messages?.filter(
            (msg: any) => msg.user_id !== userId && !msg.is_read
          )
          unreadCount += unreadMessages?.length || 0
          totalCount += conversation.messages?.length || 0
        })

        setStats({
          unreadCount,
          totalCount
        })

      } catch (error) {
        console.error('Erro ao buscar estatísticas de mensagens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessageStats()

    // Configurar subscription para mensagens em tempo real
    const channel = supabase
      .channel('message-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchMessageStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return {
    stats,
    loading
  }
}
