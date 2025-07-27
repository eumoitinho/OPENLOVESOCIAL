"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Settings, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/app/hooks/useNotifications"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { NotificationsContent } from "./NotificationsContent"

interface NotificationSystemProps {
  className?: string
  showBadge?: boolean
  showCenter?: boolean
}

export function NotificationSystem({ 
  className, 
  showBadge = true, 
  showCenter = true 
}: NotificationSystemProps) {
  const { user } = useAuth()
  const { stats, loading } = useNotifications(user?.id)
  const [isOpen, setIsOpen] = useState(false)

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.notification-system')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const hasUnread = stats.unread > 0

  return (
    <div className={`notification-system relative ${className || ''}`}>
      {/* Botão de Notificações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge de Notificações */}
        {showBadge && hasUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <Badge 
              variant="destructive" 
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {stats.unread > 99 ? '99+' : stats.unread}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Centro de Notificações */}
      <AnimatePresence>
        {isOpen && showCenter && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-pink-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Notificações
                  </h3>
                  {hasUnread && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.unread} nova{stats.unread !== 1 ? 's' : ''}
                    </Badge>
                  )}
      </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {/* Abrir configurações */}}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[calc(80vh-80px)] overflow-y-auto">
                <NotificationsContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 
