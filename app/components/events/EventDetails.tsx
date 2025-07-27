"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Share2,
  DollarSign,
  Monitor,
  CheckCircle,
  Star,
  Navigation,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Flag,
  Edit,
  X,
  QrCode,
  Download
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/components/auth/AuthProvider"
import EventParticipants from './EventParticipants'

interface Event {
  id: string
  title: string
  description: string
  cover_image_url?: string
  start_date: string
  end_date?: string
  location_name?: string
  location_address?: string
  latitude?: number
  longitude?: number
  is_online: boolean
  online_link?: string
  type: 'public' | 'private' | 'paid'
  category: string
  price?: number
  max_participants?: number
  min_age?: number
  max_age?: number
  tags: string[]
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
  can_edit?: boolean
  qr_code?: string
}

interface EventDetailsProps {
  eventId: string
  onClose: () => void
  onEventUpdated?: (event: Event) => void
}

export default function EventDetails({ eventId, onClose, onEventUpdated }: EventDetailsProps) {
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) throw new Error('Evento não encontrado')
      
      const eventData = await response.json()
      setEvent(eventData)
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipation = async (status: 'going' | 'interested' | 'not_going') => {
    if (!user || !event) return

    setActionLoading(status)
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Erro ao participar do evento')

      // Atualizar evento local
      const updatedEvent = {
        ...event,
        user_participation_status: status,
        stats: {
          ...event.stats,
          participants_count: status === 'going' 
            ? event.stats.participants_count + (event.user_participation_status === 'going' ? 0 : 1)
            : event.user_participation_status === 'going' 
              ? event.stats.participants_count - 1 
              : event.stats.participants_count,
          interested_count: status === 'interested'
            ? event.stats.interested_count + (event.user_participation_status === 'interested' ? 0 : 1)
            : event.user_participation_status === 'interested'
              ? event.stats.interested_count - 1
              : event.stats.interested_count
        }
      }

      setEvent(updatedEvent)
      onEventUpdated?.(updatedEvent)
    } catch (error) {
      console.error('Erro na participação:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const shareToFeed = async () => {
    if (!user || !event) return
    
    setActionLoading('share_to_feed')
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_share',
          content: `Vou participar deste evento! 🎉`,
          related_data: {
            event_id: event.id,
            event_title: event.title,
            event_date: event.start_date,
            event_location: event.location_name || 'Online'
          },
          visibility: 'public'
        })
      })
      
      if (response.ok) {
        alert('Evento compartilhado no seu feed!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const shareEvent = async () => {
    if (!event) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `${window.location.origin}/events/${eventId}`
        })
      } catch (error) {
        console.warn('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback - copiar para clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`)
      alert('Link copiado para área de transferência!')
    }
  }

  const openLocation = () => {
    if (!event || event.is_online) return

    if (event.latitude && event.longitude) {
      const url = `https://maps.google.com/maps?q=${event.latitude},${event.longitude}`
      window.open(url, '_blank')
    } else if (event.location_address) {
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(event.location_address)}`
      window.open(url, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getParticipationButton = () => {
    if (!user) {
      return (
        <Button onClick={() => handleParticipation('going')}>
          <Users className="w-4 h-4 mr-2" />
          Fazer Login para Participar
        </Button>
      )
    }

    switch (event?.user_participation_status) {
      case 'going':
        return (
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleParticipation('not_going')}
            disabled={actionLoading === 'not_going'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmado
          </Button>
        )
      case 'interested':
        return (
          <Button 
            variant="outline"
            onClick={() => handleParticipation('going')}
            disabled={actionLoading === 'going'}
          >
            <Star className="w-4 h-4 mr-2" />
            Participar
          </Button>
        )
      default:
        return (
          <Button 
            onClick={() => handleParticipation('going')}
            disabled={actionLoading === 'going'}
          >
            <Users className="w-4 h-4 mr-2" />
            Participar
          </Button>
        )
    }
  }

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!event) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Evento não encontrado</h3>
            <p className="text-gray-600 mb-4">
              O evento pode ter sido removido ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              {event.creator.is_verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            
            <div className="flex gap-2">
              {event.can_edit && (
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Cover Image */}
        {event.cover_image_url && (
          <div className="h-64 overflow-hidden rounded-lg">
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="participants">
              Participantes ({event.stats.participants_count})
            </TabsTrigger>
            <TabsTrigger value="discussion">Discussão</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sobre o evento</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>

                {/* Tags */}
                {event.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Map/Link */}
                {!event.is_online && event.latitude && event.longitude && (
                  <div>
                    <h4 className="font-medium mb-2">Localização</h4>
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Button onClick={openLocation} variant="outline">
                        <Navigation className="w-4 h-4 mr-2" />
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Creator */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Organizador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={event.creator.avatar_url} />
                        <AvatarFallback>
                          {event.creator.full_name?.charAt(0) || event.creator.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {event.creator.full_name || event.creator.username}
                        </p>
                        <p className="text-sm text-gray-600">@{event.creator.username}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Conversar
                    </Button>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{formatDate(event.start_date)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(event.start_date)}
                          {event.end_date && ` - ${formatTime(event.end_date)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {event.is_online ? (
                        <>
                          <Monitor className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Evento Online</p>
                            {event.online_link && user?.id && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto text-blue-600"
                                onClick={() => window.open(event.online_link, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Acessar link
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{event.location_name}</p>
                            {event.location_address && (
                              <p className="text-sm text-gray-600">{event.location_address}</p>
                            )}
                            {event.distance_km && (
                              <p className="text-xs text-gray-500">
                                {event.distance_km.toFixed(1)}km de distância
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {event.type === 'paid' && event.price && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">R$ {event.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Por pessoa</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {event.stats.participants_count} confirmados
                        </p>
                        {event.stats.interested_count > 0 && (
                          <p className="text-sm text-gray-600">
                            {event.stats.interested_count} interessados
                          </p>
                        )}
                        {event.max_participants && (
                          <p className="text-xs text-gray-500">
                            Máx: {event.max_participants} pessoas
                          </p>
                        )}
                      </div>
                    </div>

                    {(event.min_age || event.max_age) && (
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Faixa etária</p>
                          <p className="text-sm text-gray-600">
                            {event.min_age && event.max_age 
                              ? `${event.min_age} - ${event.max_age} anos`
                              : event.min_age 
                                ? `${event.min_age}+ anos`
                                : `Até ${event.max_age} anos`
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* QR Code para participantes confirmados */}
                {event.user_participation_status === 'going' && event.qr_code && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Check-in
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <img 
                          src={event.qr_code} 
                          alt="QR Code" 
                          className="w-32 h-32 mx-auto mb-3"
                        />
                        <p className="text-xs text-gray-600 mb-3">
                          Apresente este código no evento
                        </p>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar QR
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <EventParticipants eventId={eventId} />
          </TabsContent>

          <TabsContent value="discussion" className="mt-6">
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Discussão em desenvolvimento</h3>
              <p className="text-gray-600">
                Em breve os participantes poderão comentar e tirar dúvidas sobre o evento.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {getParticipationButton()}
          
          {user && event.user_participation_status !== 'interested' && (
            <Button
              variant="outline"
              onClick={() => handleParticipation('interested')}
              disabled={actionLoading === 'interested'}
              className={cn(
                event.user_participation_status === 'interested' && 
                "border-yellow-400 text-yellow-600"
              )}
            >
              <Heart className={cn(
                "w-4 h-4 mr-2",
                event.user_participation_status === 'interested' && "fill-current"
              )} />
              Interessado
            </Button>
          )}

          <div className="flex gap-1 ml-auto">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={shareToFeed}
                disabled={actionLoading === 'share_to_feed'}
                title="Compartilhar no feed"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareEvent}
              title="Compartilhar evento"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Reportar evento"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
