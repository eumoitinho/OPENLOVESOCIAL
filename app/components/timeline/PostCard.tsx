"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { AvatarBadge } from "@/app/components/ui/avatar-badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  BadgeCheckIcon,
  EllipsisIcon,
  MessageCircleIcon,
  SendIcon,
  UserPlusIcon,
  MapPin,
  Flame,
  Save,
  Clock,
  CheckCircle,
  Play,
  Share2,
  Calendar,
  Users,
  ImageIcon,
  Video,
  Heart,
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer, MediaItem } from "./MediaViewer"
import { ShareDialog } from "./ShareDialog"
import { ProfileViewer } from "./ProfileViewer"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface PostUser {
  name: string
  username: string
  avatar: string
  verified: boolean
  premium: boolean
  location: string
  relationshipType: string
  isPrivate: boolean
}

interface PostEvent {
  title: string
  date: string
  location: string
  attendees: number
  image: string
}

interface Post {
  id: number
  user: PostUser
  content: string
  images: string[] | null
  video: string | null
  event: PostEvent | null
  likes: number
  likesCount: number
  comments: number
  shares: number
  reposts: number
  liked: boolean
  saved: boolean
  timestamp: string
}

interface PostCardProps {
  post: Post
  onLike?: (postId: number) => void
  onSave?: (postId: number) => void
  onFollow?: (postId: number, isPrivate: boolean) => void
  onComment?: (postId: number) => void
  onShare?: (postId: number) => void
  onViewMedia?: (postId: number, mediaIndex: number) => void
  onViewProfile?: (username: string) => void
  followState?: "follow" | "requested" | "following"
  currentUser?: {
    name: string
    username: string
    avatar: string
    id?: string
  }
}

