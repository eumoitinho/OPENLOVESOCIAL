"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Star, MapPin, Users, TrendingUp, Eye, MessageCircle, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface RecommendedProfile {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  location: string
  age: number
  gender: string
  relationshipType: string
  interests: string[]
  isVerified: boolean
  isPremium: boolean
  isOnline: boolean
  lastSeen: string
  memberSince: string
  recommendationScore: number
  scoreBreakdown: {
    interests: number
    demographics: number
    activity: number
    location: number
    preferences: number
    social: number
  }
  reasons: string[]
  stats: {
    followers: number
    following: number
    posts: number
    likes: number
  }
}

interface ProfileRecommendationsProps {
  className?: string
}

export default function ProfileRecommendations({ className }: ProfileRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<'hybrid' | 'collaborative' | 'content-based'>('hybrid')
  const [selectedProfile, setSelectedProfile] = useState<RecommendedProfile | null>(null)

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user, algorithm])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profiles/recommendations?algorithm=${algorithm}&limit=20`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar recomendações')
      }

      setRecommendations(data.data || [])
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (targetUserId: string, interactionType: string) => {
    try {
      const response = await fetch('/api/profiles/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          interactionType,
          metadata: {
            source: 'recommendations',
            algorithm: algorithm,
            score: recommendations.find(r => r.id === targetUserId)?.recommendationScore
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao registrar interação')
      }

      // Atualizar UI baseado na interação
      if (interactionType === 'like' || interactionType === 'pass') {
        setRecommendations(prev => prev.filter(r => r.id !== targetUserId))
      }

    } catch (err) {
      console.error('Erro ao registrar interação:', err)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Boa"
    if (score >= 40) return "Média"
    return "Baixa"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm sm:text-base">Carregando recomendações...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar recomendações</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchRecommendations} variant="outline" size="sm">
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recomendações para você
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Perfis selecionados especialmente para você
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
          >
            <option value="hybrid">Híbrido</option>
            <option value="collaborative">Colaborativo</option>
            <option value="content-based">Baseado em conteúdo</option>
          </select>
          
          <Button onClick={fetchRecommendations} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma recomendação disponível
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete seu perfil para receber recomendações personalizadas
            </p>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cards" className="text-sm">Cartões</TabsTrigger>
            <TabsTrigger value="detailed" className="text-sm">Detalhado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendations.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                          <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                            {profile.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      {/* Score Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={`${getScoreColor(profile.recommendationScore)} bg-white/90 text-xs font-semibold`}>
                          {profile.recommendationScore}% {getScoreLabel(profile.recommendationScore)}
                        </Badge>
                      </div>
                      
                      {/* Online Status */}
                      {profile.isOnline && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-500 text-white text-xs">
                            Online
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                              {profile.name}
                            </h3>
                            {profile.isVerified && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                <Star className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span>{profile.age} anos</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{profile.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {profile.bio}
                        </p>
                        
                        {/* Reasons */}
                        <div className="space-y-1">
                          {profile.reasons.slice(0, 2).map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-1 h-1 bg-pink-500 rounded-full flex-shrink-0"></div>
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Common Interests */}
                        {profile.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {profile.interests.slice(0, 3).map((interest, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {profile.interests.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.interests.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <div className="p-3 sm:p-4 pt-0">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleInteraction(profile.id, 'pass')}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          Passar
                        </Button>
                        <Button
                          onClick={() => handleInteraction(profile.id, 'like')}
                          size="sm"
                          className="flex-1 bg-pink-500 hover:bg-pink-600 text-xs sm:text-sm"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Curtir
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-4">
            {recommendations.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <Avatar className="w-16 h-16 mx-auto sm:mx-0">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {profile.name}
                            </h3>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              {profile.isVerified && (
                                <Badge variant="secondary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                              {profile.isOnline && (
                                <Badge className="bg-green-500 text-white">
                                  Online
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{profile.age} anos</span>
                            <div className="flex items-center gap-1 justify-center sm:justify-start">
                              <MapPin className="w-3 h-3" />
                              <span>{profile.location}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-center sm:justify-start">
                              <Users className="w-3 h-3" />
                              <span>{profile.stats.followers} seguidores</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {profile.bio}
                        </p>
                        
                        {/* Score Breakdown */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Compatibilidade</span>
                            <span className={`text-sm font-semibold ${getScoreColor(profile.recommendationScore)}`}>
                              {profile.recommendationScore}%
                            </span>
                          </div>
                          <Progress value={profile.recommendationScore} className="h-2" />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Interesses: </span>
                              <span className="font-medium">{Math.round(profile.scoreBreakdown.interests)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Localização: </span>
                              <span className="font-medium">{Math.round(profile.scoreBreakdown.location)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Atividade: </span>
                              <span className="font-medium">{Math.round(profile.scoreBreakdown.activity)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Reasons */}
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Por que recomendamos:
                          </span>
                          <ul className="mt-1 space-y-1">
                            {profile.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-1 h-1 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Interests */}
                        {profile.interests.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Interesses:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.interests.map((interest, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 justify-center sm:justify-start">
                        <Button
                          onClick={() => handleInteraction(profile.id, 'view_profile')}
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </Button>
                        <Button
                          onClick={() => handleInteraction(profile.id, 'message')}
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Mensagem
                        </Button>
                        <Button
                          onClick={() => handleInteraction(profile.id, 'like')}
                          size="sm"
                          className="flex-1 sm:flex-initial bg-pink-500 hover:bg-pink-600 text-xs sm:text-sm"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Curtir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 