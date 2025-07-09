"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContents } from "@/components/ui/motion-tabs"
import PostCard from "./PostCard"
import { AdCardHorizontal, AdCardVertical } from "../ads/AdCard"
import AvatarGroup from "../ui/avatar-group"
import CreatePost from "./CreatePost"

// Mock data
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Ana Silva",
      username: "ana_silva",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      isFollowing: false,
    },
    content: "Perdida nas cores da noite 🌌✨ Às vezes o desfoque revela mais do que a clareza.",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
    hashtags: ["AbstractVibes", "Dreamscape", "VisualPoetry"],
    stats: {
      likes: 2100,
      comments: 1400,
      reposts: 669,
      shares: 1100,
    },
    isLiked: true,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    author: {
      name: "Carlos Mendes",
      username: "carlos_m",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
      isFollowing: true,
    },
    content: "Explorando novas conexões na comunidade OpenLove! 💕 A liberdade de ser autêntico é incrível.",
    hashtags: ["OpenLove", "Autenticidade", "Conexões"],
    stats: {
      likes: 856,
      comments: 234,
      reposts: 89,
      shares: 156,
    },
    isLiked: false,
    createdAt: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    author: {
      name: "Mariana & João",
      username: "mari_joao",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
      isFollowing: false,
    },
    content: "Nosso primeiro evento como casal na plataforma foi incrível! Conhecemos pessoas maravilhosas. 🎉",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    hashtags: ["CasalAberto", "Eventos", "NovasAmizades"],
    stats: {
      likes: 1250,
      comments: 567,
      reposts: 234,
      shares: 445,
    },
    isLiked: false,
    createdAt: "2024-01-15T08:45:00Z",
  },
]

const mockAvatars = [
  {
    src: "/placeholder.svg?height=24&width=24",
    fallback: "OS",
    name: "Olivia Sparks",
  },
  {
    src: "/placeholder.svg?height=24&width=24",
    fallback: "HL",
    name: "Howard Lloyd",
  },
  {
    src: "/placeholder.svg?height=24&width=24",
    fallback: "HR",
    name: "Hallie Richards",
  },
  {
    src: "/placeholder.svg?height=24&width=24",
    fallback: "JW",
    name: "Jenny Wilson",
  },
]

const tabs = [
  {
    name: "Timeline",
    value: "timeline",
    content: "Descubra posts frescos, tópicos em alta e conexões especiais selecionadas para você.",
  },
  {
    name: "Favoritos",
    value: "favorites",
    content: "Todos os seus favoritos estão salvos aqui. Revisite posts e momentos que você ama.",
  },
  {
    name: "Explorar",
    value: "explore",
    content: "Explore novos perfis, eventos e oportunidades de conexão em sua região.",
  },
]

export default function EnhancedTimeline() {
  const [posts, setPosts] = useState(mockPosts)
  const [loading, setLoading] = useState(false)

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post,
      ),
    )
  }

  const handleFollow = (username: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.author.username === username ? { ...post, author: { ...post.author, isFollowing: true } } : post,
      ),
    )
  }

  const handlePostCreated = () => {
    // Refresh posts when a new one is created
    console.log("New post created")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar Group */}
      <div className="flex justify-center">
        <AvatarGroup avatars={mockAvatars} count={15000} label="membros ativos" />
      </div>

      {/* Animated Tabs */}
      <div className="w-full">
        <Tabs defaultValue="timeline" className="gap-4">
          <div className="flex justify-center">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContents className="bg-background mx-1 -mt-2 mb-1 h-full rounded-sm">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <p className="text-muted-foreground text-sm text-center mb-6">{tab.content}</p>

                {tab.value === "timeline" && (
                  <div className="space-y-6">
                    {/* Create Post */}
                    <CreatePost onPostCreated={handlePostCreated} />

                    {/* Posts and Ads */}
                    {posts.map((post, index) => (
                      <div key={post.id} className="space-y-6">
                        <div className="flex justify-center">
                          <PostCard post={post} onLike={handleLike} onFollow={handleFollow} />
                        </div>

                        {/* Insert ads every 2 posts */}
                        {(index + 1) % 2 === 0 && (
                          <div className="flex justify-center">
                            {index === 1 ? (
                              <AdCardHorizontal
                                title="Dreamy Colorwave Gradient"
                                description="Uma mistura suave de rosas, roxos e azuis vibrantes para um toque mágico."
                                image="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=200&fit=crop"
                                buttonText="Explorar Mais"
                                className="max-w-md"
                              />
                            ) : (
                              <AdCardVertical
                                title="Ethereal Swirl Gradient"
                                description="Gradientes suaves e fluidos misturando vermelhos e azuis ricos em um redemoinho abstrato."
                                image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop"
                                buttonText="Explorar Mais"
                                className="max-w-md"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tab.value === "favorites" && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Seus posts favoritos aparecerão aqui.</p>
                  </div>
                )}

                {tab.value === "explore" && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Explore novos perfis e conexões.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </TabsContents>
        </Tabs>
      </div>
    </div>
  )
}
