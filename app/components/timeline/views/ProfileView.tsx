"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  User,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Camera,
  Edit,
  Settings,
  UserPlus,
  UserMinus,
  CheckCircle,
  Lock,
  Globe,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  X,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  BadgeCheck,
  Flame,
  Save,
  Clock,
  Flag,
  Ban,
  Trash2,
  Download,
  Copy,
  Link,
  ExternalLink,
  Camera as CameraIcon,
  Palette,
  Zap,
  Gift,
  Award,
  Trophy,
  Medal,
  Gem,
  Sparkles,
  Home,
  Bell,
  Sun,
  TrendingUp,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  BookOpen,
  Heart as HeartIcon,
  MessageSquare,
  Share,
  MoreHorizontal,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Filter as FilterIcon,
  Layers,
  Grid3X3,
  List as ListIcon,
  ThumbsUp,
  ThumbsDown,
  Flag as FlagIcon,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock,
  Shield as ShieldIcon,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldQuestion,
  ShieldCheck as ShieldCheckIcon,
  ShieldX as ShieldXIcon,
  ShieldAlert as ShieldAlertIcon,
  ShieldOff as ShieldOffIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  ShieldQuestion as ShieldQuestionIcon,
  Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
  username: string
  onBack: () => void
}

interface Profile {
  id: string
  username: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  interests: string[]
  location: string | null
  website: string | null
  is_verified: boolean
  is_premium: boolean
  profile_type: 'single' | 'couple' | 'trans' | 'other'
  city: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  followers_count: number
  following_count: number
  posts_count: number
  media_count: number
  distance_km: number | null
  view_stats: {
    total_views: number
    unique_viewers: number
    views_today: number
    views_this_week: number
    views_this_month: number
  }
}

interface Media {
  id: string
  url: string
  file_type: 'image' | 'video'
  filename: string
  original_name: string
  is_profile_picture: boolean
  is_public: boolean
  visibility: 'public' | 'friends_only'
  created_at: string
}

interface Post {
  id: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_public: boolean
}

export default function ProfileView({ username, onBack }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [canMessage, setCanMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [showPrivateContent, setShowPrivateContent] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/profile/${username}`)
      if (!response.ok) {
        throw new Error("Perfil não encontrado")
      }
      const data = await response.json()
      
      setProfile(data.profile)
      setMedia(data.media)
      setPosts(data.posts)
      setFriends(data.friends)
      setIsFollowing(data.is_following)
      setCanMessage(data.can_message)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile) return

    try {
      const response = await fetch("/api/follows", {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: profile.id }) })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setProfile(prev => prev ? {
          ...prev,
          followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
        } : null)
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error)
    }
  }

  const handleMessage = () => {
    // Implementar envio de mensagem
    console.log("Enviar mensagem para:", profile?.username)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O usuário @{username} não existe ou foi removido.
          </p>
          <Button onClick={onBack} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const profilePicture = media.find(item => item.is_profile_picture)
  const coverImage = media.find(item => !item.is_profile_picture && item.is_public)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      {/* Header com botão voltar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={profilePicture?.url || "/placeholder-user.jpg"} />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                {profile.full_name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-500 to-purple-600">
          <img
            src={coverImage.url}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Profile Info */}
      <div className="relative px-4 md:px-8 -mt-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800">
                  <AvatarImage src={profilePicture?.url || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0) || profile.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {profile.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.full_name}
                  </h2>
                  {profile.is_premium && (
                    <Badge variant="premium" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-3 max-w-md">
                    {profile.bio}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile.distance_km && (
                    <div className="flex items-center">
                      <span>{profile.distance_km} km de distância</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Membro desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                className="flex items-center"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Deixar de Seguir
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Seguir
                  </>
                )}
              </Button>
              {canMessage && (
                <Button variant="outline" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.followers_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.following_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Seguindo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.posts_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.media_count}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Mídia</div>
            </div>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Interesses
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4 md:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Galeria</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum post encontrado
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <p className="text-gray-900 dark:text-white mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
                        <div className="flex items-center space-x-4">
                          <span>{post.likes_count} curtidas</span>
                          <span>{post.comments_count} comentários</span>
                          <span>{post.shares_count} compartilhamentos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma mídia encontrada
                  </p>
                </div>
              ) : (
                media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {item.file_type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.original_name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum amigo encontrado
                  </p>
                </div>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>
                            {friend.full_name?.charAt(0) || friend.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {friend.full_name || friend.username}
                          </p>
                          {friend.location && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {friend.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Visualizações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-semibold">{profile.view_stats.total_views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hoje</span>
                      <span className="font-semibold">{profile.view_stats.views_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esta semana</span>
                      <span className="font-semibold">{profile.view_stats.views_this_week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Este mês</span>
                      <span className="font-semibold">{profile.view_stats.views_this_month}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Rede
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Seguidores</span>
                      <span className="font-semibold">{profile.followers_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seguindo</span>
                      <span className="font-semibold">{profile.following_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posts</span>
                      <span className="font-semibold">{profile.posts_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mídia</span>
                      <span className="font-semibold">{profile.media_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
