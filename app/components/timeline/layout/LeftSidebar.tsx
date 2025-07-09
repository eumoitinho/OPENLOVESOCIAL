"use client"

import React from "react"
import {
  Home,
  Compass,
  Calendar,
  Mail,
  User,
  Settings,
  Verified,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Tipos podem ser centralizados futuramente
type UserProfile = {
  name: string
  username: string
  avatar: string
  isPremium: boolean
  stats: {
    friends: number
    posts: number
    likes: number
    earnings: number
  }
}

type NavigationItem = {
  id: string
  label: string
  icon: React.ElementType
}

interface LeftSidebarProps {
  profile: UserProfile
  activeView: string
  onNavigate: (view: string) => void
  onOpenChat: () => void
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Timeline", icon: Home },
  { id: "explore", label: "Explorar", icon: Compass },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "messages", label: "Mensagens", icon: Mail },
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
]

export function LeftSidebar({ profile, activeView, onNavigate, onOpenChat }: LeftSidebarProps) {
  return (
    <div className="w-64 md:w-72 lg:w-80 border-r border-openlove-200 fixed h-full hidden md:flex flex-col bg-gradient-to-b from-white via-openlove-50 to-openlove-100 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-openlove-200">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-openlove-500 via-openlove-600 to-openlove-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
          OpenLove
        </h1>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 border-b border-openlove-200 bg-gradient-to-r from-openlove-50 to-white">
        <div className="text-center mb-4">
          <div className="relative inline-block mb-3">
            <Avatar className="w-16 h-16 ring-4 ring-openlove-200 shadow-lg">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-r from-openlove-400 to-openlove-500 text-white text-lg">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {profile.isPremium && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-openlove-500 to-openlove-600 rounded-full flex items-center justify-center shadow-md">
                <Verified className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <h2 className="font-semibold text-base text-openlove-800">{profile.name}</h2>
          <p className="text-xs text-openlove-500">@{profile.username}</p>
          <Badge variant="outline" className="text-xs mt-2 border-openlove-400 text-openlove-600 bg-openlove-100">
            {profile.isPremium ? "Premium" : "Free"}
          </Badge>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
          <div className="p-2 bg-openlove-100 rounded-lg shadow-sm">
            <div className="font-semibold text-openlove-600">{profile.stats.friends}</div>
            <div className="text-openlove-500">Amigos</div>
          </div>
          <div className="p-2 bg-openlove-100 rounded-lg shadow-sm">
            <div className="font-semibold text-openlove-600">{profile.stats.posts}</div>
            <div className="text-openlove-500">Posts</div>
          </div>
          <div className="p-2 bg-openlove-100 rounded-lg shadow-sm">
            <div className="font-semibold text-openlove-600">{profile.stats.likes}</div>
            <div className="text-openlove-500">Curtidas</div>
          </div>
          <div className="p-2 bg-openlove-100 rounded-lg shadow-sm">
            <div className="font-semibold text-openlove-600">R$ {profile.stats.earnings.toFixed(2)}</div>
            <div className="text-openlove-500">Ganhos</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left text-sm",
                activeView === item.id
                  ? "bg-gradient-to-r from-openlove-100 to-openlove-200 text-openlove-600"
                  : "hover:bg-openlove-100",
              )}
              onClick={() => {
                onNavigate(item.id)
                if (item.id === "messages") onOpenChat()
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}
