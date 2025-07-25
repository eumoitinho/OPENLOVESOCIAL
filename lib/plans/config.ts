// Configuração de planos e suas limitações
export type PlanType = 'free' | 'gold' | 'diamond' | 'diamond_annual'

// Mapeamento para compatibilidade
export const PLAN_LEGACY_MAPPING: Record<string, PlanType> = {
  'diamante': 'diamond',
  'diamante_anual': 'diamond_annual'
}

export interface PlanLimits {
  // Uploads
  maxImages: number
  maxVideoSize: number // em bytes
  maxVideosPerMonth: number
  canUploadAudio: boolean
  
  // Comunidades
  maxCommunities: number
  canCreateCommunities: boolean
  canJoinVerifiedOnly: boolean
  
  // Eventos
  maxEventsPerMonth: number
  canCreateEvents: boolean
  canJoinVerifiedOnly: boolean
  
  // Mensagens
  canSendMessages: boolean
  canSendMedia: boolean
  canSendAudio: boolean
  canMakeVoiceCalls: boolean
  canMakeVideoCalls: boolean
  
  // Funcionalidades
  canCreatePolls: boolean
  canCreatePaidContent: boolean
  canAccessAnalytics: boolean
  canGetVerifiedBadge: boolean
  
  // Visual
  hasVisualHighlight: boolean
  badgeType: 'none' | 'premium' | 'verified'
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    // Uploads
    maxImages: 1,
    maxVideoSize: 0,
    maxVideosPerMonth: 0,
    canUploadAudio: false,
    
    // Comunidades
    maxCommunities: 0,
    canCreateCommunities: false,
    canJoinVerifiedOnly: true,
    
    // Eventos
    maxEventsPerMonth: 0,
    canCreateEvents: false,
    canJoinVerifiedOnly: true,
    
    // Mensagens
    canSendMessages: false,
    canSendMedia: false,
    canSendAudio: false,
    canMakeVoiceCalls: false,
    canMakeVideoCalls: false,
    
    // Funcionalidades
    canCreatePolls: false,
    canCreatePaidContent: false,
    canAccessAnalytics: false,
    canGetVerifiedBadge: false,
    
    // Visual
    hasVisualHighlight: false,
    badgeType: 'none'
  },
  
  gold: {
    // Uploads
    maxImages: 5,
    maxVideoSize: 25 * 1024 * 1024, // 25MB
    maxVideosPerMonth: 10,
    canUploadAudio: true,
    
    // Comunidades
    maxCommunities: 1,
    canCreateCommunities: true,
    canJoinVerifiedOnly: false,
    
    // Eventos
    maxEventsPerMonth: 3,
    canCreateEvents: true,
    canJoinVerifiedOnly: false,
    
    // Mensagens
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: false,
    
    // Funcionalidades
    canCreatePolls: true,
    canCreatePaidContent: false,
    canAccessAnalytics: true,
    canGetVerifiedBadge: false,
    
    // Visual
    hasVisualHighlight: true,
    badgeType: 'premium'
  },
  
  diamond: {
    // Uploads
    maxImages: 10,
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxVideosPerMonth: -1, // Ilimitado
    canUploadAudio: true,
    
    // Comunidades
    maxCommunities: 5,
    canCreateCommunities: true,
    canJoinVerifiedOnly: false,
    
    // Eventos
    maxEventsPerMonth: 10,
    canCreateEvents: true,
    canJoinVerifiedOnly: false,
    
    // Mensagens
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    
    // Funcionalidades
    canCreatePolls: true,
    canCreatePaidContent: true,
    canAccessAnalytics: true,
    canGetVerifiedBadge: true,
    
    // Visual
    hasVisualHighlight: true,
    badgeType: 'verified'
  },
  
  diamond_annual: {
    // Mesmo que diamond, mas com desconto anual
    maxImages: 10,
    maxVideoSize: 50 * 1024 * 1024,
    maxVideosPerMonth: -1,
    canUploadAudio: true,
    
    maxCommunities: 5,
    canCreateCommunities: true,
    canJoinVerifiedOnly: false,
    
    maxEventsPerMonth: 10,
    canCreateEvents: true,
    canJoinVerifiedOnly: false,
    
    canSendMessages: true,
    canSendMedia: true,
    canSendAudio: true,
    canMakeVoiceCalls: true,
    canMakeVideoCalls: true,
    
    canCreatePolls: true,
    canCreatePaidContent: true,
    canAccessAnalytics: true,
    canGetVerifiedBadge: true,
    
    hasVisualHighlight: true,
    badgeType: 'verified'
  }
}

export const PLAN_NAMES: Record<PlanType, string> = {
  free: 'Gratuito',
  gold: 'Open Ouro',
  diamond: 'Open Diamante',
  diamond_annual: 'Open Diamante Anual'
}

export const PLAN_PRICES: Record<PlanType, { monthly: number; currency: string }> = {
  free: { monthly: 0, currency: 'BRL' },
  gold: { monthly: 25.00, currency: 'BRL' },
  diamond: { monthly: 45.90, currency: 'BRL' },
  diamond_annual: { monthly: 38.25, currency: 'BRL' } // R$ 459/ano = R$ 38,25/mês
}

// Função para verificar se o plano é ativo
export function isPlanActive(status: string): boolean {
  return status === 'authorized' || status === 'active'
}

// Função para obter o plano efetivo (considerando status da assinatura)
export function getEffectivePlan(plan: PlanType, status: string): PlanType {
  if (!isPlanActive(status)) {
    return 'free'
  }
  return plan
}