"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import NotificationCenter from "./NotificationCenter"
import { useNotifications } from "@/app/hooks/useNotifications"

interface NotificationBadgeProps {
  className?: string
}

export default function NotificationBadge({ className }: NotificationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        
        {/* Badge rosa para notificações não lidas */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-500 animate-pulse" />
        )}
        
        {/* Badge com número para muitas notificações */}
        {unreadCount > 3 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
} 