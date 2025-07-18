import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { verifyAuth } from '@/app/lib/auth-helpers'
import { pixStripeIntegration } from '@/lib/abacatepay/stripe-integration'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType, paymentMethodId } = await request.json()

    if (!planType || !paymentMethodId) {
      return NextResponse.json({ 
        error: 'planType e paymentMethodId são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    // Buscar dados do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se paymentMethodId é o PIX personalizado
    if (paymentMethodId !== 'pm_pix_custom') {
      return NextResponse.json({ 
        error: 'Método de pagamento inválido para PIX' 
      }, { status: 400 })
    }

    // Definir valores dos planos
    const planPrices = {
      gold: { amount: 2500, currency: 'brl', name: 'Open Ouro' }, // R$ 25,00
      diamante: { amount: 4590, currency: 'brl', name: 'Open Diamante' }, // R$ 45,90
      diamante_anual: { amount: 45900, currency: 'brl', name: 'Open Diamante Anual' } // R$ 459,00
    }

    const planConfig = planPrices[planType as keyof typeof planPrices]
    
    if (!planConfig) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Criar/buscar customer no Stripe
    let customerId = profile.stripe_customer_id
    
    if (!customerId) {
      // Criar customer no Stripe se não existir
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name,
        metadata: {
          user_id: user.id,
          username: profile.username
        }
      })
      
      customerId = customer.id
      
      // Atualizar perfil com customer_id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Criar pagamento PIX
    const pixPaymentResult = await pixStripeIntegration.createPixPayment({
      amount: planConfig.amount,
      currency: planConfig.currency,
      customer: customerId,
      description: `Assinatura ${planConfig.name} - OpenLove`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        username: profile.username,
        email: user.email
      },
      paymentMethodId: 'cpmt_1Rlib2FLZANOl02HqsXhMWUO' // ID do método personalizado PIX
    })

    // Salvar informações no banco
    await supabase
      .from('payment_intents')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: pixPaymentResult.stripePaymentIntentId,
        abacatepay_payment_id: pixPaymentResult.abacatePayId,
        amount: planConfig.amount,
        currency: planConfig.currency,
        plan_type: planType,
        payment_method: 'pix',
        status: 'pending',
        expires_at: pixPaymentResult.expiresAt,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: pixPaymentResult.clientSecret,
        pixCode: pixPaymentResult.pixCode,
        pixQrCode: pixPaymentResult.pixQrCode,
        abacatePayId: pixPaymentResult.abacatePayId,
        stripePaymentIntentId: pixPaymentResult.stripePaymentIntentId,
        expiresAt: pixPaymentResult.expiresAt,
        amount: planConfig.amount,
        currency: planConfig.currency,
        planName: planConfig.name
      }
    })

  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}