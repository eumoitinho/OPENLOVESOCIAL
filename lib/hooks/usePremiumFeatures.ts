"use client"

import { useAuth } from "@/app/components/auth/AuthProvider"
import { useMemo } from "react"
import type { User } from "@/app/lib/database.types"

export type PlanType = 'free' | 'gold' | 'diamond' | 'diamond_annual'

export interface PremiumFeatures {
  // Comunidades
  maxCommunities: number
  canCreateCommunities: boolean
  
  // Eventos
  maxEventsPerMonth: number
  canCreateEvents: boolean
  
  // Mensagens
  canSendMessages: boolean
  canSendMedia: boolean
  canSendAudio: boolean
  canSendVideo: boolean
  
  // Chamadas
  canMakeVoiceCalls: boolean
  canMakeVideoCalls: boolean
  
  // Upload
  maxPhotos: number
  maxVideos: number
  maxVideoSizeMB: number
  canUploadAudio: boolean
  canUploadVideo: boolean
  
  // Visual
  hasVerifiedBadge: boolean
  hasProfileHighlight: boolean
  hasCustomColors: boolean
  
  // Analytics
  hasBasicAnalytics: boolean
  hasAdvancedAnalytics: boolean
  
  // Suporte
  hasPrioritySupport: boolean
  hasDedicatedSupport: boolean
  
  // Moderação
  hasAdvancedModeration: boolean
  
  // Outros
  canExportData: boolean
  hasNoAds: boolean
  canCreatePolls: boolean
  canCreatePaidContent: boolean
  canAccessAnalytics: boolean
  canGetVerifiedBadge: boolean
}

const PLAN_FEATURES: Record<PlanType, PremiumFeatures> = {
  free: {
    maxCommunities: 0,
    canCreateCommunities: false,
    maxEventsPerMonth: 0,
    canCreateEvents: false,
    canSendMessages: false,
    canSendMedia: false,
    canSendAudio: false,
    canSendVideo: false,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
    maxPhotos: -1, // Ilimitado
    maxVideos: 1,
    maxVideoSizeMB: 10,
    canUploadAudio: false,
    canUploadVideo: false,
    hasVerifiedBadge: false,
    hasProfileHighlight: false,
    hasCustomColors: false,
    hasBasicAnalytics: false,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    hasDedicatedSupport: false,
    hasAdvancedModeration: false,
    canExportData: false,
    hasNoAds: false,
    canCreatePolls: false,
    canCreatePaidContent: false,
    canAccessAnalytics: false,
    canGetVerifiedBadge: false
  },
  gold: {
    maxCommunities: 3,
    canCreateCommunities: false,
    maxEventsPerMonth: 2,
    canCreateEvents: true,
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: false,
    canSendVideo: false,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
    maxPhotos: -1, // Ilimitado
    maxVideos: 10,
    maxVideoSizeMB: 25,
    canUploadAudio: true,
    canUploadVideo: true,
    hasVerifiedBadge: false,
    hasProfileHighlight: true,
    hasCustomColors: false,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: true,
    hasDedicatedSupport: false,
    hasAdvancedModeration: false,
    canExportData: false,
    hasNoAds: true,
    canCreatePolls: true,
    canCreatePaidContent: false,
    canAccessAnalytics: true,
    canGetVerifiedBadge: false
  },
  diamond: {
    maxCommunities: 5,
    canCreateCommunities: true,
    maxEventsPerMonth: 10,
    canCreateEvents: true,
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: true,
    canSendVideo: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    maxPhotos: -1, // Ilimitado
    maxVideos: -1, // Ilimitado
    maxVideoSizeMB: 50,
    canUploadAudio: true,
    canUploadVideo: true,
    hasVerifiedBadge: true,
    hasProfileHighlight: true,
    hasCustomColors: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
    hasDedicatedSupport: true,
    hasAdvancedModeration: true,
    canExportData: true,
    hasNoAds: true,
    canCreatePolls: true,
    canCreatePaidContent: true,
    canAccessAnalytics: true,
    canGetVerifiedBadge: true
  },
  diamond_annual: {
    maxCommunities: 5,
    canCreateCommunities: true,
    maxEventsPerMonth: 10,
    canCreateEvents: true,
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: true,
    canSendVideo: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    maxPhotos: -1, // Ilimitado
    maxVideos: -1, // Ilimitado
    maxVideoSizeMB: 50,
    canUploadAudio: true,
    canUploadVideo: true,
    hasVerifiedBadge: true,
    hasProfileHighlight: true,
    hasCustomColors: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
    hasDedicatedSupport: true,
    hasAdvancedModeration: true,
    canExportData: true,
    hasNoAds: true,
    canCreatePolls: true,
    canCreatePaidContent: true,
    canAccessAnalytics: true,
    canGetVerifiedBadge: true
  }
}

export function usePremiumFeatures() {
  const { profile } = useAuth()
  
  const features = useMemo(() => {
    if (!profile) return PLAN_FEATURES.free
    
    const planType = (profile.premium_type || 'free') as PlanType
    const isPremiumActive = profile.is_premium && profile.premium_status === 'active'
    
    // Se o premium não está ativo, retornar recursos gratuitos
    if (!isPremiumActive && planType !== 'free') {
      return PLAN_FEATURES.free
    }
    
    return PLAN_FEATURES[planType] || PLAN_FEATURES.free
  }, [profile])
  
  const planType = (profile?.premium_type || 'free') as PlanType
  const isPremium = profile?.is_premium && profile?.premium_status === 'active'
  const premiumExpiresAt = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null
  const isExpired = premiumExpiresAt ? new Date() > premiumExpiresAt : false
  
  return {
    features,
    planType,
    isPremium: isPremium && !isExpired,
    isExpired,
    premiumExpiresAt,
    
    // Helpers para verificações específicas
    canSendMessages: () => features.canSendMessages,
    canCreateEvents: () => features.canCreateEvents,
    hasVerifiedBadge: () => features.hasVerifiedBadge,
    canJoinCommunities: (currentCount: number) => currentCount < features.maxCommunities,
    canCreateMoreEvents: (currentMonthCount: number) => 
      features.maxEventsPerMonth === -1 || currentMonthCount < features.maxEventsPerMonth,
    canUploadVideo: (fileSizeMB: number) => fileSizeMB <= features.maxVideoSizeMB,
    
    // Função para verificar se pode usar uma funcionalidade específica
    hasFeature: (featureName: keyof PremiumFeatures) => {
      return features[featureName] as boolean
    }
  }
}

export function getPlanName(planType: PlanType): string {
  const names = {
    free: 'Gratuito',
    gold: 'Gold',
    diamond: 'Diamond',
    diamond_annual: 'Diamond Anual'
  }
  return names[planType] || 'Desconhecido'
}

export function getPlanColor(planType: PlanType): string {
  const colors = {
    free: 'gray',
    gold: 'yellow',
    diamond: 'blue',
    diamond_annual: 'purple'
  }
  return colors[planType] || 'gray'
}
