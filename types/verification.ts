import { PlanType } from "@/lib/plans/config"

export type VerificationId = string
export type UserId = string

// Tipos de verificação
export type VerificationType = 
  | 'identity'     // Verificação de identidade
  | 'professional' // Verificação profissional
  | 'creator'      // Verificação de criador de conteúdo
  | 'business'     // Verificação de empresa
  | 'celebrity'    // Verificação de celebridade/figura pública

// Status da verificação
export type VerificationStatus = 
  | 'pending'      // Aguardando análise
  | 'under_review' // Em análise
  | 'approved'     // Aprovada
  | 'rejected'     // Rejeitada
  | 'expired'      // Expirada
  | 'revoked'      // Revogada

// Tipos de badge
export type BadgeType = 
  | 'verified'     // Badge azul padrão
  | 'professional' // Badge profissional
  | 'creator'      // Badge de criador
  | 'business'     // Badge de empresa
  | 'premium'      // Badge premium (para planos pagos)

// Solicitação de verificação
export interface VerificationRequest {
  id: VerificationId
  user_id: UserId
  type: VerificationType
  status: VerificationStatus
  
  // Informações pessoais
  personal_info: PersonalInfo
  
  // Documentos enviados
  documents: VerificationDocument[]
  
  // Informações específicas do tipo
  type_specific_data: TypeSpecificData
  
  // Processo de análise
  review_process: ReviewProcess
  
  // Metadados
  created_at: string
  updated_at: string
  expires_at?: string
}

// Informações pessoais
export interface PersonalInfo {
  full_name: string
  display_name?: string
  date_of_birth?: string
  nationality?: string
  occupation?: string
  bio?: string
  
  // Informações de contato
  email: string
  phone?: string
  website?: string
  
  // Redes sociais para verificação cruzada
  social_links?: {
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
    facebook?: string
  }
}

// Documento de verificação
export interface VerificationDocument {
  id: string
  type: DocumentType
  file_url: string
  file_name: string
  uploaded_at: string
  status: 'pending' | 'verified' | 'rejected'
  rejection_reason?: string
}

// Tipos de documento
export type DocumentType = 
  | 'government_id'      // RG, CNH, Passaporte
  | 'proof_of_address'   // Comprovante de endereço
  | 'business_license'   // Licença comercial
  | 'tax_document'       // CPF, CNPJ
  | 'professional_cert'  // Certificado profissional
  | 'media_credentials'  // Credenciais de imprensa
  | 'portfolio'          // Portfolio de trabalho
  | 'verification_video' // Vídeo de verificação
  | 'other'              // Outros documentos

// Dados específicos por tipo de verificação
export type TypeSpecificData = 
  | IdentityVerificationData
  | ProfessionalVerificationData
  | CreatorVerificationData
  | BusinessVerificationData
  | CelebrityVerificationData

// Verificação de identidade
export interface IdentityVerificationData {
  type: 'identity'
  reason: string // Por que quer ser verificado
  public_figure: boolean
  follower_count_other_platforms?: number
}

// Verificação profissional
export interface ProfessionalVerificationData {
  type: 'professional'
  profession: string
  company: string
  position: string
  years_of_experience: number
  professional_achievements: string[]
  certifications: string[]
}

// Verificação de criador
export interface CreatorVerificationData {
  type: 'creator'
  content_type: string[]  // ['video', 'music', 'art', 'writing', etc.]
  follower_count: number
  monthly_views?: number
  brand_partnerships: string[]
  notable_works: string[]
  awards_recognition: string[]
}

// Verificação de empresa
export interface BusinessVerificationData {
  type: 'business'
  business_name: string
  business_type: string
  registration_number: string
  tax_id: string
  founded_year: number
  employee_count: string
  business_description: string
  official_website: string
}

// Verificação de celebridade
export interface CelebrityVerificationData {
  type: 'celebrity'
  category: 'entertainment' | 'sports' | 'politics' | 'business' | 'media' | 'other'
  notable_achievements: string[]
  media_mentions: string[]
  wikipedia_link?: string
  imdb_link?: string
  public_recognition_level: 'local' | 'national' | 'international'
}

// Processo de análise
export interface ReviewProcess {
  assigned_reviewer?: string
  review_started_at?: string
  review_completed_at?: string
  
  // Estágios da análise
  stages: ReviewStage[]
  
  // Comentários do revisor
  reviewer_notes?: string
  
  // Motivo da decisão
  decision_reason?: string
  
  // Próximos passos
  next_steps?: string[]
}

// Estágio da análise
export interface ReviewStage {
  stage: 'document_review' | 'identity_check' | 'background_check' | 'manual_review' | 'final_decision'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  started_at?: string
  completed_at?: string
  notes?: string
}

// Badge do usuário
export interface UserBadge {
  id: string
  user_id: UserId
  type: BadgeType
  verification_id?: VerificationId
  
  // Configurações do badge
  is_visible: boolean
  display_priority: number
  
  // Metadados
  granted_at: string
  expires_at?: string
  granted_by: string
  
  // Badge info
  title: string
  description: string
  icon_url?: string
  color: string
}

// Dados para criar solicitação
export interface CreateVerificationRequestData {
  type: VerificationType
  personal_info: PersonalInfo
  type_specific_data: Omit<TypeSpecificData, 'type'>
  documents_to_upload: {
    type: DocumentType
    required: boolean
  }[]
}

// Dados para atualizar solicitação
export interface UpdateVerificationRequestData {
  personal_info?: Partial<PersonalInfo>
  type_specific_data?: Partial<Omit<TypeSpecificData, 'type'>>
  additional_documents?: VerificationDocument[]
}

