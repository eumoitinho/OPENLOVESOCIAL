"use client"

import React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "../feed/PostCard"
import { BookIcon, HeartIcon, GiftIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos podem ser centralizados
type Post = {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    isPremium: boolean
    isFollowing: boolean
  }
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

interface HomeViewProps {
  posts: Post[]
  activeTab: string
  onTabChange: (tab: string) => void
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
  onToggleFollow: (username: string) => void
}

const tabs = [
  {
    name: "Explorar",
    value: "explore",
    icon: BookIcon,
    content: (
      <>
        Descubra <span className="text-foreground font-semibold">ideias frescas</span>, tópicos em alta e conexões
        incríveis curadas especialmente para você. Comece a explorar!
      </>
    ) },
  {
    name: "Favoritos",
    value: "favorites",
    icon: HeartIcon,
    content: (
      <>
        Todos os seus <span className="text-foreground font-semibold">favoritos</span> estão salvos aqui. Revisite
        posts, conexões e momentos que você ama, a qualquer momento.
      </>
    ) },
  {
    name: "Eventos",
    value: "events",
    icon: GiftIcon,
    content: (
      <>
        <span className="text-foreground font-semibold">Eventos próximos</span> em sua área. Participe e conheça pessoas
        com interesses similares aos seus!
      </>
    ) },
]

export function HomeView({ posts, activeTab, onTabChange, onLike, onComment, onShare, onToggleFollow }: HomeViewProps) {
  return (
    <div className="border-x border-openlove-200 flex flex-col flex-1 min-h-0 bg-gradient-to-br from-white via-openlove-50 to-openlove-100">
      <div className="sticky top-0 bg-gradient-to-r from-white via-openlove-50 to-openlove-100/90 backdrop-blur-sm border-b border-openlove-200 p-4 z-10 shadow-sm">
        <h2 className="text-2xl font-extrabold text-openlove-700 tracking-tight">Timeline</h2>
        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
          <TabsList className="bg-openlove-100/80 rounded-xl p-1 shadow-inner">
            {tabs.map(({ icon: Icon, name, value }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold",
                  activeTab === value
                    ? "bg-gradient-to-r from-openlove-500 to-openlove-600 text-white shadow-md"
                    : "text-openlove-600 hover:bg-openlove-200/60",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <p className="text-base text-openlove-700 font-medium">{tab.content}</p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="divide-y divide-openlove-200 flex-1 overflow-y-auto">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onToggleFollow={onToggleFollow}
          />
        ))}
      </div>
    </div>
  )
}
