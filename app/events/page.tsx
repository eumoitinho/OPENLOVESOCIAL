"use client"

import { useState } from "react"
import { useCanAccess, usePlanUsage } from "@/lib/plans/hooks"
import { usePaywall } from "@/lib/plans/paywall"
import PaywallModal from '@/components/plan-limits/PaywallModal'
import PlanIndicator from '@/components/plan-limits/PlanIndicator'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Calendar,
  MessageCircle,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  MoreVertical,
  Camera,
  Music,
  Coffee,
  Wine,
  Gamepad2,
  BookOpen,
  Palette,
  Dumbbell,
  Globe as GlobeIcon,
  Tag,
  UserPlus,
  Shield,
  Crown,
  TrendingUp,
  Send,
  Mic,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Video,
  Play,
  Home,
  Bell,
  Mail,
  Bookmark,
  User,
  Sun,
  Settings,
  Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description: string
  category: string
  image: string
  date: string
  time: string
  location: string
  maxAttendees: number
  currentAttendees: number
  price: number
  isPrivate: boolean
  isPremium: boolean
  isVIP: boolean
  isJoined: boolean
  isLiked: boolean
  tags: string[]
  organizer: {
    name: string
    avatar: string
    isVerified: boolean
    isVIP: boolean
  }
  attendees: {
    name: string
    avatar: string
    isVerified: boolean
    isVIP: boolean
    status: "confirmed" | "pending" | "waitlist"
  }[]
  chatMessages: {
    id: string
    content: string
    timestamp: string
    user: {
      name: string
      avatar: string
      isVerified: boolean
      isVIP: boolean
    }
    isFromMe: boolean
  }[]
}

interface User {
  isVerified: boolean
  isVIP: boolean
}

