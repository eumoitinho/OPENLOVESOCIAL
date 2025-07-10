"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "../../../components/ui/dialog"
import PostCard from "./PostCard"
import { CommentsDialog } from "./CommentsDialog"
import { MediaViewer } from "./MediaViewer"
import { ShareDialog } from "./ShareDialog"
import { SavedContent } from "./SavedContent"
import ProfileSearch from "./ProfileSearch"
import { NotificationsDialog } from "./NotificationsDialog"
import { MessagesDialog } from "./MessagesDialog"
import { EventsDialog } from "./EventsDialog"
import { CommunitiesDialog } from "./CommunitiesDialog"
import { ProfileDialog } from "./ProfileDialog"
import { Separator } from "@/components/ui/separator"
import { MobileNav } from "./layout/MobileNav"
import { TimelineRightSidebar } from "./TimelineRightSidebar"
import Advertisement from "../ads/Advertisement"

export default function Timeline() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savedContentOpen, setSavedContentOpen] = useState(false)
  // Post creation state
  const [postContent, setPostContent] = useState("")
  const [postVisibility, setPostVisibility] = useState<"public" | "friends_only">("public")
  const [postLoading, setPostLoading] = useState(false)

  // Ad tracking
  const handleAdClick = (adId: string) => {
    console.log("Ad clicked:", adId)
    // Aqui você pode implementar tracking de cliques
  }

  const handleAdImpression = (adId: string) => {
    console.log("Ad impression:", adId)
    // Aqui você pode implementar tracking de impressões
  }

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: "Amanda & Carlos",
        username: "@amandacarlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        verified: true,
        premium: true,
        location: "São Paulo, SP",
        relationshipType: "Casal (M&H)",
        isPrivate: false,
      },
      content:
        "Vivendo momentos incríveis juntos! 🌊✨ Nosso primeiro evento OpenLove foi incrível. Conhecemos pessoas maravilhosas que compartilham nossa visão de liberdade e respeito. #OpenLove #Casal #Liberdade",
      images: [
        "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
        "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
        "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png",
      ],
      video: null,
      event: null,
      likes: 2100,
      comments: 340,
      shares: 89,
      reposts: 156,
      liked: false,
      saved: false,
      timestamp: "2h",
    },
    {
      id: 2,
      user: {
        name: "Sofia Mendes",
        username: "@sofia_livre",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
        verified: false,
        premium: false,
        location: "Rio de Janeiro, RJ",
        relationshipType: "Solteira",
        isPrivate: true,
      },
      content:
        "Procurando novas amizades em São Paulo! Quem topa um café e uma conversa sobre liberdade, arte e conexões autênticas? 🎨☕ #SP #Amizades #Arte",
      images: null,
      video: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
      event: null,
      likes: 89,
      comments: 23,
      shares: 12,
      reposts: 8,
      liked: true,
      saved: false,
      timestamp: "4h",
    },
    {
      id: 3,
      user: {
        name: "Lisa & João",
        username: "@lisajoao",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        verified: true,
        premium: true,
        location: "Cascais, Portugal",
        relationshipType: "Casal (M&H)",
        isPrivate: false,
      },
      content:
        "Workshop de fotografia em Cascais neste sábado! 📸🌅 Vamos explorar a arte da fotografia íntima e artística. Vagas limitadas! #Fotografia #Cascais #Workshop",
      images: null,
      video: null,
      event: {
        title: "Workshop de Fotografia Íntima",
        date: "Sábado, 15 de Dezembro",
        location: "Cascais, Portugal",
        attendees: 24,
        image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
      },
      likes: 456,
      comments: 67,
      shares: 34,
      reposts: 23,
      liked: false,
      saved: true,
      timestamp: "6h",
    },
    {
      id: 4,
      user: {
        name: "Miguel Santos",
        username: "@miguel_open",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        verified: false,
        premium: true,
        location: "Lisboa, Portugal",
        relationshipType: "Solteiro",
        isPrivate: false,
      },
      content:
        "Reflexão do dia: A verdadeira liberdade está em ser autêntico consigo mesmo e respeitar a autenticidade dos outros. 🌟 #Reflexão #Autenticidade #OpenLove",
      images: null,
      video: null,
      event: null,
      likes: 234,
      comments: 45,
      shares: 18,
      reposts: 12,
      liked: true,
      saved: false,
      timestamp: "8h",
    },
  ])

  interface ProfileData {
    id: string | number
    name: string
    username: string
    description: string
    backgroundImage: string
    profileImage?: string
    verified: boolean
    rating: number
    followers: string
    following: string
    location?: string
    joinedDate?: string
    tags?: string[]
    revenue?: string
    rate?: string
  }

  const profileCards: ProfileData[] = [
    {
      id: 1,
      name: "Amanda Johnson",
      username: "@amandaj",
      verified: true,
      description: "Creative UI/UX Designer with 5+ years of experience of designing user interfaces.",
      backgroundImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
      rating: 4.7,
      followers: "1.2k",
      following: "890",
      location: "São Paulo, SP",
      joinedDate: "2023",
      tags: ["design", "ui/ux", "creative"],
      revenue: "$125k+",
      rate: "149$ / hr",
    },
    {
      id: 2,
      name: "Caleb Meredith",
      username: "@calebm",
      verified: true,
      description: "Results-driven Full Stack Developer with 8+ years in React.js and Node.js.",
      backgroundImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
      rating: 4.9,
      followers: "2.1k",
      following: "1.2k",
      location: "Rio de Janeiro, RJ",
      joinedDate: "2022",
      tags: ["developer", "react", "node"],
      revenue: "$225k+",
      rate: "215$/hr",
    },
    {
      id: 3,
      name: "Sofia Martinez",
      username: "@sofiam",
      verified: true,
      description: "Digital Marketing Specialist helping brands grow their online presence.",
      backgroundImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
      profileImage: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
      rating: 4.8,
      followers: "1.8k",
      following: "950",
      location: "Lisboa, Portugal",
      joinedDate: "2023",
      tags: ["marketing", "digital", "brands"],
      revenue: "$180k+",
      rate: "175$/hr",
    },
  ]
  const [followStates, setFollowStates] = useState<Record<number, "follow" | "requested" | "following">>({})
  const [profileSearchOpen, setProfileSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const [communitiesOpen, setCommunitiesOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Current user data
  const currentUser = {
    name: "Você",
    username: "@voce",
    avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png"
  }

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
    }
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
    const currentState = followStates[postId] || "follow"

    if (currentState === "follow") {
      const newState = isPrivate ? "requested" : "following"
      setFollowStates((prev) => ({ ...prev, [postId]: newState }))
    } else if (currentState === "following") {
      setFollowStates((prev) => ({ ...prev, [postId]: "follow" }))
    }
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

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return

    setPostLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newPost = {
      id: posts.length + 1,
      user: {
        name: "Você",
        username: "@voce",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        verified: false,
        premium: true,
        location: "São Paulo, SP",
        relationshipType: "Solteiro",
        isPrivate: false,
      },
      content: postContent,
      images: null,
      video: null,
      event: null,
      likes: 0,
      comments: 0,
      shares: 0,
      reposts: 0,
      liked: false,
      saved: false,
      timestamp: "agora",
    }

    setPosts((prev) => [newPost, ...prev])
    setPostContent("")
    setPostLoading(false)
    setPostModalOpen(false)
  }

  const CreatePostModal = () => (
    <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mt-2 mb-2 sm:mt-2 sm:mb-2"
        style={{
          marginTop: typeof window !== 'undefined' && window.innerWidth < 640 ? '0' : '10vh',
          marginBottom: typeof window !== 'undefined' && window.innerWidth < 640 ? '0' : 'auto',
          height: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vh' : 'auto',
          maxHeight: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vh' : '90vh',
          width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : 'auto',
          maxWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : '500px',
          borderRadius: typeof window !== 'undefined' && window.innerWidth < 640 ? '0' : '0.5rem'
        }}
      >
        <DialogTitle>Criar Post</DialogTitle>
        <DialogDescription className="sr-only">Crie um novo post para compartilhar com a comunidade</DialogDescription>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <Textarea
                placeholder="O que você está pensando?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
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
                  <Button type="submit" disabled={postLoading || !postContent.trim()} size="sm">
                    {postLoading ? "Postando..." : "Postar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )

  const SettingsDialog = () => (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Configurações</DialogTitle>
        <DialogDescription className="sr-only">Personalize suas configurações aqui.</DialogDescription>
        <div className="flex">
          <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-white/10">
            <div className="p-4 space-y-2 w-full">
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Bell className="w-4 h-4" />
                Notificações
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <User className="w-4 h-4" />
                Perfil
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left bg-gray-100 dark:bg-gray-800">
                <MessageCircleIcon className="w-4 h-4" />
                Mensagens & mídia
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Lock className="w-4 h-4" />
                Privacidade
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Settings className="w-4 h-4" />
                Avançado
              </Button>
            </div>
          </div>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-semibold">Mensagens & mídia</h3>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-muted/50 aspect-video max-w-3xl rounded-xl" />
              ))}
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )

  const ProfileCard = ({ profile }: { profile: ProfileData }) => (
    <Card className="relative w-full max-w-[320px] sm:max-w-sm overflow-hidden shadow-xl border-0">
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
                .map((n) => n[0])
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
              {profile.tags.slice(0, 2).map((tag, index) => (
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
          <Button className="flex-1" size="sm">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Seguir</span>
          </Button>
          <Button variant="outline" size="sm">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Custom CSS */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.3)" : "rgba(190, 24, 93, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(219, 39, 119, 0.5)" : "rgba(190, 24, 93, 0.5)"};
        }
      `}</style>

      {/* Artistic Background */}
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
      </div>

      {/* Main Layout */}
      <div className="relative z-10 max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-80 p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                OpenLove
              </span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Home className="w-5 h-5" />
                Início
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setProfileSearchOpen(true)}>
                <Search className="w-5 h-5" />
                Explorar
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setNotificationsOpen(true)}>
                <Bell className="w-5 h-5" />
                Notificações
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setMessagesOpen(true)}>
                <Mail className="w-5 h-5" />
                Mensagens
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setEventsOpen(true)}>
                <Calendar className="w-5 h-5" />
                Eventos
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setCommunitiesOpen(true)}>
                <Users className="w-5 h-5" />
                Comunidades
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-left"
                onClick={() => setSavedContentOpen(true)}
              >
                <Bookmark className="w-5 h-5" />
                Salvos
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => setProfileOpen(true)}>
                <User className="w-5 h-5" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-left"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
                Configurações
              </Button>
            </nav>

            {/* Theme Toggle */}
            <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3 text-left">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? "Modo Claro" : "Modo Escuro"}
            </Button>

            {/* Ad Card */}
            <div className="mt-8">
              <AdCard2 />
            </div>

            {/* Advertiser Dashboard Link */}
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 text-left"
                onClick={() => window.open('/ads', '_blank')}
              >
                <TrendingUp className="w-5 h-5" />
                Anunciar no OpenLove
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen border-x border-gray-200 dark:border-white/10">
                  {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-white/10 p-4 z-40">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Timeline</h1>
              <Button variant="ghost" onClick={toggleTheme} className="lg:hidden" aria-label="Toggle theme">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="home">Para Você</TabsTrigger>
                  <TabsTrigger value="following">Seguindo</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Feed */}
          <div className="p-4 space-y-6">
            {posts.map((post, index) => (
              <div key={post.id}>
                <PostCard 
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={handleFollow}
                  onComment={handleComment}
                  onShare={handleShare}
                  onViewMedia={handleViewMedia}
                  onViewEvent={(eventId) => {
                    console.log("Visualizando evento do post:", eventId)
                    setEventsOpen(true)
                  }}
                  followState={followStates[post.id] || "follow"}
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
                      {profileCards.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
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
      </div>

      {/* Desktop Floating Action Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Criar novo post"
          onClick={() => setPostModalOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
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
      />

      {/* Modals */}
      <CreatePostModal />
      <SettingsDialog />
      
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
