"use client"

import React, { useState, useEffect } from "react"
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
  LogOut,
  Menu,
  X,
  ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useNotifications } from "@/app/hooks/useNotifications"

const navItems = [
  { id: "home", label: "Timeline", icon: Home },
  { id: "search", label: "Buscar", icon: SearchIcon },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "messages", label: "Mensagens", icon: Mail },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "communities", label: "Comunidades", icon: Users },
  { id: "open-dates", label: "Open Dates", icon: Heart },
  { id: "saved", label: "Salvos", icon: Bookmark },
  { id: "my-profile", label: "Meu Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "create-post", label: "Criar Post", icon: Feather },
  { id: "logout", label: "Sair", icon: LogOut },
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
  setActiveView }: MobileNavProps) {
  const { signOut, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { stats } = useNotifications(user?.id)
  const hasNotifications = stats.unread > 0

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemClick = (itemId: string) => {
    if (setActiveView) setActiveView(itemId)
    setIsOpen(false) // Fecha o menu após clicar

    switch (itemId) {
      case "home":
        break
      case "search":
        onProfileSearchClick?.()
        break
      case "messages":
        onMessagesClick?.()
        break
      case "my-profile":
        // Navega para o perfil do usuário logado
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
      case "logout":
        signOut()
        break
    }
  }

  return (
    <>
      {/* Botão hamburguer/home fixo na viewport */}
      <Button
        className={cn(
          "xl:hidden fixed left-4 z-50 rounded-full h-14 w-14 shadow-lg relative",
          "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700"
        )}
        style={{
          bottom: "20px", // Usa style inline para garantir que fica fixo na viewport
          position: "fixed"
        }}
        onClick={() => {
          if (activeView !== "home" && !isOpen) {
            handleItemClick("home")
          } else {
            setIsOpen(!isOpen)
          }
        }}
        aria-label={activeView !== "home" && !isOpen ? "Voltar ao início" : "Menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : activeView !== "home" ? (
          <Home className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
        
        {/* Badge de notificação piscando */}
        {hasNotifications && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-pink-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <Button
          className={cn(
            "xl:hidden fixed right-4 z-50 rounded-full h-14 w-14 shadow-lg",
            "bg-white/90 dark:bg-gray-800/90 text-pink-600 dark:text-pink-400",
            "hover:bg-white dark:hover:bg-gray-800 border border-pink-200 dark:border-pink-800",
            "transition-all duration-300 transform",
            showScrollTop ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
          )}
          style={{
            bottom: "20px",
            position: "fixed"
          }}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}

      {/* Overlay quando aberto */}
      {isOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "xl:hidden fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-900 overflow-y-auto p-4 z-50 scrollbar-hide transition-transform duration-300",
          isOpen ? "translate-x-0 w-[280px] shadow-2xl" : "-translate-x-[95%] w-[72px]"
        )}
      >
        {/* Logo - visível apenas quando aberto */}
        {isOpen && (
          <div className="mb-6 px-2">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">open</span>
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                love
              </span>
            </h1>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start transition-all duration-200",
                isOpen ? "w-full px-4 py-3 gap-3" : "w-12 h-12 p-0 rounded-full",
                activeView === item.id && item.id !== "create-post" && item.id !== "logout" && "bg-pink-100 text-pink-600 dark:bg-gray-800 dark:text-pink-400",
                item.id === "create-post" && "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700",
                item.id === "logout" && "text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
              )}
              onClick={() => handleItemClick(item.id)}
              aria-label={item.label}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              {isOpen && <span className="text-base">{item.label}</span>}
            </Button>
          ))}
        </div>
      </aside>
    </>
  )
}
