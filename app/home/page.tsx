"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/components/ui/motion-tabs"
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
  BadgeCheckIcon,
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
  MessageCircleIcon,
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
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
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

// --- Componente Principal da Home ---

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// Adicione esta interface se não existir
interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    username?: string
  }
  email_confirmed_at?: string
}

interface Profile {
  avatar_url?: string
  plano?: 'free' | 'gold' | 'diamond'
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Outros estados da página
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

  // Hook personalizado para recomendações (mantenha seu hook existente)
  const { recommendations, loading: loadingRecommendations, error: errorRecommendations } = useRecommendationAlgorithm()

  // Função para verificar e carregar a sessão
  const checkAuth = async () => {
    try {
      console.log("HomePage: Verificando autenticação...")
      setAuthLoading(true)
      setSessionError(null)

      // Obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("HomePage: Erro ao obter sessão:", sessionError)
        setSessionError(sessionError.message)
        setAuthLoading(false)
        return
      }

      if (!session) {
        console.log("HomePage: Nenhuma sessão encontrada")
        setUser(null)
        setProfile(null)
        setAuthLoading(false)
        // Redirecionar para login se não há sessão
        router.push('/')
        return
      }

      console.log("HomePage: Sessão encontrada:", session.user.id)
      console.log("HomePage: Email confirmado:", session.user.email_confirmed_at)

      // Verificar se o email foi confirmado
      if (!session.user.email_confirmed_at) {
        console.log("HomePage: Email não confirmado, redirecionando")
        router.push('/auth/signin?email=unconfirmed')
        return
      }

      // Definir usuário
      setUser(session.user as User)

      // Carregar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error("HomePage: Erro ao carregar perfil:", profileError)
        // Continuar mesmo sem perfil
      } else {
        console.log("HomePage: Perfil carregado:", profileData)
        setProfile(profileData)
      }

    } catch (error) {
      console.error("HomePage: Erro na verificação de autenticação:", error)
      setSessionError("Erro ao verificar autenticação")
    } finally {
      setAuthLoading(false)
    }
  }

  // Effect para verificar autenticação no mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("HomePage: Mudança de autenticação:", event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          router.push('/')
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user as User)
          // Recarregar perfil
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profileData)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user as User)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  // Função para buscar posts (atualizada)
  const fetchPosts = async () => {
    if (!user) {
      console.log("HomePage: Usuário não autenticado, não buscando posts")
      return
    }

    console.log("HomePage: Iniciando fetchPosts...")
    setLoadingPosts(true)
    setErrorPosts(null)
    
    try {
      console.log("HomePage: Fazendo requisição para /api/timeline")
      const res = await fetch("/api/timeline", {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      })
      
      console.log("HomePage: Status da resposta:", res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.log("HomePage: Erro na resposta:", errorData)
        
        if (errorData.error === "Session expired" || res.status === 401) {
          console.log("HomePage: Sessão expirada, fazendo logout")
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

  // Effect para buscar posts quando usuário estiver carregado
  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts()
    }
  }, [user, authLoading])

  // Current user data - definido após profile estar disponível
  const currentUser = useMemo(() => ({
    name: user?.user_metadata?.full_name || "Você",
    username: user?.user_metadata?.username || "@voce",
    avatar: profile?.avatar_url || "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
    id: user?.id
  }), [user, profile])

  // Função para criar post (atualizada)
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

      // Obter token atual
      const { data: { session } } = await supabase.auth.getSession()
      
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
      setPostModalOpen(false)
      fetchPosts()
    } catch (error) {
      console.error("Erro ao criar post:", error)
      alert("Erro ao criar post. Tente novamente.")
    } finally {
      setPostLoading(false)
    }
  }

  // Resto das funções (mantenha as existentes)
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
    console.log("Seguir usuário do post:", postId)
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

  // Suas outras funções de upload e handlers...
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    const userPlan = profile?.plano || 'free'
    
    if (userPlan === 'free') {
      alert("Upload de imagens disponível apenas para planos Open Ouro e Open Diamante")
      return
    }
    
    const maxImages = userPlan === 'gold' ? 5 : 10
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
    
    const userPlan = profile?.plano || 'free'
    
    if (userPlan === 'free') {
      alert("Upload de vídeos disponível apenas para planos Open Ouro e Open Diamante")
      return
    }
    
    const maxSize = userPlan === 'gold' ? 25 * 1024 * 1024 : 50 * 1024 * 1024
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

  // Mostrar loading se ainda estiver carregando
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

  // Mostrar erro se houver
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro de autenticação: {sessionError}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  // Mostrar se não há usuário (não deveria acontecer com middleware)
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

  // Resto do seu JSX (mantenha igual, apenas atualize as referências)
  console.log("HomePage: Renderizando com usuário:", user?.id)
  console.log("HomePage: Auth Loading:", authLoading)
  console.log("HomePage: Profile:", profile)

  // ... resto do seu JSX return aqui
  // (mantenha todo o JSX existente, apenas certifique-se de que as referências a user, profile, authLoading estão corretas)

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-gray-900 text-gray-50" : "bg-gray-50 text-gray-900")}>
      {/* Todo o seu JSX existente aqui */}
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo, {currentUser.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Usuário autenticado: {user.email}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Plano: {profile?.plano || 'free'}
        </p>
        {/* Adicione aqui todo o resto do seu JSX existente */}
      </div>
    </div>
  )
}