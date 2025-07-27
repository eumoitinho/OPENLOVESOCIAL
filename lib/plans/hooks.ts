'use client'

import { useMemo } from "react"
import { PLAN_LIMITS, PlanType, PlanLimits, getEffectivePlan } from "./config"
import { useAuth } from "@/app/components/auth/AuthProvider"

// Hook para obter os limites do plano atual do usuário
export function usePlanLimits(): PlanLimits {
  const { user } = useAuth()
  
  return useMemo(() => {
    if (!user) return PLAN_LIMITS.free
    
    const userPlan = user.plano as PlanType || 'free'
    const userStatus = user.status_assinatura || 'inactive'
    const effectivePlan = getEffectivePlan(userPlan, userStatus)
    
    return PLAN_LIMITS[effectivePlan]
  }, [user])
}

// Hook para verificar se o usuário pode acessar uma funcionalidade
export function useCanAccess() {
  const limits = usePlanLimits()
  const { user } = useAuth()
  
  return useMemo(() => ({
    // Uploads
    canUploadImages: limits.maxImages > 0,
    canUploadVideos: limits.maxVideoSize > 0,
    canUploadAudio: limits.canUploadAudio,
    
    // Comunidades
    canJoinCommunities: limits.maxCommunities > 0 || limits.canJoinVerifiedOnly,
    canCreateCommunities: limits.canCreateCommunities,
    
    // Eventos
    canJoinEvents: limits.maxEventsPerMonth > 0 || limits.canJoinVerifiedOnly,
    canCreateEvents: limits.canCreateEvents,
    
    // Mensagens
    canSendMessages: limits.canSendMessages,
    canSendMedia: limits.canSendMedia,
    canSendAudio: limits.canSendAudio,
    canMakeVoiceCalls: limits.canMakeVoiceCalls,
    canMakeVideoCalls: limits.canMakeVideoCalls,
    
    // Funcionalidades
    canCreatePolls: limits.canCreatePolls,
    canCreatePaidContent: limits.canCreatePaidContent,
    canAccessAnalytics: limits.canAccessAnalytics,
    
    // Visual
    hasVerifiedBadge: limits.canGetVerifiedBadge,
    hasPremiumHighlight: limits.hasVisualHighlight,
    
    // Informações do usuário
    currentPlan: user?.plano as PlanType || 'free',
    isActive: user?.status_assinatura === 'authorized',
    limits
  }), [limits, user])
}

// Hook para verificar limites específicos com contadores
export function usePlanUsage() {
  const limits = usePlanLimits()
  const { user } = useAuth()
  
  // TODO: Implementar contadores reais do banco de dados
  // Por enquanto, retorna valores mock
  return useMemo(() => ({
    // Uploads (dados mock - implementar contadores reais)
    videosThisMonth: 0,
    maxVideosPerMonth: limits.maxVideosPerMonth,
    canUploadMoreVideos: limits.maxVideosPerMonth === -1 || 0 < limits.maxVideosPerMonth,
    
    // Comunidades (dados mock - implementar contadores reais)
    communitiesJoined: 0,
    maxCommunities: limits.maxCommunities,
    canJoinMoreCommunities: limits.maxCommunities === -1 || 0 < limits.maxCommunities,
    
    // Eventos (dados mock - implementar contadores reais)
    eventsCreatedThisMonth: 0,
    maxEventsPerMonth: limits.maxEventsPerMonth,
    canCreateMoreEvents: limits.maxEventsPerMonth === -1 || 0 < limits.maxEventsPerMonth,
    
    // Função para verificar se pode fazer uma ação
    canPerformAction: (action: string) => {
      switch (action) {
        case 'upload_video':
          return limits.maxVideosPerMonth === -1 || 0 < limits.maxVideosPerMonth
        case 'join_community':
          return limits.maxCommunities === -1 || 0 < limits.maxCommunities
        case 'create_event':
          return limits.maxEventsPerMonth === -1 || 0 < limits.maxEventsPerMonth
        default:
          return true
      }
    }
  }), [limits, user])
}

// Hook para obter informações de upgrade
export function useUpgradeInfo() {
  const { user } = useAuth()
  const currentPlan = user?.plano as PlanType || 'free'
  
  return useMemo(() => {
    const suggestions = []
    
    if (currentPlan === 'free') {
      suggestions.push({
        targetPlan: 'gold',
        reason: 'Desbloquear mensagens, uploads e criação de eventos',
        features: ['Mensagens privadas', 'Upload de fotos', 'Criar eventos']
      })
    }
    
    if (currentPlan === 'gold') {
      suggestions.push({
        targetPlan: 'diamante',
        reason: 'Recursos completos + chamadas de voz/vídeo',
        features: ['Chamadas de voz/vídeo', 'Mais comunidades', 'Badge verificado']
      })
    }
    
    return {
      currentPlan,
      suggestions,
      canUpgrade: currentPlan !== 'diamante' && currentPlan !== 'diamante_anual'
    }
  }, [currentPlan])
}
