"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  MapPin,
  Users,
  Play,
  ImageIcon,
  Video,
  BadgeCheckIcon,
  Flame,
  Save,
  Clock,
  Filter,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SavedPost {
  id: string
  user: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
    location: string
    relationshipType: string
  }
  content: string
  images?: string[]
  video?: string
  event?: {
    title: string
    date: string
    location: string
    attendees: number
    image: string
  }
  likes: number
  comments: number
  shares: number
  timestamp: string
  savedAt: string
  category: "posts" | "events" | "media"
}

interface SavedContentProps {
  savedPosts: SavedPost[]
  onRemoveFromSaved: (postId: string) => void
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onViewMedia: (postId: string, mediaIndex: number) => void
}

export function SavedContent({
  savedPosts,
  onRemoveFromSaved,
  onLike,
  onComment,
  onShare,
  onViewMedia,
}: SavedContentProps) {
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "events" | "media">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "popular">("recent")

  const filteredPosts = savedPosts.filter((post) => {
    const matchesTab = activeTab === "all" || post.category === activeTab
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      case "oldest":
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
      case "popular":
        return b.likes - a.likes
      default:
        return 0
    }
  })

  const formatTimestamp = (timestamp: string) => {
    // Implementar lógica de formatação de tempo
    return timestamp
  }

  const SavedPostCard = ({ post }: { post: SavedPost }) => (
    <Card className="max-w-full border-gray-200 dark:border-white/10">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="ring-ring ring-2">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback className="text-xs">
                {post.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {post.user.verified && (
              <span className="absolute -end-1.5 -top-1.5">
                <BadgeCheckIcon className="text-background size-5 fill-sky-500" />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="flex items-center gap-2 text-sm">
              {post.user.name}
              {post.user.premium && (
                <Badge
                  variant="outline"
                  className="border-pink-600 dark:border-pink-400 text-pink-600 dark:text-pink-400 text-xs"
                >
                  Premium
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{post.user.username}</span>
              <span>•</span>
              <span>{formatTimestamp(post.timestamp)}</span>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span>{post.user.location}</span>
              <span>•</span>
              <span className="text-purple-600 font-medium">{post.user.relationshipType}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Bookmark className="w-3 h-3" />
              <span>Salvo em {formatTimestamp(post.savedAt)}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveFromSaved(post.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <p className="leading-relaxed">{post.content}</p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="w-full">
            {post.images.length === 1 ? (
              <div
                className="relative cursor-pointer"
                onClick={() => onViewMedia(post.id, 0)}
              >
                <img
                  src={post.images[0]}
                  alt="Post content"
                  className="aspect-video w-full rounded-md object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  Foto
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer"
                    onClick={() => onViewMedia(post.id, index)}
                  >
                    <img
                      src={image}
                      alt={`Post content ${index + 1}`}
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    {index === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{post.images!.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {post.video && (
          <div
            className="relative w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer"
            onClick={() => onViewMedia(post.id, 0)}
          >
            <img
              src={post.video}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button size="lg" className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                <Play className="w-6 h-6 text-white" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              <Video className="w-3 h-3 inline mr-1" />
              Vídeo
            </div>
          </div>
        )}

        {/* Event */}
        {post.event && (
          <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={post.event.image}
                  alt={post.event.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">{post.event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-purple-700 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <MapPin className="w-4 h-4" />
                    <span>{post.event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Users className="w-4 h-4" />
                    <span>{post.event.attendees} participantes</span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Ver Evento
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>

      <CardContent className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post.id)}
          className="transition-all duration-200 hover:scale-110"
        >
          <Flame className="size-4" />
          {post.likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComment(post.id)}
          className="transition-all duration-200 hover:scale-110 hover:text-blue-500"
        >
          <MessageCircle className="size-4" />
          {post.comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(post.id)}
          className="transition-all duration-200 hover:scale-110 hover:text-purple-500"
        >
          <Share2 className="size-4" />
          {post.shares}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conteúdo Salvo</h1>
          <p className="text-gray-500">Seus posts, eventos e mídia favoritos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conteúdo salvo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-0 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Ordenar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({savedPosts.length})</TabsTrigger>
          <TabsTrigger value="posts">
            Posts ({savedPosts.filter(p => p.category === "posts").length})
          </TabsTrigger>
          <TabsTrigger value="events">
            Eventos ({savedPosts.filter(p => p.category === "events").length})
          </TabsTrigger>
          <TabsTrigger value="media">
            Mídia ({savedPosts.filter(p => p.category === "media").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Ordenar por:</span>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            Mais Recentes
          </Button>
          <Button
            variant={sortBy === "oldest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("oldest")}
          >
            Mais Antigos
          </Button>
          <Button
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("popular")}
          >
            Mais Populares
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo salvo</h3>
            <p className="text-gray-500">
              {searchQuery ? "Nenhum resultado encontrado para sua busca." : "Salve posts, eventos e mídia para vê-los aqui."}
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <SavedPostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CardContent } from "@/components/ui/card"