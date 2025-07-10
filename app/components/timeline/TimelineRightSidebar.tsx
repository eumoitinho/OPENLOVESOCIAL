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

  // Trending Topics - Dados dinâmicos
  const [trendingTopics] = useState<TrendingTopic[]>([
    {
      id: "1",
      hashtag: "OpenLove",
      postCount: 12500,
      growth: 15.2,
      category: "general",
      isHot: true
    },
    {
      id: "2", 
      hashtag: "LiberdadeERespeito",
      postCount: 8200,
      growth: 8.7,
      category: "relationships"
    },
    {
      id: "3",
      hashtag: "CasaisLivres", 
      postCount: 5800,
      growth: 12.3,
      category: "relationships"
    },
    {
      id: "4",
      hashtag: "EventosOpenLove",
      postCount: 3200,
      growth: 25.1,
      category: "events",
      isHot: true
    },
    {
      id: "5",
      hashtag: "FotografiaIntima",
      postCount: 2100,
      growth: 18.9,
      category: "lifestyle"
    }
  ])

  // Quem Seguir - Baseado em localização
  const [suggestedUsers] = useState<SuggestedUser[]>([
    {
      id: "1",
      name: "Maria & Carlos",
      username: "@mariacarlos",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
      location: "São Paulo, SP",
      distance: "2km",
      followers: 1240,
      verified: true,
      premium: true,
      relationshipType: "Casal (M&H)",
      tags: ["fotografia", "viagens", "arte"],
      mutualFriends: 3,
      followState: "follow"
    },
    {
      id: "2", 
      name: "Rafael Alves",
      username: "@rafael_livre",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
      location: "São Paulo, SP",
      distance: "5km",
      followers: 890,
      verified: false,
      premium: true,
      relationshipType: "Solteiro",
      tags: ["música", "festivais", "cultura"],
      mutualFriends: 1,
      followState: "follow"
    },
    {
      id: "3",
      name: "Ana & Pedro",
      username: "@anapedro",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png", 
      location: "São Paulo, SP",
      distance: "8km",
      followers: 2100,
      verified: true,
      premium: false,
      relationshipType: "Casal (M&H)",
      tags: ["gastronomia", "vinhos", "experiências"],
      mutualFriends: 5,
      followState: "follow"
    },
    {
      id: "4",
      name: "Sofia Mendes",
      username: "@sofia_livre",
      avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
      location: "São Paulo, SP", 
      distance: "3km",
      followers: 670,
      verified: false,
      premium: false,
      relationshipType: "Solteira",
      tags: ["yoga", "bem-estar", "natureza"],
      mutualFriends: 2,
      followState: "follow"
    }
  ])

  // Eventos Compartilhados
  const [sharedEvents] = useState<SharedEvent[]>([
    {
      id: "1",
      title: "Workshop de Fotografia Íntima",
      date: "Sábado, 15 de Dezembro",
      location: "São Paulo, SP",
      attendees: 24,
      maxAttendees: 30,
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
      category: "Fotografia",
      sharedBy: {
        name: "Lisa & João",
        username: "@lisajoao",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
      },
      sharedAt: "2h"
    },
    {
      id: "2",
      title: "Encontro de Casais Livres",
      date: "Domingo, 16 de Dezembro", 
      location: "São Paulo, SP",
      attendees: 45,
      maxAttendees: 50,
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png",
      category: "Social",
      sharedBy: {
        name: "Amanda & Carlos",
        username: "@amandacarlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
      },
      sharedAt: "4h"
    }
  ])

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
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
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

  const AdCard1 = () => (
    <Card className="max-w-lg py-0 sm:flex-row sm:gap-0">
      <CardContent className="grow-1 px-0">
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"
          alt="Banner"
          className="size-full rounded-s-xl"
        />
      </CardContent>
      <div className="sm:min-w-54">
        <CardHeader className="pt-6">
          <CardTitle className="text-sm">Eventos Exclusivos</CardTitle>
          <div className="text-xs text-muted-foreground">
            Participe de eventos únicos para casais e pessoas livres em sua cidade.
          </div>
        </CardHeader>
        <CardContent className="gap-3 py-6">
          <Button className="bg-transparent bg-gradient-to-br from-purple-500 to-pink-500 text-white focus-visible:ring-pink-600/20 text-xs">
            Explorar Eventos
          </Button>
        </CardContent>
      </div>
    </Card>
  )

  const AvatarGroup = () => {
    const avatars = [
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        fallback: "OS",
        name: "Olivia Sparks",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        fallback: "HL",
        name: "Howard Lloyd",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        fallback: "HR",
        name: "Hallie Richards",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        fallback: "JW",
        name: "Jenny Wilson",
      },
    ]

    return (
      <div className="bg-background flex flex-wrap items-center justify-center rounded-full border p-1 shadow-sm">
        <div className="flex -space-x-1">
          {avatars.map((avatar, index) => (
            <Avatar key={index} className="ring-background size-6 ring-2">
              <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.name} />
              <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <p className="text-muted-foreground px-2 text-xs">
          <strong className="text-foreground font-medium">10K+</strong> pessoas conectadas.
        </p>
      </div>
    )
  }

  return (
    <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar no OpenLove"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-0 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </form>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <Badge 
                      variant={topic.isHot ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {topic.isHot ? "🔥 HOT" : topic.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    +{topic.growth}%
                  </span>
                </div>
                <p className="font-semibold text-base">#{topic.hashtag}</p>
                <p className="text-sm text-gray-500">{formatNumber(topic.postCount)} posts</p>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm text-pink-600 hover:text-pink-700">
              Ver mais trending topics
            </Button>
          </CardContent>
        </Card>

        {/* Quem Seguir - Baseado em Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Quem Seguir
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {userLocation}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.verified && (
                      <BadgeCheck className="absolute -top-1 -right-1 w-4 h-4 fill-blue-500 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      {user.premium && (
                        <Badge variant="outline" className="text-xs border-pink-600 text-pink-600">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.username}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{user.distance}</span>
                      <span>•</span>
                      <span>{formatNumber(user.followers)} seguidores</span>
                      {user.mutualFriends && (
                        <>
                          <span>•</span>
                          <span>{user.mutualFriends} amigos em comum</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={getFollowButtonVariant(user.id)}
                  className={getFollowButtonClassName(user.id)}
                  onClick={() => handleFollow(user.id, false)}
                >
                  {getFollowButtonIcon(user.id)}
                  {getFollowButtonText(user.id)}
                </Button>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-sm text-pink-600 hover:text-pink-700">
              Ver mais sugestões
            </Button>
          </CardContent>
        </Card>

        {/* Eventos Compartilhados */}
        {sharedEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Eventos Compartilhados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sharedEvents.map((event) => (
                <div key={event.id} className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={event.sharedBy.avatar} />
                      <AvatarFallback className="text-xs">
                        {event.sharedBy.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{event.sharedBy.name}</span>
                    <span>•</span>
                    <span>{event.sharedAt}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees}/{event.maxAttendees} participantes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => onViewEvent?.(event.id)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Evento
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Community Stats */}
        <AvatarGroup />

        {/* Ad Card */}
        <AdCard1 />

        {/* Sponsored Ad */}
        <Advertisement 
          type="sidebar"
          onAdClick={(adId) => console.log("Sidebar ad clicked:", adId)}
          onAdImpression={(adId) => console.log("Sidebar ad impression:", adId)}
        />
      </div>
    </aside>
  )
}