export default function PostCard({ 
  post, 
  onLike, 
  onSave, 
  onFollow, 
  onComment,
  onShare,
  onViewMedia,
  onViewProfile,
  followState = "follow",
  currentUser = { name: "Usuário", username: "@usuario", avatar: "/placeholder.svg" }
}: PostCardProps) {
  // Estados básicos
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [profileViewerOpen, setProfileViewerOpen] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  
  // Estados para as correções
  const [loadedComments, setLoadedComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingLike, setLoadingLike] = useState(false)

  // Estado local para curtidas otimista
  const [localLiked, setLocalLiked] = useState(post.liked)
  const [localLikesCount, setLocalLikesCount] = useState(
    typeof post.likesCount === 'number' ? post.likesCount : post.likes
  )

  const router = useRouter()

  // Função para buscar comentários
  const fetchComments = async (postId: string) => {
    if (loadingComments) return
    
    setLoadingComments(true)
    try {
      console.log("[PostCard] Buscando comentários do post:", postId)
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const result = await response.json()
        setLoadedComments(result.data || [])
        console.log("[PostCard] Comentários carregados:", result.data?.length || 0)
      } else {
        console.error("Erro ao buscar comentários")
        setLoadedComments([])
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error)
      setLoadedComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  // Função para adicionar comentário
  const handleAddComment = async (content: string) => {
    try {
      console.log("[PostCard] Adicionando comentário:", content)
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "comment", 
          postId: post.id, 
          content 
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Adicionar novo comentário à lista
        const newComment = {
          id: result.data.id,
          content: result.data.content,
          timestamp: result.data.createdAt,
          likes: 0,
          isLiked: false,
          author: result.data.author
        }
        
        setLoadedComments(prev => [...prev, newComment])
        console.log("[PostCard] Comentário adicionado com sucesso")
        
        // Chamar callback do componente pai se existir
        onComment?.(post.id)
      } else {
        console.error("Erro ao adicionar comentário")
        throw new Error("Erro ao adicionar comentário")
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
      throw error
    }
  }

  // Função para curtir comentário
  const handleLikeComment = async (commentId: string) => {
    try {
      console.log("[PostCard] Curtindo comentário:", commentId)
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "like", 
          postId: commentId,
          targetType: "comment"
        })
      })
      
      if (response.ok) {
        console.log("[PostCard] Comentário curtido com sucesso")
        // Atualizar estado local do comentário
        setLoadedComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
              : comment
          )
        )
      } else {
        console.error("Erro ao curtir comentário")
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error)
    }
  }

  const getFollowButtonText = () => {
    switch (followState) {
      case "following":
        return "Seguindo"
      case "requested":
        return "Solicitado"
      default:
        return "Seguir"
    }
  }

  const getFollowButtonIcon = () => {
    switch (followState) {
      case "following":
        return <CheckCircle className="w-3 h-3" />
      case "requested":
        return <Clock className="w-3 h-3" />
      default:
        return <UserPlusIcon className="w-3 h-3" />
    }
  }

  const handleLike = async () => {
    if (loadingLike) return
    
    setLoadingLike(true)
    
    // Atualização otimista
    const newLiked = !localLiked
    const newCount = newLiked ? localLikesCount + 1 : localLikesCount - 1
    
    setLocalLiked(newLiked)
    setLocalLikesCount(newCount)
    
    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "like", 
          postId: post.id 
        })
      })
      
      if (response.ok) {
        console.log("[PostCard] Like processado com sucesso")
        onLike?.(post.id)
      } else {
        // Reverter em caso de erro
        setLocalLiked(!newLiked)
        setLocalLikesCount(newLiked ? newCount - 1 : newCount + 1)
        console.error("Erro ao processar like")
      }
    } catch (error) {
      // Reverter em caso de erro
      setLocalLiked(!newLiked)
      setLocalLikesCount(newLiked ? newCount - 1 : newCount + 1)
      console.error("Erro ao processar like:", error)
    } finally {
      setLoadingLike(false)
    }
  }

  const handleSave = async () => {
    if (loadingSave) return
    
    setLoadingSave(true)
    try {
      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      })
      
      if (response.ok) {
        console.log("[PostCard] Post salvo/removido com sucesso")
        onSave?.(post.id)
      } else {
        console.error("Erro ao salvar post")
      }
    } catch (error) {
      console.error("Erro ao salvar post:", error)
    } finally {
      setLoadingSave(false)
    }
  }

  const handleFollow = () => {
    onFollow?.(post.id, post.user?.isPrivate || false)
  }

  const handleComment = () => {
    fetchComments(post.id.toString())
    setCommentsOpen(true)
  }

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  const handleViewMedia = (index: number) => {
    setSelectedMediaIndex(index)
    setMediaViewerOpen(true)
  }

  const handleViewImage = (index: number) => {
    handleViewMedia(index)
  }

  const handleViewVideo = () => {
    handleViewMedia(0)
  }

  const handleViewProfile = () => {
    const username = post.user?.username?.replace('@','') || 'usuario'
    if (onViewProfile) {
      onViewProfile(username)
    } else {
      router.push(`/profile/${username}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
        {/* Header Moderno */}
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative cursor-pointer group/avatar" 
              onClick={handleViewProfile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <AvatarBadge
                src={post.user?.avatar || "/placeholder.svg"}
                alt={post.user?.name || "Usuário"}
                fallback={(post.user?.name || "Usuário").split(" ").map((n) => n[0]).join("")}
                size="lg"
                isVerified={post.user?.verified}
                isPremium={post.user?.premium}
                createdAt={post.timestamp}
                className="relative ring-2 ring-transparent group-hover/avatar:ring-pink-500 transition-all duration-300"
              />
            </motion.div>
            
            <div className="flex flex-col gap-1">
              <CardTitle 
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                onClick={handleViewProfile}
              >
                {post.user?.name || "Usuário"}
                {post.user?.premium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5">
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-xs">{post.user?.username || "@usuario"}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-gray-400 text-xs">{post.timestamp}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span className="hidden xs:inline text-xs">{post.user?.location || "Localização não informada"}</span>
                  <span className="xs:hidden text-xs">{post.user?.location?.split(',')[0] || "Localização"}</span>
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentUser.id !== post.user?.username && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={followState === "following" ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleFollow}
                  className={cn(
                    "transition-all duration-200 text-xs h-8 px-3 font-medium",
                    "border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
                    followState === "requested" && "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30",
                    followState === "following" && "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border-green-300 dark:border-green-400/30",
                  )}
                >
                  {getFollowButtonIcon()}
                  {getFollowButtonText()}
                </Button>
              </motion.div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Toggle menu" 
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Conteúdo */}
        <CardContent className="px-4 pb-3 space-y-4">
          <p className="leading-relaxed text-gray-800 dark:text-gray-200 text-xs sm:text-sm">{post.content}</p>
          
          {/* Mídia com Design Moderno */}
          {post.images && post.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <Carousel className="w-full rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CarouselContent>
                  {post.images.map((img, index) => (
                    <CarouselItem key={index} onClick={() => handleViewImage(index)} className="cursor-pointer">
                      <div className="relative group/media">
                        <img 
                          src={img} 
                          alt={`Post media ${index + 1}`} 
                          className="w-full h-auto object-cover max-h-96 transition-transform duration-300 group-hover/media:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/20 transition-colors duration-300"></div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {post.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-sm" />
                    <CarouselNext className="right-2 bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-sm" />
                  </>
                )}
              </Carousel>
            </motion.div>
          )}
          
          {post.video && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-xl overflow-hidden cursor-pointer border border-gray-200/50 dark:border-gray-700/50 shadow-lg group"
              onClick={handleViewVideo}
            >
              <img 
                src={post.video.replace('.mp4', '.jpg')} 
                alt="Video thumbnail" 
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors duration-300">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                >
                  <Play className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </CardContent>
        
        {/* Footer com Ações */}
        <CardFooter className="flex justify-between items-center p-4 pt-3 border-t border-gray-100/50 dark:border-gray-800/50">
          <div className="flex items-center gap-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                disabled={loadingLike}
                className={cn(
                  "text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 h-9 px-3 rounded-full transition-all duration-200",
                  localLiked && "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                )}
              >
                <motion.div
                  animate={localLiked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn("w-4 h-4 mr-2", localLiked && "fill-red-500")} />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium">{localLikesCount}</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleComment}
                disabled={loadingComments}
                className="text-gray-500 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 hover:text-sky-600 dark:hover:text-sky-400 h-9 px-3 rounded-full transition-all duration-200"
              >
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm font-medium">{post.comments}</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare} 
                className="text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 h-9 px-3 rounded-full transition-all duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">Compartilhar</span>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              disabled={loadingSave}
              className={cn(
                "text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 h-9 px-3 rounded-full transition-all duration-200",
                post.saved && "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
              )}
            >
              {post.saved ? (
                <BookmarkCheck className="w-4 h-4 mr-2 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline text-xs sm:text-sm font-medium">
                {loadingSave ? "..." : "Salvar"}
              </span>
            </Button>
          </motion.div>
        </CardFooter>

        {/* Dialogs */}
        {commentsOpen && (
          <CommentsDialog 
            isOpen={commentsOpen} 
            onClose={() => setCommentsOpen(false)} 
            postId={post.id.toString()} 
            postAuthor={{
              name: post.user?.name || "Usuário",
              username: post.user?.username || "@usuario", 
              avatar: post.user?.avatar || "/placeholder.svg",
              verified: post.user?.verified || false,
              premium: post.user?.premium || false
            }}
            postContent={post.content}
            comments={loadedComments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        )}
        
        {mediaViewerOpen && (
          <MediaViewer 
            isOpen={mediaViewerOpen} 
            onClose={() => setMediaViewerOpen(false)}
            media={(post.images || (post.video ? [post.video] : [])).map((url, index) => ({ 
              id: `${post.id}-${index}`, 
              type: url.endsWith('.mp4') ? 'video' : 'image', 
              url 
            }))}
            initialIndex={selectedMediaIndex} 
            postAuthor={post.user || { name: "Usuário", username: "@usuario", avatar: "/placeholder.svg" }}
            postContent={post.content}
            postTimestamp={post.timestamp}
            currentUser={currentUser}
            onLike={() => handleLike()}
            onComment={() => handleComment()}
            onShare={() => handleShare()}
            isLiked={post.liked}
            likes={post.likes}
            comments={post.comments}
          />
        )}
        
        {shareDialogOpen && (
          <ShareDialog 
            isOpen={shareDialogOpen} 
            onClose={() => setShareDialogOpen(false)} 
            postId={post.id.toString()}
            postContent={post.content}
            postAuthor={post.user || { name: "Usuário", username: "@usuario", avatar: "/placeholder.svg" }}
            postImages={post.images || undefined}
            postVideo={post.video || undefined}
            currentUser={currentUser}
            onCopyLink={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)}
          />
        )}
      </Card>
    </motion.div>
  )
}