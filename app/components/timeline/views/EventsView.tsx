"use client"

import React from "react"
import { Calendar, Users, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Tipos podem ser centralizados
type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string
  participants: number
  maxParticipants: number
  price: string
  organizer: string
  category: string
  isJoined: boolean
}

interface EventsViewProps {
  events: Event[]
  onJoinEvent: (eventId: string) => void
}

export function EventsView({ events, onJoinEvent }: EventsViewProps) {
  return (
    <div className="border-x border-openlove-200 min-h-screen">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-openlove-200 p-4">
        <h2 className="text-xl font-bold text-openlove-800">Próximos Eventos</h2>
      </div>
      <div className="p-4 space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="border-openlove-200">
            <div className="aspect-video relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <Badge className="absolute top-3 right-3 bg-openlove-600 text-white">
                {event.category}
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-openlove-800">{event.title}</CardTitle>
                  <CardDescription className="mt-1 text-openlove-600">{event.description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-openlove-600 border-openlove-600">
                  {event.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-openlove-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {event.date} às {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.participants}/{event.maxParticipants} participantes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Organizado por {event.organizer}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onJoinEvent(event.id)}
                className={cn(
                  "w-full",
                  event.isJoined
                    ? "bg-openlove-600 hover:bg-openlove-700"
                    : "bg-gradient-to-r from-openlove-500 to-openlove-600 hover:from-openlove-600 hover:to-openlove-700",
                )}
              >
                {event.isJoined ? "Participando" : "Participar"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
