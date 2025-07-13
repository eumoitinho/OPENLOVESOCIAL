"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Moon,
  Sun,
  Users,
  Calendar,
  Search,
  Plus,
  Home,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  TrendingUp,
  Star,
  Globe,
  MapPin,
  ImageIcon,
  Video,
  MessageCircle,
  Lock,
  UserPlus,
  BadgeCheck,
  Wallet,
  Store,
  ShoppingBag,
  Clapperboard,
  Flag,
  HelpCircle,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PostCard from "@/app/components/timeline/PostCard"
import { CommentsDialog } from "@/app/components/timeline/CommentsDialog"
import { MediaViewer } from "@/app/components/timeline/MediaViewer"
import { ShareDialog } from "@/app/components/timeline/ShareDialog"
import { SavedContent } from "@/app/components/timeline/SavedContent"
import ProfileSearch from "@/app/components/timeline/ProfileSearch"
import { Separator } from "@/components/ui/separator"
import { MobileNav } from "@/app/components/timeline/layout/MobileNav"
import { TimelineRightSidebar } from "@/app/components/timeline/TimelineRightSidebar"
import Advertisement from "@/app/components/ads/Advertisement"
import Logo from "@/app/components/Logo"
import { TimelineSidebar } from "@/app/components/timeline/TimelineSidebar"
import { NotificationsContent } from "@/app/components/timeline/NotificationsContent"
import { MessagesContent } from "@/app/components/timeline/MessagesContent"
import { EventsContent } from "@/app/components/timeline/EventsContent"
import { CommunitiesContent } from "@/app/components/timeline/CommunitiesContent"
import { useRecommendationAlgorithm } from "@/app/hooks/useRecommendationAlgorithm"
import RecommendedPostCard from "@/app/components/timeline/RecommendedPostCard"
import { OpenDatesStack } from "@/app/components/timeline/OpenDatesStack"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from "@supabase/ssr"

// --- Tipos e Dados para a Sidebar ---
type NavigationItem = {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  count?: number
  action?: () => void
}

