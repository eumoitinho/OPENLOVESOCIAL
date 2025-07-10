"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  User,
  Settings,
  Edit,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  MapPin,
  Calendar,
  Users,
  Star,
  Crown,
  CheckCircle,
  Lock,
  Globe,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Bookmark,
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
  UserPlus,
  UserMinus,
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
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  username: string
  name: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  birthDate: string
  relationshipType: string
  isVerified: boolean
  isVIP: boolean
  isPremium: boolean
  isPrivate: boolean
  followers: number
  following: number
  posts: number
  photos: number
  videos: number
  likes: number
  joinDate: string
  lastSeen: string
  socialLinks: {
    instagram?: string
    twitter?: string
    facebook?: string
    linkedin?: string
  }
  interests: string[]
  userPhotos: {
    id: string
    url: string
    caption: string
    likes: number
    comments: number
    isPrivate: boolean
  }[]
  userPosts: {
    id: string
    content: string
    images?: string[]
    video?: string
    likes: number
    comments: number
    shares: number
    timestamp: string
    isPrivate: boolean
  }[]
  isFollowing: boolean
  isBlocked: boolean
  canMessage: boolean
  canViewPrivate: boolean
}

interface User {
  isVerified: boolean
  isVIP: boolean
  isPremium: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [showPrivateContent, setShowPrivateContent] = useState(false)

  // Mock user - em produção viria do contexto de autenticação
  const currentUser: User = {
    isVerified: true,
    isVIP: false,
    isPremium: true
  }

