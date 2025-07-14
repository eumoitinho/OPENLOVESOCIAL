'use client'

import { Bell } from 'lucide-react'
import { useNotifications } from '@/app/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  className?: string
  onClick?: () => void
}

export function NotificationBadge({ className, onClick }: NotificationBadgeProps) {
  const { stats } = useNotifications()
  const hasUnread = stats.unread > 0

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      
      {/* Badge rosa para notificações não lidas */}
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse">
          {/* Contador para múltiplas notificações */}
          {stats.unread > 1 && (
            <span className="absolute -top-1 -right-1 text-xs text-white font-bold bg-pink-600 rounded-full w-4 h-4 flex items-center justify-center">
              {stats.unread > 9 ? '9+' : stats.unread}
            </span>
          )}
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {hasUnread ? `${stats.unread} notificação${stats.unread > 1 ? 's' : ''} não lida${stats.unread > 1 ? 's' : ''}` : 'Notificações'}
      </div>
    </div>
  )
} 