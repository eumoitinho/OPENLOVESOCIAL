'use client'

import { useMemo, useState, useEffect } from "react"
import { PLAN_LIMITS, PlanType, PlanLimits, getEffectivePlan } from "./config"
import { useAuth } from "@/app/components/auth/AuthProvider"

// Interface para contadores reais
export interface UsageCounters {
  images_uploaded: number
  videos_uploaded: number
  audio_files_uploaded: number
  total_storage_bytes: number
  messages_sent: number
  events_created: number
  communities_joined: number
  communities_created: number
  polls_created: number
  voice_calls_made: number
  video_calls_made: number
  total_call_minutes: number
  profile_views_received: number
  posts_created: number
  likes_given: number
  likes_received: number
}

// Interface para limites do plano
export interface PlanLimitsConfig {
  max_images_per_month: number
  max_videos_per_month: number
  max_audio_files_per_month: number
  max_storage_bytes: number
  max_messages_per_month: number
  max_events_per_month: number
  max_communities_joined: number
  max_communities_created: number
  max_polls_per_month: number
  max_voice_calls_per_month: number
  max_video_calls_per_month: number
  max_call_minutes_per_month: number
  can_send_messages: boolean
  can_upload_media: boolean
  can_create_events: boolean
  can_create_communities: boolean
  can_create_polls: boolean
  can_make_calls: boolean
  can_access_analytics: boolean
  can_get_verified_badge: boolean
  has_premium_highlight: boolean
  badge_type: 'none' | 'premium' | 'verified'
}

// Hook para obter os limites do plano atual do usuário
export function usePlanLimits(): PlanLimits {
  const { user, profile } = useAuth()
  
  return useMemo(() => {
    if (!user) return PLAN_LIMITS.free
    
    // Usar profile.plano se disponível, senão usar 'free' como padrão
    const userPlan = (profile as any)?.plano as PlanType || 'free'
    const userStatus = (profile as any)?.status_assinatura || 'inactive'
    const effectivePlan = getEffectivePlan(userPlan, userStatus)
    
    return PLAN_LIMITS[effectivePlan]
  }, [user, profile])
}

