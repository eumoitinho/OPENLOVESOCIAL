'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'

interface Post {
  id: string
  content: string
  user: {
    name: string
    username: string
    avatar?: string
  }
  likesCount: number
  isLiked: boolean
  createdAt: string
}

export function LikeTestComponent() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Este é um post de teste para demonstrar o sistema de curtidas! 🎉',
      user: {
        name: 'João Silva',
        username: 'joaosilva',
        avatar: '/placeholder.jpg'
      },
      likesCount: 5,
      isLiked: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      content: 'Outro post para testar as notificações de curtidas! 💕',
      user: {
        name: 'Maria Santos',
        username: 'mariasantos',
        avatar: '/placeholder.jpg'
      },
      likesCount: 12,
      isLiked: true,
      createdAt: new Date().toISOString()
    }
  ])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'like',
          postId
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao curtir post')
      }

      const data = await response.json()

      // Atualizar estado local
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: data.isLiked,
              likesCount: data.likesCount
            }
          : post
      ))

      // Mostrar feedback
      if (data.action === 'liked') {
        toast.success('Post curtido! ❤️', {
          description: 'O autor do post será notificado!'
        })
      } else {
        toast.info('Curtida removida', {
          description: 'Você removeu a curtida do post'
        })
      }

    } catch (error) {
      console.error('Erro ao curtir:', error)
      toast.error('Erro ao curtir post', {
        description: 'Tente novamente em alguns instantes'
      })
    }
  }

  const handleComment = (postId: string) => {
    toast.info('Funcionalidade de comentários', {
      description: 'Sistema de comentários será implementado em breve!'
    })
  }

  const handleShare = (postId: string) => {
    toast.info('Funcionalidade de compartilhamento', {
      description: 'Sistema de compartilhamento será implementado em breve!'
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sistema de Curtidas com Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Teste o sistema de curtidas e veja as notificações em tempo real!
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {post.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">{post.user.name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{post.user.username}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                {post.content}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.isLiked 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} 
                    />
                    <span>{post.likesCount}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comentar</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Como funciona:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Clique no coração para curtir/descurtir um post</li>
          <li>• O contador de curtidas é atualizado automaticamente</li>
          <li>• O autor do post receberá uma notificação em tempo real</li>
          <li>• As notificações aparecem no badge rosa no topo da página</li>
          <li>• O sistema funciona com múltiplos usuários simultaneamente</li>
        </ul>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          Funcionalidades implementadas:
        </h3>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>✅ Sistema de curtidas com toggle (curtir/descurtir)</li>
          <li>✅ Contadores em tempo real</li>
          <li>✅ Notificações automáticas para o autor</li>
          <li>✅ Badges visuais com pontos rosas</li>
          <li>✅ Centro de notificações completo</li>
          <li>✅ Triggers SQL para automatização</li>
          <li>✅ Políticas de segurança RLS</li>
        </ul>
      </div>
    </div>
  )
} 