export default function EventsPage() {
  // Hooks para verificação de planos
  const canAccess = useCanAccess()
  const usage = usePlanUsage()
  const { paywall, requireFeature, closePaywall } = usePaywall()
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Encontro Mensal Casais Livres SP",
      description: "Um encontro descontraído para casais que vivem relacionamentos abertos. Networking, conversas interessantes e novas amizades em um ambiente seguro e respeitoso.",
      category: "Social",
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
      date: "15 de Dezembro, 2024",
      time: "19:00 - 23:00",
      location: "Bar Lounge, São Paulo - SP",
      maxAttendees: 50,
      currentAttendees: 34,
      price: 0,
      isPrivate: false,
      isPremium: false,
      isVIP: false,
      isJoined: true,
      isLiked: true,
      tags: ["casais", "networking", "são paulo"],
      organizer: {
        name: "Amanda & Carlos",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
        isVerified: true,
        isVIP: true
      },
      attendees: [
        {
          name: "Você",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
          isVerified: true,
          isVIP: false,
          status: "confirmed"
        },
        {
          name: "Lisa & João",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
          isVerified: true,
          isVIP: false,
          status: "confirmed"
        },
        {
          name: "Sofia Mendes",
          avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
          isVerified: true,
          isVIP: false,
          status: "pending"
        }
      ],
      chatMessages: [
        {
          id: "1",
          content: "Oi pessoal! Quem vai no evento de sábado?",
          timestamp: "10:30",
          user: {
            name: "Amanda & Carlos",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
            isVerified: true,
            isVIP: true
          },
          isFromMe: false
        },
        {
          id: "2",
          content: "Sim! Vamos sim, já confirmei presença!",
          timestamp: "10:32",
          user: {
            name: "Você",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
            isVerified: true,
            isVIP: false
          },
          isFromMe: true
        },
        {
          id: "3",
          content: "Que ótimo! Vai ser incrível!",
          timestamp: "10:35",
          user: {
            name: "Lisa & João",
            avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
            isVerified: true,
            isVIP: false
          },
          isFromMe: false
        }
      ]
    },
    {
      id: "2",
      title: "Workshop VIP de Fotografia Íntima",
      description: "Workshop exclusivo para fotógrafos e modelos VIP. Aprenda técnicas avançadas de fotografia artística e íntima com profissionais experientes.",
      category: "Arte",
      image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto",
      date: "20 de Dezembro, 2024",
      time: "14:00 - 18:00",
      location: "Estúdio Privado, Cascais - Portugal",
      maxAttendees: 20,
      currentAttendees: 18,
      price: 150,
      isPrivate: true,
      isPremium: true,
      isVIP: true,
      isJoined: false,
      isLiked: false,
      tags: ["fotografia", "arte", "vip", "workshop"],
      organizer: {
        name: "Lisa & João",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
        isVerified: true,
        isVIP: true
      },
      attendees: [],
      chatMessages: []
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [createEventOpen, setCreateEventOpen] = useState(false)

  // Mock user - em produção viria do contexto de autenticação
  const currentUser: User = {
    isVerified: true,
    isVIP: false
  }

  const categories = [
    { id: "all", name: "Todos", icon: GlobeIcon },
    { id: "social", name: "Social", icon: Users },
    { id: "arte", name: "Arte", icon: Palette },
    { id: "fitness", name: "Fitness", icon: Dumbbell },
    { id: "cultura", name: "Cultura", icon: BookOpen },
    { id: "musica", name: "Música", icon: Music },
    { id: "games", name: "Games", icon: Gamepad2 },
  ]

  const handleJoin = (eventId: string) => {
    if (!currentUser.isVerified) {
      alert("Apenas perfis verificados podem participar de eventos")
      return
    }

    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              isJoined: !event.isJoined,
              currentAttendees: event.isJoined ? event.currentAttendees - 1 : event.currentAttendees + 1
            }
          : event
      )
    )
  }

  const handleLike = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, isLiked: !event.isLiked }
          : event
      )
    )
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedEvent) return

    if (!currentUser.isVerified) {
      alert("Apenas perfis verificados podem enviar mensagens")
      return
    }

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      user: {
        name: "Você",
        avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
        isVerified: currentUser.isVerified,
        isVIP: currentUser.isVIP
      },
      isFromMe: true
    }

    setEvents(prev =>
      prev.map(event =>
        event.id === selectedEvent.id
          ? {
              ...event,
              chatMessages: [...event.chatMessages, message]
            }
          : event
      )
    )

    setNewMessage("")
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const joinedEvents = events.filter(e => e.isJoined)
  const recommendedEvents = events.filter(e => !e.isJoined)

  const canCreateEvent = currentUser.isVIP

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
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                  Eventos
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Descubra e participe de eventos incríveis
                </p>
              </div>
              {canCreateEvent ? (
                <Button onClick={() => setCreateEventOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Evento
                </Button>
              ) : (
                <div className="text-center">
                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Apenas VIP
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Criar eventos</p>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Events List */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="discover">Descobrir</TabsTrigger>
                    <TabsTrigger value="joined">Meus Eventos</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Buscar eventos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <TabsContent value="discover" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredEvents.filter(e => !e.isJoined).map((event) => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
                          <div className="relative">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {event.isPremium && (
                                <Badge variant="secondary" className="bg-yellow-500 text-white">
                                  <Star className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              {event.isPrivate && (
                                <Badge variant="secondary" className="bg-gray-500 text-white">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Privado
                                </Badge>
                              )}
                              {event.isVIP && (
                                <Badge variant="secondary" className="bg-purple-500 text-white">
                                  <Crown className="w-3 h-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <CardHeader>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{event.currentAttendees}/{event.maxAttendees} participantes</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {event.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleJoin(event.id)
                                  }}
                                  className="flex-1"
                                  disabled={!currentUser.isVerified}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  {!currentUser.isVerified ? "Verificação Necessária" : "Participar"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(event.id)
                                  }}
                                >
                                  <Heart className={cn("w-4 h-4", event.isLiked && "fill-red-500 text-red-500")} />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="joined" className="space-y-4">
                    {joinedEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Você ainda não participa de eventos</p>
                        <Button onClick={() => setActiveTab("discover")} className="mt-2">
                          Descobrir Eventos
                        </Button>
                      </div>
                    ) : (
                      joinedEvents.map((event) => (
                        <Card key={event.id} className="overflow-hidden cursor-pointer" onClick={() => setSelectedEvent(event)}>
                          <div className="flex">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-32 h-32 object-cover"
                            />
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                    {event.isPremium && (
                                      <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        Premium
                                      </Badge>
                                    )}
                                    {event.isVIP && (
                                      <Badge variant="secondary" className="bg-purple-500 text-white text-xs">
                                        <Crown className="w-3 h-3 mr-1" />
                                        VIP
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {event.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{event.date}</span>
                                    <span>•</span>
                                    <span>{event.location}</span>
                                    <span>•</span>
                                    <span>{event.currentAttendees}/{event.maxAttendees} participantes</span>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Ver Evento
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="trending" className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Eventos em alta em breve</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Event Chat */}
              <div className="lg:col-span-1">
                {selectedEvent ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                          <CardDescription>
                            {selectedEvent.currentAttendees}/{selectedEvent.maxAttendees} participantes
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {selectedEvent.chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.isFromMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                              message.isFromMe
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={message.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {message.user.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{message.user.name}</span>
                              {message.user.isVerified && (
                                <Check className="w-3 h-3 text-blue-500" />
                              )}
                              {message.user.isVIP && (
                                <Crown className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {message.timestamp}
                              </span>
                              {message.isFromMe && (
                                message.user.isVerified ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t">
                      {currentUser.isVerified ? (
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Textarea
                              placeholder="Digite sua mensagem..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  sendMessage()
                                }
                              }}
                              className="min-h-[40px] max-h-32 resize-none"
                              rows={1}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={sendMessage}
                              disabled={!newMessage.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Apenas perfis verificados podem enviar mensagens
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Selecione um evento</p>
                      <p className="text-sm">Escolha um evento para ver o chat</p>
                    </div>
                  </Card>
                )}
              </div>
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
