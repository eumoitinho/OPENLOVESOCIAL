"use client"

import type React from "react"
import { Calendar, MapPin, Users, Clock, Heart, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees?: number
  category: string
  imageUrl?: string
  organizer: {
    name: string
    avatar?: string
  }
  isAttending?: boolean
  isFavorite?: boolean
  price?: number
}

interface EventCardProps {
  event: Event
  onAttend?: (eventId: string) => void
  onFavorite?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

const EventCard: React.FC<EventCardProps> = ({ event, onAttend, onFavorite, onShare }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      tecnologia: "bg-blue-100 text-blue-800",
      música: "bg-purple-100 text-purple-800",
      esporte: "bg-green-100 text-green-800",
      arte: "bg-pink-100 text-pink-800",
      educação: "bg-yellow-100 text-yellow-800",
      negócios: "bg-gray-100 text-gray-800",
      saúde: "bg-red-100 text-red-800",
      culinária: "bg-orange-100 text-orange-800",
    }
    return colors[category.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAttendanceStatus = () => {
    if (!event.maxAttendees) return `${event.attendees} participantes`

    const percentage = (event.attendees / event.maxAttendees) * 100
    if (percentage >= 90) return "Quase lotado"
    if (percentage >= 70) return "Muitos interessados"
    return `${event.attendees} / ${event.maxAttendees} vagas`
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => onFavorite?.(event.id)}>
              <Heart className={`h-4 w-4 ${event.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => onShare?.(event.id)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">{event.description}</CardDescription>
          </div>
          {!event.imageUrl && <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{event.organizer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">por {event.organizer.name}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.time}
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {getAttendanceStatus()}
            </div>
            {event.price !== undefined && (
              <div className="text-sm font-medium">
                {event.price === 0 ? "Gratuito" : `R$ ${event.price.toFixed(2)}`}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              variant={event.isAttending ? "secondary" : "default"}
              onClick={() => onAttend?.(event.id)}
              disabled={event.maxAttendees && event.attendees >= event.maxAttendees}
            >
              {event.isAttending ? "Participando" : "Participar"}
            </Button>
            <Button variant="outline">Ver Detalhes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard
