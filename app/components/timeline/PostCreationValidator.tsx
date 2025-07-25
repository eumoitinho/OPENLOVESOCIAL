"use client"

import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import { PLAN_LIMITS, PlanType } from '@/lib/plans/config'

interface PostCreationValidatorProps {
  postType: 'text' | 'image' | 'video' | 'audio' | 'poll'
  fileSize?: number
  imageCount?: number
  onValidationError: (error: string) => void
  onUpgradeNeeded: (requiredPlan: 'gold' | 'diamond') => void
  children: React.ReactNode
}

// Helper para converter bytes para MB
const bytesToMB = (bytes: number): number => bytes / (1024 * 1024)

const VALIDATION_MESSAGES = {
  text: {
    error: 'Posts de texto estão disponíveis para todos',
    requiredPlan: 'free' as const
  },
  image: {
    error: 'Número de imagens excede o limite do seu plano',
    requiredPlan: 'gold' as const
  },
  video: {
    error: 'Posts de vídeo requerem plano Ouro ou superior',
    requiredPlan: 'gold' as const
  },
  audio: {
    error: 'Posts de áudio requerem plano Ouro ou superior',
    requiredPlan: 'gold' as const
  },
  poll: {
    error: 'Enquetes requerem plano Diamante',
    requiredPlan: 'diamond' as const
  }
}

export default function PostCreationValidator({
  postType,
  fileSize = 0,
  imageCount = 1,
  onValidationError,
  onUpgradeNeeded,
  children
}: PostCreationValidatorProps) {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const userPlan = (canAccess.plan || 'free') as PlanType

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

  const validatePostCreation = (): boolean => {
    const userLimits = PLAN_LIMITS[userPlan as PlanType]
    const validation = VALIDATION_MESSAGES[postType]
    
    switch (postType) {
      case 'text':
        // Texto sempre permitido
        return true
        
      case 'image':
        if (imageCount > userLimits.maxImages) {
          onValidationError(`Máximo ${userLimits.maxImages} ${userLimits.maxImages === 1 ? 'imagem' : 'imagens'} por post no seu plano`)
          onUpgradeNeeded(userLimits.maxImages < 5 ? 'gold' : 'diamond')
          return false
        }
        break
        
      case 'video':
        if (userLimits.maxVideoSize === 0) {
          onValidationError(validation.error)
          onUpgradeNeeded(validation.requiredPlan)
          return false
        }
        
        if (fileSize > userLimits.maxVideoSize) {
          onValidationError(`Tamanho máximo: ${bytesToMB(userLimits.maxVideoSize).toFixed(0)}MB`)
          onUpgradeNeeded(bytesToMB(userLimits.maxVideoSize) < 50 ? 'diamond' : 'gold')
          return false
        }
        break
        
      case 'audio':
        if (!userLimits.canUploadAudio) {
          onValidationError(validation.error)
          onUpgradeNeeded(validation.requiredPlan)
          return false
        }
        break
        
      case 'poll':
        if (!userLimits.canCreatePolls) {
          onValidationError(validation.error)
          onUpgradeNeeded(validation.requiredPlan)
          return false
        }
        break
        
      default:
        return true
    }
    
    return true
  }

  // Se a validação falhar, não renderizar os children
  if (!validatePostCreation()) {
    return null
  }

  return <>{children}</>
}

// Hook para usar a validação em outros componentes
export const usePostValidation = () => {
  const canAccess = useCanAccess()
  const userPlan = (canAccess.plan || 'free') as PlanType

  const validatePostByPlan = (
    planType: PlanType, 
    postType: 'text' | 'image' | 'video' | 'audio' | 'poll',
    options: {
      fileSize?: number
      imageCount?: number
    } = {}
  ) => {
    const userLimits = PLAN_LIMITS[planType]
    const { fileSize = 0, imageCount = 1 } = options
    
    switch (postType) {
      case 'text':
        return { allowed: true }
        
      case 'image':
        if (imageCount > userLimits.maxImages) {
          return {
            allowed: false,
            reason: `Máximo ${userLimits.maxImages} ${userLimits.maxImages === 1 ? 'imagem' : 'imagens'} por post`,
            requiredPlan: userLimits.maxImages < 5 ? 'gold' as const : 'diamond' as const
          }
        }
        break
        
      case 'video':
        if (userLimits.maxVideoSize === 0) {
          return {
            allowed: false,
            reason: 'Posts de vídeo requerem plano Ouro',
            requiredPlan: 'gold' as const
          }
        }
        
        if (fileSize > userLimits.maxVideoSize) {
          return {
            allowed: false,
            reason: `Tamanho máximo: ${bytesToMB(userLimits.maxVideoSize).toFixed(0)}MB`,
            requiredPlan: bytesToMB(userLimits.maxVideoSize) < 50 ? 'diamond' as const : 'gold' as const
          }
        }
        break
        
      case 'audio':
        if (!userLimits.canUploadAudio) {
          return {
            allowed: false,
            reason: 'Posts de áudio requerem plano Ouro',
            requiredPlan: 'gold' as const
          }
        }
        break
        
      case 'poll':
        if (!userLimits.canCreatePolls) {
          return {
            allowed: false,
            reason: 'Enquetes requerem plano Diamante',
            requiredPlan: 'diamond' as const
          }
        }
        break
    }
    
    return { allowed: true }
  }

  const getPostLimits = (planType: PlanType) => {
    return PLAN_LIMITS[planType]
  }

  return { 
    validatePostByPlan, 
    getPostLimits,
    userPlan
  }
}