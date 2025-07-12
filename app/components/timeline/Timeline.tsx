"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/motion-tabs"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "../../../components/ui/dialog"
import PostCard from "./PostCard"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer } from "./MediaViewer"
import { ShareDialog } from "./ShareDialog"
import { SavedContent } from "./SavedContent"
import SearchContent from "../../search/SearchContent"
import { Separator } from "@/components/ui/separator"
import { MobileNav } from "./layout/MobileNav"
import { TimelineRightSidebar } from "./TimelineRightSidebar"
import Advertisement from "../ads/Advertisement"
import Logo from "../Logo" // Certifique-se que o caminho está correto
import { TimelineSidebar } from "./TimelineSidebar"
import ProfileSearch from "./ProfileSearch"
import { MessagesContent } from "./MessagesContent"

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

// --- Componente Principal da Timeline ---

export default function Timeline() {
  const { user, loading: authLoading } = useAuth()
  

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
              <textarea
                placeholder="O que você está pensando?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[100px] w-full resize-none border-0 focus-visible:ring-0 text-base bg-transparent outline-none"
                maxLength={2000}
                dir="ltr"
                style={{ direction: 'ltr', unicodeBidi: 'normal' }}
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
    <Card className="relative w-full max-w-[320px] sm:max-w-sm overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={navigateToProfiles}>
      {/* Background Header */}
      <div className="relative h-24 sm:h-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
  
      <CardContent className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Profile Avatar - Overlapping the background */}
        <div className="flex justify-center -mt-8 sm:-mt-12 mb-3 sm:mb-4">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
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
        <div className="text-center space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</h3>
            {profile.verified && <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-500 text-white flex-shrink-0" />}
          </div>
  
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{profile.username}</p>
  
          {/* Tags */}
          {profile.tags && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-2">
              {profile.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {profile.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{profile.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
  
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-2 sm:mt-3">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20 sm:max-w-none">{profile.location}</span>
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
        <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed mb-3 sm:mb-4 line-clamp-2">{profile.description}</p>
  
        <Separator className="my-3 sm:my-4" />
  
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{profile.followers}</div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{profile.following}</div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); handleFollow(profile.id, false); }}>
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Seguir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSave(profile.id); }}>
            <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Salvar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )



  const AdCard1 = () => (
    <Card className="max-w-lg py-0 sm:flex-row sm:gap-0">
      <CardContent className="grow-1 px-0">
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"
          alt="Banner"
          className="size-full rounded-s-xl"
        />
      </CardContent>
      <div className="sm:min-w-54">
        <CardHeader className="pt-6">
          <CardTitle className="text-sm">Eventos Exclusivos</CardTitle>
          <CardDescription className="text-xs">
            Participe de eventos únicos para casais e pessoas livres em sua cidade.
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-3 py-6">
          <Button className="bg-transparent bg-gradient-to-br from-purple-500 to-pink-500 text-white focus-visible:ring-pink-600/20 text-xs">
            Explorar Eventos
          </Button>
        </CardFooter>
      </div>
    </Card>
  )

  const AdCard2 = () => (
    <Card className="max-w-md pt-0">
      <CardContent className="px-0">
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"
          alt="Banner"
          className="aspect-video h-32 rounded-t-xl object-cover"
        />
      </CardContent>
      <CardHeader>
        <CardTitle className="text-sm">Premium OpenLove</CardTitle>
        <CardDescription className="text-xs">Desbloqueie recursos exclusivos e conecte-se sem limites.</CardDescription>
      </CardHeader>
      <CardFooter className="gap-3 max-sm:flex-col max-sm:items-stretch">
        <Button size="sm" className="text-xs">
          Assinar Premium
        </Button>
        <Button variant="outline" size="sm" className="text-xs bg-transparent">
          Saiba Mais
        </Button>
      </CardFooter>
    </Card>
  )

  const AvatarGroup = () => {
    const avatars = [
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        fallback: "OS",
        name: "Olivia Sparks",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        fallback: "HL",
        name: "Howard Lloyd",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        fallback: "HR",
        name: "Hallie Richards",
      },
      {
        src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        fallback: "JW",
        name: "Jenny Wilson",
      },
    ]

    return (
      <div className="bg-background flex flex-wrap items-center justify-center rounded-full border p-1 shadow-sm">
        <div className="flex -space-x-1">
          {avatars.map((avatar, index) => (
            <Avatar key={index} className="ring-background size-6 ring-2">
              <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.name} />
              <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <p className="text-muted-foreground px-2 text-xs">
          <strong className="text-foreground font-medium">10K+</strong> pessoas conectadas.
        </p>
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
        
        /* Ocultar a barra de rolagem para todos os navegadores */
        ::-webkit-scrollbar {
          display: none;
        }
        
        body, .sidebar-box {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Artistic Background 
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-pink-500/5 to-purple-500/5 dark:from-pink-500/10 dark:to-purple-500/10 blur-3xl" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>*/}

     

      {/* Main Layout */}
      <div className="relative z-20 flex">
        {/* Sidebar Esquerda */}
        <TimelineSidebar
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          activeView={activeView}
          setActiveView={setActiveView}
          onNavigateToSettings={navigateToSettings}
          onNavigateToProfiles={navigateToProfiles}
          onCreatePost={() => setPostModalOpen(true)}
        />

        {/* Feed Central */}
        <main className="flex-1 xl:pl-[275px] pl-[72px] relative z-10">
          <div className="p-4 space-y-6">
            
            {(() => {
              switch (activeView) {
                case "home":
                  if (loadingPosts) {
                    return (
                      <div className="text-center py-8">
                        <p>Carregando posts...</p>
                      </div>
                    )
                  }
                  if (errorPosts) {
                    return (
                      <div className="text-center py-8 text-red-500">
                        Erro ao carregar posts: {errorPosts}
                      </div>
                    )
                  }
                  if (posts.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p>Nenhum post encontrado. Seja o primeiro a criar um!</p>
                      </div>
                    )
                  }
                  return posts.map((post, index) => (
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
                      
                      {/* Insert profile cards after every 2 posts */}
                      {(index + 1) % 2 === 0 && (
                        <div className="my-6">
                          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                            Pessoas que você pode conhecer
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posts.map((profile) => (
                              <ProfileCard key={profile.id} profile={profile} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                case "explore":
                  return (
                    <ProfileSearch />
                  )
                case "notifications":
                  return (
                    <div className="p-4 bg-green-100 rounded">
                      <h2 className="text-2xl font-bold mb-4">Notificações</h2>
                      <p>Redirecionando para a página de notificações...</p>
                      <Button onClick={() => window.location.href = '/notificacoes'}>
                        Ir para Notificações
                      </Button>
                    </div>
                  )
                case "messages":
                  return <MessagesContent />
                case "events":
                  return (
                    <div className="p-4 bg-orange-100 rounded">
                      <h2 className="text-2xl font-bold mb-4">Eventos</h2>
                      <p>Redirecionando para a página de eventos...</p>
                      <Button onClick={() => window.location.href = '/events'}>
                        Ir para Eventos
                      </Button>
                    </div>
                  )
                case "communities":
                  return (
                    <div className="p-4 bg-pink-100 rounded">
                      <h2 className="text-2xl font-bold mb-4">Comunidades</h2>
                      <p>Redirecionando para a página de comunidades...</p>
                      <Button onClick={() => window.location.href = '/communities'}>
                        Ir para Comunidades
                      </Button>
                    </div>
                  )
                case "saved":
                  return <SavedContent
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
              
                case "settings":
                  return (
                    <div className="p-4 bg-blue-100 rounded">
                      <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                      <p>Redirecionando para a página de configurações...</p>
                      <Button onClick={() => window.location.href = '/settings'}>
                        Ir para Configurações
                      </Button>
                    </div>
                  )
                default:
                  return <div className="text-center py-8">Seção em desenvolvimento.</div>
              }
            })()}
          </div>
        </main>

        {/* Sidebar Direita */}
        <div className="hidden xl:block">
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
            window.location.href = `/events?id=${eventId}`
            // Aqui você pode implementar a navegação para o evento específico
          }}
          onSearch={(query: string) => {
            console.log("Buscando:", query)
            window.location.href = `/search?q=${encodeURIComponent(query)}`
            // Aqui você pode implementar a busca
          }}
        />
        </div>
      </div>

      {/* Desktop Floating Action Button */}
      <div className="hidden xl:block fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Criar novo post"
          onClick={() => {
            console.log("Botão flutuante clicado - User:", user?.id, "Loading:", authLoading)
            if (authLoading) {
              console.log("Ainda carregando autenticação...")
              return
            }
            if (!user) {
              console.log("Usuário não autenticado, redirecionando para login...")
              window.location.href = "/auth/signin"
              return
            }
            console.log("Abrindo modal de criação de post")
            setPostModalOpen(true)
          }}
          disabled={authLoading || !user}
        >
          <span className="sr-only">Criar novo post</span>
          <Plus className="w-6 h-6" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded shadow-lg pointer-events-none select-none">
            {`user: ${user ? user.id : 'null'} | loading: ${authLoading ? 'true' : 'false'}`}
          </span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        onProfileClick={() => window.location.href = '/profile'}
        onSettingsClick={() => window.location.href = '/settings'}
        onMessagesClick={() => window.location.href = '/messages'}
        onNotificationsClick={() => window.location.href = '/notificacoes'}
        onEventsClick={() => window.location.href = '/events'}
        onCommunitiesClick={() => window.location.href = '/communities'}
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