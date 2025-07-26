import { Stripe } from 'stripe'

// Tipos de planos disponíveis
export type StripePlanType = 'free' | 'gold' | 'diamond' | 'diamond_annual'

// IDs dos produtos no Stripe (configurar no dashboard)
export const STRIPE_PRODUCTS = {
  gold: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GOLD || 'price_gold_monthly',
    productId: 'prod_gold',
    name: 'Plano Ouro',
    price: 2500, // Em centavos (R$ 25,00)
    interval: 'month' as const
  },
  diamond: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DIAMOND || 'price_diamond_monthly',
    productId: 'prod_diamond',
    name: 'Plano Diamante',
    price: 4590, // Em centavos (R$ 45,90)
    interval: 'month' as const
  },
  diamond_annual: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DIAMOND_YEARLY || 'price_diamond_yearly',
    productId: 'prod_diamond',
    name: 'Plano Diamante Anual',
    price: 45900, // Em centavos (R$ 459,00)
    interval: 'year' as const
  }
} as const

// Mapeamento de status Stripe para status do sistema
export const STRIPE_STATUS_MAP = {
  active: 'authorized',
  past_due: 'suspended',
  canceled: 'cancelled',
  incomplete: 'pending',
  incomplete_expired: 'cancelled',
  trialing: 'authorized',
  unpaid: 'suspended'
} as const

// Tipo para eventos webhook
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Stripe.Customer | Stripe.Subscription | Stripe.Invoice | Stripe.PaymentIntent
  }
}

// Tipo para criar checkout session
export interface CreateCheckoutSessionData {
  priceId: string
  userEmail: string
  userId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

// Tipo para criar subscription direta
export interface CreateSubscriptionData {
  customerId: string
  priceId: string
  paymentMethodId: string
  metadata?: Record<string, string>
}

// Tipo para resposta de subscription
export interface SubscriptionResponse {
  success: boolean
  subscriptionId?: string
  clientSecret?: string
  error?: string
  requiresAction?: boolean
}

// Tipo para dados do usuário com Stripe
export interface UserWithStripe {
  id: string
  email: string
  plano: StripePlanType
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status_assinatura: string
  payment_provider: 'stripe' | 'mercadopago'
}

// Configuração do Stripe
export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  apiVersion: '2025-06-30.basil' | string
}

// Tipo para elementos do formulário
export interface StripeFormData {
  name: string
  email: string
  cardElement: any // Stripe.StripeCardElement
  plan: keyof typeof STRIPE_PRODUCTS
}

// Tipos de erro customizados
export class StripeError extends Error {
  code: string
  statusCode: number
  
  constructor(message: string, code: string, statusCode: number = 400) {
    super(message)
    this.name = 'StripeError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Helper para validar webhook signature
export interface ValidateWebhookParams {
  payload: string | Buffer
  signature: string
  secret: string
}

// Feature flags para migração gradual
export interface PaymentFeatureFlags {
  useStripe: boolean
  stripeFallbackToMP: boolean
  showBothOptions: boolean
}