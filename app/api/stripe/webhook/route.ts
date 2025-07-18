import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { STRIPE_STATUS_MAP } from '@/types/stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não configurada")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (error) {
    console.error("Erro na verificação do webhook:", error)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabase)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = STRIPE_STATUS_MAP[subscription.status as keyof typeof STRIPE_STATUS_MAP] || 'pending'
  
  // Obter o price_id do primeiro item (assumindo um produto por assinatura)
  const priceId = subscription.items.data[0]?.price.id
  
  // Mapear price_id para plano
  const planType = getPlanFromPriceId(priceId)
  
  // Calcular próximo pagamento
  const nextPayment = subscription.current_period_end ? 
    new Date(subscription.current_period_end * 1000).toISOString() : null

  // Buscar usuário pelo customer_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('Usuário não encontrado para customer_id:', customerId)
    return
  }

  // Atualizar dados do usuário
  const { error: updateError } = await supabase
    .from('users')
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      plano: planType,
      status_assinatura: status,
      proximo_pagamento: nextPayment,
      is_premium: planType !== 'free',
      payment_provider: 'stripe',
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Erro ao atualizar usuário:', updateError)
  } else {
    console.log(`Assinatura atualizada para ${userData.email}: ${planType} (${status})`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string

  // Buscar usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('Usuário não encontrado para customer_id:', customerId)
    return
  }

  // Cancelar assinatura
  const { error: updateError } = await supabase
    .from('users')
    .update({
      plano: 'free',
      status_assinatura: 'cancelled',
      is_premium: false,
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Erro ao cancelar assinatura:', updateError)
  } else {
    console.log(`Assinatura cancelada para ${userData.email}`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string
  const paymentDate = new Date(invoice.created * 1000).toISOString()
  
  // Calcular próximo pagamento
  let nextPayment = null
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      nextPayment = subscription.current_period_end ? 
        new Date(subscription.current_period_end * 1000).toISOString() : null
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error)
    }
  }

  // Buscar usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('Usuário não encontrado para customer_id:', customerId)
    return
  }

  // Registrar pagamento
  const { error: updateError } = await supabase
    .from('users')
    .update({
      status_assinatura: 'authorized',
      ultimo_pagamento: paymentDate,
      proximo_pagamento: nextPayment,
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Erro ao registrar pagamento:', updateError)
  } else {
    console.log(`Pagamento registrado para ${userData.email}`)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string

  // Buscar usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('Usuário não encontrado para customer_id:', customerId)
    return
  }

  // Marcar como suspenso
  const { error: updateError } = await supabase
    .from('users')
    .update({
      status_assinatura: 'suspended',
    })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Erro ao suspender assinatura:', updateError)
  } else {
    console.log(`Assinatura suspensa para ${userData.email}`)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string

  // Buscar usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !userData) {
    console.error('Usuário não encontrado para customer_id:', customerId)
    return
  }

  // Aqui você pode implementar lógica para notificar o usuário
  console.log(`Trial expira em breve para ${userData.email}`)
}

function getPlanFromPriceId(priceId: string): string {
  const plans = {
    'price_gold_monthly': 'gold',
    'price_diamond_monthly': 'diamante',
    'price_diamond_yearly': 'diamante_anual',
  }
  
  return plans[priceId as keyof typeof plans] || 'free'
}
