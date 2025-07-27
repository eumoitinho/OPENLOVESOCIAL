"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCanAccess } from "@/lib/plans/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  Heart,
  Share2,
  MessageCircle,
  Music,
  Wine,
  Gamepad2,
  BookOpen,
  Palette,
  Dumbbell,
  Globe,
  Lock,
  X,
  Shield,
  CheckCircle
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  location: string
  category: string
  image_url: string
  current_attendees: number
  max_attendees: number
  is_private: boolean
  is_verified: boolean
  price?: string
  creator_id: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_verified: boolean
  }
  tags?: string[]
  isLiked?: boolean
  isAttending?: boolean
}

export function EventsContent() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canAccess = useCanAccess()
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        // Se o usuário só pode ver eventos verificados, adicionar filtro
        // Corrigido: a propriedade correta é canJoinVerifiedOnly
        const verifiedOnly = canAccess.canJoinVerifiedOnly
        const url = verifiedOnly ? "/api/events?verified=true" : "/api/events"
        
        const res = await fetch(url)
        if (!res.ok) throw new Error("Erro ao buscar eventos")
        const json = await res.json()
        setEvents(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [canAccess.canJoinVerifiedOnly])

  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", name: "Todos", icon: Globe },
    { id: "social", name: "Social", icon: Users },
    { id: "arte", name: "Arte", icon: Palette },
    { id: "gastronomia", name: "Gastronomia", icon: Wine },
    { id: "fitness", name: "Fitness", icon: Dumbbell },
    { id: "cultura", name: "Cultura", icon: BookOpen },
    { id: "musica", name: "Música", icon: Music },
    { id: "games", name: "Games", icon: Gamepad2 },
  ]

  const handleLike = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, isLiked: !event.isLiked }
          : event
      )
    )
  }

  const handleAttend = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              isAttending: !event.isAttending,
              current_attendees: event.isAttending ? event.current_attendees - 1 : event.current_attendees + 1
            }
          : event
      )
    )
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory
    
    // Se o usuário só pode ver eventos verificados, filtra apenas verificados
    if (canAccess.canJoinVerifiedOnly) {
      return matchesSearch && matchesCategory && event.is_verified
    }
    
    return matchesSearch && matchesCategory
  })

  const CreateEventForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      maxAttendees: "",
      isPrivate: false,
      price: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Implementar criação do evento
      setCreateEventOpen(false)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Novo Evento
            </h2>
            <Button variant="ghost" onClick={() => setCreateEventOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Título do Evento</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Workshop de Fotografia"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
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
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva seu evento..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Horário</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Máximo de Participantes</label>
                <Input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  placeholder="50"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Localização</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: São Paulo, SP"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Preço (opcional)</label>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ex: R$ 50,00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isPrivate" className="text-sm font-medium">
                Evento privado
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Evento
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">
          <p>Carregando eventos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          <p>Erro ao carregar eventos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Eventos
          </h1>
          <p className="text-muted-foreground">
            Descubra e participe de eventos incríveis
          </p>
        </div>
        <Button 
          onClick={() => {
            if (canAccess.canCreateEvents) {
              router.push('/events/create')
            } else {
              router.push('/pricing')
            }
          }}
          disabled={!canAccess.canCreateEvents}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Evento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="my-events">Meus Eventos</TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={event.image_url || '/placeholder-event.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {event.is_private ? (
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        Privado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        <Globe className="w-3 h-3 mr-1" />
                        Público
                      </Badge>
                    )}
                    {event.is_verified && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {event.profiles.is_verified && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Criador Verificado
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(event.id)}
                      className={cn(
                        "h-8 w-8 p-0",
                        event.isLiked && "text-red-500"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", event.isLiked && "fill-current")} />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.current_attendees}/{event.max_attendees} participantes</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(event.tags || []).slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(event.tags || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(event.tags || []).length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={event.isAttending ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAttend(event.id)}
                    >
                      {event.isAttending ? "Cancelar" : "Participar"}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-events" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Seus eventos aparecerão aqui</p>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Eventos passados aparecerão aqui</p>
          </div>
        </TabsContent>
      </Tabs>

      {createEventOpen && <CreateEventForm />}
    </div>
  )
}
