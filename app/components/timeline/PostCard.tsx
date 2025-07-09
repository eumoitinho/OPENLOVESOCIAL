"use client"

import { useState } from "react"
import {
  Flame,
  MessageCircle,
  Share2,
  UserPlus,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Play,
  ImageIcon,
  Video,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: any
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onFollow?: (username: string) => void
  onViewProfile?: (user: any) => void
}

export function PostCard({ post, onLike, onComment, onShare, onFollow, onViewProfile }: PostCardProps) {
  const [liked, setLiked] = useState<boolean>(post.isLiked || false)

  const handleLike = () => {
    setLiked(!liked)
    onLike?.(post.id)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <Card className="openlove-card rounded-3xl overflow-hidden mb-6 hover-lift animate-fade-in">
      <CardHeader className="flex flex-row items-center gap-4 p-6 pb-4">
        <Avatar
          className="w-12 h-12 border-3 border-pink-200 cursor-pointer hover:border-pink-400 transition-all duration-200 hover:scale-105"
          onClick={() => onViewProfile?.(post.author)}
        >
          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white font-semibold">
            {post.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p
              className="font-semibold text-pink-900 cursor-pointer hover:text-pink-600 transition-colors"
              onClick={() => onViewProfile?.(post.author)}
            >
              {post.author.name}
            </p>
            {post.author.isPremium && (
              <Badge className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">Premium</Badge>
            )}
            {post.visibility === "friends" && (
              <Badge variant="outline" className="text-xs border-pink-300 text-pink-600 bg-pink-50">
                Amigos
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-pink-600">
            <span>@{post.author.username}</span>
            <span>•</span>
            <span>
              {post.createdAt} às {post.time}
            </span>
            {post.author.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.author.location}
                </span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 text-pink-600 hover:text-pink-800 hover:bg-pink-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mais opções</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="openlove-card rounded-2xl">
            <DropdownMenuItem className="rounded-xl hover:bg-pink-50">Salvar Post</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl hover:bg-pink-50">Adicionar aos Favoritos</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl hover:bg-pink-50">Copiar Link</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 rounded-xl hover:bg-red-50">Denunciar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="space-y-4">
          {/* Post Content */}
          <div className="text-pink-900 leading-relaxed">
            {post.content.split(" ").map((word: string, i: number) => {
              if (word.startsWith("#")) {
                return (
                  <span key={i} className="text-pink-600 font-semibold hover:underline cursor-pointer">
                    {word}{" "}
                  </span>
                )
              }
              if (word.startsWith("@")) {
                return (
                  <span key={i} className="text-pink-700 font-medium hover:underline cursor-pointer">
                    {word}{" "}
                  </span>
                )
              }
              return word + " "
            })}
          </div>

          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-pink-600">
                <ImageIcon className="w-4 h-4" />
                <span>
                  {post.images.length} foto{post.images.length > 1 ? "s" : ""}
                </span>
              </div>
              <div
                className={cn(
                  "grid gap-3 rounded-2xl overflow-hidden",
                  post.images.length === 1
                    ? "grid-cols-1"
                    : post.images.length === 2
                      ? "grid-cols-2"
                      : post.images.length === 3
                        ? "grid-cols-2"
                        : "grid-cols-2",
                )}
              >
                {post.images.slice(0, 4).map((image: string, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "relative group cursor-pointer bg-pink-50 rounded-xl overflow-hidden",
                      post.images.length === 3 && index === 0 ? "row-span-2" : "",
                    )}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-300"
                    />
                    {post.images.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/80 to-rose-500/80 flex items-center justify-center rounded-xl">
                        <div className="text-center text-white">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                          <span className="font-bold text-lg">+{post.images.length - 4}</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {post.video && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-pink-600">
                <Video className="w-4 h-4" />
                <span>Vídeo Premium</span>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 group">
                <video
                  src={post.video}
                  className="w-full aspect-video object-cover"
                  controls
                  poster="/placeholder.svg?height=400&width=600"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg">
                    <Play className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Event Details */}
          {post.isEvent && post.eventDetails && (
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-pink-900">Evento Premium</p>
                  <p className="text-sm text-pink-600">
                    {post.eventDetails.date} às {post.eventDetails.time}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div className="flex items-center gap-2 text-pink-600">
                  <MapPin className="w-4 h-4" />
                  <span>{post.eventDetails.location}</span>
                </div>
                <div className="flex items-center gap-2 text-pink-600">
                  <Users className="w-4 h-4" />
                  <span>{post.eventDetails.participants} participantes</span>
                </div>
              </div>
              <Button className="w-full btn-openlove rounded-xl">Participar do Evento</Button>
            </Card>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-6 pt-0 border-t border-pink-100">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "hover:bg-orange-50 rounded-xl transition-all duration-200 hover-lift",
              liked ? "text-orange-500 bg-orange-50" : "text-pink-600 hover:text-orange-500",
            )}
          >
            <Flame className={cn("w-5 h-5 mr-2", liked && "fill-orange-500")} />
            {formatNumber(post.stats.likes + (liked && !post.isLiked ? 1 : 0))}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="hover:bg-blue-50 text-pink-600 hover:text-blue-500 rounded-xl transition-all duration-200 hover-lift"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {formatNumber(post.stats.comments)}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="hover:bg-green-50 text-pink-600 hover:text-green-500 rounded-xl transition-all duration-200 hover-lift"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {formatNumber(post.stats.shares)}
          </Button>
        </div>

        {!post.author.isFollowing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFollow?.(post.author.username)}
            className="border-pink-300 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 rounded-xl transition-all duration-200 hover-lift"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Seguir
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
