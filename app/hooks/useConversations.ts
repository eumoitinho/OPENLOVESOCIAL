"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio'
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  sender?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
}

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  created_at: string
  updated_at: string
  participants: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }[]
  last_message?: {
    content: string
    sender_name: string
    created_at: string
  }
  unread_count: number
}

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const supabase = createClient()

  // Buscar conversas
  const fetchConversations = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            users(
              id,
              name,
              username,
              avatar_url
            )
          )
        `)
        .contains('participant_ids', `[${userId}]`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Processar dados das conversas
      const processedConversations = (data || []).map((conv: any) => {
        const participants = conv.participants?.map((p: any) => p.users) || []
        const otherParticipants = participants.filter((p: any) => p.id !== userId)
        
        return {
          id: conv.id,
          type: conv.type,
          name: conv.name || (conv.type === 'direct' && otherParticipants[0]?.name),
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participants: otherParticipants,
          last_message: conv.last_message,
          unread_count: conv.unread_count || 0
        }
      })

      setConversations(processedConversations)

    } catch (err) {
      console.error('Erro ao buscar conversas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Buscar mensagens de uma conversa
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      setActiveConversation(conversationId)

    } catch (err) {
      console.error('Erro ao buscar mensagens:', err)
    }
  }, [userId, supabase])

  // Enviar mensagem
  const sendMessage = useCallback(async (conversationId: string, content: string, type: string = 'text') => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          type
        })
        .select()
        .single()

      if (error) throw error

      // Adicionar mensagem ao estado local
      setMessages(prev => [...prev, data])

      // Atualizar última mensagem da conversa
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                updated_at: new Date().toISOString(),
                last_message: {
                  content,
                  sender_name: 'Você',
                  created_at: new Date().toISOString()
                }
              }
            : conv
        )
      )

      return data

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      throw err
    }
  }, [userId, supabase])

  // Criar nova conversa
  const createConversation = useCallback(async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!userId) return

    try {
      const allParticipants = [...new Set([userId, ...participantIds])]
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          type,
          name,
          participant_ids: allParticipants,
          created_by: userId
        })
        .select()
        .single()

      if (error) throw error

      // Buscar dados dos participantes
      const { data: participantsData } = await supabase
        .from('users')
        .select('id, name, username, avatar_url')
        .in('id', participantIds)

      const newConversation: Conversation = {
        id: data.id,
        type,
        name: name || (type === 'direct' && participantsData?.[0]?.name),
        created_at: data.created_at,
        updated_at: data.updated_at,
        participants: participantsData || [],
        unread_count: 0
      }

      setConversations(prev => [newConversation, ...prev])
      return newConversation

    } catch (err) {
      console.error('Erro ao criar conversa:', err)
      throw err
    }
  }, [userId, supabase])

  // Marcar mensagens como lidas
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (error) throw error

      // Atualizar estado local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )

    } catch (err) {
      console.error('Erro ao marcar como lida:', err)
    }
  }, [userId, supabase])

  // Indicar que está digitando
  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!userId) return

    try {
      const channel = supabase.channel(`typing:${conversationId}`)
      
      if (isTyping) {
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping: true }
        })
      } else {
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping: false }
        })
      }
    } catch (err) {
      console.error('Erro ao enviar status de digitação:', err)
    }
  }, [userId, supabase])

  // Configurar real-time
  useEffect(() => {
    if (!userId) return

    // Buscar conversas iniciais
    fetchConversations()

    // Configurar subscription para novas mensagens
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          const newMessage = payload.new as Message
          
          // Adicionar mensagem se for da conversa ativa
          if (activeConversation === newMessage.conversation_id) {
            setMessages(prev => [...prev, newMessage])
          }

          // Atualizar conversa na lista
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id 
                ? { 
                    ...conv, 
                    updated_at: newMessage.created_at,
                    last_message: {
                      content: newMessage.content,
                      sender_name: newMessage.sender?.name || 'Alguém',
                      created_at: newMessage.created_at
                    },
                    unread_count: conv.unread_count + (newMessage.sender_id !== userId ? 1 : 0)
                  }
                : conv
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload: any) => {
          const updatedConversation = payload.new
          
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id 
                ? { ...conv, ...updatedConversation }
                : conv
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchConversations, activeConversation])

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    setTyping,
    setActiveConversation
  }
} 
