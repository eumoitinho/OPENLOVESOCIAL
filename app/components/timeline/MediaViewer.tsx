"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Heart,
  MessageCircle,
  BadgeCheckIcon,
  Clock,
  Music,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface MediaItem {
  id: string
  type: "image" | "video" | "audio"
  url: string
  thumbnail?: string
}

interface MediaViewerProps {
  isOpen: boolean
  onClose: () => void
  media: MediaItem[]
  initialIndex?: number
  postAuthor: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
  }
  postContent: string
  postTimestamp: string
  currentUser: {
    name: string
    username: string
  }
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  isLiked?: boolean
  likes?: number
  comments?: number
}

export function MediaViewer({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  postAuthor,
  postContent,
  postTimestamp,
  currentUser,
  onLike,
  onComment,
  onShare,
  isLiked = false,
  likes = 0,
  comments = 0,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Garantir que o índice inicial seja válido
    if (!media || media.length === 0) return 0
    return Math.min(initialIndex, media.length - 1)
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Verificar se há mídia disponível
  if (!media || media.length === 0) {
    return null
  }

  const currentMedia = media[currentIndex]

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTimestamp = (timestamp: string) => {
    // Implementar lógica de formatação de tempo
    return timestamp
  }

  const addWatermark = (imageUrl: string, text: string) => {
    // Em uma implementação real, isso seria feito no servidor
    // Por enquanto, vamos usar CSS para simular a marca d'água
    return imageUrl
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden bg-black flex items-center justify-center sm:rounded-2xl rounded-none">
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={postAuthor.avatar} alt={postAuthor.name} />
                  <AvatarFallback>{postAuthor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{postAuthor.name}</span>
                    {postAuthor.verified && (
                      <BadgeCheckIcon className="w-4 h-4 fill-sky-500 text-white" />
                    )}
                    {postAuthor.premium && (
                      <Badge variant="outline" className="text-xs border-pink-400 text-pink-400">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>{postAuthor.username}</span>
                    <span>•</span>
                    <span>{formatTimestamp(postTimestamp)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Media Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {currentMedia && currentMedia.type === "image" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={addWatermark(currentMedia.url, currentUser.name)}
                  alt="Post content"
                  className="w-full h-full max-h-[70vh] object-contain object-center rounded-none sm:rounded-2xl"
                  style={{ maxHeight: '70vh', width: '100%', height: '100%' }}
                />
                {/* Watermark */}
                <div className="absolute bottom-4 right-4 text-white/70 text-sm font-medium bg-black/40 px-2 py-1 rounded">
                  Visualizado por {currentUser.name}
                </div>
              </div>
            ) : currentMedia && currentMedia.type === "video" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  src={currentMedia.url}
                  poster={currentMedia.thumbnail}
                  className="w-full h-full max-h-[70vh] object-contain object-center rounded-none sm:rounded-2xl"
                  style={{ maxHeight: '70vh', width: '100%', height: '100%' }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  muted={isMuted}
                  controls
                />
                {/* Video Controls */}
                {showControls && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  </div>
                )}
                {/* Watermark */}
                <div className="absolute bottom-4 right-4 text-white/70 text-sm font-medium bg-black/40 px-2 py-1 rounded">
                  Visualizado por {currentUser.name}
                </div>
              </div>
            ) : currentMedia && currentMedia.type === "audio" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl max-w-md">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-white/20 rounded-full p-4">
                      <Music className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-white font-semibold text-lg mb-2">Áudio</h3>
                    <p className="text-white/80 text-sm">Clique para reproduzir o áudio</p>
                  </div>
                  <audio
                    src={currentMedia.url}
                    controls
                    className="w-full bg-white/10 rounded-lg"
                    style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                  />
                  {/* Watermark */}
                  <div className="absolute bottom-4 right-4 text-white/70 text-sm font-medium bg-black/40 px-2 py-1 rounded">
                    Visualizado por {currentUser.name}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Counter */}
            {media.length > 1 && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLike}
                  className={cn(
                    "text-white hover:bg-white/20",
                    isLiked && "text-orange-500"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isLiked && "fill-orange-500")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onComment}
                  className="text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-white">
                <span className="text-sm">{likes} curtidas</span>
                <span className="text-sm">{comments} comentários</span>
              </div>
            </div>
          </div>

          {/* Post Content Overlay */}
          {postContent && (
            <div className="absolute top-20 left-4 right-4 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
                <p className="text-sm">{postContent}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 