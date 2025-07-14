"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface MessageBadgeProps {
  className?: string
  onClick?: () => void
}

export default function MessageBadge({ className, onClick }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Buscar contagem de mensagens não lidas
  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', 
          supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id)
        )
        .eq('is_read', false)
        .neq('sender_id', user.id)

      if (error) {
        console.error('Erro ao buscar mensagens não lidas:', error)
        return
      }

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar mensagens não lidas:', error)
    }
  }

  // Configurar real-time para novas mensagens
  useEffect(() => {
    if (!user) return

    fetchUnreadCount()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative ${className}`}
      onClick={onClick}
    >
      <MessageCircle className="h-5 w-5" />
      
      {/* Badge rosa para mensagens não lidas */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-500 animate-pulse" />
      )}
      
      {/* Badge com número para muitas mensagens */}
      {unreadCount > 3 && (
        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </Button>
  )
} 