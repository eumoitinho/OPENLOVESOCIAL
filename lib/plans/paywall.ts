'use client'

import { useState, useCallback } from "react"
import { usePlanLimits, useCanAccess } from "./hooks"
import { PlanType } from "./config"

export interface PaywallConfig {
  feature: string
  title: string
  description: string
  requiredPlan: 'gold' | 'diamante'
  checkFunction: (limits: any) => boolean
}

export const PAYWALL_CONFIGS: Record<string, PaywallConfig> = {
  send_message: {
    feature: 'mensagens privadas',
    title: 'Mensagens Privadas',
    description: 'Envie mensagens privadas para outros usuários com o plano premium',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.canSendMessages
  },
  
  upload_video: {
    feature: 'upload de vídeos',
    title: 'Upload de Vídeos',
    description: 'Faça upload de vídeos para seus posts com o plano premium',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.maxVideoSize > 0
  },
  
  upload_audio: {
    feature: 'upload de áudio',
    title: 'Upload de Áudio',
    description: 'Grave e compartilhe áudios com seus seguidores',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.canUploadAudio
  },
  
  create_event: {
    feature: 'criação de eventos',
    title: 'Criar Eventos',
    description: 'Crie e organize eventos para sua comunidade',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.canCreateEvents
  },
  
  create_poll: {
    feature: 'criação de enquetes',
    title: 'Criar Enquetes',
    description: 'Crie enquetes para engajar sua audiência',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.canCreatePolls
  },
  
  join_community: {
    feature: 'participar de comunidades',
    title: 'Participar de Mais Comunidades',
    description: 'Participe de mais comunidades e expanda sua rede',
    requiredPlan: 'gold',
    checkFunction: (limits) => limits.maxCommunities > 0
  },
  
  voice_call: {
    feature: 'chamadas de voz',
    title: 'Chamadas de Voz',
    description: 'Faça chamadas de voz com outros usuários',
    requiredPlan: 'diamante',
    checkFunction: (limits) => limits.canMakeVoiceCalls
  },
  
  video_call: {
    feature: 'chamadas de vídeo',
    title: 'Chamadas de Vídeo',
    description: 'Faça chamadas de vídeo com outros usuários',
    requiredPlan: 'diamante',
    checkFunction: (limits) => limits.canMakeVideoCalls
  },
  
  create_community: {
    feature: 'criação de comunidades',
    title: 'Criar Comunidades',
    description: 'Crie suas próprias comunidades privadas',
    requiredPlan: 'diamante',
    checkFunction: (limits) => limits.canCreateCommunities
  },
  
  analytics: {
    feature: 'estatísticas avançadas',
    title: 'Analytics e Estatísticas',
    description: 'Acesse estatísticas detalhadas do seu perfil',
    requiredPlan: 'diamante',
    checkFunction: (limits) => limits.canAccessAnalytics
  }
}

export interface PaywallState {
  isOpen: boolean
  config: PaywallConfig | null
}

export function usePaywall() {
  const [paywall, setPaywall] = useState<PaywallState>({
    isOpen: false,
    config: null
  })
  
  const limits = usePlanLimits()
  const canAccess = useCanAccess()
  
  const checkFeature = useCallback((featureKey: string): boolean => {
    const config = PAYWALL_CONFIGS[featureKey]
    if (!config) return true
    
    return config.checkFunction(limits)
  }, [limits])
  
  const requireFeature = useCallback((featureKey: string): boolean => {
    const config = PAYWALL_CONFIGS[featureKey]
    if (!config) return true
    
    const hasAccess = config.checkFunction(limits)
    
    if (!hasAccess) {
      setPaywall({
        isOpen: true,
        config
      })
      return false
    }
    
    return true
  }, [limits])
  
  const closePaywall = useCallback(() => {
    setPaywall({
      isOpen: false,
      config: null
    })
  }, [])
  
  return {
    paywall,
    checkFeature,
    requireFeature,
    closePaywall,
    canAccess,
    limits
  }
}

// Hook para verificar se uma funcionalidade específica está disponível
export function useFeatureAccess(featureKey: string) {
  const { checkFeature, requireFeature } = usePaywall()
  
  return {
    hasAccess: checkFeature(featureKey),
    requireAccess: () => requireFeature(featureKey)
  }
}
