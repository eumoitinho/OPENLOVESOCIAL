"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
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
  Settings,
  Star,
  Camera,
  Music,
  Coffee,
  Wine,
  Gamepad2,
  BookOpen,
  Palette,
  Dumbbell,
  Globe,
  Tag,
  Image as ImageIcon,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  image: string
  attendees: number
  maxAttendees: number
  isPrivate: boolean
  isPremium: boolean
  organizer: {
    name: string
    avatar: string
    username: string
  }
  tags: string[]
  isLiked: boolean
  isAttending: boolean
  price?: string
}

interface EventsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EventsDialog = function EventsDialog({ open, onOpenChange }: EventsDialogProps) {
  // Remover MOCK_EVENTS
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/events")
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
  }, [open])

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
              attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
            }
          : event
      )
    )
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory
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
      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Novo Evento
            </DialogTitle>
            <DialogDescription>
              Compartilhe um evento incrível com a comunidade
            </DialogDescription>
          </DialogHeader>

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

            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Cidade, Estado"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Preço (opcional)</label>
              <Input
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="R$ 0 (gratuito)"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" className="flex-1">
                Criar Evento
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 sm:p-6 bg-white dark:bg-gray-900">
          <DialogHeader className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Eventos
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Descubra e participe de eventos incríveis
                </DialogDescription>
              </div>
              <Button onClick={() => setCreateEventOpen(true)} size="sm" className="text-xs">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Criar Evento</span>
                <span className="sm:hidden">Criar</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-2 sm:mx-4 mt-2 sm:mt-4">
                <TabsTrigger value="upcoming" className="text-xs">Próximos</TabsTrigger>
                <TabsTrigger value="my-events" className="text-xs">Meus Eventos</TabsTrigger>
                <TabsTrigger value="past" className="text-xs">Passados</TabsTrigger>
              </TabsList>

              <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 px-2 sm:px-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 sm:pl-10 text-sm"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 text-sm">
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

              <TabsContent value="upcoming" className="flex-1 mt-2 sm:mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto max-h-[60vh] px-2 sm:px-4">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-32 sm:h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {event.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-500 text-white text-xs px-1 py-0.5">
                              <Star className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Premium</span>
                            </Badge>
                          )}
                          {event.isPrivate && (
                            <Badge variant="secondary" className="bg-gray-500 text-white text-xs px-1 py-0.5">
                              <Lock className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Privado</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg line-clamp-1">{event.title}</CardTitle>
                            <CardDescription className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm">
                              {event.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="space-y-1 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{event.date} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{event.attendees}/{event.maxAttendees} participantes</span>
                          </div>
                          {event.price && (
                            <div className="text-xs sm:text-sm font-medium text-green-600">
                              {event.price}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
                          <Button
                            variant={event.isAttending ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttend(event.id)}
                            className="flex-1 text-xs"
                          >
                            {event.isAttending ? "Participando" : "Participar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(event.id)}
                          >
                            <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", event.isLiked && "fill-red-500 text-red-500")} />
                          </Button>
                          <Button variant="ghost" size="sm" className="hidden sm:flex">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-events" className="flex-1 mt-2 sm:mt-4">
                <div className="text-center py-8 text-gray-500 px-4">
                  <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Você ainda não criou eventos</p>
                  <Button onClick={() => setCreateEventOpen(true)} className="mt-2 text-xs">
                    Criar Primeiro Evento
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="past" className="flex-1 mt-2 sm:mt-4">
                <div className="text-center py-8 text-gray-500 px-4">
                  <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">Nenhum evento passado</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      <CreateEventForm />
    </>
  )
} 