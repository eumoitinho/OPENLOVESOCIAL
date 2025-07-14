'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
}

export function PostToast() {
  const [lastPostId, setLastPostId] = useState<string | null>(null)
  const router = useRouter()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Buscar o último post para estabelecer baseline
    const fetchLastPost = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setLastPostId(data.id)
      }
    }

    fetchLastPost()

    // Configurar real-time para novos posts
    const channel = supabase
      .channel('new_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          const newPost = payload.new as Post
          
          // Evitar mostrar toast para posts antigos
          if (lastPostId && newPost.id === lastPostId) {
            return
          }

          // Buscar informações do usuário que fez o post
          const { data: userData } = await supabase
            .from('users')
            .select('name, username')
            .eq('id', newPost.user_id)
            .single()

          const userName = userData?.name || 'Alguém'
          const userUsername = userData?.username || 'usuario'

          // Mostrar toast com preview do post
          const postPreview = newPost.content?.substring(0, 50) || newPost.title?.substring(0, 50) || 'Novo post'
          const displayText = postPreview.length > 50 ? postPreview + '...' : postPreview

          toast(
            `Novo post de ${userName}`,
            {
              description: displayText,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Navegar para o timeline
                  router.push('/timeline')
                }
              },
              duration: 5000,
              position: 'top-right'
            }
          )

          setLastPostId(newPost.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, lastPostId])

  return null // Este componente não renderiza nada visualmente
} 