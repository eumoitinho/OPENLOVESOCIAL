"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, UserPlus, MessageCircle, Heart, MapPin, Calendar, Users, Verified, Share2 } from "lucide-react"

interface UserProfileViewProps {
  user: any
  onBack: () => void
}

export function UserProfileView({ user, onBack }: UserProfileViewProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const [activeTab, setActiveTab] = useState("posts")

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const userPosts = [
    {
      id: "1",
      content: "Aproveitando o fim de semana na praia! O sol está perfeito hoje.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 24,
      comments: 8,
      timestamp: "2h",
    },
    {
      id: "2",
      content: "Quem quer se juntar para um jantar romântico hoje? Conheço um lugar incrível!",
      likes: 15,
      comments: 12,
      timestamp: "5h",
    },
    {
      id: "3",
      content: "Acabei de terminar meu treino. Nada melhor que cuidar da saúde!",
      image: "/placeholder.svg?height=300&width=400",
      likes: 31,
      comments: 6,
      timestamp: "1d",
    },
  ]

  const userGallery = [
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ]

  return (
    <div className="flex-1 ml-0 md:ml-72 mr-0 lg:mr-80 timeline-bg min-h-screen">
      <div className="max-w-4xl mx-auto mobile-padding pt-16 md:pt-6">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-pink-100 text-pink-600 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-pink-900 truncate">Perfil de {user.name}</h1>
        </div>

        {/* Profile Header - Mobile Optimized */}
        <Card className="openlove-card rounded-3xl mb-6 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 relative" />

          <CardContent className="p-4 md:p-6 -mt-16 md:-mt-20 relative">
            <div className="flex flex-col items-center md:flex-row md:items-end gap-4 md:gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative mb-3">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl md:text-4xl font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isPremium && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Verified className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-pink-900">{user.name}</h2>
                  <p className="text-pink-600 mobile-text-sm">@{user.username}</p>
                  <Badge
                    className={cn(
                      "mt-2 text-xs",
                      user.isPremium
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0"
                        : "border-pink-400 text-pink-700 bg-pink-50",
                    )}
                  >
                    {user.isPremium ? "Premium" : "Gratuito"}
                  </Badge>
                </div>
              </div>

              {/* Profile Details - Mobile Optimized */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-3 md:mb-4 text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-pink-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-pink-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{user.age} anos</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-pink-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Membro desde 2023</span>
                  </div>
                </div>

                <p className="text-pink-900 mb-4 text-center md:text-left text-sm md:text-base leading-relaxed">
                  {user.bio}
                </p>

                {/* Interests - Mobile Optimized */}
                <div className="mb-4">
                  <h3 className="font-semibold text-pink-900 mb-2 text-center md:text-left text-sm md:text-base">
                    Interesses
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-pink-300 text-pink-600 bg-pink-50 text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats - Mobile Optimized */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                    <div className="font-bold text-pink-600 text-lg md:text-xl">{user.stats?.posts || 42}</div>
                    <div className="text-pink-700 text-xs md:text-sm">Posts</div>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                    <div className="font-bold text-pink-600 text-lg md:text-xl">{user.stats?.followers || 1.2}K</div>
                    <div className="text-pink-700 text-xs md:text-sm">Seguidores</div>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                    <div className="font-bold text-pink-600 text-lg md:text-xl">{user.stats?.following || 234}</div>
                    <div className="text-pink-700 text-xs md:text-sm">Seguindo</div>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <Button
                    onClick={handleFollow}
                    className={cn(
                      "flex-1 rounded-xl font-medium transition-all duration-200",
                      isFollowing
                        ? "bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300"
                        : "btn-openlove",
                    )}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent rounded-xl"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent rounded-xl md:flex hidden"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/80 rounded-2xl p-1 border border-pink-200 mb-6">
            <TabsTrigger
              value="posts"
              className="rounded-xl text-pink-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="rounded-xl text-pink-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Galeria
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-xl text-pink-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              Sobre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {userPosts.map((post) => (
              <Card key={post.id} className="openlove-card rounded-3xl hover-lift">
                <CardContent className="p-4 md:p-6">
                  <p className="text-pink-900 mb-4 leading-relaxed">{post.content}</p>
                  {post.image && (
                    <div className="mb-4 rounded-2xl overflow-hidden">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post"
                        className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-pink-600">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                    </div>
                    <span>{post.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {userGallery.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden bg-pink-50 hover-lift cursor-pointer group"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="openlove-card rounded-3xl">
              <CardHeader>
                <h3 className="text-lg md:text-xl font-semibold text-pink-900">Sobre {user.name}</h3>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div>
                  <h4 className="font-semibold text-pink-900 mb-2">Biografia</h4>
                  <p className="text-pink-700 leading-relaxed">{user.bio}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-900 mb-2">Informações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-pink-600">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-600">
                      <Calendar className="w-4 h-4" />
                      <span>{user.age} anos</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-900 mb-2">Interesses</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-pink-300 text-pink-600 bg-pink-50">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
