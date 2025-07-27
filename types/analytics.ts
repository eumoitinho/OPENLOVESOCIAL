import { PlanType } from "@/lib/plans/config"

export type AnalyticsId = string
export type UserId = string
export type PostId = string
export type CommunityId = string
export type EventId = string

// Períodos de tempo para analytics
export type AnalyticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'

// Tipos de métricas
export type MetricType = 
  | 'profile_views'
  | 'post_views'
  | 'post_likes'
  | 'post_comments'
  | 'post_shares'
  | 'follower_growth'
  | 'engagement_rate'
  | 'reach'
  | 'impressions'
  | 'community_growth'
  | 'event_attendance'
  | 'content_performance'
  | 'audience_demographics'

// Analytics principais do usuário
export interface UserAnalytics {
  user_id: UserId
  period: AnalyticsPeriod
  start_date: string
  end_date: string
  
  // Métricas principais
  overview: AnalyticsOverview
  
  // Performance de conteúdo
  content: ContentAnalytics
  
  // Crescimento de audiência
  audience: AudienceAnalytics
  
  // Engajamento
  engagement: EngagementAnalytics
  
  // Revenue (para criadores de conteúdo premium)
  revenue?: RevenueAnalytics
}

// Visão geral das métricas
export interface AnalyticsOverview {
  total_profile_views: number
  total_post_views: number
  total_followers: number
  total_following: number
  total_posts: number
  total_likes_received: number
  total_comments_received: number
  total_shares_received: number
  
  // Comparação com período anterior
  growth: {
    profile_views: number // percentual
    followers: number
    engagement: number
    content_creation: number
  }
}

// Analytics de conteúdo
export interface ContentAnalytics {
  total_posts: number
  total_views: number
  total_interactions: number
  average_engagement_rate: number
  
  // Performance por tipo de conteúdo
  by_type: {
    text: ContentTypeMetrics
    image: ContentTypeMetrics
    video: ContentTypeMetrics
    audio: ContentTypeMetrics
    poll: ContentTypeMetrics
  }
  
  // Posts com melhor performance
  top_posts: TopContentItem[]
  
  // Horários de melhor engajamento
  best_posting_times: PostingTimeMetrics[]
  
  // Tendências de hashtags
  trending_hashtags: HashtagMetrics[]
}

// Métricas por tipo de conteúdo
export interface ContentTypeMetrics {
  count: number
  views: number
  likes: number
  comments: number
  shares: number
  avg_engagement_rate: number
}

// Item de conteúdo top
export interface TopContentItem {
  id: PostId
  type: 'text' | 'image' | 'video' | 'audio' | 'poll'
  title?: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
  created_at: string
}

// Métricas de horário de postagem
export interface PostingTimeMetrics {
  hour: number
  day_of_week: number
  avg_engagement_rate: number
  recommended: boolean
}

// Métricas de hashtags
export interface HashtagMetrics {
  hashtag: string
  usage_count: number
  avg_engagement_rate: number
  trending_score: number
}

// Analytics de audiência
export interface AudienceAnalytics {
  total_followers: number
  follower_growth: GrowthMetrics[]
  
  // Demografia
  demographics: {
    age_groups: DemographicBreakdown[]
    gender: DemographicBreakdown[]
    location: DemographicBreakdown[]
    interests: DemographicBreakdown[]
  }
  
  // Atividade da audiência
  audience_activity: {
    most_active_times: ActiveTimeMetrics[]
    engagement_patterns: EngagementPattern[]
  }
  
  // Qualidade da audiência
  audience_quality: {
    engagement_rate: number
    retention_rate: number
    authentic_followers_percentage: number
  }
}

// Métricas de crescimento
export interface GrowthMetrics {
  date: string
  followers: number
  following: number
  net_growth: number
  growth_rate: number
}

// Breakdown demográfico
export interface DemographicBreakdown {
  category: string
  value: string | number
  count: number
  percentage: number
}

// Métricas de tempo ativo
export interface ActiveTimeMetrics {
  hour: number
  day_of_week: number
  activity_score: number
}

// Padrão de engajamento
export interface EngagementPattern {
  content_type: string
  avg_time_to_engage: number // em minutos
  peak_engagement_time: number // horas após posting
  engagement_duration: number // quanto tempo o engajamento dura
}

// Analytics de engajamento
export interface EngagementAnalytics {
  total_interactions: number
  engagement_rate: number
  
  // Tipos de interação
  interactions_by_type: {
    likes: number
    comments: number
    shares: number
    saves: number
    profile_visits: number
  }
  
  // Timeline de engajamento
  engagement_timeline: EngagementTimelineItem[]
  
  // Engajamento por conteúdo
  engagement_by_content: ContentEngagementMetrics[]
  
  // Usuários mais engajados
  top_engagers: TopEngagerItem[]
}

// Item da timeline de engajamento
export interface EngagementTimelineItem {
  date: string
  likes: number
  comments: number
  shares: number
  saves: number
  total: number
  rate: number
}

// Métricas de engajamento por conteúdo
export interface ContentEngagementMetrics {
  post_id: PostId
  post_type: string
  engagement_rate: number
  time_to_peak_engagement: number
  total_interactions: number
  virality_score: number
}

// Top engajadores
export interface TopEngagerItem {
  user_id: UserId
  username: string
  avatar_url?: string
  interaction_count: number
  engagement_types: string[]
  relationship: 'follower' | 'following' | 'mutual' | 'none'
}

// Analytics de receita (para premium)
export interface RevenueAnalytics {
  total_revenue: number
  revenue_growth: number
  
  // Fontes de receita
  revenue_sources: {
    premium_content: number
    tips: number
    subscriptions: number
    events: number
  }
  
