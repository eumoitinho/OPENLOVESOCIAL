import { createSupabaseAdmin } from '@/app/lib/supabase'
import { PLAN_LIMITS, PlanType, PlanLimits, getEffectivePlan } from './config'

// Classe para verificações server-side
export class PlanValidator {
  private supabase = createSupabaseAdmin()
  
  async getUserPlan(userId: string): Promise<{ plan: PlanType; status: string; limits: PlanLimits }> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('premium_type, premium_status')
      .eq('id', userId)
      .single()
    
    if (error || !user) {
      return { plan: 'free', status: 'inactive', limits: PLAN_LIMITS.free }
    }
    
    const effectivePlan = getEffectivePlan(user.premium_type as PlanType, user.premium_status)
    
    return {
      plan: effectivePlan,
      status: user.premium_status,
      limits: PLAN_LIMITS[effectivePlan]
    }
  }
  
  async canUploadMedia(userId: string, imageCount: number, videoSize: number): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (imageCount > limits.maxImages) {
      return { 
        allowed: false, 
        reason: `Máximo de ${limits.maxImages} imagens permitido para seu plano` 
      }
    }
    
    if (videoSize > limits.maxVideoSize) {
      return { 
        allowed: false, 
        reason: `Tamanho máximo de vídeo: ${Math.round(limits.maxVideoSize / (1024 * 1024))}MB` 
      }
    }
    
    return { allowed: true }
  }
  
  async canCreateEvent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (!limits.canCreateEvents) {
      return { 
        allowed: false, 
        reason: 'Criação de eventos disponível apenas para assinantes' 
      }
    }
    
    // Verificar limite mensal
    if (limits.maxEventsPerMonth > 0) {
      const { count } = await this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      
      if (count && count >= limits.maxEventsPerMonth) {
        return { 
          allowed: false, 
          reason: `Limite mensal de ${limits.maxEventsPerMonth} eventos atingido` 
        }
      }
    }
    
    return { allowed: true }
  }
  
  async canJoinCommunity(userId: string, communityId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    // Verificar se é comunidade verificada
    const { data: community } = await this.supabase
      .from('communities')
      .select('is_verified')
      .eq('id', communityId)
      .single()
    
    // Usuários free só podem participar de comunidades verificadas
    if (limits.canJoinVerifiedOnly && !community?.is_verified) {
      return { 
        allowed: false, 
        reason: 'Usuários gratuitos podem participar apenas de comunidades verificadas' 
      }
    }
    
    // Verificar limite de comunidades
    if (limits.maxCommunities > 0) {
      const { count } = await this.supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')
      
      if (count && count >= limits.maxCommunities) {
        return { 
          allowed: false, 
          reason: `Limite de ${limits.maxCommunities} comunidades atingido` 
        }
      }
    }
    
    return { allowed: true }
  }
  
  async canCreateCommunity(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (!limits.canCreateCommunities) {
      return { 
        allowed: false, 
        reason: 'Criação de comunidades disponível apenas para plano Diamante' 
      }
    }
    
    return { allowed: true }
  }
  
  async canSendMessage(userId: string, targetUserId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (!limits.canSendMessages) {
      return { 
        allowed: false, 
        reason: 'Mensagens disponíveis apenas para assinantes' 
      }
    }
    
    return { allowed: true }
  }
  
  async canCreatePoll(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (!limits.canCreatePolls) {
      return { 
        allowed: false, 
        reason: 'Enquetes disponíveis apenas para assinantes' 
      }
    }
    
    return { allowed: true }
  }
  
  async validatePollCreation(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    return this.canCreatePoll(userId)
  }
  
  async validateAudioUpload(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    return this.canUploadAudio(userId)
  }
  
  async canUploadAudio(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (!limits.canUploadAudio) {
      return { 
        allowed: false, 
        reason: 'Upload de áudio disponível apenas para assinantes' 
      }
    }
    
    return { allowed: true }
  }
  
  async validateVideoUpload(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const { limits } = await this.getUserPlan(userId)
    
    if (limits.maxVideosPerMonth === 0) {
      return { 
        allowed: false, 
        reason: 'Upload de vídeo disponível apenas para assinantes' 
      }
    }
    
    if (limits.maxVideosPerMonth > 0) {
      // Verificar limite mensal
      const { count } = await this.supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('media_urls', 'is', null)
        .contains('media_types', '["video"]')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      
      if (count && count >= limits.maxVideosPerMonth) {
        return { 
          allowed: false, 
          reason: `Limite mensal de ${limits.maxVideosPerMonth} vídeos atingido` 
        }
      }
    }
    
    return { allowed: true }
  }
  
  async getPlanUsage(userId: string): Promise<{
    videosThisMonth: number
    eventsThisMonth: number
    communitiesJoined: number
  }> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    
    const [videosResult, eventsResult, communitiesResult] = await Promise.all([
      this.supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('media_urls', 'is', null)
        .contains('media_types', '["video"]')
        .gte('created_at', firstDayOfMonth),
      
      this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId)
        .gte('created_at', firstDayOfMonth),
      
      this.supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')
    ])
    
    return {
      videosThisMonth: videosResult.count || 0,
      eventsThisMonth: eventsResult.count || 0,
      communitiesJoined: communitiesResult.count || 0
    }
  }
}

// Instância singleton para reutilização
export const planValidator = new PlanValidator()

// Função helper para middleware
export async function validatePlanAccess(
  userId: string, 
  action: string, 
  data?: any
): Promise<{ allowed: boolean; reason?: string }> {
  const validator = new PlanValidator()
  
  switch (action) {
    case 'upload_media':
      return validator.canUploadMedia(userId, data?.imageCount || 0, data?.videoSize || 0)
    case 'create_event':
      return validator.canCreateEvent(userId)
    case 'join_community':
      return validator.canJoinCommunity(userId, data?.communityId)
    case 'create_community':
      return validator.canCreateCommunity(userId)
    case 'send_message':
      return validator.canSendMessage(userId, data?.targetUserId)
    case 'create_poll':
      return validator.canCreatePoll(userId)
    case 'upload_audio':
      return validator.canUploadAudio(userId)
    case 'upload_video':
      return validator.validateVideoUpload(userId)
    default:
      return { allowed: true }
  }
}