// Hook para obter contadores reais do banco de dados
export function useUsageCounters() {
  const { user } = useAuth()
  const [counters, setCounters] = useState<UsageCounters>({
    images_uploaded: 0,
    videos_uploaded: 0,
    audio_files_uploaded: 0,
    total_storage_bytes: 0,
    messages_sent: 0,
    events_created: 0,
    communities_joined: 0,
    communities_created: 0,
    polls_created: 0,
    voice_calls_made: 0,
    video_calls_made: 0,
    total_call_minutes: 0,
    profile_views_received: 0,
    posts_created: 0,
    likes_given: 0,
    likes_received: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchCounters = async () => {
      try {
        const response = await fetch(`/api/users/usage-counters?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setCounters(data.counters)
        }
      } catch (error) {
        console.error('Erro ao buscar contadores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounters()
  }, [user?.id])

  return { counters, loading }
}

// Hook para obter configuração de limites do banco de dados
export function usePlanLimitsConfig() {
  const { user, profile } = useAuth()
  const [limitsConfig, setLimitsConfig] = useState<PlanLimitsConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userPlan = ((profile as any)?.plano || (user as any)?.plano) as PlanType || 'free'
    if (!userPlan) {
      setLoading(false)
      return
    }

    const fetchLimitsConfig = async () => {
      try {
        const response = await fetch(`/api/plans/limits-config?planType=${userPlan}`)
        if (response.ok) {
          const data = await response.json()
          setLimitsConfig(data.config)
        }
      } catch (error) {
        console.error('Erro ao buscar configuração de limites:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLimitsConfig()
  }, [(user as any)?.plano, (profile as any)?.plano])

  return { limitsConfig, loading }
}

// Hook para verificar se o usuário pode acessar uma funcionalidade
export function useCanAccess() {
  const limits = usePlanLimits()
  const { user } = useAuth()
  const { counters } = useUsageCounters()
  const { limitsConfig } = usePlanLimitsConfig()
  
  return useMemo(() => {
    const config = limitsConfig || {
      max_images_per_month: limits.maxImages,
      max_videos_per_month: limits.maxVideosPerMonth,
      max_communities_joined: limits.maxCommunities,
      max_messages_per_month: 0,
      can_send_messages: limits.canSendMessages,
      can_upload_media: limits.maxVideoSize > 0,
      can_create_events: limits.canCreateEvents,
      can_create_communities: limits.canCreateCommunities,
      can_create_polls: limits.canCreatePolls,
      can_make_calls: limits.canMakeVoiceCalls || limits.canMakeVideoCalls,
      can_access_analytics: limits.canAccessAnalytics,
      can_get_verified_badge: limits.canGetVerifiedBadge,
      has_premium_highlight: limits.hasVisualHighlight,
      badge_type: limits.badgeType
    }

    return {
      // Uploads
      canUploadImages: config.max_images_per_month > 0,
      canUploadVideos: config.max_videos_per_month > 0,
      canUploadAudio: limits.canUploadAudio,
      
      // Comunidades
      canJoinCommunities: config.max_communities_joined > 0,
      canCreateCommunities: config.can_create_communities,
      
      // Eventos
      canJoinEvents: true, // Sempre permitido
      canCreateEvents: config.can_create_events,
      
      // Mensagens
      canSendMessages: config.can_send_messages,
      canSendMedia: config.can_upload_media,
      canSendAudio: limits.canSendAudio,
      canMakeVoiceCalls: limits.canMakeVoiceCalls,
      canMakeVideoCalls: limits.canMakeVideoCalls,
      
      // Funcionalidades
      canCreatePolls: config.can_create_polls,
      canCreatePaidContent: limits.canCreatePaidContent,
      canAccessAnalytics: config.can_access_analytics,
      
      // Visual
      hasVerifiedBadge: config.can_get_verified_badge,
      hasPremiumHighlight: config.has_premium_highlight,
      
      // Informações do usuário
      currentPlan: (user as any)?.plano as PlanType || 'free',
      isActive: (user as any)?.status_assinatura === 'authorized',
      limits,
      counters
    }
  }, [limits, user, counters, limitsConfig])
}

// Hook para verificar limites específicos com contadores reais
export function usePlanUsage() {
  const limits = usePlanLimits()
  const { user } = useAuth()
  const { counters } = useUsageCounters()
  const { limitsConfig } = usePlanLimitsConfig()
  
  return useMemo(() => {
    const config = limitsConfig || {
      max_images_per_month: limits.maxImages,
      max_videos_per_month: limits.maxVideosPerMonth,
      max_events_per_month: limits.maxEventsPerMonth,
      max_communities_joined: limits.maxCommunities,
      max_messages_per_month: 0
    }

    return {
      // Uploads
      imagesThisMonth: counters.images_uploaded,
      maxImagesPerMonth: config.max_images_per_month,
      canUploadMoreImages: config.max_images_per_month === -1 || counters.images_uploaded < config.max_images_per_month,
      
      videosThisMonth: counters.videos_uploaded,
      maxVideosPerMonth: config.max_videos_per_month,
      canUploadMoreVideos: config.max_videos_per_month === -1 || counters.videos_uploaded < config.max_videos_per_month,
      
      // Comunidades
      communitiesJoined: counters.communities_joined,
      maxCommunities: config.max_communities_joined,
      canJoinMoreCommunities: config.max_communities_joined === -1 || counters.communities_joined < config.max_communities_joined,
      
      // Eventos
      eventsCreatedThisMonth: counters.events_created,
      maxEventsPerMonth: config.max_events_per_month,
      canCreateMoreEvents: config.max_events_per_month === -1 || counters.events_created < config.max_events_per_month,
      
      // Mensagens
      messagesSentThisMonth: counters.messages_sent,
      maxMessagesPerMonth: config.max_messages_per_month || 0,
      canSendMoreMessages: (config.max_messages_per_month || 0) === -1 || counters.messages_sent < (config.max_messages_per_month || 0),
      
      // Função para verificar se pode fazer uma ação
      canPerformAction: (action: string) => {
        switch (action) {
          case 'upload_image':
            return config.max_images_per_month === -1 || counters.images_uploaded < config.max_images_per_month
          case 'upload_video':
            return config.max_videos_per_month === -1 || counters.videos_uploaded < config.max_videos_per_month
          case 'join_community':
            return config.max_communities_joined === -1 || counters.communities_joined < config.max_communities_joined
          case 'create_event':
            return config.max_events_per_month === -1 || counters.events_created < config.max_events_per_month
          case 'send_message':
            return (config.max_messages_per_month || 0) === -1 || counters.messages_sent < (config.max_messages_per_month || 0)
          default:
            return true
        }
      }
    }
  }, [limits, user, counters, limitsConfig])
}

// Hook para obter informações de upgrade
export function useUpgradeInfo() {
  const { user, profile } = useAuth()
  const { counters } = useUsageCounters()
  const currentPlan = ((profile as any)?.plano || (user as any)?.plano) as PlanType || 'free'
  
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
        targetPlan: 'diamond',
        reason: 'Recursos completos + chamadas de voz/vídeo',
        features: ['Chamadas de voz/vídeo', 'Mais comunidades', 'Badge verificado']
      })
    }
    
    // Verificar se está próximo dos limites
    const nearLimits = []
    if (counters.images_uploaded >= 40 && currentPlan === 'gold') {
      nearLimits.push('Upload de imagens próximo do limite')
    }
    if (counters.messages_sent >= 800 && currentPlan === 'gold') {
      nearLimits.push('Mensagens próximas do limite')
    }
    if (counters.events_created >= 4 && currentPlan === 'gold') {
      nearLimits.push('Eventos próximos do limite')
    }
    
    return {
      currentPlan,
      suggestions,
      nearLimits,
      canUpgrade: currentPlan !== 'diamond' && currentPlan !== 'diamond_annual',
      usagePercentage: {
        images: counters.images_uploaded / 50 * 100,
        messages: counters.messages_sent / 1000 * 100,
        events: counters.events_created / 5 * 100
      }
    }
  }, [currentPlan, counters])
}

// Hook para incrementar contadores
export function useIncrementCounter() {
  const { user } = useAuth()
  
  const incrementCounter = async (actionType: string, points: number = 1) => {
    if (!user?.id) return false
    
    try {
      const response = await fetch('/api/users/increment-counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          actionType,
          points
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Erro ao incrementar contador:', error)
      return false
    }
  }
  
  return { incrementCounter }
}
