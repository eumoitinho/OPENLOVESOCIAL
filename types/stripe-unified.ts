import { Stripe } from "stripe"
import { PlanType } from "@/lib/plans/config"

// Tipos de planos disponíveis (usando tipo unificado)
export type StripePlanType = PlanType

// Configuração do Stripe
export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  apiVersion: '2025-06-30.basil' | string
  priceIds: {
    gold: string
    diamond: string
    diamond_annual: string
  }
}

// Produto Stripe unificado
export interface StripeProduct {
  id: string
  name: string
  description?: string
  price: number // Em centavos para Stripe
  priceDecimal: number // Em reais para exibição
  currency: string
  interval: 'month' | 'year'
  priceId: string
  productId: string
  features?: string[]
}

// IDs dos produtos no Stripe (configurar no dashboard)
export const STRIPE_PRODUCTS: Record<Exclude<StripePlanType, 'free'>, StripeProduct> = {
  gold: {
    id: 'gold',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GOLD || 'price_gold_monthly',
    productId: 'prod_gold',
    name: 'Plano Ouro',
    price: 2500, // Em centavos (R$ 25,00)
    priceDecimal: 25.00,
    currency: 'BRL',
    interval: 'month'
  },
  diamond: {
    id: 'diamond',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DIAMOND || 'price_diamond_monthly',
    productId: 'prod_diamond',
    name: 'Plano Diamante',
    price: 4590, // Em centavos (R$ 45,90)
    priceDecimal: 45.90,
    currency: 'BRL',
    interval: 'month'
  },
  diamond_annual: {
    id: 'diamond_annual',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_DIAMOND_YEARLY || 'price_diamond_yearly',
    productId: 'prod_diamond',
    name: 'Plano Diamante Anual',
    price: 45900, // Em centavos (R$ 459,00)
    priceDecimal: 459.00,
    currency: 'BRL',
    interval: 'year'
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
  unpaid: 'suspended',
  paused: 'suspended'
} as const

// Subscription Stripe
export interface StripeSubscription {
  id: string
  status: keyof typeof STRIPE_STATUS_MAP
  priceId: string
  customerId: string
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  canceledAt?: number
  trialEnd?: number
  metadata?: Record<string, string>
}

// Customer Stripe
export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
  created: number
  defaultPaymentMethod?: string
}

// Tipo para eventos webhook
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Stripe.Customer | Stripe.Subscription | Stripe.Invoice | Stripe.PaymentIntent
  }
  created: number
}

// Tipo para criar checkout session
export interface CreateCheckoutSessionData {
  priceId: string
  userEmail: string
  userId: string
  successUrl: string
  cancelUrl: string
  allowPromotionCodes?: boolean
  metadata?: Record<string, string>
}

// Tipo para criar subscription direta
export interface CreateSubscriptionData {
  customerId: string
  priceId: string
  paymentMethodId: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}

// Tipo para resposta de subscription
export interface SubscriptionResponse {
  success: boolean
  subscriptionId?: string
  clientSecret?: string
  error?: string
  requiresAction?: boolean
  status?: string
}

// Tipo para dados do usuário com Stripe
export interface UserWithStripe {
  id: string
  email: string
  plan: StripePlanType
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status_assinatura: string
  payment_provider: 'stripe' | 'mercadopago' | 'abacatepay'
  plan_expires_at?: string
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
  enableTrialPeriods: boolean
}

// Helper functions
export const getStripeProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return Object.values(STRIPE_PRODUCTS).find(product => product.priceId === priceId)
}

export const getStripeProductByPlan = (plan: Exclude<StripePlanType, 'free'>): StripeProduct => {
  return STRIPE_PRODUCTS[plan]
}

export const formatStripePriceForDisplay = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2)
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any
  }
}

export {}
