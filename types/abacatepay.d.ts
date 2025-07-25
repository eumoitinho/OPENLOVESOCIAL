import { PlanType } from '@/lib/plans/config'

// Tipos principais do AbacatePay
export type AbacatePayTransactionId = string
export type AbacatePayCustomerId = string
export type AbacatePayProductId = string

// Status das transações
export type AbacatePayStatus = 
  | 'pending'     // Aguardando pagamento
  | 'processing'  // Processando
  | 'paid'        // Pago
  | 'cancelled'   // Cancelado
  | 'expired'     // Expirado
  | 'refunded'    // Reembolsado
  | 'failed'      // Falhou

// Métodos de pagamento
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto'

// Frequência de assinatura
export type SubscriptionFrequency = 'monthly' | 'yearly'

// Configuração do AbacatePay
export interface AbacatePayConfig {
  apiKey: string
  apiSecret: string
  webhookSecret: string
  environment: 'sandbox' | 'production'
  baseUrl: string
}

// Cliente do AbacatePay
export interface AbacatePayCustomer {
  id: AbacatePayCustomerId
  name: string
  email: string
  document: string // CPF/CNPJ
  phone?: string
  
  // Endereço
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    country: string
  }
  
  // Metadados
  metadata?: Record<string, string>
  created_at: string
  updated_at: string
}

// Produto/Plano no AbacatePay
export interface AbacatePayProduct {
  id: AbacatePayProductId
  name: string
  description: string
  price: number // Em centavos
  currency: string
  frequency: SubscriptionFrequency
  
  // Configurações
  trial_period_days?: number
  max_cycles?: number // null para ilimitado
  
  // Metadados
  metadata: {
    plan_type: PlanType
    features: string[]
  }
  
  created_at: string
  updated_at: string
  active: boolean
}

// Transação do AbacatePay
export interface AbacatePayTransaction {
  id: AbacatePayTransactionId
  customer_id: AbacatePayCustomerId
  product_id?: AbacatePayProductId
  
  // Informações da transação
  amount: number // Em centavos
  currency: string
  description: string
  external_reference: string // ID interno do sistema
  
  // Pagamento
  payment_method: PaymentMethod
  payment_details: PaymentDetails
  
  // Status e datas
  status: AbacatePayStatus
  created_at: string
  updated_at: string
  paid_at?: string
  expires_at?: string
  
  // URLs
  checkout_url?: string
  pix_qr_code?: string
  pix_qr_code_base64?: string
  boleto_url?: string
  
  // Metadados
  metadata?: Record<string, string>
}

// Detalhes do pagamento
export type PaymentDetails = 
  | PixPaymentDetails
  | CreditCardPaymentDetails
  | DebitCardPaymentDetails
  | BoletoPaymentDetails

// Pagamento PIX
export interface PixPaymentDetails {
  method: 'pix'
  pix_key: string
  qr_code: string
  qr_code_base64: string
  copy_paste_code: string
  expires_at: string
}

// Pagamento Cartão de Crédito
export interface CreditCardPaymentDetails {
  method: 'credit_card'
  card_brand: string
  card_last_four: string
  installments: number
  installment_amount: number
  authorization_code?: string
  acquirer_transaction_id?: string
}

// Pagamento Cartão de Débito
export interface DebitCardPaymentDetails {
  method: 'debit_card'
  card_brand: string
  card_last_four: string
  authorization_code?: string
  acquirer_transaction_id?: string
}

// Pagamento Boleto
export interface BoletoPaymentDetails {
  method: 'boleto'
  barcode: string
  due_date: string
  instructions: string
  boleto_url: string
}

// Assinatura do AbacatePay
export interface AbacatePaySubscription {
  id: string
  customer_id: AbacatePayCustomerId
  product_id: AbacatePayProductId
  
  // Status da assinatura
  status: 'active' | 'cancelled' | 'suspended' | 'expired' | 'trial'
  
  // Datas importantes
  created_at: string
  started_at: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  
  // Configurações
  cancel_at_period_end: boolean
  cycles_completed: number
  max_cycles?: number
  
  // Última transação
  last_transaction_id?: AbacatePayTransactionId
  next_billing_date: string
  
  // Metadados
  metadata?: Record<string, string>
}

// Webhook do AbacatePay
export interface AbacatePayWebhook {
  id: string
  event: AbacatePayWebhookEvent
  data: AbacatePayWebhookData
  created_at: string
  signature: string
}

// Eventos de webhook
export type AbacatePayWebhookEvent = 
  | 'transaction.paid'
  | 'transaction.cancelled'
  | 'transaction.expired'
  | 'transaction.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.expired'
  | 'subscription.trial_ended'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.failed'

// Dados do webhook
export interface AbacatePayWebhookData {
  transaction?: AbacatePayTransaction
  subscription?: AbacatePaySubscription
  customer?: AbacatePayCustomer
  previous_values?: Record<string, any>
}

// Request para criar transação
export interface CreateAbacatePayTransactionRequest {
  customer_id: AbacatePayCustomerId
  product_id?: AbacatePayProductId
  amount: number
  currency: string
  description: string
  external_reference: string
  payment_method: PaymentMethod
  
  // Configurações específicas
  expires_in_minutes?: number
  notification_url?: string
  return_url?: string
  
  // PIX específico
  pix_key_type?: 'email' | 'phone' | 'cpf' | 'cnpj' | 'random'
  
  // Cartão específico
  installments?: number
  card_token?: string
  
  // Boleto específico
  due_date?: string
  instructions?: string
  
  metadata?: Record<string, string>
}

