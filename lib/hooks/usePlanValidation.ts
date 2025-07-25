import { useAuth } from '@/app/components/auth/AuthProvider'
import { useCanAccess } from '@/lib/plans/hooks'
import { PLAN_LIMITS, PlanType } from '@/lib/plans/config'

export interface ValidationResult {
  allowed: boolean
  reason?: string
  requiredPlan?: 'gold' | 'diamond'
  currentUsage?: number
  limit?: number
}

export const usePlanValidation = () => {
  const { user } = useAuth()
  const canAccess = useCanAccess()
  const userPlan = (canAccess.plan || 'free') as PlanType

  // Obter limitações do plano atual
  const getPlanLimitations = (plan: PlanType = userPlan) => {
    return PLAN_LIMITS[plan]
  }

  // Validar ação específica
  const validateAction = (
    action: string,
    options: {
      fileSize?: number
      count?: number
      currentUsage?: number
    } = {}
  ): ValidationResult => {
    const limitations = getPlanLimitations()
    const { fileSize = 0, count = 1, currentUsage = 0 } = options

    // Verificar limites específicos baseados na ação
    switch (action) {
      case 'createPost':
        return { allowed: true } // Posts de texto sempre permitidos

      case 'uploadImages':
        if (count > limitations.maxImages) {
          return {
            allowed: false,
            reason: `Máximo ${limitations.maxImages} ${limitations.maxImages === 1 ? 'imagem' : 'imagens'} por post`,
            requiredPlan: limitations.maxImages < 5 ? 'gold' : 'diamond'
          }
        }
        break

      case 'uploadVideo':
        if (limitations.maxVideoSize === 0) {
          return {
            allowed: false,
            reason: 'Posts de vídeo requerem plano Ouro ou superior',
            requiredPlan: 'gold'
          }
        }
        if (fileSize > limitations.maxVideoSize) {
          return {
            allowed: false,
            reason: `Tamanho máximo: ${Math.floor(limitations.maxVideoSize / (1024 * 1024))}MB`,
            requiredPlan: limitations.maxVideoSize < 50 * 1024 * 1024 ? 'diamond' : 'gold'
          }
        }
        break

      case 'uploadAudio':
        if (!limitations.canUploadAudio) {
          return {
            allowed: false,
            reason: 'Posts de áudio requerem plano Ouro ou superior',
            requiredPlan: 'gold'
          }
        }
        break

      case 'createPoll':
        if (!limitations.canCreatePolls) {
          return {
            allowed: false,
            reason: 'Enquetes requerem plano Diamante',
            requiredPlan: 'diamond'
          }
        }
        break

      case 'sendMessage':
        if (!limitations.canSendMessages) {
          return {
            allowed: false,
            reason: 'Upgrade para enviar mensagens',
            requiredPlan: 'gold'
          }
        }
        break

      case 'sendAudio':
        if (!limitations.canSendAudio) {
          return {
            allowed: false,
            reason: 'Mensagens de voz requerem plano Ouro',
            requiredPlan: 'gold'
          }
        }
        break

      case 'makeVoiceCall':
        if (!limitations.canMakeVoiceCalls) {
          return {
            allowed: false,
            reason: 'Chamadas de voz requerem plano Ouro',
            requiredPlan: 'gold'
          }
        }
        break

      case 'makeVideoCall':
        if (!limitations.canMakeVideoCalls) {
          return {
            allowed: false,
            reason: 'Chamadas de vídeo requerem plano Diamante',
            requiredPlan: 'diamond'
          }
        }
        break

      case 'createEvent':
        if (!limitations.canCreateEvents) {
          return {
            allowed: false,
            reason: 'Criação de eventos requer plano Ouro',
            requiredPlan: 'gold'
          }
        }
        if (limitations.maxEventsPerMonth > 0 && currentUsage >= limitations.maxEventsPerMonth) {
          return {
            allowed: false,
            reason: `Limite mensal atingido (${limitations.maxEventsPerMonth} eventos)`,
            requiredPlan: 'diamond',
            currentUsage,
            limit: limitations.maxEventsPerMonth
          }
        }
        break

      case 'createCommunity':
        if (!limitations.canCreateCommunities) {
          return {
            allowed: false,
            reason: 'Criação de comunidades requer plano Ouro',
            requiredPlan: 'gold'
          }
        }
        break

      case 'createPaidContent':
        if (!limitations.canCreatePaidContent) {
          return {
            allowed: false,
            reason: 'Venda de conteúdo requer plano Diamante',
            requiredPlan: 'diamond'
          }
        }
        break
    }

    return { allowed: true }
  }

  // Obter todas as limitações atuais
  const getCurrentLimitations = () => {
    return getPlanLimitations()
  }

  // Comparar com outro plano
  const comparePlans = (targetPlan: 'gold' | 'diamond'): {
    improvements: string[]
    newFeatures: string[]
  } => {
    const currentLimitations = getPlanLimitations()
    const targetLimitations = getPlanLimitations(targetPlan)

    const improvements: string[] = []
    const newFeatures: string[] = []

    // Novas funcionalidades
    if (!currentLimitations.canUploadAudio && targetLimitations.canUploadAudio) {
      newFeatures.push('Posts de áudio')
    }
    if (currentLimitations.maxVideoSize === 0 && targetLimitations.maxVideoSize > 0) {
      newFeatures.push('Posts de vídeo')
    }
    if (!currentLimitations.canCreatePolls && targetLimitations.canCreatePolls) {
      newFeatures.push('Enquetes')
    }
    if (!currentLimitations.canSendMessages && targetLimitations.canSendMessages) {
      newFeatures.push('Mensagens ilimitadas')
    }
    if (!currentLimitations.canMakeVoiceCalls && targetLimitations.canMakeVoiceCalls) {
      newFeatures.push('Chamadas de voz')
    }
    if (!currentLimitations.canMakeVideoCalls && targetLimitations.canMakeVideoCalls) {
      newFeatures.push('Chamadas de vídeo')
    }

    // Melhorias
    if (targetLimitations.maxImages > currentLimitations.maxImages) {
      improvements.push(`Até ${targetLimitations.maxImages} imagens por post`)
    }
    if (targetLimitations.maxVideoSize > currentLimitations.maxVideoSize) {
      improvements.push(`Vídeos até ${Math.floor(targetLimitations.maxVideoSize / (1024 * 1024))}MB`)
    }
    if (targetLimitations.maxEventsPerMonth > currentLimitations.maxEventsPerMonth) {
      const limit = targetLimitations.maxEventsPerMonth === -1 ? 'ilimitados' : `${targetLimitations.maxEventsPerMonth}/mês`
      improvements.push(`Eventos ${limit}`)
    }

    return { improvements, newFeatures }
  }

  // Obter estatísticas de uso
  const getUsageStats = async (): Promise<{
    videos: { used: number; limit: number }
    events: { used: number; limit: number }
    communities: { used: number; limit: number }
  }> => {
    try {
      const response = await fetch('/api/users/usage-stats')
      if (response.ok) {
        const data = await response.json()
        return data.data.usage
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }

    const limitations = getCurrentLimitations()
    return {
      videos: { used: 0, limit: limitations.maxVideosPerMonth },
      events: { used: 0, limit: limitations.maxEventsPerMonth },
      communities: { used: 0, limit: limitations.maxCommunities }
    }
  }

  return {
    getPlanLimitations,
    validateAction,
    getCurrentLimitations,
    comparePlans,
    getUsageStats,
    userPlan,
    isFeatureAvailable: (feature: keyof typeof PLAN_LIMITS.free) => {
      const limitations = getCurrentLimitations()
      return Boolean(limitations[feature])
    }
  }
}