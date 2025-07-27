"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  BadgeCheckIcon,
  MapPin,
  Calendar,
  Users,
  Camera,
  Video,
  ImageIcon,
  Settings,
  Globe,
  Lock,
  UserPlus,
  CheckCircle,
  Clock,
  Star,
  Flame,
  Save,
  Send,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import PostCard from "./PostCard"

interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  coverImage?: string
  verified: boolean
  premium: boolean
  location: string
  relationshipType: string
  isPrivate: boolean
  bio: string
  followers: number
  following: number
  postsCount: number
  joinedDate: string
  interests: string[]
  photos: string[]
  videos: string[]
  userPosts: any[]
  isFollowing: boolean
  followState: "follow" | "requested" | "following"
}

interface ProfileViewerProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  currentUser: {
    name: string
    username: string
    avatar: string
  }
  onFollow?: (userId: string, isPrivate: boolean) => void
  onMessage?: (userId: string) => void
  onShare?: (userId: string) => void
  onLike?: (postId: number) => void
  onSave?: (postId: number) => void
  onComment?: (postId: number) => void
  onSharePost?: (postId: number) => void
  onViewMedia?: (postId: number, mediaIndex: number) => void
}

export function ProfileViewer({
  isOpen,
  onClose,
  profile,
  currentUser,
  onFollow,
  onMessage,
  onShare,
  onLike,
  onSave,
  onComment,
  onSharePost,
  onViewMedia,
}: ProfileViewerProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "photos" | "videos" | "about">("posts")

  const getFollowButtonText = () => {
    switch (profile.followState) {
      case "requested":
        return "Solicitado"
      case "following":
        return "Seguindo"
      default:
        return "Seguir"
    }
  }

  const getFollowButtonIcon = () => {
    switch (profile.followState) {
      case "requested":
        return <Clock className="w-4 h-4 mr-1" />
      case "following":
        return <CheckCircle className="w-4 h-4 mr-1" />
      default:
        return <UserPlus className="w-4 h-4 mr-1" />
    }
  }

  const handleFollow = () => {
    onFollow?.(profile.id, profile.isPrivate)
  }

  const handleMessage = () => {
    onMessage?.(profile.id)
  }

  const handleShare = () => {
    onShare?.(profile.id)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Perfil de {profile.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Header com Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-pink-500 to-purple-600">
            {profile.coverImage && (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Botão Fechar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Informações do Perfil */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <Avatar className="w-32 h-32 ring-4 ring-white dark:ring-gray-900">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Informações Básicas */}
            <div className="mt-20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    {profile.verified && (
                      <BadgeCheckIcon className="w-6 h-6 fill-sky-500 text-white" />
                    )}
                    {profile.premium && (
                      <Badge variant="outline" className="border-pink-600 text-pink-600">
                        Premium
                      </Badge>
                    )}
                    {profile.isPrivate && (
                      <Badge variant="outline" className="border-gray-600 text-gray-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Entrou em {formatDate(profile.joinedDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{profile.relationshipType}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>

                  {/* Estatísticas */}
                  <div className="flex items-center gap-6 text-sm mb-4">
                    <div className="text-center">
                      <div className="font-semibold">{profile.postsCount}</div>
                      <div className="text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{profile.followers}</div>
                      <div className="text-gray-500">Seguidores</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{profile.following}</div>
                      <div className="text-gray-500">Seguindo</div>
                    </div>
                  </div>

                  {/* Interesses */}
                  {(profile.interests || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(profile.interests || []).map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant={profile.followState === "following" ? "secondary" : "outline"}
                    onClick={handleFollow}
                    className={cn(
                      "transition-all duration-200",
                      profile.followState === "requested" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                      profile.followState === "following" && "bg-green-100 text-green-700 border-green-300",
                    )}
                  >
                    {getFollowButtonIcon()}
                    {getFollowButtonText()}
                  </Button>
                  
                  <Button variant="outline" onClick={handleMessage}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
                  
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts">Posts ({profile.postsCount})</TabsTrigger>
                <TabsTrigger value="photos">
                  <Camera className="w-4 h-4 mr-2" />
                  Fotos ({(profile.photos || []).length})
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Video className="w-4 h-4 mr-2" />
                  Vídeos ({(profile.videos || []).length})
                </TabsTrigger>
                <TabsTrigger value="about">Sobre</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {activeTab === "posts" && (
              <div className="space-y-4">
                {(profile.userPosts || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum post ainda</p>
                  </div>
                ) : (
                  (profile.userPosts || []).map((post: any) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={onLike}
                      onSave={onSave}
                      onComment={onComment}
                      onShare={onSharePost}
                      onViewMedia={onViewMedia}
                      currentUser={currentUser}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "photos" && (
              <div className="grid grid-cols-3 gap-2">
                {(profile.photos || []).length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhuma foto ainda</p>
                  </div>
                ) : (
                  (profile.photos || []).map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "videos" && (
              <div className="grid grid-cols-2 gap-4">
                {(profile.videos || []).length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhum vídeo ainda</p>
                  </div>
                ) : (
                  (profile.videos || []).map((video, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-black">
                      <img
                        src={video}
                        alt={`Vídeo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full bg-white/20 hover:bg-white/30">
                          <Play className="w-6 h-6 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{profile.relationshipType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Membro desde {formatDate(profile.joinedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500" />
                      )}
                      <span>Perfil {profile.isPrivate ? "Privado" : "Público"}</span>
                    </div>
                  </CardContent>
                </Card>

                {(profile.interests || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(profile.interests || []).map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CardContent } from "@/components/ui/card"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"