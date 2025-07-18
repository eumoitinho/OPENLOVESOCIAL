export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  priceIds: {
    gold: string
    diamante: string
    diamante_anual: string
  }
}

export interface StripeProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  priceId: string
  features: string[]
}

export interface StripeSubscription {
  id: string
  status: string
  priceId: string
  customerId: string
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

export const STRIPE_PRODUCTS = {
  gold: {
    name: 'Gold',
    priceId: process.env.STRIPE_GOLD_PRICE_ID || '',
    price: 9.99,
    currency: 'BRL',
    interval: 'month'
  },
  diamante: {
    name: 'Diamante',
    priceId: process.env.STRIPE_DIAMANTE_PRICE_ID || '',
    price: 19.99,
    currency: 'BRL',
    interval: 'month'
  },
  diamante_anual: {
    name: 'Diamante Anual',
    priceId: process.env.STRIPE_DIAMANTE_ANUAL_PRICE_ID || '',
    price: 199.99,
    currency: 'BRL',
    interval: 'year'
  }
} as const

export const STRIPE_STATUS_MAP = {
  'active': 'active',
  'trialing': 'trialing',
  'canceled': 'canceled',
  'incomplete': 'incomplete',
  'incomplete_expired': 'incomplete_expired',
  'past_due': 'past_due',
  'unpaid': 'unpaid',
  'paused': 'paused'
} as const