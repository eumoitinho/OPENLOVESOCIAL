"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Users, 
  Calendar, 
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  CheckCircle,
  Clock,
  Star,
  BadgeCheck,
  MoreHorizontal,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Advertisement from "../ads/Advertisement"
import PlanAdCard from '@/app/components/ads/PlanAdCard'
import { useCanAccess } from "@/lib/plans/hooks"

interface TrendingTopic {
  id: string
  hashtag: string
  postCount: number
  growth: number
  category: "general" | "events" | "relationships" | "lifestyle"
  isHot?: boolean
}

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatar: string
  location: string
  distance: string
  followers: number
  verified: boolean
  premium: boolean
  relationshipType: string
  tags: string[]
  mutualFriends?: number
  followState: "follow" | "requested" | "following"
}

interface SharedEvent {
  id: string
  title: string
  date: string
  location: string
  attendees: number
  maxAttendees: number
  image: string
  category: string
  sharedBy: {
    name: string
    username: string
    avatar: string
  }
  sharedAt: string
}

interface TimelineRightSidebarProps {
  userLocation?: string
  onFollowUser?: (userId: string) => void
  onUnfollowUser?: (userId: string) => void
  onViewEvent?: (eventId: string) => void
  onSearch?: (query: string) => void
}

export function TimelineRightSidebar({ 
  userLocation = "São Paulo, SP",
  onFollowUser,
  onUnfollowUser,
  onViewEvent,
  onSearch
}: TimelineRightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [followStates, setFollowStates] = useState<Record<string, "follow" | "requested" | "following">>({})
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [sharedEvents, setSharedEvents] = useState<SharedEvent[]>([])
  const [loading, setLoading] = useState({
    trending: true,
    users: true,
    events: true
  })

  const canAccess = useCanAccess()

  // Buscar dados reais
  useEffect(() => {
    fetchTrendingTopics()
    fetchSuggestedUsers()
    fetchNearbyEvents()
  }, [])

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingTopics(data.trending || [])
      }
    } catch (error) {
      console.error('Erro ao buscar trending topics:', error)
    } finally {
      setLoading(prev => ({ ...prev, trending: false }))
    }
  }

  const fetchSuggestedUsers = async () => {
    try {
      const response = await fetch('/api/suggestions/users')
      if (response.ok) {
        const data = await response.json()
        setSuggestedUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários sugeridos:', error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchNearbyEvents = async () => {
    try {
      const response = await fetch('/api/events/nearby')
      if (response.ok) {
        const data = await response.json()
        setSharedEvents(data.events || [])
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    } finally {
      setLoading(prev => ({ ...prev, events: false }))
    }
  }

  // Handlers
  const handleFollow = (userId: string, isPrivate: boolean = false) => {
    const currentState = followStates[userId] || "follow"
    
    if (currentState === "follow") {
      const newState = isPrivate ? "requested" : "following"
      setFollowStates(prev => ({ ...prev, [userId]: newState }))
      onFollowUser?.(userId)
    } else if (currentState === "following") {
      setFollowStates(prev => ({ ...prev, [userId]: "follow" }))
      onUnfollowUser?.(userId)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  const getFollowButtonText = (userId: string) => {
    const state = followStates[userId] || "follow"
    switch (state) {
      case "requested": return "Solicitado"
      case "following": return "Seguindo"
      default: return "Seguir"
    }
  }

  const getFollowButtonIcon = (userId: string) => {
    const state = followStates[userId] || "follow"
    switch (state) {
      case "requested": return <Clock className="w-4 h-4 mr-1" />
      case "following": return <CheckCircle className="w-4 h-4 mr-1" />
      default: return <UserPlus className="w-4 h-4 mr-1" />
    }
  }

  const getFollowButtonVariant = (userId: string) => {
    const state = followStates[userId] || "follow"
    switch (state) {
      case "requested": return "secondary"
      case "following": return "outline"
      default: return "outline"
    }
  }

  const getFollowButtonClassName = (userId: string) => {
    const state = followStates[userId] || "follow"
    return cn(
      "transition-all duration-200",
      state === "requested" && "bg-yellow-100 text-yellow-700 border-yellow-300",
      state === "following" && "bg-green-100 text-green-700 border-green-300"
    )
  }

  return (
    <aside className="hidden xl:block w-[350px] p-3 xs:p-4 sticky top-0 h-screen overflow-y-auto overflow-x-hidden scrollbar-hide space-y-4 xs:space-y-6">
      {/* Card de Plano - Mostrar apenas para usuários do plano gratuito */}
      {canAccess.currentPlan === 'free' && (
        <PlanAdCard 
          plan="gold" 
          position="sidebar"
          onDismiss={() => {
            // Store dismissal in localStorage
            localStorage.setItem('planAdDismissed', 'true')
          }}
        />
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no OpenLove"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 xs:py-2.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-full text-xs xs:text-sm focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Trending Topics */}
      <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.trending ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : trendingTopics.length > 0 ? (
            <ul className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <li key={topic.id} className="group">
                  <a href="#" className="block">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{index + 1} · {topic.category}</span>
                      {topic.isHot && <Badge variant="destructive" className="text-xs">Hot</Badge>}
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      #{topic.hashtag}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(topic.postCount)} posts</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum trending topic encontrado
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Who to Follow */}
      <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Users className="w-5 h-5 text-pink-500" />
            <span>Quem Seguir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.users ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="space-y-4">
              {suggestedUsers.map(user => (
                <div key={user.id} className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 border-2 border-gray-100 dark:border-gray-700">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-50">{user.name}</h4>
                      {user.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      {user.premium && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={getFollowButtonVariant(user.id)} 
                    onClick={() => handleFollow(user.id)}
                    className={getFollowButtonClassName(user.id)}
                  >
                    {getFollowButtonIcon(user.id)}
                    {getFollowButtonText(user.id)}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhuma sugestão encontrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shared Events */}
      <Card className="bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-pink-500" />
            <span>Eventos na sua Área</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.events ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sharedEvents.length > 0 ? (
            <div className="space-y-4">
              {sharedEvents.map(event => (
                <a href="#" key={event.id} className="block group">
                  <Card className="overflow-hidden border-gray-200 dark:border-gray-700 group-hover:border-pink-500 dark:group-hover:border-pink-400 transition-colors">
                    <CardContent className="p-0">
                      <img src={event.image} alt={event.title} className="w-full h-24 object-cover" />
                      <div className="p-3">
                        <p className="text-xs font-semibold uppercase text-pink-600 dark:text-pink-400">{event.category}</p>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-50">{event.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum evento encontrado
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Footer Links */}
      <footer className="text-xs text-gray-500 dark:text-gray-400 space-x-2 text-center">
        <a href="/terms" className="hover:underline">Termos</a>
        <span>·</span>
        <a href="/privacy" className="hover:underline">Privacidade</a>
        <span>·</span>
        <a href="/about" className="hover:underline">Sobre</a>
        <span>·</span>
        <span>© {new Date().getFullYear()} OpenLove</span>
      </footer>
    </aside>
  )
}
