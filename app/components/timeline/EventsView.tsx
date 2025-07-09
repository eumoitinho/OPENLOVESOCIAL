"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, User } from "lucide-react"

interface EventsViewProps {
  events: any[]
  handleJoinEvent: (eventId: string) => void
}

export function EventsView({ events, handleJoinEvent }: EventsViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Próximos Eventos</CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden"
          >
            <div className="aspect-video relative">
              <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
              <Badge className="absolute top-3 right-3 bg-pink-600 text-white">{event.category}</Badge>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{event.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400"
                >
                  {event.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                onClick={() => handleJoinEvent(event.id)}
                className={
                  event.isJoined
                    ? "w-full bg-pink-600 hover:bg-pink-700 text-white"
                    : "w-full bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:via-rose-700 hover:to-purple-700 text-white"
                }
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
