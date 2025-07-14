"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer, MediaItem } from "./MediaViewer" // Importar MediaItem
import { ShareDialog } from "./ShareDialog"
import { ProfileViewer } from "./ProfileViewer"
import { useRouter } from "next/navigation"

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
          postId: commentId, // Para comentários, usar ID do comentário
          targetType: "comment"
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const isLiked = result.action === "liked"
        
        // Atualizar o comentário específico
        setLoadedComments(prev => prev.map(comment => 
          comment.id === commentId
            ? {
                ...comment,
                isLiked,
                likes: isLiked ? comment.likes + 1 : comment.likes - 1
              }
            : comment
        ))
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error)
    }
  }

  const getFollowButtonText = () => {
    switch (followState) {
      case "requested":
        return "Solicitado"
      case "following":
        return "Seguindo"
      default:
        return "Seguir"
    }
  }

  const getFollowButtonIcon = () => {
    switch (followState) {
      case "requested":
        return <Clock className="w-4 h-4 mr-1" />
      case "following":
        return <CheckCircle className="w-4 h-4 mr-1" />
      default:
        return <UserPlusIcon className="w-4 h-4 mr-1" />
    }
  }

  const handleLike = async () => {
    if (loadingLike) return
    
    setLoadingLike(true)
    try {
      console.log("[PostCard] Curtindo/descurtindo post:", post.id)
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "like", 
          postId: post.id 
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("[PostCard] Resultado do like:", result.action)
        
        // Chamar callback do componente pai
        onLike?.(post.id)
      } else {
        console.error("Erro ao curtir post")
      }
    } catch (error) {
      console.error("Erro ao curtir post:", error)
    } finally {
      setLoadingLike(false)
    }
  }

  const handleSave = async () => {
    if (loadingSave) return
    
    setLoadingSave(true)
    try {
      console.log("[PostCard] Salvando/removendo post:", post.id)
      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("[PostCard] Resultado do save:", result.action)
        
        // Chamar callback do componente pai
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
    onFollow?.(post.id, post.user.isPrivate)
  }

  const handleComment = () => {
    console.log("[PostCard] Abrindo comentários do post:", post.id)
    setCommentsOpen(true)
    fetchComments(post.id.toString())
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
    router.push(`/profile/${username}`)
  }

  return (
    <Card className="max-w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <CardHeader className="flex flex-row items-center justify-between gap-2 xs:gap-3 p-3 xs:p-4">
        <div className="flex items-center gap-2 xs:gap-3">
          <div className="relative cursor-pointer" onClick={handleViewProfile}>
            <Avatar className="ring-2 ring-transparent group-hover:ring-pink-500 transition-all duration-200">
              <AvatarImage src={post.user?.avatar || "/placeholder.svg"} alt={post.user?.name || "Usuário"} />
              <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {(post.user?.name || "Usuário").split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {post.user?.verified && (
              <span className="absolute -end-1.5 -top-1.5">
                <BadgeCheckIcon className="size-5 fill-sky-500 text-white dark:text-gray-900" />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle 
              className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
              onClick={handleViewProfile}
            >
              {post.user?.name || "Usuário"}
              {post.user?.premium && (
                <Badge
                  variant="outline"
                  className="border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-400 text-xs font-bold"
                >
                  Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-1 xs:gap-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>{post.user?.username || "@usuario"}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{post.timestamp}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {post.user?.location || "Localização não informada"}
              </span>
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1.5 xs:gap-2">
          {currentUser.id !== post.user?.username && (
            <Button
              variant={followState === "following" ? "secondary" : "outline"}
              size="sm"
              onClick={handleFollow}
              className={cn(
                "transition-all duration-200 text-xs",
                "border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
                followState === "requested" && "bg-yellow-100/10 text-yellow-600 dark:text-yellow-400 border-yellow-300/50 dark:border-yellow-400/30 hover:bg-yellow-100/20",
                followState === "following" && "bg-green-100/10 text-green-600 dark:text-green-400 border-green-300/50 dark:border-green-400/30 hover:bg-green-100/20",
              )}
            >
              {getFollowButtonIcon()}
              {getFollowButtonText()}
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Toggle menu" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <EllipsisIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 xs:px-4 pb-3 xs:pb-4 space-y-3 xs:space-y-4 text-xs xs:text-sm">
        <p className="leading-relaxed text-gray-800 dark:text-gray-300">{post.content}</p>
        
        {/* Mídia */}
        {post.images && post.images.length > 0 && (
          <Carousel className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <CarouselContent>
              {post.images.map((img, index) => (
                <CarouselItem key={index} onClick={() => handleViewImage(index)} className="cursor-pointer">
                  <img src={img} alt={`Post media ${index + 1}`} className="w-full h-auto object-cover max-h-96" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {post.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-black/30 text-white hover:bg-black/50 border-none" />
                <CarouselNext className="right-2 bg-black/30 text-white hover:bg-black/50 border-none" />
              </>
            )}
          </Carousel>
        )}
        {post.video && (
          <div className="relative rounded-lg overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700" onClick={handleViewVideo}>
            <img src={post.video.replace('.mp4', '.jpg')} alt="Video thumbnail" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-12 h-12 text-white/80" />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 xs:p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            disabled={loadingLike}
            className="text-gray-500 dark:text-gray-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <Heart className={cn("w-4 h-4 mr-1 xs:mr-1.5", post.liked && "fill-red-500 text-red-500")} />
            <span className="text-xs">{post.likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleComment}
            disabled={loadingComments}
            className="text-gray-500 dark:text-gray-400 hover:bg-sky-100/50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <MessageCircleIcon className="w-4 h-4 mr-1 xs:mr-1.5" />
            <span className="text-xs">{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-500 dark:text-gray-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400">
            <Share2 className="w-4 h-4 mr-1 xs:mr-1.5" />
            <span className="hidden sm:inline text-xs">Compartilhar</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave}
          disabled={loadingSave}
          className="text-gray-500 dark:text-gray-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <Save className={cn("w-4 h-4", post.saved && "fill-amber-400 text-amber-500")} />
          <span className="hidden sm:inline text-xs ml-1 xs:ml-1.5">
            {loadingSave ? "..." : "Salvar"}
          </span>
        </Button>
      </CardFooter>

      {/* Dialogs Corrigidos */}
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
          comments={loadedComments} // ✅ Usar comentários carregados da API
          onAddComment={handleAddComment} // ✅ Usar função real
          onLikeComment={handleLikeComment} // ✅ Usar função real
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
  )
}