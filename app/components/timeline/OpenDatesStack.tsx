"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Star, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OpenDatesCard } from "./OpenDatesCard"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface OpenDatesCardData {
  id: string
  user_id: string
  title: string
  subtitle: string
  description: string
  image_url: string
  icon: string
  colors: {
    primary: string
    secondary: string
    text: string
    shadow: string
  }
  user?: {
    full_name: string
    username: string
    avatar_url?: string
    age?: number
    location?: string
    interests?: string[]
    profile_type?: string
  }
  distance?: number
  common_interests?: string[]
}

export function OpenDatesStack() {
  const [cards, setCards] = useState<OpenDatesCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // Carregar cards recomendados
  const fetchRecommendedCards = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/open-dates/recommendations')
      if (!response.ok) throw new Error('Erro ao carregar recomendações')
      
      const data = await response.json()
      setCards(data.cards || [])
    } catch (error) {
      console.error('Erro ao carregar cards:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as recomendações",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar matches
  const fetchMatches = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/open-dates/matches')
      if (!response.ok) throw new Error('Erro ao carregar matches')
      
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Erro ao carregar matches:', error)
    }
  }

  useEffect(() => {
    fetchRecommendedCards()
    fetchMatches()
  }, [user])

  // Registrar interação (like/pass/super_like)
  const registerInteraction = async (cardId: string, action: 'like' | 'pass' | 'super_like') => {
    if (!user) return
    
    try {
      const response = await fetch('/api/open-dates/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, action })
      })
      
      if (!response.ok) throw new Error('Erro ao registrar interação')
      
      const data = await response.json()
      
      // Se houve match
      if (data.match) {
        toast({
          title: "🎉 Match!",
          description: `Você e ${data.match.other_user_name} curtiram um ao outro!`,
        })
        fetchMatches() // Atualizar lista de matches
      }
      
      // Remover card da lista
      setCards(prev => prev.filter(card => card.id !== cardId))
      
      // Mostrar feedback baseado na ação
      if (action === 'like') {
        toast({
          title: "Curtido!",
          description: "Você curtiu este perfil",
        })
      } else if (action === 'super_like') {
        toast({
          title: "Super Like!",
          description: "Você deu um super like!",
        })
      }
      
    } catch (error) {
      console.error('Erro ao registrar interação:', error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar a interação",
        variant: "destructive"
      })
    }
  }

  const handleLike = (cardId: string) => {
    registerInteraction(cardId, 'like')
  }

  const handlePass = (cardId: string) => {
    registerInteraction(cardId, 'pass')
  }

  const handleSuperLike = (cardId: string) => {
    registerInteraction(cardId, 'super_like')
  }

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando recomendações...</p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma recomendação encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar suas preferências ou volte mais tarde
          </p>
          <Button onClick={fetchRecommendedCards}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Open Dates
        </h2>
        <p className="text-gray-600 mb-4">
          Descubra pessoas incríveis na sua área
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-pink-600">{cards.length}</div>
            <div className="text-xs text-gray-500">Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{matches.length}</div>
            <div className="text-xs text-gray-500">Matches</div>
          </div>
        </div>
      </div>

      {/* Cards Stack */}
      <div className="relative h-[600px] w-full">
        <AnimatePresence mode="popLayout">
          {cards.slice(0, 3).map((card, index) => (
            <OpenDatesCard
              key={card.id}
              card={card}
              index={index}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              totalCards={Math.min(cards.length, 3)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-pink-600" />
            Seus Matches
          </h3>
          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div
                key={match.match_id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/open-dates/matches/${match.match_id}`}
              >
                <div className="relative">
                  <img
                    src={match.other_user_avatar || '/placeholder-user.jpg'}
                    alt={match.other_user_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{match.other_user_name}</h4>
                  <p className="text-sm text-gray-500">
                    Match em {new Date(match.matched_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {match.unread_count > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {match.unread_count}
                  </Badge>
                )}
              </div>
            ))}
            {matches.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/open-dates/matches'}
              >
                Ver todos os matches ({matches.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.location.href = '/open-dates?view=preferences'}
        >
          <Users className="w-4 h-4 mr-2" />
          Preferências
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.location.href = '/open-dates/matches'}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Matches
        </Button>
      </div>
    </div>
  )
} 