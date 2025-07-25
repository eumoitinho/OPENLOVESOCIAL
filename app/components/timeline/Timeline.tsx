"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Shield,
  Edit,
  Camera,
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
import TimelineAdCard from '@/app/components/ads/TimelineAdCard'
import { useCanAccess } from '@/lib/plans/hooks'
import { Checkbox } from "@/components/ui/checkbox"

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
  const canAccess = useCanAccess()
  

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
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'for-you'>('all')

  console.log("Timeline render - User:", user?.id, "Loading:", authLoading)

  // Atualiza timeline baseado na tab ativa
  const fetchPosts = async (tab: 'all' | 'following' | 'for-you' = activeTab) => {
    console.log('fetchPosts called with tab:', tab)
    setLoadingPosts(true)
    setErrorPosts(null)
    
    let endpoint = "/api/timeline"
    if (tab === 'following') {
      endpoint = "/api/timeline/following"
    } else if (tab === 'for-you') {
      endpoint = "/api/timeline/for-you"
    }

    console.log('Fetching from endpoint:', endpoint)

    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error("Erro ao buscar timeline")
      const json = await res.json()
      console.log('Posts received:', json.data?.length || 0)
      setPosts(json.data || [])
    } catch (err: any) {
      console.error('Error fetching posts:', err)
      setErrorPosts(err.message || "Erro desconhecido")
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchPosts()
    }
  }, [authLoading, activeTab])

  // Função para trocar de tab
  const handleTabChange = (tab: 'all' | 'following' | 'for-you') => {
    console.log('Changing tab to:', tab)
    setActiveTab(tab)
    fetchPosts(tab)
  }

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
  const [viewParams, setViewParams] = useState<any>({})
  const [viewHistory, setViewHistory] = useState<string[]>([])

  // Debug: Log quando activeView muda
  useEffect(() => {
    console.log("Timeline: activeView mudou para:", activeView)
  }, [activeView])


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

  const handleFollow = async (postId: number, isPrivate: boolean) => {
    // Refresh the posts after following/unfollowing
    setTimeout(() => {
      fetchPosts(activeTab)
    }, 500) // Small delay to allow the follow action to complete
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
      fetchPosts(activeTab) // Atualiza timeline
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
    setViewHistory(prev => [...prev, activeView])
    setActiveView("settings")
  }

  // Função para navegar para perfis
  const navigateToProfiles = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("profiles")
  }

  const navigateToProfile = (username: string) => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("profile")
    setViewParams({ username })
  }

  const navigateToEvents = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("events")
  }

  const navigateToCommunities = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("communities")
  }

  const navigateToMessages = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("messages")
  }

  const navigateToNotifications = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("notifications")
  }

  const navigateToFriends = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("friends")
  }

  const navigateToSearch = () => {
    setViewHistory(prev => [...prev, activeView])
    setActiveView("search")
  }

  const goBack = () => {
    if ((viewHistory || []).length > 0) {
      const previousView = (viewHistory || [])[(viewHistory || []).length - 1]
      setViewHistory(prev => (prev || []).slice(0, -1))
      setActiveView(previousView)
      setViewParams({})
    } else {
      setActiveView("home")
      setViewParams({})
    }
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
              {(profile.tags || []).length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{(profile.tags || []).length - 2}
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

  // Função para inserir ads na timeline
  const insertAdsInTimeline = (posts: any[]) => {
    if (canAccess.plan !== 'free') return posts
    
    const postsWithAds = [...posts]
    
    // Inserir ad a cada 5 posts
    for (let i = 5; i < postsWithAds.length; i += 6) {
      postsWithAds.splice(i, 0, {
        id: `ad-${i}`,
        type: 'ad',
        plan: Math.random() > 0.5 ? 'gold' : 'diamante'
      })
    }
    
    return postsWithAds
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
          onNavigateToEvents={navigateToEvents}
          onNavigateToCommunities={navigateToCommunities}
          onNavigateToMessages={navigateToMessages}
          onNavigateToNotifications={navigateToNotifications}
          onNavigateToFriends={navigateToFriends}
          onNavigateToSearch={navigateToSearch}
          onCreatePost={() => setPostModalOpen(true)}
        />

        {/* Feed Central */}
        <main className="flex-1 xl:pl-[275px] pl-[72px] relative z-10">
          <div className="p-4 space-y-6">
            
            {(() => {
              switch (activeView) {
                case "home":
                  return (
                    <div className="space-y-6">
                      {/* Timeline Tabs */}
                      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 pb-4">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                              <Home className="w-4 h-4 mr-2" />
                              Todos
                            </TabsTrigger>
                            <TabsTrigger value="following" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                              <Users className="w-4 h-4 mr-2" />
                              Seguindo
                            </TabsTrigger>
                            <TabsTrigger value="for-you" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Para Você
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Timeline Content */}
                      <div>
                        {(() => {
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
                          if ((posts || []).length === 0) {
                            return (
                              <div className="text-center py-8">
                                <p>
                                  {activeTab === 'following' 
                                    ? "Você ainda não segue ninguém. Explore e siga pessoas para ver seus posts aqui!"
                                    : activeTab === 'for-you'
                                    ? "Explore e interaja com posts para personalizar sua timeline!"
                                    : "Nenhum post encontrado. Seja o primeiro a criar um!"
                                  }
                                </p>
                              </div>
                            )
                          }
                          return (
                            <div className="space-y-6">
                              {insertAdsInTimeline(posts).map((post, index) => {
                                if (post.type === 'ad') {
                                  return (
                                    <TimelineAdCard 
                                      key={post.id}
                                      plan={post.plan}
                                      onDismiss={() => {
                                        // Remove this ad from timeline
                                        setPosts(prev => prev.filter(p => p.id !== post.id))
                                      }}
                                    />
                                  )
                                }
                                
                                return (
                                  <PostCard 
                                    key={post.id}
                                    post={post}
                                    onLike={handleLike}
                                    onSave={handleSave}
                                    onFollow={handleFollow}
                                    onComment={handleComment}
                                    onShare={handleShare}
                                    onViewMedia={handleViewMedia}
                                    currentUser={currentUser}
                                  />
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                case "explore":
                  return <ProfileSearch />
                case "profile":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Perfil de @{viewParams.username}</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Avatar className="h-24 w-24 mx-auto mb-4">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>@{viewParams.username}</AvatarFallback>
                          </Avatar>
                          <h2 className="text-xl font-bold mb-2">@{viewParams.username}</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Perfil em desenvolvimento...
                          </p>
                          <div className="flex justify-center space-x-4">
                            <Button onClick={() => handleFollow(1, false)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Seguir
                            </Button>
                            <Button variant="outline">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Mensagem
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                case "events":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Eventos</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Eventos</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Seção de eventos em desenvolvimento...
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Evento
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                case "communities":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Comunidades</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Comunidades</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Seção de comunidades em desenvolvimento...
                          </p>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Comunidade
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                case "messages":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Mensagens</h1>
                      </div>
                      <MessagesContent />
                    </div>
                  )
                case "notifications":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Notificações</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Notificações</h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Seção de notificações em desenvolvimento...
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                case "friends":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Amigos</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Amigos</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Seção de amigos em desenvolvimento...
                          </p>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar Amigos
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                case "search":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Busca</h1>
                      </div>
                      <SearchContent 
                        initialQuery=""
                        initialType="all"
                        initialInterests={[]}
                      />
                    </div>
                  )
                case "profiles":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Perfis</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Perfis</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Seção de perfis em desenvolvimento...
                          </p>
                          <Button>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar Perfis
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                case "saved":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Salvos</h1>
                      </div>
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
                  )
                case "my-profile":
                  console.log("Timeline: Renderizando view my-profile")
                  console.log("Timeline: authLoading:", authLoading)
                  console.log("Timeline: user:", user)
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Meu Perfil</h1>
                      </div>
                      
                      {authLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
                          </div>
                        </div>
                      ) : !user ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                          <div className="text-center">
                            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold mb-2">Usuário não autenticado</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Faça login para ver seu perfil
                            </p>
                            <Button onClick={() => window.location.href = '/auth/signin'}>
                              Fazer Login
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <MyProfileEditor user={user} goBack={goBack} />
                      )}
                    </div>
                  )
                case "settings":
                  return (
                    <div className="min-h-screen">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" onClick={goBack} className="mr-4">
                          ← Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">Configurações</h1>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h2 className="text-xl font-bold mb-2">Configurações</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Seção de configurações em desenvolvimento...
                          </p>
                          <div className="flex justify-center space-x-4">
                            <Button variant="outline">
                              <User className="h-4 w-4 mr-2" />
                              Perfil
                            </Button>
                            <Button variant="outline">
                              <Shield className="h-4 w-4 mr-2" />
                              Privacidade
                            </Button>
                            <Button variant="outline">
                              <Bell className="h-4 w-4 mr-2" />
                              Notificações
                            </Button>
                          </div>
                        </div>
                      </div>
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
            navigateToEvents()
            // Aqui você pode implementar a navegação para o evento específico
          }}
          onSearch={(query: string) => {
            console.log("Buscando:", query)
            navigateToSearch()
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
        onProfileClick={() => navigateToProfile("voce")}
        onSettingsClick={navigateToSettings}
        onMessagesClick={navigateToMessages}
        onNotificationsClick={navigateToNotifications}
        onEventsClick={navigateToEvents}
        onCommunitiesClick={navigateToCommunities}
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

// Componente para editar perfil inline
interface MyProfileEditorProps {
  user: any
  authLoading: boolean
  goBack: () => void
}

const MyProfileEditor = ({ user, authLoading, goBack }: MyProfileEditorProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    profileType: "single" as "single" | "couple",
    seeking: [] as string[],
    interests: [] as string[],
    otherInterest: "",
    bio: "",
    partner: {
      nickname: "",
      age: "",
      height: "",
      weight: "",
      eyeColor: "",
      hairColor: "",
    },
    city: "",
    uf: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile/me')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        
        // Preencher formData com dados existentes
        if (data) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            birthDate: data.birth_date || "",
            profileType: data.profile_type || "single",
            seeking: data.seeking ? JSON.parse(data.seeking) : [],
            interests: data.interests ? JSON.parse(data.interests) : [],
            otherInterest: data.other_interest || "",
            bio: data.bio || "",
            partner: {
              nickname: data.partner_nickname || "",
              age: data.partner_age || "",
              height: data.partner_height || "",
              weight: data.partner_weight || "",
              eyeColor: data.partner_eye_color || "",
              hairColor: data.partner_hair_color || "",
            },
            city: data.city || "",
            uf: data.uf || "",
            latitude: data.latitude || null,
            longitude: data.longitude || null,
          })
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes("partner.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        partner: { ...prev.partner, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCheckboxChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value) 
        ? (prev[field] as string[]).filter((item: string) => item !== value) 
        : [...(prev[field] as string[]), value],
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    if (field.includes("partner.")) {
      const partnerField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        partner: { ...prev.partner, [partnerField]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleCityFocus = async () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          })
        })
        
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || data.address.county || ""
          const state = data.address.state || data.address.region || ""
          setFormData((prev) => ({ ...prev, city, uf: state, latitude, longitude }))
        } catch (e) {
          console.error("Erro ao buscar cidade:", e)
          setFormData((prev) => ({ ...prev, latitude, longitude }))
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error)
      }
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfile() // Recarregar dados
        setIsEditing(false)
        alert('Perfil atualizado com sucesso!')
      } else {
        throw new Error('Erro ao salvar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={goBack} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={goBack} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Usuário não autenticado</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Faça login para ver seu perfil
            </p>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-4">
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => {
            if (isEditing) {
              setIsEditing(false)
              fetchProfile() // Restaurar dados originais
            } else {
              setIsEditing(true)
            }
          }}
          disabled={loading}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      {loading && !isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-2xl bg-pink-500 text-white">
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName[0]}${formData.lastName[0]}`
                        : user?.user_metadata?.full_name 
                          ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('')
                          : user?.email?.charAt(0).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-white">
                    <h2 className="text-2xl font-bold mb-1">
                      {formData.firstName && formData.lastName 
                        ? `${formData.firstName} ${formData.lastName}`
                        : user?.user_metadata?.full_name || user?.email
                      }
                    </h2>
                    <p className="text-pink-100 mb-2">
                      @{user?.user_metadata?.username || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-pink-200 text-sm">
                      {user.email} • Membro desde {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {isEditing ? (
            /* Formulário de Edição */
            <div className="space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Seu sobrenome"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Conte um pouco sobre você"
                      className="h-24 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tipo de Perfil e Interesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Preferências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Perfil</Label>
                    <Select
                      value={formData.profileType}
                      onValueChange={(value: "single" | "couple") => handleSelectChange("profileType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Solteiro(a)</SelectItem>
                        <SelectItem value="couple">Casal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>O que você busca?</Label>
                    <div className="mt-2 space-y-2">
                      {["Mulher", "Homem", "Casal"].map((option) => (
                        <div key={option} className="flex items-center">
                          <Checkbox
                            id={`seeking-${option}`}
                            checked={formData.seeking.includes(option)}
                            onCheckedChange={() => handleCheckboxChange("seeking", option)}
                          />
                          <label htmlFor={`seeking-${option}`} className="ml-2 text-sm">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Interesses</Label>
                    <div className="mt-2 space-y-2">
                      {["Ménage", "Swing", "Encontros Casuais", "Amizades", "Eventos Sociais"].map((option) => (
                        <div key={option} className="flex items-center">
                          <Checkbox
                            id={`interest-${option}`}
                            checked={formData.interests.includes(option)}
                            onCheckedChange={() => handleCheckboxChange("interests", option)}
                          />
                          <label htmlFor={`interest-${option}`} className="ml-2 text-sm">
                            {option}
                          </label>
                        </div>
                      ))}
                      <Input
                        name="otherInterest"
                        value={formData.otherInterest}
                        onChange={handleInputChange}
                        placeholder="Outro interesse (opcional)"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Parceiro (se for casal) */}
              {formData.profileType === "couple" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informações do Parceiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partner.nickname">Apelido</Label>
                        <Input
                          id="partner.nickname"
                          name="partner.nickname"
                          value={formData.partner.nickname}
                          onChange={handleInputChange}
                          placeholder="Apelido do parceiro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partner.age">Idade</Label>
                        <Input
                          id="partner.age"
                          name="partner.age"
                          type="number"
                          value={formData.partner.age}
                          onChange={handleInputChange}
                          placeholder="Idade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partner.height">Altura (cm)</Label>
                        <Input
                          id="partner.height"
                          name="partner.height"
                          type="number"
                          value={formData.partner.height}
                          onChange={handleInputChange}
                          placeholder="Altura em cm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partner.weight">Peso (kg)</Label>
                        <Input
                          id="partner.weight"
                          name="partner.weight"
                          type="number"
                          value={formData.partner.weight}
                          onChange={handleInputChange}
                          placeholder="Peso em kg"
                        />
                      </div>
                      <div>
                        <Label>Cor dos Olhos</Label>
                        <Select
                          value={formData.partner.eyeColor}
                          onValueChange={(value) => handleSelectChange("partner.eyeColor", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor dos olhos" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Castanho", "Azul", "Verde", "Cinza", "Outro"].map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cor do Cabelo</Label>
                        <Select
                          value={formData.partner.hairColor}
                          onValueChange={(value) => handleSelectChange("partner.hairColor", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor do cabelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Preto", "Castanho", "Loiro", "Ruivo", "Outro"].map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Localização */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={handleCityFocus}
                      placeholder="Digite sua cidade ou toque para detectar automaticamente"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Toque no campo para detectar sua localização automaticamente
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    fetchProfile()
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          ) : (
            /* Visualização do Perfil */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Nome Completo</div>
                      <div className="font-medium">
                        {formData.firstName && formData.lastName 
                          ? `${formData.firstName} ${formData.lastName}`
                          : "Não informado"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Data de Nascimento</div>
                      <div className="font-medium">
                        {formData.birthDate 
                          ? new Date(formData.birthDate).toLocaleDateString('pt-BR')
                          : "Não informado"
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Localização</div>
                      <div className="font-medium">{formData.city || "Não informado"}</div>
                    </div>
                  </div>
                  
                  {formData.bio && (
                    <div>
                      <div className="text-sm text-gray-500">Bio</div>
                      <div className="font-medium">{formData.bio}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Preferências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Tipo de Perfil</div>
                    <div className="font-medium">
                      {formData.profileType === "single" ? "Solteiro(a)" : "Casal"}
                    </div>
                  </div>
                  
                  {formData.seeking.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500">Buscando</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.seeking.map((item) => (
                          <Badge key={item} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.interests.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500">Interesses</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.interests.map((item) => (
                          <Badge key={item} variant="outline">{item}</Badge>
                        ))}
                        {formData.otherInterest && (
                          <Badge variant="outline">{formData.otherInterest}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {formData.profileType === "couple" && formData.partner.nickname && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Informações do Parceiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Apelido</div>
                        <div className="font-medium">{formData.partner.nickname}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Idade</div>
                        <div className="font-medium">{formData.partner.age} anos</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Altura</div>
                        <div className="font-medium">{formData.partner.height} cm</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Peso</div>
                        <div className="font-medium">{formData.partner.weight} kg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cor dos Olhos</div>
                        <div className="font-medium">{formData.partner.eyeColor}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cor do Cabelo</div>
                        <div className="font-medium">{formData.partner.hairColor}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}