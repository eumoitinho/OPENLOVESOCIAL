"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, MessageCircle, Share2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/app/lib/supabase-browser"

interface PostToastProps {
  className?: string
}

interface NewPost {
  id: string
  content: string
  user: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  created_at: string
  likes_count: number
  comments_count: number
}

export function PostToast({ className }: PostToastProps) {
  const [newPosts, setNewPosts] = useState<NewPost[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Escutar novos posts em tempo real
    const channel = supabase
      .channel('new_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload: any) => {
          const newPost = payload.new
          
          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, username, avatar_url')
            .eq('id', newPost.user_id)
            .single()

          if (userData) {
            const postWithUser: NewPost = {
              id: newPost.id,
              content: newPost.content,
              user: userData,
              created_at: newPost.created_at,
              likes_count: 0,
              comments_count: 0
            }

            setNewPosts(prev => [postWithUser, ...prev.slice(0, 2)]) // Manter apenas os 3 mais recentes
            setIsVisible(true)

            // Auto-hide após 5 segundos
            setTimeout(() => {
              setIsVisible(false)
            }, 5000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleViewPost = (postId: string) => {
    window.location.href = `/posts/${postId}`
  }

  const handleDismiss = (postId: string) => {
    setNewPosts(prev => prev.filter(post => post.id !== postId))
    if (newPosts.length <= 1) {
      setIsVisible(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Agora"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    return `${Math.floor(diffInSeconds / 3600)}h`
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className || ''}`}>
      <AnimatePresence>
        {isVisible && newPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-3"
          >
            {newPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80 max-w-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs">
                        {post.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {post.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{post.user.username} • {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDismiss(post.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleViewPost(post.id)}
                    >
                      Ver post
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-pink-500"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
