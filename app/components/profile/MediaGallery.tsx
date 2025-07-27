"use client"

import React, { useState } from 'react'
import { Image, Video, Play, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'

interface MediaPost {
  id: string
  media_urls: string[]
  media_types: string[]
  created_at: string
}

interface MediaGalleryProps {
  mediaPosts: MediaPost[]
  canViewPrivateContent: boolean
}

export default function MediaGallery({ mediaPosts, canViewPrivateContent }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string
    type: string
    postId: string
  } | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)

  const allMedia = mediaPosts.flatMap(post => 
    post.media_urls.map((url, index) => ({
      url,
      type: post.media_types[index],
      postId: post.id,
      created_at: post.created_at
    }))
  )

  const handleMediaClick = (media: typeof allMedia[0]) => {
    const index = allMedia.findIndex(m => m.url === media.url)
    setCurrentIndex(index)
    setSelectedMedia(media)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setSelectedMedia(allMedia[newIndex])
    }
  }

  const handleNext = () => {
    if (currentIndex < allMedia.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setSelectedMedia(allMedia[newIndex])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setSelectedMedia(null)
  }

  if (!canViewPrivateContent && mediaPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">Conteúdo privado</p>
        <p className="text-gray-400 text-xs mt-1">Siga este perfil para ver as mídias</p>
      </div>
    )
  }

  if (allMedia.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">Nenhuma mídia ainda</p>
        <p className="text-gray-400 text-xs mt-1">As fotos e vídeos aparecerão aqui</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {allMedia.slice(0, 12).map((media, index) => (
          <Card 
            key={`${media.postId}-${index}`}
            className="aspect-square cursor-pointer hover:opacity-75 transition-opacity relative overflow-hidden"
            onClick={() => handleMediaClick(media)}
          >
            <CardContent className="p-0 h-full">
              {media.type?.startsWith('image/') ? (
                <img
                  src={media.url}
                  alt="Post media"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    className="w-full h-full object-cover"
                    src={media.url}
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allMedia.length > 12 && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            Ver mais ({allMedia.length - 12}+)
          </Button>
        </div>
      )}

      {/* Modal de Visualização */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Botão Fechar */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Navegação */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={handleNext}
                  disabled={currentIndex === allMedia.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Contador */}
            {allMedia.length > 1 && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {currentIndex + 1} de {allMedia.length}
                </Badge>
              </div>
            )}

            {/* Mídia */}
            <div 
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type?.startsWith('image/') ? (
                <img
                  src={selectedMedia.url}
                  alt="Post media"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-[80vh] object-contain"
                  autoPlay
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}