  // Métricas de conversão
  conversion_metrics: {
    profile_to_subscriber_rate: number
    content_to_purchase_rate: number
    average_order_value: number
  }
  
  // Timeline de receita
  revenue_timeline: RevenueTimelineItem[]
  
  // Top content vendido
  top_selling_content: TopSellingItem[]
}

// Item da timeline de receita
export interface RevenueTimelineItem {
  date: string
  revenue: number
  transactions: number
  new_subscribers: number
}

// Item mais vendido
export interface TopSellingItem {
  content_id: string
  content_type: string
  title: string
  revenue: number
  purchases: number
  conversion_rate: number
}

// Analytics de eventos
export interface EventAnalytics {
  event_id: EventId
  title: string
  
  // Métricas básicas
  total_views: number
  total_interested: number
  total_attendees: number
  conversion_rate: number
  
  // Timeline de inscrições
  registration_timeline: RegistrationTimelineItem[]
  
  // Demografia dos participantes
  attendee_demographics: {
    age_groups: DemographicBreakdown[]
    gender: DemographicBreakdown[]
    location: DemographicBreakdown[]
  }
  
  // Engajamento
  engagement_metrics: {
    shares: number
    comments: number
    saves: number
    check_ins: number
  }
  
  // Feedback pós-evento
  feedback?: EventFeedbackMetrics
}

// Item da timeline de registro
export interface RegistrationTimelineItem {
  date: string
  registrations: number
  cumulative_registrations: number
  conversion_rate: number
}

// Métricas de feedback do evento
export interface EventFeedbackMetrics {
  average_rating: number
  total_reviews: number
  satisfaction_score: number
  nps_score: number
  
  feedback_breakdown: {
    rating: number
    count: number
    percentage: number
  }[]
}

// Query para analytics
export interface AnalyticsQuery {
  user_id?: UserId
  period: AnalyticsPeriod
  start_date: string
  end_date: string
  metrics?: MetricType[]
  compare_previous_period?: boolean
  include_demographics?: boolean
  include_revenue?: boolean
}

// Filtros para analytics
export interface AnalyticsFilters {
  content_type?: string[]
  min_engagement_rate?: number
  max_engagement_rate?: number
  location?: string[]
  age_group?: string[]
  gender?: string[]
  plan_type?: PlanType[]
}

// Resposta de analytics
export interface AnalyticsResponse {
  success: boolean
  data: UserAnalytics
  metadata: {
    generated_at: string
    cache_expires_at: string
    data_freshness: string
    plan_limits: AnalyticsPlanLimits
  }
}

// Limites de analytics por plano
export interface AnalyticsPlanLimits {
  max_historical_data_months: number
  available_metrics: MetricType[]
  can_export_data: boolean
  can_access_demographics: boolean
  can_access_revenue_analytics: boolean
  refresh_frequency_hours: number
}

// Constantes
export const ANALYTICS_LIMITS_BY_PLAN: Record<PlanType, AnalyticsPlanLimits> = {
  free: {
    max_historical_data_months: 1,
    available_metrics: ['profile_views', 'post_views', 'post_likes', 'follower_growth'],
    can_export_data: false,
    can_access_demographics: false,
    can_access_revenue_analytics: false,
    refresh_frequency_hours: 24
  },
  gold: {
    max_historical_data_months: 6,
    available_metrics: [
      'profile_views', 'post_views', 'post_likes', 'post_comments', 
      'post_shares', 'follower_growth', 'engagement_rate', 'reach'
    ],
    can_export_data: true,
    can_access_demographics: true,
    can_access_revenue_analytics: false,
    refresh_frequency_hours: 12
  },
  diamond: {
    max_historical_data_months: 24,
    available_metrics: [
      'profile_views', 'post_views', 'post_likes', 'post_comments', 
      'post_shares', 'follower_growth', 'engagement_rate', 'reach',
      'impressions', 'community_growth', 'event_attendance', 
      'content_performance', 'audience_demographics'
    ],
    can_export_data: true,
    can_access_demographics: true,
    can_access_revenue_analytics: true,
    refresh_frequency_hours: 4
  },
  diamond_annual: {
    max_historical_data_months: 36,
    available_metrics: [
      'profile_views', 'post_views', 'post_likes', 'post_comments', 
      'post_shares', 'follower_growth', 'engagement_rate', 'reach',
      'impressions', 'community_growth', 'event_attendance', 
      'content_performance', 'audience_demographics'
    ],
    can_export_data: true,
    can_access_demographics: true,
    can_access_revenue_analytics: true,
    refresh_frequency_hours: 1
  }
} as const

// Erros de analytics
export interface AnalyticsError {
  code: 'INSUFFICIENT_PLAN' 
       | 'DATA_NOT_AVAILABLE' 
       | 'INVALID_DATE_RANGE'
       | 'METRIC_NOT_AVAILABLE'
       | 'RATE_LIMIT_EXCEEDED'
       | 'ANALYTICS_DISABLED'
       | 'UNKNOWN_ERROR'
  message: string
  details?: any
}

// Type guards
export const canAccessMetric = (plan: PlanType, metric: MetricType): boolean => {
  return ANALYTICS_LIMITS_BY_PLAN[plan].available_metrics.includes(metric)
}

export const canAccessDemographics = (plan: PlanType): boolean => {
  return ANALYTICS_LIMITS_BY_PLAN[plan].can_access_demographics
}

export const canAccessRevenueAnalytics = (plan: PlanType): boolean => {
  return ANALYTICS_LIMITS_BY_PLAN[plan].can_access_revenue_analytics
}

export const getMaxHistoricalMonths = (plan: PlanType): number => {
  return ANALYTICS_LIMITS_BY_PLAN[plan].max_historical_data_months
}