  // Mock profile data
  const mockProfile: Profile = {
    id: "1",
    username: username,
    name: "Amanda & Carlos",
    bio: "Casal livre explorando relacionamentos abertos com respeito e transparência. Apaixonados por fotografia, viagens e novas conexões autênticas. 🌊✨",
    avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
    coverImage: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
    location: "São Paulo, SP",
    birthDate: "1990-05-15",
    relationshipType: "Casal (M&H)",
    isVerified: true,
    isVIP: true,
    isPremium: true,
    isPrivate: false,
    followers: 1247,
    following: 892,
    posts: 156,
    photos: 89,
    videos: 23,
    likes: 5678,
    joinDate: "2023-01-15",
    lastSeen: "2h",
    socialLinks: {
      instagram: "@amandacarlos",
      twitter: "@amandacarlos",
      facebook: "amanda.carlos"
    },
    interests: ["fotografia", "viagens", "música", "culinária", "yoga", "arte"],
    userPhotos: [
      {
        id: "1",
        url: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
        caption: "Momentos especiais em Cascais 🌊",
        likes: 234,
        comments: 45,
        isPrivate: false
      },
      {
        id: "2",
        url: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png",
        caption: "Workshop de fotografia íntima 📸",
        likes: 189,
        comments: 32,
        isPrivate: true
      }
    ],
    userPosts: [
      {
        id: "1",
        content: "Vivendo momentos incríveis juntos! 🌊✨ Nosso primeiro evento OpenLove foi incrível. Conhecemos pessoas maravilhosas que compartilham nossa visão de liberdade e respeito.",
        images: [
          "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
          "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"
        ],
        likes: 2100,
        comments: 340,
        shares: 89,
        timestamp: "2h",
        isPrivate: false
      },
      {
        id: "2",
        content: "Reflexão do dia: A verdadeira liberdade está em ser autêntico consigo mesmo e respeitar a autenticidade dos outros. 🌟",
        likes: 456,
        comments: 67,
        shares: 23,
        timestamp: "1 dia",
        isPrivate: false
      }
    ],
    isFollowing: true,
    isBlocked: false,
    canMessage: true,
    canViewPrivate: true
  }

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setProfile(mockProfile)
      setIsLoading(false)
    }, 1000)
  }, [username])

  const handleFollow = () => {
    if (!currentUser.isVerified) {
      alert("Apenas perfis verificados podem seguir outros usuários")
      return
    }

    setProfile(prev => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    } : null)
  }

  const handleMessage = () => {
    if (!currentUser.isVerified) {
      alert("Apenas perfis verificados podem enviar mensagens")
      return
    }
    // Implementar envio de mensagem
  }

  const handleBlock = () => {
    setProfile(prev => prev ? { ...prev, isBlocked: true } : null)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    // Implementar envio de mensagem
    setNewMessage("")
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400">O usuário @{username} não existe ou foi removido.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
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
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Search className="w-5 h-5" />
                Explorar
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Bell className="w-5 h-5" />
                Notificações
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Mail className="w-5 h-5" />
                Mensagens
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Calendar className="w-5 h-5" />
                Eventos
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Users className="w-5 h-5" />
                Comunidades
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Bookmark className="w-5 h-5" />
                Salvos
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <User className="w-5 h-5" />
                Perfil
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-left">
                <Settings className="w-5 h-5" />
                Configurações
              </Button>
            </nav>

            {/* Theme Toggle */}
            <Button variant="ghost" className="w-full justify-start gap-3 text-left">
              <Sun className="w-5 h-5" />
              Modo Claro
            </Button>

            {/* Ad Card */}
            <div className="mt-8">
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
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen border-x border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white"
                onClick={() => window.history.back()}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/20 hover:bg-black/40 text-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/20 hover:bg-black/40 text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="relative px-4 md:px-8 -mt-20">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-white dark:ring-gray-900">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <Button size="sm" className="rounded-full w-8 h-8 p-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                    {profile.isVerified && (
                      <BadgeCheck className="w-6 h-6 text-blue-500" />
                    )}
                    {profile.isVIP && (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    )}
                    {profile.isPremium && (
                      <Star className="w-6 h-6 text-pink-500" />
                    )}
                    {profile.isPrivate && (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membro desde {new Date(profile.joinDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Visto {profile.lastSeen}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{profile.followers.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{profile.following.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Seguindo</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{profile.posts.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{profile.likes.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Curtidas</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={profile.isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                      disabled={!currentUser.isVerified}
                    >
                      {profile.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Deixar de Seguir
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {!currentUser.isVerified ? "Verificação Necessária" : "Seguir"}
                        </>
                      )}
                    </Button>
                    
                    {profile.canMessage && (
                      <Button variant="outline" onClick={handleMessage}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Mensagem
                      </Button>
                    )}
                    
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                    
                    <Button variant="outline" onClick={handleBlock}>
                      <Ban className="w-4 h-4 mr-2" />
                      Bloquear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Interesses</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(profile.socialLinks).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Redes Sociais</h3>
                  <div className="flex gap-2">
                    {profile.socialLinks.instagram && (
                      <Button variant="outline" size="sm">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </Button>
                    )}
                    {profile.socialLinks.twitter && (
                      <Button variant="outline" size="sm">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                    )}
                    {profile.socialLinks.facebook && (
                      <Button variant="outline" size="sm">
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Content Tabs */}
            <div className="px-4 md:px-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="photos">Fotos</TabsTrigger>
                  <TabsTrigger value="videos">Vídeos</TabsTrigger>
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  <div className="space-y-4">
                    {profile.userPosts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.avatar} />
                              <AvatarFallback>
                                {profile.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{profile.name}</span>
                                {profile.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                                {profile.isVIP && <Crown className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {post.timestamp}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{post.content}</p>
                          
                          {post.images && post.images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {post.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.userPhotos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-48 object-cover"
                          />
                          {photo.isPrivate && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-black/50 text-white">
                                <Lock className="w-3 h-3 mr-1" />
                                Privada
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium mb-2">{photo.caption}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Heart className="w-3 h-3" />
                            <span>{photo.likes}</span>
                            <MessageCircle className="w-3 h-3" />
                            <span>{photo.comments}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-6">
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum vídeo encontrado</p>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nome</span>
                          <span className="font-medium">{profile.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Localização</span>
                          <span className="font-medium">{profile.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tipo de Relacionamento</span>
                          <span className="font-medium">{profile.relationshipType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Membro desde</span>
                          <span className="font-medium">
                            {new Date(profile.joinDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Estatísticas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Posts</span>
                          <span className="font-medium">{profile.posts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Fotos</span>
                          <span className="font-medium">{profile.photos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Vídeos</span>
                          <span className="font-medium">{profile.videos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Curtidas Recebidas</span>
                          <span className="font-medium">{profile.likes.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar no OpenLove"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border-0 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            {/* Trending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">#1 Trending</p>
                  <p className="font-semibold">#OpenLove</p>
                  <p className="text-sm text-gray-500">12.5K posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">#2 Trending</p>
                  <p className="font-semibold">#LiberdadeERespeito</p>
                  <p className="text-sm text-gray-500">8.2K posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">#3 Trending</p>
                  <p className="font-semibold">#CasaisLivres</p>
                  <p className="text-sm text-gray-500">5.8K posts</p>
                </div>
              </CardContent>
            </Card>

            {/* Who to Follow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quem Seguir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png" />
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">Maria & Carlos</p>
                      <p className="text-xs text-gray-500">@mariacarlos</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Seguir
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png" />
                      <AvatarFallback>RA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">Rafael Alves</p>
                      <p className="text-xs text-gray-500">@rafael_livre</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Seguir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <div className="bg-background flex flex-wrap items-center justify-center rounded-full border p-1 shadow-sm">
              <div className="flex -space-x-1">
                <Avatar className="ring-background size-6 ring-2">
                  <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png" />
                  <AvatarFallback className="text-xs">OS</AvatarFallback>
                </Avatar>
                <Avatar className="ring-background size-6 ring-2">
                  <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png" />
                  <AvatarFallback className="text-xs">HL</AvatarFallback>
                </Avatar>
                <Avatar className="ring-background size-6 ring-2">
                  <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png" />
                  <AvatarFallback className="text-xs">HR</AvatarFallback>
                </Avatar>
                <Avatar className="ring-background size-6 ring-2">
                  <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png" />
                  <AvatarFallback className="text-xs">JW</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-muted-foreground px-2 text-xs">
                <strong className="text-foreground font-medium">10K+</strong> pessoas conectadas.
              </p>
            </div>

            {/* Ad Card */}
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
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-white/10 p-2 z-40">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" className="flex-col gap-1">
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1">
            <Search className="w-5 h-5" />
            <span className="text-xs">Buscar</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs">Notificações</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col gap-1">
            <Mail className="w-5 h-5" />
            <span className="text-xs">Mensagens</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 