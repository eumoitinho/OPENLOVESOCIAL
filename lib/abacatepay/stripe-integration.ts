import Stripe from 'stripe'
import { abacatePayClient, AbacatePayPixPayment, CreatePixPaymentParams } from './client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export interface PixPaymentIntentData {
  amount: number
  currency: string
  customer: string
  description: string
  metadata: Record<string, any>
  paymentMethodId: string // ID do método de pagamento personalizado PIX
}

export interface PixPaymentResult {
  clientSecret: string
  pixCode: string
  pixQrCode: string
  abacatePayId: string
  stripePaymentIntentId: string
  expiresAt: string
}

export class PixStripeIntegration {
  // Criar PaymentIntent no Stripe + Pagamento PIX no AbacatePay
  async createPixPayment(data: PixPaymentIntentData): Promise<PixPaymentResult> {
    try {
      // 1. Criar PaymentIntent no Stripe com status manual
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customer,
        description: data.description,
        metadata: {
          ...data.metadata,
          payment_method: 'pix',
          provider: 'abacatepay'
        },
        payment_method: data.paymentMethodId,
        confirmation_method: 'manual',
        confirm: false, // Não confirmar automaticamente
        capture_method: 'manual' // Captura manual após confirmação PIX
      })

      // 2. Obter dados do customer do Stripe
      const customer = await stripe.customers.retrieve(data.customer) as Stripe.Customer

      // 3. Criar cobrança PIX no AbacatePay
      const pixPaymentData: CreatePixPaymentParams = {
        amount: data.amount,
        description: data.description,
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: data.customer,
          user_email: customer.email,
          user_name: customer.name,
          ...data.metadata
        },
        dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      }

      const pixPayment = await abacatePayClient.createPixPayment(pixPaymentData)

      // 4. Atualizar PaymentIntent com dados do PIX
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          ...paymentIntent.metadata,
          abacatepay_payment_id: pixPayment.id,
          pix_code: pixPayment.pixCode,
          pix_expires_at: pixPayment.expiresAt
        }
      })

      return {
        clientSecret: paymentIntent.client_secret!,
        pixCode: pixPayment.pixCode || pixPayment.url || 'PIX gerado',
        pixQrCode: pixPayment.pixQrCode || 'QR Code gerado',
        abacatePayId: pixPayment.id,
        stripePaymentIntentId: paymentIntent.id,
        expiresAt: pixPayment.dueDate || new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error)
      throw new Error('Falha ao criar pagamento PIX')
    }
  }

  // Verificar status do pagamento PIX e atualizar Stripe
  async checkPixPaymentStatus(abacatePayId: string, stripePaymentIntentId: string): Promise<{
    pixStatus: string
    stripeStatus: string
    updated: boolean
  }> {
    try {
      // Verificar status no AbacatePay
      const pixPayment = await abacatePayClient.checkPixPaymentStatus(abacatePayId)
      
      // Obter PaymentIntent do Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
      
      let updated = false
      
      // Se PIX foi pago, confirmar no Stripe
      if (pixPayment.status === 'paid' && paymentIntent.status !== 'succeeded') {
        await stripe.paymentIntents.confirm(stripePaymentIntentId, {
          payment_method: paymentIntent.payment_method as string
        })
        
        // Capturar o pagamento
        await stripe.paymentIntents.capture(stripePaymentIntentId)
        
        updated = true
      }
      
      // Se PIX expirou ou foi cancelado, cancelar no Stripe
      if (['expired', 'cancelled'].includes(pixPayment.status) && 
          !['succeeded', 'canceled'].includes(paymentIntent.status)) {
        await stripe.paymentIntents.cancel(stripePaymentIntentId)
        updated = true
      }
      
      return {
        pixStatus: pixPayment.status,
        stripeStatus: paymentIntent.status,
        updated
      }
    } catch (error) {
      console.error('Erro ao verificar status PIX:', error)
      throw new Error('Falha ao verificar status do pagamento')
    }
  }

  // Processar webhook do AbacatePay
  async processAbacatePayWebhook(webhookData: any): Promise<void> {
    try {
      const { id: abacatePayId, status, metadata } = webhookData
      
      if (!metadata?.stripe_payment_intent_id) {
        console.warn('Webhook AbacatePay sem stripe_payment_intent_id')
        return
      }
      
      const stripePaymentIntentId = metadata.stripe_payment_intent_id
      
      // Verificar e atualizar status
      await this.checkPixPaymentStatus(abacatePayId, stripePaymentIntentId)
      
      console.log(`Webhook processado: PIX ${abacatePayId} -> Stripe ${stripePaymentIntentId}`)
    } catch (error) {
      console.error('Erro ao processar webhook AbacatePay:', error)
      throw error
    }
  }

  // Cancelar pagamento PIX
  async cancelPixPayment(abacatePayId: string, stripePaymentIntentId: string): Promise<void> {
    try {
      // Cancelar no Stripe
      await stripe.paymentIntents.cancel(stripePaymentIntentId)
      
      // Nota: AbacatePay não tem cancelamento explícito, expira automaticamente
      console.log(`Pagamento PIX cancelado: ${abacatePayId}`)
    } catch (error) {
      console.error('Erro ao cancelar pagamento PIX:', error)
      throw error
    }
  }

  // Simular pagamento PIX (desenvolvimento)
  async simulatePixPayment(abacatePayId: string): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Simulação só disponível em desenvolvimento')
    }
    
    try {
      await abacatePayClient.simulatePixPayment(abacatePayId)
      console.log(`Pagamento PIX simulado: ${abacatePayId}`)
    } catch (error) {
      console.error('Erro ao simular pagamento PIX:', error)
      throw error
    }
  }
}

// Instância única
export const pixStripeIntegration = new PixStripeIntegration()