// Query para buscar verificações
export interface VerificationQuery {
  user_id?: UserId
  type?: VerificationType
  status?: VerificationStatus
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'updated_at' | 'status'
  sort_order?: 'asc' | 'desc'
}

// Resposta de verificação
export interface VerificationResponse {
  success: boolean
  request?: VerificationRequest
  badge?: UserBadge
  error?: VerificationError
}

// Configurações de verificação por plano
export interface VerificationPlanConfig {
  can_request_verification: boolean
  available_types: VerificationType[]
  max_pending_requests: number
  priority_review: boolean
  fast_track_eligible: boolean
  badge_customization: boolean
}

// Estatísticas de verificação
export interface VerificationStats {
  total_requests: number
  approved_requests: number
  pending_requests: number
  approval_rate: number
  average_review_time_days: number
  
  by_type: Record<VerificationType, {
    requests: number
    approved: number
    approval_rate: number
  }>
  
  recent_verifications: Array<{
    user_id: UserId
    username: string
    type: VerificationType
    approved_at: string
  }>
}

// Critérios de verificação
export interface VerificationCriteria {
  type: VerificationType
  requirements: VerificationRequirement[]
  review_process: string[]
  typical_review_time: string
  success_rate: number
}

// Requisito de verificação
export interface VerificationRequirement {
  category: 'document' | 'follower_count' | 'activity' | 'authenticity' | 'notable_presence'
  description: string
  required: boolean
  min_value?: number
  accepted_documents?: DocumentType[]
}

// Erros de verificação
export interface VerificationError {
  code: 'INSUFFICIENT_PLAN'
       | 'ALREADY_VERIFIED'
       | 'PENDING_REQUEST_EXISTS'
       | 'INVALID_DOCUMENTS'
       | 'INSUFFICIENT_EVIDENCE'
       | 'ELIGIBILITY_NOT_MET'
       | 'DOCUMENT_EXPIRED'
       | 'SUSPICIOUS_ACTIVITY'
       | 'APPEAL_PERIOD_EXPIRED'
       | 'UNKNOWN_ERROR'
  message: string
  details?: any
  retry_after?: string
}

// Configurações por plano
export const VERIFICATION_PLAN_CONFIG: Record<PlanType, VerificationPlanConfig> = {
  free: {
    can_request_verification: false,
    available_types: [],
    max_pending_requests: 0,
    priority_review: false,
    fast_track_eligible: false,
    badge_customization: false
  },
  gold: {
    can_request_verification: true,
    available_types: ['identity', 'professional'],
    max_pending_requests: 1,
    priority_review: false,
    fast_track_eligible: false,
    badge_customization: false
  },
  diamond: {
    can_request_verification: true,
    available_types: ['identity', 'professional', 'creator', 'business'],
    max_pending_requests: 2,
    priority_review: true,
    fast_track_eligible: true,
    badge_customization: true
  },
  diamond_annual: {
    can_request_verification: true,
    available_types: ['identity', 'professional', 'creator', 'business', 'celebrity'],
    max_pending_requests: 3,
    priority_review: true,
    fast_track_eligible: true,
    badge_customization: true
  }
} as const

// Constantes
export const VERIFICATION_LIMITS = {
  max_documents_per_request: 10,
  max_file_size_mb: 50,
  allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mov'],
  request_cooldown_days: 30, // Tempo entre tentativas após rejeição
  badge_display_limit: 3     // Máximo de badges visíveis no perfil
} as const

export const BADGE_COLORS = {
  verified: '#1DA1F2',      // Azul Twitter
  professional: '#0A66C2',  // Azul LinkedIn
  creator: '#FF6B6B',       // Vermelho
  business: '#4CAF50',      // Verde
  premium: '#FFD700'        // Dourado
} as const

// Type guards e utilitários
export const canRequestVerification = (plan: PlanType): boolean => {
  return VERIFICATION_PLAN_CONFIG[plan].can_request_verification
}

export const canRequestVerificationType = (plan: PlanType, type: VerificationType): boolean => {
  return VERIFICATION_PLAN_CONFIG[plan].available_types.includes(type)
}

export const getMaxPendingRequests = (plan: PlanType): number => {
  return VERIFICATION_PLAN_CONFIG[plan].max_pending_requests
}

export const hasPriorityReview = (plan: PlanType): boolean => {
  return VERIFICATION_PLAN_CONFIG[plan].priority_review
}

export const isFastTrackEligible = (plan: PlanType): boolean => {
  return VERIFICATION_PLAN_CONFIG[plan].fast_track_eligible
}

export const getBadgeColor = (type: BadgeType): string => {
  return BADGE_COLORS[type] || '#666666'
}

export const isVerificationExpired = (request: VerificationRequest): boolean => {
  if (!request.expires_at) return false
  return new Date(request.expires_at) < new Date()
}

export const getRequiredDocuments = (type: VerificationType): DocumentType[] => {
  const baseDocuments: DocumentType[] = ['government_id']
  
  switch (type) {
    case 'identity':
      return [...baseDocuments, 'verification_video']
    case 'professional':
      return [...baseDocuments, 'professional_cert', 'proof_of_address']
    case 'creator':
      return [...baseDocuments, 'portfolio', 'verification_video']
    case 'business':
      return [...baseDocuments, 'business_license', 'tax_document', 'proof_of_address']
    case 'celebrity':
      return [...baseDocuments, 'media_credentials', 'verification_video']
    default:
      return baseDocuments
  }
}
