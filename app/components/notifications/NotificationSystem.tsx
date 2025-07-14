'use client'

import { useState } from 'react'
import { NotificationBadge } from './NotificationBadge'
import { MessageBadge } from './MessageBadge'
import { NotificationCenter } from './NotificationCenter'
import { PostToast } from './PostToast'

export function NotificationSystem() {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

  return (
    <>
      {/* Badges de notificação */}
      <div className="flex items-center space-x-2">
        <NotificationBadge 
          onClick={() => setIsNotificationCenterOpen(true)}
          className="group"
        />
        <MessageBadge 
          onClick={() => {
            // Navegar para mensagens
            window.location.href = '/messages'
          }}
          className="group"
        />
      </div>

      {/* Centro de notificações */}
      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      {/* Toast para novos posts */}
      <PostToast />
    </>
  )
} 