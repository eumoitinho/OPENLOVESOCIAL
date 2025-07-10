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
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { id: "home", label: "Timeline", icon: Home },
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "messages", label: "Mensagens", icon: Mail },
  { id: "profile", label: "Perfil", icon: User },
]

const popupNavItems = [
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "communities", label: "Comunidades", icon: Users },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "saved", label: "Salvos", icon: Bookmark },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "create-post", label: "Criar Post", icon: Plus, highlight: true },
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
  onCreatePostClick
}: MobileNavProps) {
  const [popupOpen, setPopupOpen] = useState(false)

  const handlePopupItemClick = (itemId: string) => {
    setPopupOpen(false)
    
    switch (itemId) {
      case "notifications":
        onNotificationsClick?.()
        break
      case "communities":
        onCommunitiesClick?.()
        break
      case "events":
        onEventsClick?.()
        break
      case "saved":
        onSavedContentClick?.()
        break
      case "settings":
        onSettingsClick?.()
        break
      case "create-post":
        onCreatePostClick?.()
        break
    }
  }

  const handleMainNavClick = (itemId: string) => {
    switch (itemId) {
      case "home":
        // Navegar para home/timeline (já estamos aqui)
        break
      case "search":
        onProfileSearchClick?.()
        break
      case "messages":
        onMessagesClick?.()
        break
      case "profile":
        onProfileClick?.()
        break
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex justify-center md:hidden">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg hover:scale-105 transition-all duration-200 border-4 border-white dark:border-slate-950"
          onClick={() => setPopupOpen((v) => !v)}
          aria-label="Abrir menu rápido"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      {/* Popup/Modal */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPopupOpen(false)} />
          <div className="relative w-full max-w-sm mx-auto mb-24 rounded-2xl bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 animate-fade-in-up shadow-xl">
            {popupNavItems.map((item) => (
              <Button
                key={item.id}
                variant={item.highlight ? "default" : "ghost"}
                className={cn(
                  "w-full flex items-center gap-3 justify-start text-base",
                  item.highlight && "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
                )}
                onClick={() => handlePopupItemClick(item.id)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-openlove-50 to-openlove-100 border-t border-openlove-200 flex justify-around py-2 z-40">
        {mainNavItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-500 hover:bg-openlove-100",
            )}
            onClick={() => handleMainNavClick(item.id)}
          >
            <item.icon className="h-6 w-6" />
          </Button>
        ))}
      </div>
    </>
  )
}
