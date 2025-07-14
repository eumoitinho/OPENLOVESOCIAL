"use client"

import { useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart, MessageCircle, Share } from "lucide-react"

interface PostToastProps {
  onNewPost?: (postId: string) => void
}

export default function PostToast({ onNewPost }: PostToastProps) {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('new_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `user_id=neq.${user.id}`
        },
        (payload) => {
          const newPost = payload.new as any
          
          // Buscar informações do usuário que fez o post
          supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', newPost.user_id)
            .single()
            .then(({ data: userData }) => {
              if (userData) {
                // Mostrar toast com informações do novo post
                toast({
                  title: `Novo post de ${userData.full_name || userData.username}`,
                  description: newPost.content?.substring(0, 100) + (newPost.content?.length > 100 ? '...' : ''),
                  duration: 6000,
                  action: (
                    <Button
                      variant="outline"
                      size="sm"
                                             onClick={() => {
                         // Atualizar timeline
                         if (onNewPost) {
                           onNewPost(newPost.id)
                         }
                       }}
                      className="ml-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  ),
                  className: "bg-white border border-gray-200 shadow-lg",
                })
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, toast, onNewPost])

  return null // Este componente não renderiza nada, apenas escuta eventos
} 