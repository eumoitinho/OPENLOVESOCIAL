'use client'

import { useState } from 'react'
import { Bell, Check, X, MessageCircle, Heart, UserPlus, AtSign, Calendar } from 'lucide-react'
import { useNotifications } from '@/app/hooks/useNotifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const notificationIcons = {
  new_message: MessageCircle,
  new_follower: UserPlus,
  new_like: Heart,
  new_comment: MessageCircle,
  mention: AtSign,
  new_match: Heart,
  new_event: Calendar,
  system: Bell
}

const notificationColors = {
  new_message: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  new_follower: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  new_like: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  new_comment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  mention: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  new_match: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  new_event: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, stats, loading, markAsRead, markAllAsRead } = useNotifications()
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    // Aqui você pode adicionar navegação baseada no tipo de notificação
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificações
            </h2>
            {stats.unread > 0 && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'unread'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Não lidas ({stats.unread})
          </button>
        </div>

        {/* Actions */}
        {stats.unread > 0 && (
          <div className="p-3 border-b dark:border-gray-700">
            <button
              onClick={markAllAsRead}
              className="w-full px-3 py-2 text-sm text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Marcar todas como lidas</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Carregando notificações...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {activeTab === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell
                const colorClass = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.system
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
                      !notification.is_read && 'bg-pink-50 dark:bg-pink-900/10'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        colorClass
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.is_read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
