"use client"

import React, { useState } from "react"
import {
  Home,
  Search as SearchIcon,
  Mail,
  User,
  Bell,
  Users,
  Calendar,
  Bookmark,
  Settings,
  Feather,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "home", label: "Timeline", icon: Home },
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "messages", label: "Mensagens", icon: Mail },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "communities", label: "Comunidades", icon: Users },
  { id: "open-dates", label: "Open Dates", icon: Heart },
  { id: "saved", label: "Salvos", icon: Bookmark },
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "create-post", label: "Criar Post", icon: Feather }, // Botão de criar post após Configurações
]

interface MobileNavProps {
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onMessagesClick?: () => void
  onNotificationsClick?: () => void
  onEventsClick?: () => void
  onCommunitiesClick?: () => void
  onSavedContentClick?: () => void
  onProfileSearchClick?: () => void
  onCreatePostClick?: () => void
  onNavigateToSettings?: () => void
  onNavigateToProfiles?: () => void
  activeView?: string
  setActiveView?: (view: string) => void
}

export function MobileNav({
  onProfileClick,
  onSettingsClick,
  onMessagesClick,
  onNotificationsClick,
  onEventsClick,
  onCommunitiesClick,
  onSavedContentClick,
  onProfileSearchClick,
  onCreatePostClick,
  onNavigateToSettings,
  onNavigateToProfiles,
  activeView = "home",
  setActiveView,
}: MobileNavProps) {
  const handleItemClick = (itemId: string) => {
    if (setActiveView) setActiveView(itemId)

    switch (itemId) {
      case "home":
        break
      case "search":
        onProfileSearchClick?.()
        break
      case "messages":
        onMessagesClick?.()
        break
      case "profile":
        onNavigateToProfiles?.()
        break
      case "notifications":
        onNotificationsClick?.()
        break
      case "communities":
        onCommunitiesClick?.()
        break
      case "open-dates":
        // Open Dates é renderizado na home, não precisa de redirecionamento
        break
      case "events":
        onEventsClick?.()
        break
      case "saved":
        onSavedContentClick?.()
        break
      case "settings":
        onNavigateToSettings?.()
        break
      case "create-post":
        onCreatePostClick?.()
        break
    }
  }

  return (
    <aside
      className={cn(
        "xl:hidden fixed left-0 top-0 bottom-0 w-[72px] bg-white dark:bg-gray-900 overflow-y-auto p-4 flex flex-col gap-4 z-10 scrollbar-hide"
      )}
    >
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-12 w-12",
            activeView === item.id && item.id !== "create-post" && "bg-pink-100 text-pink-600 dark:bg-gray-800 dark:text-pink-400",
            item.id === "create-post" && "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
          )}
          onClick={() => handleItemClick(item.id)}
          aria-label={item.label}
        >
          <item.icon className="h-6 w-6" />
        </Button>
      ))}
    </aside>
  )
}