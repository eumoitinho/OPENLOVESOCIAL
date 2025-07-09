"use client"

import React from "react"
import {
  Home,
  Compass,
  Calendar,
  Mail,
  User,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavigationItem = {
  id: string
  label: string
  icon: React.ElementType
}

interface MobileNavProps {
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

export function MobileNav({ activeView, onNavigate, onOpenChat }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-openlove-50 to-openlove-100 border-t border-openlove-200 flex justify-around py-2 z-50">
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={cn(
            activeView === item.id ? "text-openlove-600" : "text-gray-500",
            "hover:bg-openlove-100",
          )}
          onClick={() => {
            onNavigate(item.id)
            if (item.id === "messages") onOpenChat()
          }}
        >
          <item.icon className="h-6 w-6" />
        </Button>
      ))}
    </div>
  )
}
