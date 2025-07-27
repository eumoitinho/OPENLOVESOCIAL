import { PlanType } from "@/lib/plans/config"

export type CommunityId = string
export type UserId = string

// Tipo de comunidade
export type CommunityType = 'public' | 'private' | 'premium'

// Categoria da comunidade
export type CommunityCategory = 
  | 'lifestyle'
  | 'technology'
  | 'sports'
  | 'music'
  | 'art'
  | 'food'
  | 'travel'
  | 'gaming'
  | 'business'
  | 'education'
  | 'health'
  | 'entertainment'
  | 'other'

// Role do membro na comunidade
export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member'

// Status do membro
export type MembershipStatus = 'active' | 'pending' | 'banned' | 'left'

// Interface principal da comunidade
export interface Community {
  id: CommunityId
  name: string
  description: string
  avatar_url?: string
  banner_url?: string
  type: CommunityType
  category: CommunityCategory
  owner_id: UserId
  created_at: string
  updated_at: string
  
  // Configurações
  settings: CommunitySettings
  
  // Estatísticas
  stats: CommunityStats
  
  // Metadados
  metadata?: CommunityMetadata
}

// Configurações da comunidade
export interface CommunitySettings {
  // Visibilidade
  is_discoverable: boolean
  require_approval: boolean
  allow_member_invites: boolean
  
  // Conteúdo
  allow_posts: boolean
  allow_events: boolean
  allow_polls: boolean
  
  // Moderação
  auto_moderation: boolean
  banned_words: string[]
  
  // Premium features
  is_premium: boolean
  subscription_price?: number
  
  // Limites
  max_members?: number
  required_plan?: PlanType
}

// Estatísticas da comunidade
export interface CommunityStats {
  member_count: number
  post_count: number
  event_count: number
  total_interactions: number
  weekly_active_members: number
  monthly_active_members: number
}

// Metadados adicionais
export interface CommunityMetadata {
  tags: string[]
  external_links: {
    website?: string
    instagram?: string
    twitter?: string
    discord?: string
  }
  location?: {
    city?: string
    state?: string
    country?: string
  }
  language: string
  timezone: string
}

// Membro da comunidade
export interface CommunityMember {
  id: string
  community_id: CommunityId
  user_id: UserId
  role: CommunityRole
  status: MembershipStatus
  joined_at: string
  invited_by?: UserId
  
  // Permissões específicas
  permissions: MemberPermissions
  
  // Estatísticas do membro
  stats: MemberStats
}

// Permissões do membro
export interface MemberPermissions {
  can_post: boolean
  can_comment: boolean
  can_create_events: boolean
  can_invite_members: boolean
  can_moderate: boolean
  can_manage_settings: boolean
  can_view_analytics: boolean
}

// Estatísticas do membro
export interface MemberStats {
  posts_count: number
  comments_count: number
  events_created: number
  last_active_at?: string
  reputation_score: number
}

// Dados para criar comunidade
export interface CreateCommunityData {
  name: string
  description: string
  avatar_url?: string
  banner_url?: string
  type: CommunityType
  category: CommunityCategory
  settings: Partial<CommunitySettings>
  metadata?: Partial<CommunityMetadata>
}

// Dados para atualizar comunidade
export interface UpdateCommunityData {
  name?: string
  description?: string
  avatar_url?: string
  banner_url?: string
  type?: CommunityType
  category?: CommunityCategory
  settings?: Partial<CommunitySettings>
  metadata?: Partial<CommunityMetadata>
}

// Query para buscar comunidades
export interface CommunitiesQuery {
  category?: CommunityCategory
  type?: CommunityType
  search?: string
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'member_count' | 'activity' | 'name'
  sort_order?: 'asc' | 'desc'
  user_role?: CommunityRole
  user_status?: MembershipStatus
}

// Query para buscar membros
export interface MembersQuery {
  community_id: CommunityId
  role?: CommunityRole
  status?: MembershipStatus
  search?: string
  limit?: number
  offset?: number
  sort_by?: 'joined_at' | 'last_active_at' | 'reputation_score'
  sort_order?: 'asc' | 'desc'
}

// Dados para convidar membro
export interface InviteMemberData {
  community_id: CommunityId
  user_id?: UserId
  email?: string
  role?: CommunityRole
  message?: string
}

// Dados para atualizar membro
export interface UpdateMemberData {
  role?: CommunityRole
  status?: MembershipStatus
  permissions?: Partial<MemberPermissions>
}

// Convite para comunidade
export interface CommunityInvite {
  id: string
  community_id: CommunityId
  invited_by: UserId
  invited_user?: UserId
  invited_email?: string
  role: CommunityRole
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  created_at: string
  expires_at: string
}

// Analytics da comunidade
export interface CommunityAnalytics {
  community_id: CommunityId
  period: 'day' | 'week' | 'month' | 'year'
  start_date: string
  end_date: string
  
  metrics: {
    new_members: number
    active_members: number
    posts_created: number
    comments_created: number
    events_created: number
    total_interactions: number
    member_retention_rate: number
    engagement_rate: number
  }
  
  member_growth: Array<{
    date: string
    new_members: number
    total_members: number
  }>
  
  activity_timeline: Array<{
    date: string
    posts: number
    comments: number
    events: number
    interactions: number
  }>
  
  top_contributors: Array<{
    user_id: UserId
    username: string
    contribution_score: number
    posts: number
    comments: number
  }>
}

// Erros relacionados a comunidades
export interface CommunityError {
  code: 'COMMUNITY_NOT_FOUND' 
       | 'INSUFFICIENT_PERMISSIONS' 
       | 'MEMBER_LIMIT_REACHED'
       | 'PLAN_UPGRADE_REQUIRED'
       | 'COMMUNITY_PRIVATE'
       | 'ALREADY_MEMBER'
       | 'INVITE_NOT_FOUND'
       | 'INVITE_EXPIRED'
       | 'VALIDATION_ERROR'
       | 'UNKNOWN_ERROR'
  message: string
  details?: any
}

// Constantes
export const COMMUNITY_LIMITS = {
  name: { min: 3, max: 50 },
  description: { min: 10, max: 500 },
  max_members: {
    free: 50,
    gold: 200,
    diamond: 1000
  },
  max_communities_owned: {
    free: 0,
    gold: 1,
    diamond: 5
  }
} as const

export const COMMUNITY_CATEGORIES_LIST: CommunityCategory[] = [
  'lifestyle', 'technology', 'sports', 'music', 'art', 'food',
  'travel', 'gaming', 'business', 'education', 'health', 'entertainment', 'other'
]

// Type guards
export const isCommunityOwner = (member: CommunityMember): boolean => {
  return member.role === 'owner'
}

export const isCommunityAdmin = (member: CommunityMember): boolean => {
  return member.role === 'owner' || member.role === 'admin'
}

export const canModerate = (member: CommunityMember): boolean => {
  return member.role === 'owner' || member.role === 'admin' || member.role === 'moderator'
}

export const canManageSettings = (member: CommunityMember): boolean => {
  return member.permissions.can_manage_settings && (member.role === 'owner' || member.role === 'admin')
}
