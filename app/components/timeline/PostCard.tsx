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
  Music,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer, MediaItem } from "./MediaViewer"
import { ShareDialog } from "./ShareDialog"
import { ProfileViewer } from "./ProfileViewer"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import PlanBadge from "@/components/plan-limits/PlanBadge"

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
  audio: string | null
  poll: {
    id: string
    question: string
    options: Array<{
      id: string
      text: string
      votes: number
      percentage?: number
    }>
    totalVotes: number
    userVote?: string
    expiresAt?: string
  } | null
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
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Adicionar novo comentário à lista
        const newComment = result.data
        
        setLoadedComments(prev => [...prev, newComment])
        console.log("[PostCard] Comentário adicionado com sucesso")
        
        // Atualizar contador de comentários localmente
        post.comments = (post.comments || 0) + 1
        
        // Criar notificação para o autor do post
        if (post.user?.username) {
          try {
            await fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create",
                type: "comment",
                title: "Comentou em seu post",
                content: `@${currentUser.username} comentou: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                targetUserId: post.user.id || post.user.username,
                relatedPostId: post.id,
                relatedCommentId: newComment.id
              })
            })
          } catch (notifError) {
            console.warn("Erro ao criar notificação:", notifError)
          }
        }
        
        // Chamar callback do componente pai se existir
        onComment?.(post.id)
      } else {
        const error = await response.json()
        console.error("Erro ao adicionar comentário:", error)
        throw new Error(error.error || "Erro ao adicionar comentário")
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
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("[PostCard] Comentário curtido com sucesso")
        
        // Atualizar estado local do comentário
        setLoadedComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, isLiked: result.isLiked, likes: result.likes }
              : comment
          )
        )
      } else {
        const error = await response.json()
        console.error("Erro ao curtir comentário:", error)
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
        const result = await response.json()
        console.log("[PostCard] Like processado com sucesso")
        
        // Atualizar contador com dados do servidor
        if (result.likesCount !== undefined) {
          setLocalLikesCount(result.likesCount)
        }
        
        // Criar notificação se curtiu (não descurtiu)
        if (result.action === "liked" && post.user?.username) {
          try {
            await fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create",
                type: "like",
                title: "Curtiu seu post",
                content: `@${currentUser.username} curtiu seu post`,
                targetUserId: post.user.id || post.user.username,
                relatedPostId: post.id
              })
            })
          } catch (notifError) {
            console.warn("Erro ao criar notificação:", notifError)
          }
        }
        
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

  const handleFollow = async () => {
    if (!post.user?.username) return
    
    try {
      // Buscar o ID do usuário pelo username
      const userResponse = await fetch(`/api/users/by-username/${post.user.username}`)
      if (!userResponse.ok) {
        console.error("Erro ao buscar usuário")
        return
      }
      
      const userData = await userResponse.json()
      const userId = userData.id
      
      // Seguir/deixar de seguir
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: userId })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`[PostCard] ${result.following ? 'Seguindo' : 'Deixou de seguir'} usuário`)
        
        // Criar notificação se começou a seguir
        if (result.following && post.user?.username) {
          try {
            await fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create",
                type: "follow",
                title: "Novo seguidor",
                content: `@${currentUser.username} começou a seguir você`,
                targetUserId: userId,
                relatedUserId: currentUser.id
              })
            })
          } catch (notifError) {
            console.warn("Erro ao criar notificação:", notifError)
          }
        }
        
        onFollow?.(post.id, post.user?.isPrivate || false)
      } else {
        console.error("Erro ao processar follow")
      }
    } catch (error) {
      console.error("Erro ao seguir usuário:", error)
    }
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

  const handleVotePoll = async (optionId: string) => {
    if (!post.poll || post.poll.userVote) return
    
    try {
      const response = await fetch(`/api/posts/${post.id}/poll/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("[PostCard] Voto registrado com sucesso")
        
        // Atualizar o estado local do poll
        if (post.poll) {
          post.poll.userVote = optionId
          post.poll.totalVotes += 1
          post.poll.options = post.poll.options.map(opt => 
            opt.id === optionId 
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          )
        }
      } else {
        console.error("Erro ao votar na enquete")
      }
    } catch (error) {
      console.error("Erro ao votar na enquete:", error)
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
                
              />
            </motion.div>
            
            <div className="flex flex-col gap-1">
              <CardTitle 
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                onClick={handleViewProfile}
              >
                {post.user?.name || "Usuário"}
                <PlanBadge 
                  plan={post.user?.premium ? 'diamante' : 'free'} 
                  verified={post.user?.verified}
                  variant="compact"
                />
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-xs">{`@${post.user?.username || "@usuario"}`}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-gray-400 text-xs">
                  {post.timestamp
                    ? new Date(post.timestamp).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                      }).replace(",", "")
                    : ""}
                </span>
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
          
          {/* Áudio */}
          {post.audio && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-md">
                    <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <audio 
                    controls 
                    className="flex-1"
                    style={{ filter: 'hue-rotate(290deg)' }}
                  >
                    <source src={post.audio} type="audio/mpeg" />
                    <source src={post.audio} type="audio/ogg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Enquete */}
          {post.poll && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{post.poll.question}</h4>
                </div>
                
                <div className="space-y-2">
                  {post.poll.options.map((option) => {
                    const percentage = post.poll!.totalVotes > 0 
                      ? Math.round((option.votes / post.poll!.totalVotes) * 100) 
                      : 0
                    const isVoted = post.poll!.userVote === option.id
                    
                    return (
                      <div 
                        key={option.id} 
                        className="relative cursor-pointer group"
                        onClick={() => handleVotePoll(option.id)}
                      >
                        <div className="relative bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500">
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {option.text}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {percentage}%
                              </span>
                              {isVoted && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'voto' : 'votos'}
                  </span>
                  {post.poll.expiresAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expira em {new Date(post.poll.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
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
            media={[
              ...(post.images || []).map((url, index) => ({ 
                id: `${post.id}-img-${index}`, 
                type: 'image' as const, 
                url 
              })),
              ...(post.video ? [{ 
                id: `${post.id}-video`, 
                type: 'video' as const, 
                url: post.video 
              }] : []),
              ...(post.audio ? [{ 
                id: `${post.id}-audio`, 
                type: 'audio' as const, 
                url: post.audio 
              }] : [])
            ]}
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