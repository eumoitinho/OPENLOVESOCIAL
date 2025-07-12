import { useState, useEffect } from 'react'

interface UserPreferences {
  interests: string[]
  location: string
  relationshipType: string
  ageRange: [number, number]
  distance: number
}

interface PostEngagement {
  likes: number
  comments: number
  shares: number
  views: number
  timestamp: string
}

interface PostRecommendation {
  id: number
  user: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
    location: string
    distance: string
  }
  content: string
  images?: string[]
  likes: number
  comments: number
  shares: number
  timestamp: string
  liked: boolean
  saved: boolean
  engagement: "high" | "medium" | "low"
  category: string
  tags: string[]
  score: number
}

export function useRecommendationAlgorithm() {
  const [recommendations, setRecommendations] = useState<PostRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simular preferências do usuário (em um app real, viria do perfil)
  const userPreferences: UserPreferences = {
    interests: ["fotografia", "música", "culinária", "yoga", "casais", "eventos"],
    location: "São Paulo, SP",
    relationshipType: "casal_livre",
    ageRange: [25, 45],
    distance: 50
  }

  // Função para calcular score de engajamento
  const calculateEngagementScore = (post: any): number => {
    const likesWeight = 0.4
    const commentsWeight = 0.3
    const sharesWeight = 0.2
    const viewsWeight = 0.1

    const normalizedLikes = Math.min(post.likes / 1000, 1)
    const normalizedComments = Math.min(post.comments / 100, 1)
    const normalizedShares = Math.min(post.shares / 50, 1)
    const normalizedViews = Math.min((post.views || 0) / 5000, 1)

    return (
      normalizedLikes * likesWeight +
      normalizedComments * commentsWeight +
      normalizedShares * sharesWeight +
      normalizedViews * viewsWeight
    )
  }

  // Função para calcular score de relevância de conteúdo
  const calculateContentRelevanceScore = (post: any): number => {
    const userInterests = userPreferences.interests
    const postTags = post.tags || []
    const postContent = post.content.toLowerCase()

    let relevanceScore = 0

    // Verificar tags
    postTags.forEach((tag: string) => {
      if (userInterests.includes(tag.toLowerCase())) {
        relevanceScore += 0.3
      }
    })

    // Verificar conteúdo
    userInterests.forEach((interest) => {
      if (postContent.includes(interest.toLowerCase())) {
        relevanceScore += 0.2
      }
    })

    // Verificar hashtags
    const hashtags = postContent.match(/#\w+/g) || []
    hashtags.forEach((hashtag: string) => {
      const cleanHashtag = hashtag.slice(1).toLowerCase()
      if (userInterests.includes(cleanHashtag)) {
        relevanceScore += 0.1
      }
    })

    return Math.min(relevanceScore, 1)
  }

  // Função para calcular score de localização
  const calculateLocationScore = (post: any): number => {
    const userLocation = userPreferences.location
    const postLocation = post.user.location
    const postDistance = parseInt(post.user.distance.replace('km', ''))

    let locationScore = 0

    // Mesma cidade
    if (postLocation === userLocation) {
      locationScore += 0.5
    }

    // Distância
    if (postDistance <= userPreferences.distance) {
      locationScore += 0.5 * (1 - postDistance / userPreferences.distance)
    }

    return locationScore
  }

  // Função para calcular score de recência
  const calculateRecencyScore = (post: any): number => {
    const now = new Date()
    const postTime = new Date(post.timestamp)
    const hoursDiff = (now.getTime() - postTime.getTime()) / (1000 * 60 * 60)

    // Posts mais recentes têm score maior
    if (hoursDiff <= 1) return 1
    if (hoursDiff <= 6) return 0.8
    if (hoursDiff <= 24) return 0.6
    if (hoursDiff <= 72) return 0.4
    return 0.2
  }

  // Função principal para calcular score de recomendação
  const calculateRecommendationScore = (post: any): number => {
    const engagementScore = calculateEngagementScore(post)
    const contentRelevanceScore = calculateContentRelevanceScore(post)
    const locationScore = calculateLocationScore(post)
    const recencyScore = calculateRecencyScore(post)

    // Pesos para cada fator
    const weights = {
      engagement: 0.3,
      contentRelevance: 0.35,
      location: 0.2,
      recency: 0.15
    }

    const totalScore = 
      engagementScore * weights.engagement +
      contentRelevanceScore * weights.contentRelevance +
      locationScore * weights.location +
      recencyScore * weights.recency

    return totalScore
  }

  // Função para determinar nível de engajamento
  const getEngagementLevel = (score: number): "high" | "medium" | "low" => {
    if (score >= 0.7) return "high"
    if (score >= 0.4) return "medium"
    return "low"
  }

  // Função para buscar e processar posts
  const fetchAndProcessPosts = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simular busca de posts (em um app real, seria uma API call)
      const mockPosts = [
        {
          id: 1,
          user: {
            name: "Maria & Carlos",
            username: "@mariacarlos",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
            verified: true,
            premium: true,
            location: "São Paulo, SP",
            distance: "2km"
          },
          content: "Acabamos de descobrir um lugar incrível para fotos íntimas! 📸✨ O estúdio tem uma iluminação perfeita e o fotógrafo entendeu exatamente o que queríamos. Recomendo muito para casais que querem registrar momentos especiais! #FotografiaIntima #CasaisLivres #OpenLove",
          images: [
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop"
          ],
          likes: 1240,
          comments: 89,
          shares: 45,
          views: 5600,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          liked: false,
          saved: false,
          category: "lifestyle",
          tags: ["fotografia", "casais", "experiências"]
        },
        {
          id: 2,
          user: {
            name: "Rafael Alves",
            username: "@rafael_livre",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
            verified: false,
            premium: true,
            location: "São Paulo, SP",
            distance: "5km"
          },
          content: "Festival de música eletrônica esse fim de semana! 🎵 Quem vai? Seria legal conhecer outras pessoas que curtem o mesmo estilo. Sempre aberto a novas conexões e experiências musicais! #Festival #MúsicaEletrônica #Conexões",
          likes: 890,
          comments: 67,
          shares: 23,
          views: 3200,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          liked: true,
          saved: false,
          category: "events",
          tags: ["música", "festival", "social"]
        },
        {
          id: 3,
          user: {
            name: "Ana & Pedro",
            username: "@anapedro",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
            verified: true,
            premium: false,
            location: "São Paulo, SP",
            distance: "8km"
          },
          content: "Workshop de culinária para casais! 👨‍🍳👩‍🍳 Aprendemos a fazer massas artesanais juntos. Foi uma experiência incrível de conexão e aprendizado. O chef ensinou técnicas que podemos usar em casa. #Culinária #Casais #Workshop",
          images: [
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop"
          ],
          likes: 2100,
          comments: 156,
          shares: 78,
          views: 8900,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          liked: false,
          saved: true,
          category: "lifestyle",
          tags: ["culinária", "workshop", "casais"]
        },
        {
          id: 4,
          user: {
            name: "Sofia Mendes",
            username: "@sofia_livre",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
            verified: false,
            premium: false,
            location: "São Paulo, SP",
            distance: "3km"
          },
          content: "Retiro de yoga e meditação no próximo mês! 🧘‍♀️ Será um fim de semana de autoconhecimento e conexão com a natureza. Ideal para quem busca equilíbrio e bem-estar. Vagas limitadas! #Yoga #Meditação #BemEstar #Retiro",
          likes: 670,
          comments: 34,
          shares: 12,
          views: 2100,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          liked: false,
          saved: false,
          category: "wellness",
          tags: ["yoga", "meditação", "bem-estar"]
        },
        {
          id: 5,
          user: {
            name: "Fernanda & Roberto",
            username: "@fernandaroberto",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png",
            verified: true,
            premium: true,
            location: "São Paulo, SP",
            distance: "7km"
          },
          content: "Encontro de casais livres na próxima sexta! 🎉 Será em um rooftop com vista incrível da cidade. Música ao vivo, drinks especiais e muita conexão. Confirmem presença! #Encontro #CasaisLivres #Social #Rooftop",
          likes: 1560,
          comments: 203,
          shares: 89,
          views: 7200,
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          liked: true,
          saved: true,
          category: "events",
          tags: ["encontro", "casais", "social"]
        }
      ]

      // Processar posts com algoritmo de recomendação
      const processedPosts = mockPosts.map(post => {
        const score = calculateRecommendationScore(post)
        const engagement = getEngagementLevel(score)
        
        return {
          ...post,
          score,
          engagement
        }
      })

      // Ordenar por score de recomendação
      const sortedPosts = processedPosts.sort((a, b) => b.score - a.score)

      setRecommendations(sortedPosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações')
    } finally {
      setLoading(false)
    }
  }

  // Buscar recomendações quando o hook é inicializado
  useEffect(() => {
    fetchAndProcessPosts()
  }, [])

  // Função para atualizar preferências do usuário
  const updateUserPreferences = (newPreferences: Partial<UserPreferences>) => {
    Object.assign(userPreferences, newPreferences)
    fetchAndProcessPosts() // Recarregar recomendações
  }

  // Função para dar feedback sobre uma recomendação
  const provideFeedback = (postId: number, feedback: 'like' | 'dislike' | 'save' | 'share') => {
    // Em um app real, isso seria enviado para o backend para melhorar o algoritmo
    console.log(`Feedback for post ${postId}: ${feedback}`)
    
    // Atualizar estado local
    setRecommendations(prev => 
      prev.map(post => {
        if (post.id === postId) {
          switch (feedback) {
            case 'like':
              return { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            case 'save':
              return { ...post, saved: !post.saved }
            case 'share':
              return { ...post, shares: post.shares + 1 }
            default:
              return post
          }
        }
        return post
      })
    )
  }

  return {
    recommendations,
    loading,
    error,
    userPreferences,
    updateUserPreferences,
    provideFeedback,
    refreshRecommendations: fetchAndProcessPosts
  }
} 