// Request para criar assinatura
export interface CreateAbacatePaySubscriptionRequest {
  customer_id: AbacatePayCustomerId
  product_id: AbacatePayProductId
  payment_method: PaymentMethod
  
  // Configurações
  start_date?: string
  trial_period_days?: number
  max_cycles?: number
  
  // Cartão para assinaturas
  card_token?: string
  
  metadata?: Record<string, string>
}

// Request para criar cliente
export interface CreateAbacatePayCustomerRequest {
  name: string
  email: string
  document: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    country?: string
  }
  metadata?: Record<string, string>
}

// Resposta padrão do AbacatePay
export interface AbacatePayResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Configuração dos produtos AbacatePay
export const ABACATEPAY_PRODUCTS: Record<Exclude<PlanType, 'free'>, Partial<AbacatePayProduct>> = {
  gold: {
    name: 'OpenLove Gold',
    description: 'Plano Gold com funcionalidades premium',
    price: 2500, // R$ 25,00 em centavos
    currency: 'BRL',
    frequency: 'monthly',
    metadata: {
      plan_type: 'gold',
      features: [
        'Mensagens ilimitadas',
        'Upload de vídeos até 25MB',
        'Até 5 imagens por post',
        'Criação de eventos (3/mês)',
        'Chamadas de voz',
        'Analytics básicos'
      ]
    }
  },
  diamond: {
    name: 'OpenLove Diamond',
    description: 'Plano Diamond com todas as funcionalidades',
    price: 4590, // R$ 45,90 em centavos
    currency: 'BRL',
    frequency: 'monthly',
    metadata: {
      plan_type: 'diamond',
      features: [
        'Todas as funcionalidades Gold',
        'Upload de vídeos até 50MB',
        'Até 10 imagens por post',
        'Eventos ilimitados',
        'Chamadas de vídeo',
        'Criação de enquetes',
        'Venda de conteúdo premium',
        'Analytics avançados',
        'Badge de verificação'
      ]
    }
  },
  diamond_annual: {
    name: 'OpenLove Diamond Anual',
    description: 'Plano Diamond anual com desconto',
    price: 45900, // R$ 459,00 em centavos (12x R$ 38,25)
    currency: 'BRL',
    frequency: 'yearly',
    metadata: {
      plan_type: 'diamond_annual',
      features: [
        'Todas as funcionalidades Diamond',
        'Preço com desconto anual',
        'Suporte prioritário'
      ]
    }
  }
} as const

// Mapeamento de status para o sistema
export const ABACATEPAY_STATUS_MAP: Record<AbacatePayStatus, string> = {
  pending: 'pending',
  processing: 'processing',
  paid: 'authorized',
  cancelled: 'cancelled',
  expired: 'expired',
  refunded: 'refunded',
  failed: 'failed'
} as const

// Configurações por ambiente
export const ABACATEPAY_ENVIRONMENTS = {
  sandbox: {
    baseUrl: 'https://api.sandbox.abacatepay.com',
    checkoutUrl: 'https://checkout.sandbox.abacatepay.com'
  },
  production: {
    baseUrl: 'https://api.abacatepay.com',
    checkoutUrl: 'https://checkout.abacatepay.com'
  }
} as const

// Limites e configurações
export const ABACATEPAY_LIMITS = {
  max_amount_cents: 100000000, // R$ 1.000.000,00
  min_amount_cents: 100,       // R$ 1,00
  max_installments: 12,
  pix_expiry_minutes: 30,
  boleto_expiry_days: 3,
  webhook_retry_attempts: 5,
  webhook_timeout_seconds: 30
} as const

// Códigos de erro específicos
export const ABACATEPAY_ERROR_CODES = {
  INVALID_API_KEY: 'invalid_api_key',
  CUSTOMER_NOT_FOUND: 'customer_not_found',
  PRODUCT_NOT_FOUND: 'product_not_found',
  TRANSACTION_NOT_FOUND: 'transaction_not_found',
  INVALID_PAYMENT_METHOD: 'invalid_payment_method',
  AMOUNT_TOO_LOW: 'amount_too_low',
  AMOUNT_TOO_HIGH: 'amount_too_high',
  INVALID_CARD: 'invalid_card',
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  PIX_EXPIRED: 'pix_expired',
  BOLETO_EXPIRED: 'boleto_expired',
  WEBHOOK_VALIDATION_FAILED: 'webhook_validation_failed'
} as const

// Type guards
export const isAbacatePayError = (error: any): error is AbacatePayResponse => {
  return error && typeof error === 'object' && 'success' in error && error.success === false
}

export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
  return ['pix', 'credit_card', 'debit_card', 'boleto'].includes(method)
}

export const isValidStatus = (status: string): status is AbacatePayStatus => {
  return ['pending', 'processing', 'paid', 'cancelled', 'expired', 'refunded', 'failed'].includes(status)
}

export const isPaidStatus = (status: AbacatePayStatus): boolean => {
  return status === 'paid'
}

export const isFinalStatus = (status: AbacatePayStatus): boolean => {
  return ['paid', 'cancelled', 'expired', 'refunded', 'failed'].includes(status)
}

// Utilitários
export const formatAbacatePayAmount = (amountInCents: number): string => {
  return (amountInCents / 100).toFixed(2)
}

export const parseAbacatePayAmount = (amount: string): number => {
  return Math.round(parseFloat(amount) * 100)
}

export const getAbacatePayProductByPlan = (plan: Exclude<PlanType, 'free'>): Partial<AbacatePayProduct> => {
  return ABACATEPAY_PRODUCTS[plan]
}

declare global {
  interface Window {
    AbacatePay?: {
      checkout: (options: any) => void
      configure: (config: any) => void
    }
  }
}

export {}