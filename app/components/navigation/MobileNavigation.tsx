"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  Search, 
  MessageCircle, 
  User, 
  Menu, 
  X, 
  Bell, 
  Settings,
  LogOut,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@heroui/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useNotifications } from "@/app/hooks/useNotifications"
import { NotificationSystem } from "@/app/components/notifications/NotificationSystem"

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const { user, profile, signOut } = useAuth()
  const { stats } = useNotifications(user?.id)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mobile-nav')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const navigationItems = [
    { id: "home", label: "Início", icon: Home, href: "/" },
    { id: "search", label: "Buscar", icon: Search, href: "/search" },
    { id: "messages", label: "Mensagens", icon: MessageCircle, href: "/messages", badge: stats?.unread || 0, badgeColor: "primary" },
    { id: "profile", label: "Perfil", icon: User, href: `/profile/${profile?.username}` }
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    const item = navigationItems.find(item => item.id === tabId)
    if (item?.href) {
      window.location.href = item.href
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <div className={`mobile-nav ${className || ''}`}>
      {/* Top Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OL</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              OpenLove
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NotificationSystem showBadge={true} showCenter={true} />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-lg">
                        {profile?.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {profile?.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{profile?.username}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        window.location.href = `/profile/${profile?.username}/edit`
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className="w-5 h-5" />
                      Editar Perfil
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        window.location.href = "/settings"
                        setIsMenuOpen(false)
                      }}
                    >
                      <Settings className="w-5 h-5" />
                      Configurações
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        window.location.href = "/notifications"
                        setIsMenuOpen(false)
                      }}
                    >
                      <Bell className="w-5 h-5" />
                      Notificações
                      {stats?.unread > 0 && (
                        <Badge 
                          color="danger" 
                          content={stats.unread > 99 ? '99+' : stats.unread}
                          className="ml-auto"
                        >
                          <span></span>
                        </Badge>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        window.location.href = "/messages"
                        setIsMenuOpen(false)
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Mensagens
                      {stats?.unread > 0 && (
                        <Badge 
                          color="primary" 
                          content={stats.unread > 99 ? '99+' : stats.unread}
                          className="ml-auto"
                        >
                          <span></span>
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/10'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && item.badge > 0 && (
                    <Badge
                      color={item.badgeColor === 'primary' ? 'primary' : 'danger'}
                      content={item.badge > 99 ? '99+' : item.badge}
                      isInvisible={false}
                      shape="circle"
                      size="sm"
                      className="absolute -top-1 -right-1"
                    >
                      <span></span>
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </motion.nav>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-20 right-4 z-30"
      >
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
          onClick={() => {
            // Abrir modal de criar post
            console.log("Criar novo post")
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Spacer para o conteúdo */}
      <div className="h-20" /> {/* Top spacer */}
      <div className="h-20" /> {/* Bottom spacer */}
    </div>
  )
} 