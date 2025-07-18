"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw, TrendingUp, Users, Sparkles, BarChart3 } from 'lucide-react'
import { useForYouTimeline } from '@/app/hooks/useForYouTimeline'
import PostCard from './PostCard'
import { motion } from 'framer-motion'

interface ForYouTimelineProps {
  currentUser?: {
    name: string
    username: string
    avatar: string
    id?: string
  }
  onLike?: (postId: number) => void
  onSave?: (postId: number) => void
  onFollow?: (postId: number, isPrivate: boolean) => void
  onComment?: (postId: number) => void
  onShare?: (postId: number) => void
  onViewMedia?: (postId: number, mediaIndex: number) => void
  onViewProfile?: (username: string) => void
}

export default function ForYouTimeline({
  currentUser,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
  onViewMedia,
  onViewProfile
}: ForYouTimelineProps) {
  const {
    posts,
    loading,
    error,
    hasMore,
    algorithmStats,
    loadMore,
    refresh
  } = useForYouTimeline({
    autoFetch: !!currentUser?.id
  })

  const [activeTab, setActiveTab] = useState("posts")

  // Show loading if no user is authenticated
  if (!currentUser?.id) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando usuário...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header com informações do algoritmo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl font-semibold">Para Você</h2>
          {algorithmStats && (
            <Badge variant="outline" className="text-xs">
              {algorithmStats.finalPosts} de {algorithmStats.totalCandidates} posts
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Posts Recomendados
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <span className="text-sm">❌ Erro: {error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    className="ml-auto"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && posts.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded" />
                      <div className="w-3/4 h-4 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {posts.length === 0 && !loading && !error && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum post encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Não encontramos posts recomendados para você no momento.
                </p>
                <Button onClick={refresh} variant="outline">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard
                post={post}
                onLike={onLike}
                onSave={onSave}
                onFollow={onFollow}
                onComment={onComment}
                onShare={onShare}
                onViewMedia={onViewMedia}
                onViewProfile={onViewProfile}
                currentUser={currentUser}
              />
              
              {/* Mostrar score do algoritmo (debug) */}
              {process.env.NODE_ENV === 'development' && post._algorithmScore && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                  <div className="flex gap-4">
                    <span>Score: {post._algorithmScore.toFixed(1)}</span>
                    <span>Horas: {post._hoursAgo.toFixed(1)}</span>
                    <span>Engajamento: {post._engagementRate.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Load More Button */}
          {hasMore && posts.length > 0 && (
            <div className="text-center py-4">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais posts'
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          {algorithmStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {algorithmStats.totalCandidates}
                  </div>
                  <div className="text-sm text-gray-600">
                    Posts Candidatos
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {algorithmStats.rankedPosts}
                  </div>
                  <div className="text-sm text-gray-600">
                    Posts Rankeados
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {algorithmStats.diversifiedPosts}
                  </div>
                  <div className="text-sm text-gray-600">
                    Posts Diversificados
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {algorithmStats.finalPosts}
                  </div>
                  <div className="text-sm text-gray-600">
                    Posts Finais
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Como funciona o algoritmo</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Frescor: Posts mais recentes têm prioridade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Engajamento: Likes, comentários e compartilhamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Interesses: Baseado em suas hashtags e interações</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  <span>Diversidade: Varia autores para melhor experiência</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}