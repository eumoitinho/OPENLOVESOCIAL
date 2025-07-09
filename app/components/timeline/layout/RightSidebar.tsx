"use client"

import React from "react"
import { Calendar, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Tipos podem ser centralizados futuramente
type User = {
  id: string
  name: string
  username: string
  avatar: string
  mutualFriends: number
}

type Event = {
  id: string
  title: string
  date: string
  time: string
}

type Profile = {
  isPremium: boolean
}

interface RightSidebarProps {
  users: User[]
  events: Event[]
  profile: Profile
  onToggleFollow: (username: string) => void
}

function AdCard() {
  return (
    <Card className="bg-gradient-to-r from-openlove-100 to-openlove-200 border-0 shadow-md">
      <CardContent className="p-4 text-center">
        <h3 className="font-bold text-openlove-800 text-lg">Café Central</h3>
        <p className="text-base text-openlove-600">O melhor café da cidade! Venha nos visitar.</p>
        <Button size="sm" className="mt-2 bg-gradient-to-r from-openlove-500 to-openlove-600 text-white hover:from-openlove-600 hover:to-openlove-700 shadow">
          Saiba Mais
        </Button>
      </CardContent>
    </Card>
  )
}

function PeopleSuggestionCard({ users, onToggleFollow }: { users: User[]; onToggleFollow: (username: string) => void }) {
  return (
    <Card className="bg-gradient-to-r from-white to-openlove-100 border-0 shadow">
      <CardHeader>
        <CardTitle className="text-lg text-openlove-800 font-bold">Pessoas que você pode conhecer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.slice(0, 3).map((user) => (
          <div key={user.id} className="flex items-center gap-4">
            <Avatar className="ring-2 ring-openlove-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-openlove-400 to-openlove-500 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-semibold text-openlove-800">{user.name}</span>
              <span className="text-sm text-openlove-600">{user.mutualFriends} amigos em comum</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleFollow(user.username)}
              className="border-openlove-300 text-openlove-600 hover:bg-openlove-100 bg-white"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function UpcomingEventsCard({ events }: { events: Event[] }) {
  return (
    <Card className="bg-gradient-to-r from-white to-openlove-100 border-0 shadow">
      <CardHeader>
        <CardTitle className="text-lg text-openlove-800 flex items-center gap-2 font-bold">
          <Calendar className="w-5 h-5" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.slice(0, 2).map((event) => (
          <div key={event.id} className="space-y-1">
            <h4 className="font-medium text-sm text-openlove-800">{event.title}</h4>
            <p className="text-xs text-openlove-600">
              {event.date} às {event.time}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PremiumUpgradeCard() {
  return (
    <Card className="bg-gradient-to-r from-openlove-500 to-openlove-600 text-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Upgrade para Premium</CardTitle>
        <CardDescription className="text-openlove-100">Desbloqueie recursos exclusivos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-base">
        <div className="flex items-center gap-2">
          <span>•</span>
          <span>Mensagens ilimitadas</span>
        </div>
        <div className="flex items-center gap-2">
          <span>•</span>
          <span>Ver quem visitou seu perfil</span>
        </div>
        <div className="flex items-center gap-2">
          <span>•</span>
          <span>Filtros avançados</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-white text-openlove-600 hover:bg-openlove-100 font-bold">
          Fazer Upgrade
        </Button>
      </CardFooter>
    </Card>
  )
}

export function RightSidebar({ users, events, profile, onToggleFollow }: RightSidebarProps) {
  return (
    <div className="w-80 border-l border-openlove-200 p-4 space-y-6 hidden lg:block bg-gradient-to-b from-white via-openlove-50 to-openlove-100 z-20">
      <AdCard />
      <PeopleSuggestionCard users={users} onToggleFollow={onToggleFollow} />
      <UpcomingEventsCard events={events} />
      {!profile.isPremium && <PremiumUpgradeCard />}
    </div>
  )
}
