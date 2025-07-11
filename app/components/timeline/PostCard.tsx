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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer } from "./MediaViewer"
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
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [profileViewerOpen, setProfileViewerOpen] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const router = useRouter()
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

  const handleLike = () => {
    onLike?.(post.id)
  }

  const handleSave = () => {
    onSave?.(post.id)
  }

  const handleFollow = () => {
    onFollow?.(post.id, post.user.isPrivate)
  }

  const handleComment = () => {
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
    router.push(`/profile/${post.user.username.replace('@','')}`)
  }

  // Remover qualquer array de exemplo, valores fixos ou mocks de comentários, curtidas, etc.
  // Garantir que todos os dados exibidos venham de props.post
  const comments = Array.isArray(post.comments)
    ? post.comments.map((comment: any) => ({
        id: comment.id,
        author: {
          name: comment.author.name,
          username: comment.author.username,
          avatar: comment.author.avatar,
          verified: comment.author.verified,
          premium: comment.author.premium,
        },
        content: comment.content,
        timestamp: comment.timestamp,
        likes: comment.likes,
        isLiked: comment.liked,
      }))
    : []

  return (
    <Card className="max-w-full border-gray-200 dark:border-white/10">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar 
              className="ring-ring ring-2 cursor-pointer hover:ring-pink-500 transition-all duration-200"
              onClick={handleViewProfile}
            >
              <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
              <AvatarFallback className="text-xs">
                {post.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {post.user.verified && (
              <span className="absolute -end-1.5 -top-1.5">
                <BadgeCheckIcon className="text-background size-5 fill-sky-500" />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle 
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-pink-600 transition-colors duration-200"
              onClick={handleViewProfile}
            >
              {post.user.name}
              {post.user.premium && (
                <Badge
                  variant="outline"
                  className="border-pink-600 dark:border-pink-400 text-pink-600 dark:text-pink-400 text-xs"
                >
                  Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <span>{post.user.username}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span>{post.user.location}</span>
              <span>•</span>
              <span className="text-purple-600 font-medium">{post.user.relationshipType}</span>
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={followState === "following" ? "secondary" : "outline"}
            size="sm"
            onClick={handleFollow}
            className={cn(
              "transition-all duration-200",
              followState === "requested" && "bg-yellow-100 text-yellow-700 border-yellow-300",
              followState === "following" && "bg-green-100 text-green-700 border-green-300",
            )}
          >
            {getFollowButtonIcon()}
            {getFollowButtonText()}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Toggle menu">
            <EllipsisIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="leading-relaxed">{post.content}</p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="w-full">
            {post.images.length === 1 ? (
              <div
                className="relative cursor-pointer"
                onClick={() => handleViewImage(0)}
              >
                <img
                  src={post.images[0] || "/placeholder.svg"}
                  alt="Post content"
                  className="aspect-video w-full rounded-md object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  Foto
                </div>
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => handleViewImage(index)}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Post content ${index + 1}`}
                          className="aspect-video w-full rounded-md object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          <ImageIcon className="w-3 h-3 inline mr-1" />
                          Foto {index + 1}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}

        {/* Video */}
        {post.video && (
          <div 
            className="relative w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer"
            onClick={handleViewVideo}
          >
            <img
              src={post.video || "/placeholder.svg"}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button size="lg" className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                <Play className="w-6 h-6 text-white" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              <Video className="w-3 h-3 inline mr-1" />
              Vídeo
            </div>
          </div>
        )}

        {/* Event */}
        {post.event && (
          <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={post.event.image || "/placeholder.svg"}
                  alt={post.event.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">{post.event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-purple-700 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <MapPin className="w-4 h-4" />
                    <span>{post.event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Users className="w-4 h-4" />
                    <span>{post.event.attendees} participantes</span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Participar do Evento
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn("transition-all duration-200 hover:scale-110", post.liked && "text-orange-500")}
        >
          <Flame className={cn("size-4", post.liked && "fill-orange-500 stroke-orange-500")} />
          {post.likes}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleComment}
          className="transition-all duration-200 hover:scale-110 hover:text-blue-500"
        >
          <MessageCircleIcon className="size-4" />
          {post.comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={cn("transition-all duration-200 hover:scale-110", post.saved && "text-green-500")}
        >
          <Save className={cn("size-4", post.saved && "fill-green-500 stroke-green-500")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="transition-all duration-200 hover:scale-110 hover:text-purple-500"
        >
          <SendIcon className="size-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="ml-auto transition-all duration-200 hover:scale-110"
        >
          <Share2 className="size-4" />
        </Button>
      </CardFooter>

      {/* Dialogs */}
      <CommentsDialog
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id.toString()}
        postContent={post.content}
        postAuthor={post.user}
        comments={comments}
        onAddComment={(content) => {
          console.log("Novo comentário:", content)
          // Implementar lógica de adicionar comentário
        }}
        onLikeComment={(commentId) => {
          console.log("Curtir comentário:", commentId)
          // Implementar lógica de curtir comentário
        }}
      />

      <MediaViewer
        isOpen={mediaViewerOpen}
        onClose={() => setMediaViewerOpen(false)}
        media={(() => {
          const mediaArray = []
          
          // Adicionar imagens
          if (post.images && post.images.length > 0) {
            post.images.forEach((image, index) => {
              mediaArray.push({
                id: `image-${index}`,
                type: "image" as const,
                url: image,
              })
            })
          }
          
          // Adicionar vídeo
          if (post.video) {
            mediaArray.push({
              id: "video-0",
              type: "video" as const,
              url: post.video,
              thumbnail: post.video,
            })
          }
          
          return mediaArray
        })()}
        initialIndex={selectedMediaIndex}
        postAuthor={post.user}
        postContent={post.content}
        postTimestamp={post.timestamp}
        currentUser={currentUser}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        isLiked={post.liked}
        likes={post.likes}
        comments={post.comments}
      />

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        postId={post.id.toString()}
        postContent={post.content}
        postAuthor={post.user}
        postImages={post.images || undefined}
        postVideo={post.video || undefined}
        currentUser={currentUser}
        onShareToDirect={(userId, message) => {
          console.log("Compartilhar no direct:", userId, message)
          // Implementar lógica de compartilhar no direct
        }}
        onShareToTimeline={(message, isPublic) => {
          console.log("Compartilhar na timeline:", message, isPublic)
          // Implementar lógica de compartilhar na timeline
        }}
        onCopyLink={() => {
          console.log("Copiar link do post")
          // Implementar lógica de copiar link
        }}
      />

      <ProfileViewer
        isOpen={profileViewerOpen}
        onClose={() => setProfileViewerOpen(false)}
        profile={{
          id: post.user.username,
          name: post.user.name,
          username: post.user.username,
          avatar: post.user.avatar,
          verified: post.user.verified,
          premium: post.user.premium,
          location: post.user.location,
          relationshipType: post.user.relationshipType,
          isPrivate: post.user.isPrivate,
          bio: "Apaixonado por liberdade e conexões autênticas. Explorando o amor de forma aberta e respeitosa.",
          followers: 1234,
          following: 567,
          postsCount: 89,
          joinedDate: "2023-01-15",
          interests: ["Liberdade", "Arte", "Viagens", "Música", "Fotografia"],
          photos: [
            "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
            "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
            "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png",
          ],
          videos: [
            "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
          ],
          userPosts: [post], // Mock posts do usuário
          isFollowing: false,
          followState: followState,
        }}
        currentUser={currentUser}
        onFollow={(userId, isPrivate) => {
          onFollow?.(post.id, isPrivate)
        }}
        onMessage={(userId) => {
          console.log("Enviar mensagem para:", userId)
          // Implementar lógica de mensagem
        }}
        onShare={(userId) => {
          console.log("Compartilhar perfil:", userId)
          // Implementar lógica de compartilhar perfil
        }}
        onLike={onLike}
        onSave={onSave}
        onComment={onComment}
        onSharePost={onShare}
        onViewMedia={onViewMedia}
      />
    </Card>
  )
}
