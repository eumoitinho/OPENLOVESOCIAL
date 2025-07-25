"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Plus,
  Search,
  Heart,
  Share2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import EventCard from './EventCard'
import CreateEvent from './CreateEvent'
import EventFilters from './EventFilters'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  cover_image_url?: string
  start_date: string
  end_date?: string
  location_name?: string
  latitude?: number
  longitude?: number
  is_online: boolean
  online_link?: string
  type: 'public' | 'private' | 'paid'
  category: string
  price?: number
  max_participants?: number
  creator: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_verified: boolean
  }
  stats: {
    participants_count: number
    interested_count: number
  }
  user_participation_status?: 'going' | 'interested' | 'not_going'
  distance_km?: number
}

interface EventFilters {
  category?: string
  type?: 'all' | 'public' | 'private' | 'paid'
  dateRange?: 'today' | 'this_week' | 'this_month' | 'custom'
  location?: 'nearby' | 'online' | 'all'
  priceRange?: 'free' | 'paid' | 'all'
}

export default function EventsList() {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<EventFilters>({
    type: 'all',
    dateRange: 'this_week',
    location: 'all',
    priceRange: 'all'
  })
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation && user) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Localização não disponível:', error)
        }
      )
    }
  }, [user])

  // Carregar eventos
  useEffect(() => {
    loadEvents()
  }, [filters, userLocation])

  const loadEvents = async () => {
    try {
      setLoading(true)
      
      // Construir query params
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.priceRange === 'free') params.append('is_paid', 'false')
      if (filters.priceRange === 'paid') params.append('is_paid', 'true')
      
      // Filtros de data
      if (filters.dateRange && filters.dateRange !== 'custom') {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'this_week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
        }
        
        params.append('start_date_from', startDate.toISOString())
      }
      
      // Usar API de eventos próximos se localização disponível
      const endpoint = userLocation && filters.location === 'nearby' 
        ? `/api/events/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=50&${params}`
        : `/api/events?${params}`
      
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Erro ao carregar eventos')
      
      const data = await response.json()
      setEvents(data.events || data)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventAction = async (eventId: string, action: 'join' | 'interested' | 'share') => {
    if (!user) {
      // Redirect to login
      return
    }

    try {
      switch (action) {
        case 'join':
        case 'interested':
          const response = await fetch(`/api/events/${eventId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action === 'join' ? 'going' : 'interested' })
          })
          
          if (response.ok) {
            // Atualizar evento local
            setEvents(events.map(event => 
              event.id === eventId 
                ? { 
                    ...event, 
                    user_participation_status: action === 'join' ? 'going' : 'interested',
                    stats: {
                      ...event.stats,
                      participants_count: action === 'join' 
                        ? event.stats.participants_count + 1 
                        : event.stats.participants_count,
                      interested_count: action === 'interested'
                        ? event.stats.interested_count + 1
                        : event.stats.interested_count
                    }
                  }
                : event
            ))
          }
          break
          
        case 'share':
          if (navigator.share) {
            const event = events.find(e => e.id === eventId)
            if (event) {
              await navigator.share({
                title: event.title,
                text: event.description,
                url: `${window.location.origin}/events/${eventId}`
              })
            }
          }
          break
      }
    } catch (error) {
      console.error('Erro na ação do evento:', error)
    }
  }

  const handleCreateEvent = () => {
    // Verificar se pode criar eventos
    if (!canAccess.features.canCreateEvents) {
      // Mostrar modal de upgrade
      return
    }
    
    setShowCreateModal(true)
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-gray-600">
            Descubra eventos próximos e conecte-se com pessoas
          </p>
        </div>
        
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Criar Evento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <EventFilters 
          filters={filters}
          onFiltersChange={setFilters}
          userLocation={userLocation}
        />
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f !== 'all' && f !== undefined)
                ? 'Tente ajustar os filtros de busca'
                : 'Seja o primeiro a criar um evento em sua região'
              }
            </p>
            {canAccess.features.canCreateEvents && (
              <Button onClick={handleCreateEvent}>
                Criar Primeiro Evento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onAction={(action) => handleEventAction(event.id, action)}
              showDistance={filters.location === 'nearby' && event.distance_km !== undefined}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredEvents.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadEvents}>
            Carregar mais eventos
          </Button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEvent
          onClose={() => setShowCreateModal(false)}
          onEventCreated={(newEvent) => {
            setEvents([newEvent, ...events])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}