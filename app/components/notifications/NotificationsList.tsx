'use client'

import { useState, useEffect } from 'react'
import { 
  Card,
  CardBody,
  Avatar,
  Button,
  Badge,
  Skeleton,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  Bookmark,
  MoreVertical,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  icon?: string
  isRead: boolean
  createdAt: string
  actionText?: string
  actionUrl?: string
  relatedData?: any
  sender?: {
    id: string
    username: string
    name: string
    avatar: string
    verified: boolean
  }
}

interface NotificationsListProps {
  unreadOnly?: boolean
  limit?: number
  className?: string
  onNotificationClick?: (notification: Notification) => void
  onMarkAsRead?: (notificationIds: string[]) => void
  onDelete?: (notificationIds: string[]) => void
}

const notificationIcons = {
  follow: UserPlus,
  post_like: Heart,
  comment_like: Heart,
  post_comment: MessageCircle,
  comment_reply: MessageCircle,
  post_share: Share2,
  post_save: Bookmark,
  mention: MessageCircle,
  default: Bell
}

export default function NotificationsList({
  unreadOnly = false,
  limit = 20,
  className,
  onNotificationClick,
  onMarkAsRead,
  onDelete
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    fetchNotifications()
  }, [unreadOnly, limit])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(unreadOnly && { unread: 'true' })
      })

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_ids: notificationIds,
          action: 'mark_read'
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, isRead: true }
            : notif
        ))
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        onMarkAsRead?.(notificationIds)
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const handleDelete = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_ids: notificationIds,
          action: 'delete'
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => !notificationIds.includes(notif.id)))
        const unreadDeleted = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.isRead
        ).length
        setUnreadCount(prev => Math.max(0, prev - unreadDeleted))
        onDelete?.(notificationIds)
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead([notification.id])
    }
    onNotificationClick?.(notification)
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const getNotificationIcon = (type: string, iconName?: string) => {
    const IconComponent = notificationIcons[type as keyof typeof notificationIcons] || notificationIcons.default
    return <IconComponent className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <div className="flex gap-3">
                <Skeleton className="rounded-full w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhuma notificação
        </h3>
        <p className="text-gray-500">
          {unreadOnly ? 'Você não tem notificações não lidas' : 'Suas notificações aparecerão aqui'}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with actions */}
      {notifications.some(n => !n.isRead) && (
        <div className="flex items-center justify-between mb-4">
          <Badge content={unreadCount} color="danger" size="sm">
            <Bell className="w-5 h-5" />
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => handleMarkAsRead(notifications.filter(n => !n.isRead).map(n => n.id))}
          >
            Marcar todas como lidas
          </Button>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card 
            key={notification.id}
            isPressable
            className={cn(
              'transition-all duration-200 hover:scale-[1.01]',
              !notification.isRead && 'bg-blue-50 border-blue-200'
            )}
            onPress={() => handleNotificationClick(notification)}
          >
            <CardBody className="p-4">
              <div className="flex gap-3">
                {/* Avatar or Icon */}
                <div className="relative">
                  {notification.sender ? (
                    <Avatar
                      src={notification.sender.avatar}
                      name={notification.sender.name}
                      size="sm"
                      className="flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                  )}
                  
                  {/* Type icon badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={cn(
                        'text-sm font-medium',
                        !notification.isRead && 'text-blue-900'
                      )}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          className="min-w-unit-6 w-6 h-6"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        {!notification.isRead && (
                          <DropdownItem
                            key="mark_read"
                            startContent={<Check className="w-4 h-4" />}
                            onPress={() => handleMarkAsRead([notification.id])}
                          >
                            Marcar como lida
                          </DropdownItem>
                        )}
                        <DropdownItem
                          key="delete"
                          startContent={<X className="w-4 h-4" />}
                          color="danger"
                          onPress={() => handleDelete([notification.id])}
                        >
                          Deletar
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}