"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardBody, Button } from "@heroui/react"
import { Home } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

export default function Timeline() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/timeline")
      if (res.ok) {
        const data = await res.json()
        setPosts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Timeline</h1>
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center text-gray-500">Nenhum post encontrado</p>
              </CardBody>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardBody>
                  <div className="flex gap-3">
                    <Avatar
                      src={post.author?.avatar || "/placeholder.svg"}
                      name={post.author?.name}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{post.author?.name || "Usuário"}</h3>
                        <span className="text-sm text-gray-500">@{post.author?.username || "usuario"}</span>
                      </div>
                      <p className="mt-2">{post.content}</p>
                      <div className="flex gap-4 mt-4">
                        <Button size="sm" variant="light">
                          Curtir ({post.likes_count || 0})
                        </Button>
                        <Button size="sm" variant="light">
                          Comentar ({post.comments_count || 0})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
