"use client"

import { useState, useEffect } from "react"
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
import { NotificationsDialog } from "@/app/components/timeline/NotificationsDialog"
import { MessagesDialog } from "@/app/components/timeline/MessagesDialog"
import { EventsDialog } from "@/app/components/timeline/EventsDialog"
import { CommunitiesDialog } from "@/app/components/timeline/CommunitiesDialog"
import { ProfileDialog } from "@/app/components/timeline/ProfileDialog"
import { Separator } from "@/components/ui/separator"
import { MobileNav } from "@/app/components/timeline/layout/MobileNav"
import { TimelineRightSidebar } from "@/app/components/timeline/TimelineRightSidebar"
import Advertisement from "@/app/components/ads/Advertisement"
import Logo from "@/app/components/Logo"
import { TimelineSidebar } from "@/app/components/timeline/TimelineSidebar"

// --- Tipos e Dados para a Nova Sidebar ---

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

// --- Componente Principal da Home ---

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  
  // Debug logs
  console.log("Home - Auth state:", { user: user?.id, loading: authLoading })
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savedContentOpen, setSavedContentOpen] = useState(false)
  // Post creation state
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends_only">("public")
  const [postLoading, setPostLoading] = useState(false)

  // Timeline real
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [errorPosts, setErrorPosts] = useState<string | null>(null)

  // Atualiza timeline
  const fetchPosts = async () => {
    setLoadingPosts(true)
    setErrorPosts(null)
    try {
      const res = await fetch("/api/timeline")
      if (!res.ok) throw new Error("Erro ao buscar timeline")
      const json = await res.json()
      setPosts(json.data || [])
    } catch (err: any) {
      setErrorPosts(err.message || "Erro desconhecido")
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchPosts()
    }
  }, [authLoading])

  // Ad tracking
  const handleAdClick = (adId: string) => {
    console.log("Ad clicked:", adId)
    // Aqui você pode implementar tracking de cliques
  }

  const handleAdImpression = (adId: string) => {
    console.log("Ad impression:", adId)
    // Aqui você pode implementar tracking de impressões
  }

  const [profileSearchOpen, setProfileSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const [communitiesOpen, setCommunitiesOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeView, setActiveView] = useState("home")

  // Current user data
  const currentUser = {
    name: "Você",
    username: "@voce",
    avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png"
  }

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
    // Remover vestígios de followStates
  }

  const handleComment = (postId: number) => {
    console.log("Abrir comentários do post:", postId)
    // Implementar lógica de abrir comentários
  }

  const handleShare = (postId: number) => {
    console.log("Compartilhar post:", postId)
    // Implementar lógica de compartilhar
  }

  const handleViewMedia = (postId: number, mediaIndex: number) => {
    console.log("Visualizar mídia do post:", postId, "índice:", mediaIndex)
    // Implementar lógica de visualizar mídia
  }

  // Após criar post, recarregar timeline
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return
    
    console.log("Tentando criar post - User:", user?.id, "Loading:", authLoading)
    
    if (!user) {
      console.error("Usuário não autenticado")
      alert("Você precisa estar logado para criar posts")
      return
    }
    
    setPostLoading(true)
    
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: postContent, 
          visibility: postVisibility 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro ao criar post:", errorData)
        throw new Error(errorData.error || "Erro ao criar post")
      }
      
      const result = await response.json()
      console.log("Post criado com sucesso:", result)
      
      setPostContent("")
      setPostLoading(false)
      setPostModalOpen(false)
      fetchPosts() // Atualiza timeline
    } catch (error) {
      console.error("Erro ao criar post:", error)
      setPostLoading(false)
      alert("Erro ao criar post. Tente novamente.")
    }
  }

  const CreatePostModal = () => (
    <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mt-2 mb-2 sm:mt-2 sm:mb-2"
      >
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
              <Textarea
                placeholder="O que você está pensando?"
                value={postContent}
                onChange={(e) => {
                  console.log("Texto digitado:", e.target.value)
                  setPostContent(e.target.value)
                }}
                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-base"
                maxLength={2000}
              />
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
                    <Button type="button" variant="ghost" size="sm" disabled>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" disabled>
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{postContent.length}/2000</span>
                  <Button 
                    type="submit" 
                    disabled={postLoading || !postContent.trim() || !user || authLoading} 
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

  // Função para navegar para configurações
  const navigateToSettings = () => {
    window.location.href = '/settings'
  }

  // Função para navegar para perfis
  const navigateToProfiles = () => {
    window.location.href = '/profiles'
  }

  // Componente simplificado para exibir perfis na timeline
  const ProfileCard = ({ profile }: { profile: any }) => (
    <Card className="relative w-full overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={navigateToProfiles}>
      {/* Background Header */}
      <div className="relative h-20 xs:h-24 sm:h-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
  
      <CardContent className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Profile Avatar - Overlapping the background */}
        <div className="flex justify-center -mt-6 xs:-mt-8 sm:-mt-12 mb-2 xs:mb-3 sm:mb-4">
          <Avatar className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="text-sm sm:text-lg font-semibold">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
  
        {/* Profile Info */}
        <div className="text-center space-y-1 xs:space-y-1.5 sm:space-y-2 mb-2 xs:mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2">
            <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</h3>
            {profile.verified && <BadgeCheck className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 fill-blue-500 text-white flex-shrink-0" />}
          </div>
  
          <p className="text-xs text-muted-foreground font-medium truncate">{profile.username}</p>
  
          {/* Tags */}
          {profile.tags && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 xs:mt-1.5 sm:mt-2">
              {profile.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                  {tag}
                </Badge>
              ))}
              {profile.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  +{profile.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
  
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-4 text-xs text-muted-foreground mt-1.5 xs:mt-2 sm:mt-3">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-16 xs:max-w-20 sm:max-w-none">{profile.location}</span>
              </div>
            )}
            {profile.joinedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">Registered {profile.joinedDate}</span>
                <span className="sm:hidden">{profile.joinedDate}</span>
              </div>
            )}
          </div>
        </div>
  
        {/* Description */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed mb-2 xs:mb-3 sm:mb-4 line-clamp-2">{profile.description}</p>
  
        <Separator className="my-2 xs:my-3 sm:my-4" />
  
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 xs:gap-2 sm:gap-4 mb-3 xs:mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs xs:text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-xs xs:text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{profile.followers}</div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-xs xs:text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{profile.following}</div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="flex gap-1.5 xs:gap-2 sm:gap-3">
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

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode ? "dark bg-gray-900 text-gray-50" : "bg-gray-50 text-gray-900")}>
      {/* Custom CSS */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        
        /* Ocultar a barra de rolagem para todos os navegadores */
        ::-webkit-scrollbar {
          display: none;
        }
        
        body, .sidebar-box {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Layout Grid Principal - Similar ao Twitter/X */}
      <div className="flex min-h-screen max-w-7xl mx-auto">
        
        {/* Sidebar Esquerda - 1fr (minmax(0, 1fr)) */}
        <aside className="hidden lg:block w-64 xl:w-72 sticky top-0 h-screen overflow-y-auto">
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

        {/* Timeline Principal - 2fr (minmax(0, 2fr)) */}
        <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
          {/* Header com Tabs */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="p-4">
              <Tabs defaultValue="seguindo" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
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
              </Tabs>
            </div>
          </div>
          
          {/* Conteúdo das Tabs */}
          <div className="p-4">
            <Tabs defaultValue="seguindo" className="w-full">
              <TabsContents>
                {/* Tab: Seguindo - Posts de amigos */}
                <TabsContent value="seguindo" className="space-y-6">
                {loadingPosts ? (
                  <div className="text-center py-8">
                    <p>Carregando posts de amigos...</p>
                  </div>
                ) : errorPosts ? (
                  <div className="text-center py-8 text-red-500">
                    Erro ao carregar posts: {errorPosts}
                  </div>
                ) : posts.length === 0 ? (
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
                      
                      {/* Insert ads after every 3 posts */}
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

              {/* Tab: Para Você - Perfis recomendados */}
              <TabsContent value="para-voce" className="space-y-6">
                <div className="text-center py-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Perfis Recomendados para Você
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Pessoas em alta na sua região com boa popularidade
                  </p>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
                  {[
                    {
                      id: "1",
                      name: "Maria & Carlos",
                      username: "@mariacarlos",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
                      backgroundImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "2km",
                      followers: 1240,
                      verified: true,
                      premium: true,
                      rating: 4.8,
                      tags: ["fotografia", "viagens", "arte"],
                      description: "Casal apaixonado por fotografia e viagens. Sempre em busca de novas experiências e conexões autênticas."
                    },
                    {
                      id: "2",
                      name: "Rafael Alves",
                      username: "@rafael_livre",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
                      backgroundImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "5km",
                      followers: 890,
                      verified: false,
                      premium: true,
                      rating: 4.6,
                      tags: ["música", "festivais", "cultura"],
                      description: "Músico e amante da cultura. Sempre aberto a novas conexões e experiências musicais."
                    },
                    {
                      id: "3",
                      name: "Ana & Pedro",
                      username: "@anapedro",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
                      backgroundImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "8km",
                      followers: 2100,
                      verified: true,
                      premium: false,
                      rating: 4.9,
                      tags: ["gastronomia", "vinhos", "experiências"],
                      description: "Casal gastronômico apaixonado por vinhos e experiências culinárias únicas."
                    },
                    {
                      id: "4",
                      name: "Sofia Mendes",
                      username: "@sofia_livre",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
                      backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "3km",
                      followers: 670,
                      verified: false,
                      premium: false,
                      rating: 4.5,
                      tags: ["yoga", "bem-estar", "natureza"],
                      description: "Instrutora de yoga e amante da natureza. Buscando conexões autênticas e bem-estar."
                    },
                    {
                      id: "5",
                      name: "Lucas & Julia",
                      username: "@lucasjulia",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png",
                      backgroundImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "6km",
                      followers: 1850,
                      verified: true,
                      premium: true,
                      rating: 4.7,
                      tags: ["esportes", "aventura", "natureza"],
                      description: "Casal aventureiro que ama esportes radicais e conexões com a natureza."
                    },
                    {
                      id: "6",
                      name: "Camila Santos",
                      username: "@camila_livre",
                      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png",
                      backgroundImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=200&fit=crop",
                      location: "São Paulo, SP",
                      distance: "4km",
                      followers: 920,
                      verified: false,
                      premium: true,
                      rating: 4.4,
                      tags: ["dança", "arte", "cultura"],
                      description: "Bailarina e artista. Apaixonada por dança e expressão artística."
                    }
                  ].map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              </TabsContent>

              {/* Tab: Explorar - Cards de perfis com filtro */}
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
                  
                  {/* Filtros de Busca */}
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
                  
                  {/* Resultados da Busca */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
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
                      },
                      {
                        id: "5",
                        name: "Mariana & Thiago",
                        username: "@marianathiago",
                        profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-12.png",
                        backgroundImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=200&fit=crop",
                        location: "São Paulo, SP",
                        distance: "3km",
                        followers: 890,
                        verified: false,
                        premium: false,
                        rating: 4.4,
                        tags: ["café", "livros", "conversas"],
                        description: "Casal intelectual apaixonado por café, livros e conversas profundas."
                      },
                      {
                        id: "6",
                        name: "Gabriela Santos",
                        username: "@gabriela_livre",
                        profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-13.png",
                        backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
                        location: "São Paulo, SP",
                        distance: "6km",
                        followers: 1450,
                        verified: true,
                        premium: true,
                        rating: 4.7,
                        tags: ["dança", "fitness", "energia"],
                        description: "Instrutora de dança e fitness. Energia contagiante e amor pela vida."
                      }
                    ].map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                </div>
              </TabsContent>
              </TabsContents>
            </Tabs>
          </div>
        </main>

        {/* Sidebar Direita - 1fr (minmax(0, 1fr)) */}
        <aside className="hidden lg:block w-80 xl:w-96 sticky top-0 h-screen overflow-y-auto">
          <TimelineRightSidebar
            userLocation="São Paulo, SP"
            onFollowUser={(userId: string) => {
              console.log("Seguindo usuário:", userId)
              // Aqui você pode implementar a lógica de seguir usuário
            }}
            onUnfollowUser={(userId: string) => {
              console.log("Deixando de seguir usuário:", userId)
              // Aqui você pode implementar a lógica de deixar de seguir
            }}
            onViewEvent={(eventId: string) => {
              console.log("Visualizando evento:", eventId)
              setEventsOpen(true)
              // Aqui você pode implementar a navegação para o evento específico
            }}
            onSearch={(query: string) => {
              console.log("Buscando:", query)
              setProfileSearchOpen(true)
              // Aqui você pode implementar a busca
            }}
          />
        </aside>
      </div>



      {/* Mobile Navigation */}
      <MobileNav
        onProfileClick={() => setProfileOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onMessagesClick={() => setMessagesOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onEventsClick={() => setEventsOpen(true)}
        onCommunitiesClick={() => setCommunitiesOpen(true)}
        onSavedContentClick={() => setSavedContentOpen(true)}
        onProfileSearchClick={() => setProfileSearchOpen(true)}
        onCreatePostClick={() => setPostModalOpen(true)}
        onNavigateToSettings={navigateToSettings}
        onNavigateToProfiles={navigateToProfiles}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Modals */}
      <CreatePostModal />
      
      {/* Saved Content Dialog */}
      <Dialog open={savedContentOpen} onOpenChange={setSavedContentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Conteúdo Salvo</DialogTitle>
            <DialogDescription>
              Seus posts, eventos e mídia favoritos
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Search Dialog */}
      <Dialog open={profileSearchOpen} onOpenChange={setProfileSearchOpen}>
        <DialogContent className="max-w-3xl p-0">
          <ProfileSearch onProfileClick={() => setProfileSearchOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      {/* Messages Dialog */}
      <MessagesDialog open={messagesOpen} onOpenChange={setMessagesOpen} />

      {/* Events Dialog */}
      <EventsDialog open={eventsOpen} onOpenChange={setEventsOpen} />

      {/* Communities Dialog */}
      <CommunitiesDialog open={communitiesOpen} onOpenChange={setCommunitiesOpen} />

      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
} 