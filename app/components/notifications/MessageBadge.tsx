'use client'

import { Badge } from "@heroui/react"
import { useNotifications } from "@/app/hooks/useNotifications"
import { cn } from "@/lib/utils"

// Componente do ícone de mensagem
const MessageIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface MessageBadgeProps {
  className?: string
  onClick?: () => void
}

export function MessageBadge({ className, onClick }: MessageBadgeProps) {
  const { stats } = useNotifications()
  // Para mensagens, vamos usar um contador simples baseado em notificações não lidas
  // que podem ser do tipo 'message' ou 'mention'
  const unreadMessages = stats.unread
  const hasUnread = unreadMessages > 0

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <Badge 
        color="danger" 
        content={hasUnread ? (unreadMessages > 99 ? '99+' : unreadMessages) : undefined}
        isInvisible={!hasUnread}
        shape="circle"
        size="sm"
      >
        <MessageIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </Badge>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {hasUnread ? `${unreadMessages} mensagem${unreadMessages > 1 ? 's' : ''} não lida${unreadMessages > 1 ? 's' : ''}` : 'Mensagens'}
      </div>
    </div>
  )
} 
