"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Users,
  MapPin,
  Verified,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Definindo os tipos para o post, que podem ser movidos para um arquivo de tipos futuramente
// (e.g., types/database.ts ou types/timeline.ts)
type Author = {
  name: string
  username: string
  avatar: string
  isPremium: boolean
  isFollowing: boolean
}

type Post = {
  id: string
  author: Author
  content: string
  image?: string | null
  hashtags: string[]
  stats: {
    likes: number
    comments: number
    shares: number
  }
  isLiked: boolean
  createdAt: string
  time: string
  isEvent?: boolean
  eventDetails?: {
    date: string
    time: string
    location: string
    participants: number
  }
}

interface PostCardProps {
  post: Post
  index: number
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onToggleFollow: (username: string) => void
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function PostCard({ post, index, onLike, onComment, onShare, onToggleFollow }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-4 hover:bg-openlove-100/70 transition-colors"
    >
      <Card className="border-0 shadow-md bg-gradient-to-br from-white via-openlove-50 to-openlove-100 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-openlove-200">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-gradient-to-r from-openlove-400 to-openlove-500 text-white">
                  <Heart className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              {post.author.isPremium && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-openlove-500 to-openlove-600 rounded-full flex items-center justify-center shadow">
                  <Verified className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-openlove-800">
                  {post.author.name}
                </CardTitle>
                {post.author.isPremium && (
                  <Badge variant="outline" className="text-xs border-openlove-600 text-openlove-600 bg-openlove-100">
                    Premium
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-openlove-500">
                @{post.author.username} • {post.createdAt} às {post.time}
              </CardDescription>
            </div>
          </div>
          <Button
            variant={post.author.isFollowing ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleFollow(post.author.username)}
            className={cn(
              post.author.isFollowing
                ? "border-openlove-300 text-openlove-600 hover:bg-openlove-100 bg-white"
                : "bg-gradient-to-r from-openlove-500 to-openlove-600 hover:from-openlove-600 hover:to-openlove-700 text-white shadow-md",
            )}
          >
            {post.author.isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 mr-1" />
                Seguindo
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Seguir
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-base text-openlove-800 leading-relaxed">
            {post.content.split(" ").map((word, i) => {
              if (word.startsWith("#")) {
                return (
                  <span key={i} className="text-openlove-600 font-semibold hover:underline cursor-pointer">
                    {word}{" "}
                  </span>
                )
              }
              if (word.startsWith("@")) {
                return (
                  <span key={i} className="text-openlove-700 font-semibold hover:underline cursor-pointer">
                    {word}{" "}
                  </span>
                )
              }
              return word + " "
            })}
          </p>
          {post.image && (
            <img
              src={post.image}
              alt="Post image"
              className="w-full rounded-xl object-cover border border-openlove-200 shadow-sm"
            />
          )}
          {post.isEvent && post.eventDetails && (
            <Card className="bg-gradient-to-r from-openlove-100 to-openlove-200 border-openlove-200 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-openlove-500 to-openlove-600 flex items-center justify-center shadow">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-openlove-800">Evento</p>
                  <p className="text-xs text-openlove-600">
                    {post.eventDetails.date} às {post.eventDetails.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-openlove-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{post.eventDetails.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{post.eventDetails.participants} participantes</span>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={cn(
              "hover:bg-openlove-100/70",
              post.isLiked && "text-openlove-600 font-bold",
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4 mr-1",
                post.isLiked && "fill-openlove-500",
              )}
            />
            {formatNumber(post.stats.likes)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post.id)}
            className="hover:bg-openlove-100/70"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            {formatNumber(post.stats.comments)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(post.id)}
            className="hover:bg-openlove-100/70"
          >
            <Share2 className="w-4 h-4 mr-1" />
            {formatNumber(post.stats.shares)}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