const NavLink = ({ item, isActive, onClick }: { item: NavigationItem; isActive: boolean; onClick: (item: NavigationItem) => void }) => (
  <li>
    <a
      href={item.href || "#"}
      onClick={(e) => {
        e.preventDefault()
        onClick(item)
      }}
      className={cn(
        "flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group",
        isActive
          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
          : "text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <item.icon className={cn("w-5 h-5 mr-4 transition-transform duration-300 group-hover:scale-110", isActive && "text-white")} />
      <span className="font-medium">{item.label}</span>
      {item.count && (
        <span
          className={cn(
            "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            isActive ? "bg-white/20 text-white" : "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300"
          )}
        >
          {item.count}
        </span>
      )}
    </a>
  </li>
)

const NavHeader = ({ title }: { title: string }) => (
  <li className="px-3 py-2 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </li>
)

// --- Componente ProfileView para a Home ---
const ProfileView = () => {
  const { user, profile } = useAuth()

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                    src={profile.avatar_url}
                    alt={profile?.full_name || "Foto de perfil"}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                {/* Badge Premium temporariamente removido até ter acesso aos dados */}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.full_name || user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{profile?.username}</p>
                {profile?.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-md">{profile.bio}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => window.location.href = '/profile/edit'}
                variant="outline"
                className="border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats - Temporariamente simplificado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Visualizações</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="text-gray-900 dark:text-white">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Nome de usuário</div>
                <div className="text-gray-900 dark:text-white">@{profile?.username}</div>
              </div>
            </div>
          </div>
          
          {profile?.interests && profile.interests.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <Globe className="h-5 w-5 text-gray-500" />
                <div className="text-sm font-medium text-gray-500">Interesses</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status - Simplificado */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Conta</div>
                <div className="text-gray-900 dark:text-white">Ativa</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500">Premium</div>
                <div className="text-gray-900 dark:text-white">Inativo</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="text-gray-900 dark:text-white">Online</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { user, profile, loading: authLoading, session } = useAuth()
  const router = useRouter()
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
  const { recommendations, loading: loadingRecommendations, error: errorRecommendations } = useRecommendationAlgorithm()
  
  console.log("HomePage: Auth Loading:", authLoading)
  console.log("HomePage: User:", user ? user.id : "Não logado")
  console.log("HomePage: User Email:", user?.email)
  

  const [isDarkMode, setIsDarkMode] = useState(true)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends_only">("public")
  const [postLoading, setPostLoading] = useState(false)
  const [postImages, setPostImages] = useState<File[]>([])
  const [postVideo, setPostVideo] = useState<File | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [errorPosts, setErrorPosts] = useState<string | null>(null)
  const [activeView, setActiveView] = useState("home")

  // Atualiza timeline
  const fetchPosts = async () => {
    console.log("HomePage: Iniciando fetchPosts...")
    setLoadingPosts(true)
    setErrorPosts(null)
    try {
      console.log("HomePage: Fazendo requisição para /api/timeline")
      const res = await fetch("/api/timeline", {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      console.log("HomePage: Status da resposta:", res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.log("HomePage: Erro na resposta:", errorData)
        if (errorData.error === "Session expired" || res.status === 401) {
          await supabase.auth.signOut()
          router.push("/?session=expired")
          return
        }
        throw new Error(errorData.error || "Erro ao buscar timeline")
      }
      const json = await res.json()
      console.log("HomePage: Timeline carregada com sucesso, posts:", json.data?.length || 0)
      setPosts(json.data || [])
    } catch (err: any) {
      console.error("HomePage: Erro ao buscar posts:", err)
      setErrorPosts(err.message || "Erro desconhecido")
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    if (!user.email_confirmed_at) {
      router.push('/auth/signin?email=unconfirmed')
      return
    }

    fetchPosts()
  }, [authLoading, user, router, session])

  // Ad tracking
  const handleAdClick = (adId: string) => {
    console.log("Ad clicked:", adId)
  }

  const handleAdImpression = (adId: string) => {
    console.log("Ad impression:", adId)
  }

  // Current user data - definido após profile estar disponível
  const currentUser = useMemo(() => ({
    name: user?.user_metadata?.full_name || "Você",
    username: user?.user_metadata?.username || "@voce",
    avatar: profile?.avatar_url || "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
    id: user?.id
  }), [user, profile])

  // Check system preference on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleSave = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              saved: !post.saved,
            }
          : post,
      ),
    )
  }

  const handleFollow = (postId: number, isPrivate: boolean) => {
    // Lógica de seguir (mantida, mas não depende de followStates)
  }

  const handleComment = (postId: number) => {
    console.log("Abrir comentários do post:", postId)
  }

  const handleShare = (postId: number) => {
    console.log("Compartilhar post:", postId)
  }

  const handleViewMedia = (postId: number, mediaIndex: number) => {
    console.log("Visualizar mídia do post:", postId, "índice:", mediaIndex)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // Verificar plano do usuário
    const userPlan = profile?.plano || 'free'
    
    if (userPlan === 'free') {
      alert("Upload de imagens disponível apenas para planos Open Ouro e Open Diamante")
      return
    }
    
    // Limites baseados no plano
    const maxImages = userPlan === 'gold' ? 5 : 10 // Gold: 5, Diamante: 10
    if ((postImages || []).length + (imageFiles || []).length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitido para seu plano`)
      return
    }
    
    setPostImages(prev => [...prev, ...imageFiles])
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('video/')) {
      alert("Por favor, selecione um arquivo de vídeo")
      return
    }
    
    // Verificar plano do usuário
    const userPlan = profile?.plano || 'free'
    
    if (userPlan === 'free') {
      alert("Upload de vídeos disponível apenas para planos Open Ouro e Open Diamante")
      return
    }
    
    // Limites baseados no plano
    const maxSize = userPlan === 'gold' ? 25 * 1024 * 1024 : 50 * 1024 * 1024 // Gold: 25MB, Diamante: 50MB
    if (file.size > maxSize) {
      alert(`Vídeo muito grande. Máximo ${userPlan === 'gold' ? '25MB' : '50MB'} para seu plano`)
      return
    }
    
    setPostVideo(file)
  }

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setPostVideo(null)
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim() && (postImages || []).length === 0 && !postVideo) return
    
    console.log("=== DEBUG POST SUBMIT ===")
    console.log("User:", user)
    console.log("User ID:", user?.id)
    console.log("Auth Loading:", authLoading)
    console.log("Email confirmed:", user?.email_confirmed_at)
    console.log("========================")
    
    if (!user) {
      console.error("Usuário não autenticado")
      alert("Você precisa estar logado para criar posts")
      return
    }
    
    setPostLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('content', postContent)
      formData.append('visibility', postVisibility)
      
      // Adicionar imagens
      postImages.forEach((image, index) => {
        formData.append(`images`, image)
      })
      
      // Adicionar vídeo
      if (postVideo) {
        formData.append('video', postVideo)
      }
      
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro ao criar post:", errorData)
        if (errorData.error === "Session expired" || response.status === 401) {
          await supabase.auth.signOut()
          router.push("/?session=expired")
          return
        }
        throw new Error(errorData.error || "Erro ao criar post")
      }
      
      const result = await response.json()
      console.log("Post criado com sucesso:", result)
      
      setPostContent("")
      setPostImages([])
      setPostVideo(null)
      setPostLoading(false)
      setPostModalOpen(false)
      fetchPosts()
    } catch (error) {
      console.error("Erro ao criar post:", error)
      setPostLoading(false)
      alert("Erro ao criar post. Tente novamente.")
    }
  }

  const navigateToSettings = () => {
    window.location.href = '/settings'
  }

  const navigateToProfiles = () => {
    window.location.href = '/profiles'
  }

  const CreatePostModal = () => (
    <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mt-2 mb-2 sm:mt-2 sm:mb-2">
        <DialogTitle>Criar Post</DialogTitle>
        <DialogDescription className="sr-only">Crie um novo post para compartilhar com a comunidade</DialogDescription>
        {!user && !authLoading && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-yellow-800 text-sm">
              Você precisa estar logado para criar posts. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-800 underline"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Fazer login
              </Button>
            </p>
          </div>
        )}
        {authLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-blue-800 text-sm">Verificando autenticação...</p>
          </div>
        )}
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <textarea
                placeholder="O que você está pensando?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[100px] w-full resize-none border-0 focus-visible:ring-0 text-base bg-transparent outline-none post-modal-textarea"
                maxLength={2000}
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  direction: 'ltr',
                  unicodeBidi: 'normal',
                  textAlign: 'left',
                  writingMode: 'horizontal-tb',
                  textOrientation: 'mixed'
                }}
              />
              
              {/* Preview de mídia */}
              {((postImages || []).length > 0 || postVideo) && (
                <div className="space-y-2">
                  {(postImages || []).length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {postImages.map((image, index) => (
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
                  {postVideo && (
                    <div className="relative">
                      <video
                        src={URL.createObjectURL(postVideo)}
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
                  <Select
                    value={postVisibility}
                    onValueChange={(value: "public" | "friends_only") => setPostVisibility(value)}
                  >
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
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={postVideo !== null || (profile?.plano || 'free') === 'free'}
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        disabled={postVideo !== null || (profile?.plano || 'free') === 'free'}
                        className={cn(
                          "cursor-pointer",
                          (profile?.plano || 'free') === 'free' && "opacity-50 cursor-not-allowed"
                        )}
                        title={(profile?.plano || 'free') === 'free' ? "Disponível apenas para planos Open Ouro e Open Diamante" : "Adicionar imagens"}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                      disabled={(postImages || []).length > 0 || (profile?.plano || 'free') === 'free'}
                    />
                    <label htmlFor="video-upload">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        disabled={(postImages || []).length > 0 || (profile?.plano || 'free') === 'free'}
                        className={cn(
                          "cursor-pointer",
                          (profile?.plano || 'free') === 'free' && "opacity-50 cursor-not-allowed"
                        )}
                        title={(profile?.plano || 'free') === 'free' ? "Disponível apenas para planos Open Ouro e Open Diamante" : "Adicionar vídeo"}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{postContent.length}/2000</span>
                  <Button 
                    type="submit" 
                    disabled={postLoading || (!postContent.trim() && (postImages || []).length === 0 && !postVideo) || !user || authLoading} 
                    size="sm"
                  >
                    {postLoading ? "Postando..." : authLoading ? "Verificando..." : !user ? "Faça login" : "Postar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )

  const ProfileCard = ({ profile }: { profile: any }) => (
    <Card className="relative w-full max-w-[280px] overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={navigateToProfiles}>
      <div className="relative h-16 sm:h-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      <CardContent className="relative px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="flex justify-center -mt-4 sm:-mt-6 mb-2 sm:mb-3">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-white shadow-lg">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="text-xs sm:text-sm font-semibold">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{profile.name}</h3>
            {profile.verified && <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 fill-blue-500 text-white flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground font-medium truncate">{profile.username}</p>
          {profile.tags && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-1.5">
              {profile.tags.slice(0, 1).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                  {tag}
                </Badge>
              ))}
              {(profile.tags || []).length > 1 && (
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  +{(profile.tags || []).length - 1}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1 sm:mt-1.5">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-16 sm:max-w-20">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed mb-2 sm:mb-3 line-clamp-2">{profile.description}</p>
        <Separator className="my-2 sm:my-3" />
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{profile.followers}</div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{profile.following}</div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); handleFollow(profile.id, false); }}>
            <UserPlus className="w-3 h-3 mr-1" />
            <span className="text-xs">Seguir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSave(profile.id); }}>
            <Bookmark className="w-3 h-3 mr-1" />
            <span className="text-xs">Salvar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Usuário não autenticado</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Fazer login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-gray-900 text-gray-50" : "bg-gray-50 text-gray-900")}>
      {/* Custom CSS */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        ::-webkit-scrollbar {
          display: none;
        }
        body, .sidebar-box {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Layout Grid Principal - Similar ao Twitter/X */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] max-w-7xl mx-auto min-h-screen">
        {/* Sidebar Esquerda */}
        <aside className="hidden lg:block w-[275px] sticky top-0 h-screen overflow-y-auto scrollbar-hide">
          <TimelineSidebar
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            activeView={activeView}
            setActiveView={setActiveView}
            onNavigateToSettings={navigateToSettings}
            onNavigateToProfiles={navigateToProfiles}
            onCreatePost={() => setPostModalOpen(true)}
          />
        </aside>

        {/* Timeline Principal */}
        <main className="w-full border-x border-gray-200 dark:border-gray-800 pl-[72px] xl:pl-0">
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeView === "home" && "Início"}
                {activeView === "explore" && "Explorar"}
                {activeView === "notifications" && "Notificações"}
                {activeView === "messages" && "Mensagens"}
                {activeView === "events" && "Eventos"}
                {activeView === "communities" && "Comunidades"}
                {activeView === "open-dates" && "Open Dates"}
                {activeView === "saved" && "Salvos"}
                {activeView === "settings" && "Configurações"}
                {activeView === "my-profile" && "Meu Perfil"}
              </h1>
            </div>
          </div>
          
          <div className="p-4">
            {activeView === "home" && (
              <Tabs defaultValue="seguindo" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 mb-6">
                  <TabsTrigger 
                    value="seguindo" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Seguindo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="para-voce" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Para Você
                  </TabsTrigger>
                  <TabsTrigger 
                    value="explorar" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Explorar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="seguindo" className="space-y-6">
                  {loadingPosts ? (
                    <div className="text-center py-8">
                      <p>Carregando posts de amigos...</p>
                    </div>
                  ) : errorPosts ? (
                    <div className="text-center py-8 text-red-500">
                      Erro ao carregar posts: {errorPosts}
                    </div>
                  ) : (posts || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p>Nenhum post de amigos encontrado. Comece a seguir pessoas para ver seus posts!</p>
                    </div>
                  ) : (
                    posts.map((post, index) => (
                      <div key={post.id}>
                        <PostCard 
                          post={post}
                          onLike={handleLike}
                          onSave={handleSave}
                          onFollow={handleFollow}
                          onComment={handleComment}
                          onShare={handleShare}
                          onViewMedia={handleViewMedia}
                          currentUser={currentUser}
                        />
                        {(index + 1) % 3 === 0 && (
                          <div className="my-6">
                            <Advertisement 
                              type="timeline"
                              onAdClick={handleAdClick}
                              onAdImpression={handleAdImpression}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="para-voce" className="space-y-6">
                  {loadingRecommendations ? (
                    <div className="text-center py-8">
                      <p>Analisando suas preferências...</p>
                    </div>
                  ) : errorRecommendations ? (
                    <div className="text-center py-8 text-red-500">
                      Erro ao carregar recomendações: {errorRecommendations}
                    </div>
                  ) : (
                    <>
                      {/* Header da seção Para Você */}
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Para Você
                          </h2>
                        </div>
                      </div>

                      {/* Timeline de Posts Recomendados */}
                      <div className="space-y-6">
                        {recommendations.map((post) => (
                          <div key={post.id} className="relative">
                            <RecommendedPostCard 
                              post={post}
                              onLike={handleLike}
                              onSave={handleSave}
                              onFollow={handleFollow}
                              onComment={handleComment}
                              onShare={handleShare}
                              onViewMedia={handleViewMedia}
                              currentUser={currentUser}
                            />
                            
                            {/* Badge de Recomendação */}
                            <div className="absolute top-4 right-4 z-10">
                              <Badge 
                                variant={post.engagement === "high" ? "default" : "secondary"}
                                className={cn(
                                  "text-xs",
                                  post.engagement === "high" && "bg-gradient-to-r from-pink-500 to-purple-500 text-white",
                                  post.engagement === "medium" && "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                                )}
                              >
                                {post.engagement === "high" ? (
                                  <>
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Alta Recomendação
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-3 h-3 mr-1" />
                                    Recomendado
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="explorar" className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Explorar Perfis
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Encontre pessoas baseado em suas preferências
                      </p>
                    </div>
                    <Card className="p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Buscar por nome, tags, localização..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casal">Casal</SelectItem>
                            <SelectItem value="solteiro">Solteiro</SelectItem>
                            <SelectItem value="todos">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Distância" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5km">Até 5km</SelectItem>
                            <SelectItem value="10km">Até 10km</SelectItem>
                            <SelectItem value="20km">Até 20km</SelectItem>
                            <SelectItem value="50km">Até 50km</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Interesses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fotografia">Fotografia</SelectItem>
                            <SelectItem value="musica">Música</SelectItem>
                            <SelectItem value="gastronomia">Gastronomia</SelectItem>
                            <SelectItem value="esportes">Esportes</SelectItem>
                            <SelectItem value="arte">Arte</SelectItem>
                            <SelectItem value="viagens">Viagens</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="bg-pink-600 hover:bg-pink-700">
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </Card>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        {
                          id: "1",
                          name: "Fernanda & Roberto",
                          username: "@fernandaroberto",
                          profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png",
                          backgroundImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=200&fit=crop",
                          location: "São Paulo, SP",
                          distance: "7km",
                          followers: 1560,
                          verified: true,
                          premium: true,
                          rating: 4.8,
                          tags: ["fotografia", "moda", "lifestyle"],
                          description: "Casal criativo apaixonado por fotografia e moda. Sempre em busca de inspiração."
                        },
                        {
                          id: "2",
                          name: "Diego Costa",
                          username: "@diego_livre",
                          profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png",
                          backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
                          location: "São Paulo, SP",
                          distance: "12km",
                          followers: 780,
                          verified: false,
                          premium: false,
                          rating: 4.3,
                          tags: ["tecnologia", "games", "anime"],
                          description: "Desenvolvedor e gamer. Apaixonado por tecnologia e cultura geek."
                        },
                        {
                          id: "3",
                          name: "Patrícia & André",
                          username: "@patriciaandre",
                          profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-10.png",
                          backgroundImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=200&fit=crop",
                          location: "São Paulo, SP",
                          distance: "15km",
                          followers: 2300,
                          verified: true,
                          premium: true,
                          rating: 4.9,
                          tags: ["yoga", "meditação", "bem-estar"],
                          description: "Casal espiritual focado em bem-estar e desenvolvimento pessoal."
                        },
                        {
                          id: "4",
                          name: "Ricardo Silva",
                          username: "@ricardo_livre",
                          profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-11.png",
                          backgroundImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
                          location: "São Paulo, SP",
                          distance: "8km",
                          followers: 1100,
                          verified: false,
                          premium: true,
                          rating: 4.6,
                          tags: ["música", "produção", "festivais"],
                          description: "Produtor musical e DJ. Sempre em busca de novas conexões musicais."
                        }
                      ].map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            {activeView === "explore" && (
              <ProfileSearch onProfileClick={() => {}} />
            )}
            {activeView === "notifications" && (
              <NotificationsContent />
            )}
            {activeView === "messages" && (
              <MessagesContent />
            )}
            {activeView === "events" && (
              <EventsContent />
            )}
            {activeView === "communities" && (
              <CommunitiesContent />
            )}
            {activeView === "open-dates" && (
              <OpenDatesStack />
            )}
            {activeView === "saved" && (
              <SavedContent
                savedPosts={posts.filter(p => p.saved).map(p => ({
                  id: p.id.toString(),
                  user: p.user,
                  content: p.content,
                  images: p.images || undefined,
                  video: p.video || undefined,
                  event: p.event || undefined,
                  likes: p.likes,
                  comments: p.comments,
                  shares: p.shares,
                  timestamp: p.timestamp,
                  savedAt: p.timestamp,
                  category: p.event ? "events" : p.images || p.video ? "media" : "posts"
                }))}
                onRemoveFromSaved={(postId) => {
                  setPosts(prev => prev.map(p => 
                    p.id.toString() === postId ? { ...p, saved: false } : p
                  ))
                }}
                onLike={(postId) => handleLike(parseInt(postId))}
                onComment={(postId) => handleComment(parseInt(postId))}
                onShare={(postId) => handleShare(parseInt(postId))}
                onViewMedia={(postId, mediaIndex) => handleViewMedia(parseInt(postId), mediaIndex)}
              />
            )}
            {activeView === "my-profile" && (
              <ProfileView />
            )}
            {activeView === "settings" && (
              <div className="p-4 bg-blue-100 rounded">
                <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                <p>Redirecionando para a página de configurações...</p>
                <Button onClick={() => window.location.href = '/settings'}>
                  Ir para Configurações
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Direita */}
        <aside className="hidden xl:block w-[350px] sticky top-0 h-screen overflow-y-auto scrollbar-hide">
          <TimelineRightSidebar
            userLocation="São Paulo, SP"
            onFollowUser={(userId: string) => {
              console.log("Seguindo usuário:", userId)
            }}
            onUnfollowUser={(userId: string) => {
              console.log("Deixando de seguir usuário:", userId)
            }}
            onViewEvent={(eventId: string) => {
              console.log("Visualizando evento:", eventId)
              window.location.href = `/events?id=${eventId}`
            }}
            onSearch={(query: string) => {
              console.log("Buscando:", query)
              window.location.href = `/search?q=${encodeURIComponent(query)}`
            }}
          />
        </aside>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        onProfileClick={() => setActiveView("profile")}
        onSettingsClick={() => setActiveView("settings")}
        onMessagesClick={() => setActiveView("messages")}
        onNotificationsClick={() => setActiveView("notifications")}
        onEventsClick={() => setActiveView("events")}
        onCommunitiesClick={() => setActiveView("communities")}
        onSavedContentClick={() => setActiveView("saved")}
        onProfileSearchClick={() => setActiveView("explore")}
        onCreatePostClick={() => setPostModalOpen(true)}
        onNavigateToSettings={navigateToSettings}
        onNavigateToProfiles={navigateToProfiles}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Modals */}
      <CreatePostModal />
    </div>
  )
}