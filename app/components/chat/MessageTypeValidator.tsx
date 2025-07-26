"use client"

import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'

interface MessageTypeValidatorProps {
  messageType: 'text' | 'voice' | 'video' | 'file' | 'video_call' | 'voice_call'
  userPlan: 'free' | 'gold' | 'diamond'
  onValidationError: (error: string) => void
  onUpgradeNeeded: (requiredPlan: 'gold' | 'diamond') => void
  children: React.ReactNode
}

// Limitações corrigidas por tipo de mensagem
const MESSAGE_TYPE_LIMITS = {
  free: {
    canSendText: false,
    canSendVoice: false,
    canSendVideo: false,
    canSendFile: false,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
    canCreateGroups: false
  },
  gold: {
    canSendText: true,
    canSendVoice: true,
    canSendVideo: false,
    canSendFile: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: false,
    canCreateGroups: false
  },
  diamond: {
    canSendText: true,
    canSendVoice: true,
    canSendVideo: true,
    canSendFile: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    canCreateGroups: true
  }
}

const VALIDATION_MESSAGES = {
  text: {
    error: 'Upgrade para enviar mensagens',
    requiredPlan: 'gold' as const
  },
  voice: {
    error: 'Mensagens de voz requerem plano Ouro ou superior',
    requiredPlan: 'gold' as const
  },
  video: {
    error: 'Mensagens de vídeo requerem plano Diamante',
    requiredPlan: 'diamond' as const
  },
  file: {
    error: 'Envio de arquivos requer plano Ouro ou superior',
    requiredPlan: 'gold' as const
  },
  voice_call: {
    error: 'Chamadas de voz requerem plano Ouro ou superior',
    requiredPlan: 'gold' as const
  },
  video_call: {
    error: 'Chamadas de vídeo requerem plano Diamante',
    requiredPlan: 'diamond' as const
  }
}

export default function MessageTypeValidator({
  messageType,
  userPlan,
  onValidationError,
  onUpgradeNeeded,
  children
}: MessageTypeValidatorProps) {
  const validateMessageType = (): boolean => {
    const userLimits = MESSAGE_TYPE_LIMITS[userPlan]
    
    switch (messageType) {
      case 'text':
        if (!userLimits.canSendText) {
          onValidationError(VALIDATION_MESSAGES.text.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.text.requiredPlan)
          return false
        }
        break
        
      case 'voice':
        if (!userLimits.canSendVoice) {
          onValidationError(VALIDATION_MESSAGES.voice.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.voice.requiredPlan)
          return false
        }
        break
        
      case 'video':
        if (!userLimits.canSendVideo) {
          onValidationError(VALIDATION_MESSAGES.video.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.video.requiredPlan)
          return false
        }
        break
        
      case 'file':
        if (!userLimits.canSendFile) {
          onValidationError(VALIDATION_MESSAGES.file.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.file.requiredPlan)
          return false
        }
        break
        
      case 'voice_call':
        if (!userLimits.canMakeVoiceCalls) {
          onValidationError(VALIDATION_MESSAGES.voice_call.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.voice_call.requiredPlan)
          return false
        }
        break
        
      case 'video_call':
        if (!userLimits.canMakeVideoCalls) {
          onValidationError(VALIDATION_MESSAGES.video_call.error)
          onUpgradeNeeded(VALIDATION_MESSAGES.video_call.requiredPlan)
          return false
        }
        break
        
      default:
        return true
    }
    
    return true
  }

  // Se a validação falhar, não renderizar os children
  if (!validateMessageType()) {
    return null
  }

  return <>{children}</>
}

// Hook para usar a validação em outros componentes
export const useMessageValidation = () => {
  const { user } = useAuth()
  const canAccess = useCanAccess()

  const validateMessageByPlan = (
    planType: 'free' | 'gold' | 'diamond', 
    messageType: 'text' | 'voice' | 'video' | 'file' | 'video_call' | 'voice_call'
  ) => {
    const userLimits = MESSAGE_TYPE_LIMITS[planType]
    
    const getActionKey = (type: string) => {
      switch (type) {
        case 'text': return 'canSendText'
        case 'voice': return 'canSendVoice'
        case 'video': return 'canSendVideo'
        case 'file': return 'canSendFile'
        case 'voice_call': return 'canMakeVoiceCalls'
        case 'video_call': return 'canMakeVideoCalls'
        default: return 'canSendText'
      }
    }

    const actionKey = getActionKey(messageType)
    const canPerformAction = userLimits[actionKey as keyof typeof userLimits]

    if (!canPerformAction) {
      const validation = VALIDATION_MESSAGES[messageType as keyof typeof VALIDATION_MESSAGES]
      return {
        allowed: false,
        reason: validation?.error || 'Upgrade necessário',
        requiredPlan: validation?.requiredPlan || 'gold'
      }
    }

    return { allowed: true }
  }

  const getRequiredPlan = (messageType: string): 'gold' | 'diamond' => {
    const validation = VALIDATION_MESSAGES[messageType as keyof typeof VALIDATION_MESSAGES]
    return validation?.requiredPlan || 'gold'
  }

  return { 
    validateMessageByPlan, 
    getRequiredPlan,
    MESSAGE_TYPE_LIMITS,
    userPlan: canAccess.currentPlan || 'free'
  }
}