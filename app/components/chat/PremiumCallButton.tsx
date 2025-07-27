"use client"

import { useState } from 'react'
import { Button } from "@heroui/react"
import { Phone, Video, Crown, Star, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanAccess } from '@/lib/plans/hooks'
import { usePaywall } from '@/lib/plans/paywall'
import PaywallModal from '@/components/plan-limits/PaywallModal'
import { useWebRTC } from '@/app/components/chat/WebRTCContext'

interface PremiumCallButtonProps {
  userId: string
  userName: string
  type: 'audio' | 'video'
  variant?: 'solid' | 'ghost' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PremiumCallButton({
  userId,
  userName,
  type,
  variant = 'ghost',
  size = 'md',
  className
}: PremiumCallButtonProps) {
  const canAccess = useCanAccess()
  const { paywall, requireFeature, closePaywall } = usePaywall()
  const { startCall } = useWebRTC()

  const canMakeCalls = canAccess.currentPlan === 'diamond'

  const handleCallClick = () => {
    if (canMakeCalls) {
      startCall(userId, userName, type)
    } else {
      requireFeature(type === 'audio' ? 'voice_calls' : 'video_calls')
    }
  }

  const getButtonContent = () => {
    const Icon = type === 'audio' ? Phone : Video
    const label = type === 'audio' ? 'Ligar' : 'Videochamada'

    if (canMakeCalls) {
      return (
        <>
          <Icon className="w-4 h-4" />
          {size !== 'sm' && <span className="ml-2">{label}</span>}
        </>
      )
    }

    return (
      <>
        <div className="relative">
          <Icon className="w-4 h-4" />
          <Lock className="w-2 h-2 absolute -top-1 -right-1 text-purple-500" />
        </div>
        {size !== 'sm' && (
          <span className="ml-2 flex items-center gap-1">
            {label}
            <Star className="w-3 h-3 text-purple-500" />
          </span>
        )}
      </>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleCallClick}
        className={cn(
          "transition-all duration-200",
          !canMakeCalls && "relative",
          canMakeCalls && type === 'audio' && "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20",
          canMakeCalls && type === 'video' && "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20",
          !canMakeCalls && "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20",
          className
        )}
        title={
          canMakeCalls 
            ? `Iniciar ${type === 'audio' ? 'chamada de voz' : 'videochamada'}`
            : `${type === 'audio' ? 'Chamadas de voz' : 'Videochamadas'} disponíveis apenas para assinantes Open Diamante`
        }
      >
        {getButtonContent()}
      </Button>

      {paywall.config && (
        <PaywallModal
          isOpen={paywall.isOpen}
          onClose={closePaywall}
          feature={paywall.config.feature}
          title={paywall.config.title}
          description={paywall.config.description}
          requiredPlan={paywall.config.requiredPlan}
        />
      )}
    </>
  )
} 