"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Users, ImageIcon, Video } from "lucide-react"
import { toast } from "sonner"
import Compressor from "compressorjs"

interface CreatePostProps {
  onPostCreated?: (post: any) => void
  currentUser?: any
  profile?: any
  loading?: boolean
}

export default function CreatePost(props: CreatePostProps) {
  const { onPostCreated, currentUser, profile, loading } = props
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"public" | "friends_only">("public")
  const [internalLoading, setInternalLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)

  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  // Imagens limitadas a 10MB em todos os planos
  const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
  // Vídeos podem ter regras diferentes por plano (mantido original)
  const getMaxVideoSize = (plano: string) => plano === 'gold' ? 25 * 1024 * 1024 : 50 * 1024 * 1024;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => ['image/jpeg', 'image/png'].includes(file.type))
    const userPlan = profile?.plano || 'free'
    const maxImages = userPlan === 'gold' ? 5 : 10

    if (userPlan === 'free') {
      toast.error("Upload de imagens disponível apenas para planos Open Ouro e Open Diamante")
      return
    }

    for (const file of imageFiles) {
      if (file.size > IMAGE_MAX_SIZE) {
        toast.error(`Imagem muito grande. Máximo 10MB por arquivo.`)
        return
      }
    }

    if (images.length + imageFiles.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitido para seu plano`)
      return
    }

    // Comprimir imagens antes de adicionar
    const compressedImages: File[] = []
    let processedCount = 0

    imageFiles.forEach((file, index) => {
      new Compressor(file, {
        quality: 0.6, // Qualidade de compressão (0.6 é um bom equilíbrio)
        maxWidth: 1920, // Resolução máxima para imagens
        maxHeight: 1920,
        mimeType: 'image/jpeg', // Converter para JPEG
        success(result: File) {
          compressedImages[index] = result
          processedCount++
          if (processedCount === imageFiles.length) {
            setImages(prev => [...prev, ...compressedImages])
          }
        },
        error(err) {
          toast.error(`Erro ao comprimir imagem ${file.name}: ${err.message}`)
        },
      })
    })
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const userPlan = profile?.plano || 'free'
    const maxSize = getMaxVideoSize(userPlan)

    if (!file) return
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de vídeo não permitido. Apenas MP4.")
      return
    }
    if (userPlan === 'free') {
      toast.error("Upload de vídeos disponível apenas para planos Open Ouro e Open Diamante")
      return
    }
    if (file.size > maxSize) {
      toast.error(`Vídeo muito grande. Máximo ${userPlan === 'gold' ? '25MB' : '50MB'} para seu plano`)
      return
    }

    // Validação adicional de duração do vídeo (máximo 60 segundos)
    const videoElement = document.createElement('video')
    videoElement.src = URL.createObjectURL(file)
    videoElement.onloadedmetadata = () => {
      if (videoElement.duration > 60) {
        toast.error("Vídeos devem ter no máximo 60 segundos")
        URL.revokeObjectURL(videoElement.src)
        return
      }
      setVideo(file)
      URL.revokeObjectURL(videoElement.src)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setVideo(null)
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && images.length === 0 && !video) {
      toast.error("Por favor, escreva algo ou adicione mídia para postar")
      return
    }

    if (content.length > 2000) {
      toast.error("Post muito longo (máximo 2000 caracteres)")
      return
    }

    if (!currentUser) {
      toast.error("Você precisa estar logado para criar posts")
      return
    }

    setInternalLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('visibility', visibility)

      images.forEach((image) => {
        formData.append('images', image)
      })

      if (video) {
        formData.append('video', video)
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao criar post")
        setInternalLoading(false)
        return
      }
      const result = await response.json()
      toast.success("Post criado com sucesso!")
      setContent("")
      setImages([])
      setVideo(null)
      if (onPostCreated) onPostCreated(result)
    } catch (error) {
      toast.error("Erro ao criar post. Tente novamente.")
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Criar Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <Textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={2000}
          />

          {(images.length > 0 || video) && (
            <div className="space-y-2">
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {video && (
                <div className="relative">
                  <video
                    src={URL.createObjectURL(video)}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={removeVideo}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          )}

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
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </label>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button type="button" variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{content.length}/2000</span>
              <Button type="submit" disabled={!!loading || internalLoading || (!content.trim() && images.length === 0 && !video)} size="sm">
                {(!!loading || internalLoading) ? "Postando..." : "Postar"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}