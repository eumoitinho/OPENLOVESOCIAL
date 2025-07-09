"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Users, ImageIcon, Video } from "lucide-react"
import { toast } from "sonner"

interface CreatePostProps {
  onPostCreated?: (post: any) => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"public" | "friends_only">("public")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Por favor, escreva algo para postar")
      return
    }

    if (content.length > 2000) {
      toast.error("Post muito longo (máximo 2000 caracteres)")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          visibility,
        }),
      })

      if (response.ok) {
        const newPost = await response.json()
        setContent("")
        setVisibility("public")
        toast.success("Post criado com sucesso!")

        if (onPostCreated) {
          onPostCreated(newPost)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao criar post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Erro ao criar post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Criar Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={2000}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={visibility} onValueChange={(value: "public" | "friends_only") => setVisibility(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Público</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends_only">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Amigos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" disabled>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled>
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{content.length}/2000</span>
              <Button type="submit" disabled={loading || !content.trim()} size="sm">
                {loading ? "Postando..." : "Postar"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
