"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Navigation
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'

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

interface EventCardProps {
  event: Event
  onAction: (action: 'join' | 'interested' | 'share' | 'view' | 'share_to_feed') => void
  showDistance?: boolean
  compact?: boolean
}

export default function EventCard({ 
  event, 
  onAction, 
  showDistance = false,
  compact = false 
}: EventCardProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    if (diffDays < 7) return `Em ${diffDays} dias`
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAction = async (action: string) => {
    setIsLoading(action)
    try {
      await onAction(action as any)
    } finally {
      setIsLoading(null)
    }
  }

  const getParticipationButton = () => {
    if (!user) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleAction('join')}>
          <Users className="w-4 h-4 mr-2" />
          Participar
        </Button>
      )
    }

    switch (event.user_participation_status) {
      case 'going':
        return (
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmado
          </Button>
        )
      case 'interested':
        return (
          <Button variant="outline" size="sm" onClick={() => handleAction('join')}>
            <Star className="w-4 h-4 mr-2" />
            Interessado
          </Button>
        )
      default:
        return (
          <Button variant="outline" size="sm" onClick={() => handleAction('join')}>
            <Users className="w-4 h-4 mr-2" />
            Participar
          </Button>
        )
    }
  }

  const shareToFeed = async () => {
    if (!user) return
    
    setIsLoading('share_to_feed')
    try {
      // Criar post compartilhando o evento no feed
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
        // Feedback de sucesso
        alert('Evento compartilhado no seu feed!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar no feed:', error)
      alert('Erro ao compartilhar evento')
    } finally {
      setIsLoading(null)
    }
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleAction('view')}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {event.cover_image_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={event.cover_image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-1 mb-1">{event.description}</p>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.start_date)}
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.stats.participants_count}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Cover Image */}
      {event.cover_image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={event.cover_image_url} 
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => handleAction('view')}
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleAction('view')}
            >
              {event.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {event.description}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {event.type === 'paid' && (
              <Badge variant="secondary" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                R$ {event.price}
              </Badge>
            )}
            
            {event.is_online && (
              <Badge variant="outline" className="text-xs">
                <Monitor className="w-3 h-3 mr-1" />
                Online
              </Badge>
            )}
            
            {event.type === 'private' && (
              <Badge variant="destructive" className="text-xs">
                Privado
              </Badge>
            )}
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mt-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={event.creator.avatar_url} />
            <AvatarFallback className="text-xs">
              {event.creator.full_name?.charAt(0) || event.creator.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            {event.creator.full_name || event.creator.username}
          </span>
          {event.creator.is_verified && (
            <CheckCircle className="w-4 h-4 text-blue-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.start_date)} às {formatTime(event.start_date)}</span>
          </div>

          {!event.is_online && event.location_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location_name}</span>
              {showDistance && event.distance_km && (
                <Badge variant="outline" className="text-xs ml-auto">
                  <Navigation className="w-3 h-3 mr-1" />
                  {event.distance_km.toFixed(1)}km
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.stats.participants_count} confirmados</span>
            </div>
            
            {event.stats.interested_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{event.stats.interested_count} interessados</span>
              </div>
            )}

            {event.max_participants && (
              <div className="text-xs text-gray-500 ml-auto">
                Máx: {event.max_participants}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {getParticipationButton()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('interested')}
            disabled={isLoading === 'interested'}
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

          {/* Dropdown para ações de compartilhamento */}
          <div className="flex gap-1 ml-auto">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={shareToFeed}
                disabled={isLoading === 'share_to_feed'}
                title="Compartilhar no feed"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('share')}
              disabled={isLoading === 'share'}
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}