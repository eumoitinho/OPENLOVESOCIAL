export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  priceIds: {
    gold: string
    diamond: string
    diamond_annual: string
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
    price: 25.00,
    currency: 'BRL',
    interval: 'month'
  },
  diamond: {
    name: 'Diamond',
    priceId: process.env.STRIPE_DIAMOND_PRICE_ID || '',
    price: 45.90,
    currency: 'BRL',
    interval: 'month'
  },
  diamond_annual: {
    name: 'Diamond Annual',
    priceId: process.env.STRIPE_DIAMOND_ANNUAL_PRICE_ID || '',
    price: 459.00,
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
