"use client"

import { Phone, Video } from 'lucide-react'
import { Button } from '@heroui/react'
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'
import { usePremiumFeatures } from '@/lib/hooks/usePremiumFeatures'

interface CallButtonsProps {
  onVoiceCall?: () => void
  onVideoCall?: () => void
  disabled?: boolean
  className?: string
}

export default function CallButtons({ 
  onVoiceCall, 
  onVideoCall, 
  disabled = false,
  className = ''
}: CallButtonsProps) {
  const { features } = usePremiumFeatures()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão de Chamada de Voz */}
      <PremiumLockBadge 
        feature="canMakeVoiceCalls"
        size="sm"
        disabled={!features.canMakeVoiceCalls}
      >
        <Button
          isIconOnly
          variant="light"
          className="text-gray-600 hover:text-green-600 hover:bg-green-50"
          onClick={onVoiceCall}
          disabled={disabled || !features.canMakeVoiceCalls}
          title="Chamada de voz"
        >
          <Phone className="w-4 h-4" />
        </Button>
      </PremiumLockBadge>

      {/* Botão de Chamada de Vídeo */}
      <PremiumLockBadge 
        feature="canMakeVideoCalls"
        size="sm"
        disabled={!features.canMakeVideoCalls}
      >
        <Button
          isIconOnly
          variant="light"
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          onClick={onVideoCall}
          disabled={disabled || !features.canMakeVideoCalls}
          title="Chamada de vídeo"
        >
          <Video className="w-4 h-4" />
        </Button>
      </PremiumLockBadge>
    </div>
  )
}

// Versão simplificada para chat header
export function ChatHeaderCallButtons({ onVoiceCall, onVideoCall }: CallButtonsProps) {
  return (
    <CallButtons 
      onVoiceCall={onVoiceCall}
      onVideoCall={onVideoCall}
      className="ml-auto"
    />
  )
}

// Versão para barra de ferramentas de mensagem
export function MessageToolbarCallButtons({ onVoiceCall, onVideoCall }: CallButtonsProps) {
  return (
    <CallButtons 
      onVoiceCall={onVoiceCall}
      onVideoCall={onVideoCall}
      className=""
    />
  )
}