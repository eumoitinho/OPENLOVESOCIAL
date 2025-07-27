import { NextRequest, NextResponse } from "next/server"
import Stripe from 'stripe'
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' })

const PLAN_PRICES = {
  gold: process.env.STRIPE_PRICE_GOLD_MONTHLY || '2500',
  diamond: process.env.STRIPE_PRICE_DIAMOND_MONTHLY || '4590' }

export async function POST(request: NextRequest) {
  try {
    const { 
      plan, 
      userId, 
      email,
      successUrl,
      cancelUrl 
    } = await request.json()

    // Validar entrada
    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    if (!PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Tentar buscar usuário no banco (pode não existir ainda devido ao timing)
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = userData?.stripe_customer_id

    // Criar cliente no Stripe (sempre criar novo para simplificar)
    const customer = await stripe.customers.create({
      email: userData?.email || email,
      metadata: {
        userId } })
    customerId = customer.id

    // Tentar atualizar o banco se o usuário existir
    if (userData) {
      await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          payment_provider: 'stripe'
        })
        .eq('id', userId)
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan === 'gold' ? 'Plano Gold' : 'Plano Diamond',
              description: plan === 'gold' 
                ? 'Mais recursos e visibilidade' 
                : 'Experiência completa e exclusiva' },
            unit_amount: parseInt(PLAN_PRICES[plan as keyof typeof PLAN_PRICES]),
            recurring: {
              interval: 'month' } },
          quantity: 1 },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/timeline?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/timeline?payment=cancelled`,
      metadata: {
        userId,
        plan },
      subscription_data: {
        metadata: {
          userId,
          plan } } })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id })

  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
