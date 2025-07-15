"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarBadge } from "@/app/components/ui/avatar-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  UserPlus,
  MapPin,
  Calendar,
  Eye,
  X,
  Download,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface RecommendedPostCardProps {
  post: any
  onLike: (postId: number) => void
  onSave: (postId: number) => void
  onFollow: (postId: number, isPrivate: boolean) => void
  onComment: (postId: number) => void
  onShare: (postId: number) => void
  onViewMedia: (postId: number, mediaIndex: number) => void
  onViewProfile?: (username: string) => void
  currentUser: any
}

export default function RecommendedPostCard({
  post,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
  onViewMedia,
  onViewProfile,
  currentUser
}: RecommendedPostCardProps) {
  const { user } = useAuth()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setImageModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Agora mesmo"
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 48) return "Ontem"
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const addWatermark = (imageUrl: string, username: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(imageUrl)
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Desenhar imagem original
        ctx.drawImage(img, 0, 0)

        // Adicionar marca d'água
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.font = 'bold 24px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const watermarkText = `@${username}`
        const dateText = new Date().toLocaleString('pt-BR')
        
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2 - 20)
        ctx.fillText(dateText, canvas.width / 2, canvas.height / 2 + 20)

        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => resolve(imageUrl)
      img.src = imageUrl
    })
  }

  const handlePrintProtection = (e: React.MouseEvent) => {
    e.preventDefault()
    // Proteção contra print - desabilitar menu de contexto
    return false
  }

  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 protected-content">
        <CardHeader className="pb-3 post-card-header">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AvatarBadge
                src={post.user?.avatar || "/placeholder-user.jpg"}
                alt={post.user?.name}
                fallback={post.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                size="lg"
                isVerified={post.user?.verified}
                isPremium={post.user?.premium}
                createdAt={post.timestamp}
                onClick={() => onViewProfile?.(post.user?.username?.replace('@', '') || 'usuario')}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span 
                    className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    onClick={() => onViewProfile?.(post.user?.username?.replace('@', '') || 'usuario')}
                  >
                    {post.user?.name || 'Usuário'}
                  </span>
                  {post.user?.verified && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>@{post.user?.username || 'usuario'}</span>
                  <span>•</span>
                  <span>{formatDate(post.timestamp)}</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{post.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFollow(post.id, post.user?.isPrivate || false)}
                className="text-xs px-3 py-1 h-8"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Seguir
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 post-card-content">
          {/* Conteúdo do Post */}
          <div className="space-y-3">
            <p className="text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed">
              {post.content}
            </p>

            {/* Mídia */}
            {post.images && post.images.length > 0 && (
              <div className="space-y-2">
                {post.images.length === 1 ? (
                  <div 
                    className="relative cursor-pointer group overflow-hidden rounded-lg"
                    onClick={() => handleImageClick(0)}
                    onContextMenu={handlePrintProtection}
                  >
                    <img
                      src={post.images[0]}
                      alt="Post content"
                                             className="w-full h-auto max-h-96 object-cover transition-transform duration-300 group-hover:scale-105 protected-image"
                       draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.slice(0, 4).map((image: string, index: number) => (
                      <div
                        key={index}
                        className={cn(
                          "relative cursor-pointer group overflow-hidden rounded-lg",
                          index === 3 && post.images.length > 4 && "relative"
                        )}
                        onClick={() => handleImageClick(index)}
                        onContextMenu={handlePrintProtection}
                      >
                        <img
                          src={image}
                          alt={`Post content ${index + 1}`}
                                                   className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105 protected-image"
                         draggable={false}
                        />
                        {index === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              +{post.images.length - 4}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vídeo */}
            {post.video && (
              <div className="relative cursor-pointer group overflow-hidden rounded-lg">
                <video
                  src={post.video}
                  className="w-full h-auto max-h-96 object-cover"
                  controls
                  onContextMenu={handlePrintProtection}
                />
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 post-card-actions">
            <div className="flex items-center gap-4">
              <span>{post.likes || 0} curtidas</span>
              <span>{post.comments || 0} comentários</span>
              <span>{post.shares || 0} compartilhamentos</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Protegido</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 h-10 transition-colors",
                  post.liked && "text-red-500 hover:text-red-600"
                )}
              >
                <Heart className={cn("w-5 h-5", post.liked && "fill-current")} />
                <span className="text-xs sm:text-sm">Curtir</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComment(post.id)}
                className="flex items-center gap-2 px-3 py-2 h-10"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs sm:text-sm">Comentar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(post.id)}
                className="flex items-center gap-2 px-3 py-2 h-10"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs sm:text-sm">Compartilhar</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave(post.id)}
              className={cn(
                "p-2 h-10 w-10 transition-colors",
                post.saved && "text-blue-500 hover:text-blue-600"
              )}
            >
              <Bookmark className={cn("w-5 h-5", post.saved && "fill-current")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Visualização de Imagem */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Visualizando imagem
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Protegido
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageModalOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="relative flex-1 overflow-hidden">
            {post.images && post.images[selectedImageIndex] && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                                 <img
                   src={post.images[selectedImageIndex]}
                   alt={`Post content ${selectedImageIndex + 1}`}
                   className="max-w-full max-h-full object-contain protected-image"
                   draggable={false}
                   onContextMenu={handlePrintProtection}
                 />
                {/* Marca d'água sobreposta */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
                    <div className="font-semibold">@{user?.user_metadata?.username || 'usuario'}</div>
                    <div className="text-xs opacity-80">
                      {new Date().toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 