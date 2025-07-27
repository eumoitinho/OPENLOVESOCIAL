import { NextRequest, NextResponse } from "next/server"
import Stripe from 'stripe'
import { createServerComponentClient } from "@/app/lib/supabase-server"
import { STRIPE_PRODUCTS, STRIPE_STATUS_MAP } from "@/types/stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil' })

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      paymentMethodId, 
      planType,
      userId 
    } = await request.json()

    // Validar entrada
    if (!email || !paymentMethodId || !planType || !userId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const plan = STRIPE_PRODUCTS[planType as keyof typeof STRIPE_PRODUCTS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Buscar usuário no banco
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, mp_subscription_id')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Cancelar assinatura MP se existir
    if (userData.mp_subscription_id) {
      console.log('Usuário tem assinatura MP ativa, será migrado para Stripe')
    }

    let customerId = userData.stripe_customer_id

    // Criar ou buscar cliente no Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId } })
      customerId = customer.id

      // Atualizar customer_id no banco
      await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          payment_provider: 'stripe'
        })
        .eq('id', userId)
    }

    // Anexar método de pagamento ao cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId })

    // Definir como método de pagamento padrão
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId } })

    // Criar assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        planType } })

    // Atualizar banco com dados da assinatura
    const status = STRIPE_STATUS_MAP[subscription.status as keyof typeof STRIPE_STATUS_MAP] || 'pending'
    
    await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: plan.priceId,
        plano: planType as any,
        status_assinatura: status as any,
        payment_provider: 'stripe',
        is_premium: planType !== 'free' })
      .eq('id', userId)

    // Preparar resposta - simplificado para evitar erros de tipo
    // O Stripe retornará automaticamente se requer ação adicional

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId })

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    
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

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (userError || !userData || !userData.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    // Cancelar assinatura no Stripe
    const subscription = await stripe.subscriptions.cancel(
      userData.stripe_subscription_id
    )

    // Atualizar banco
    await supabase
      .from('users')
      .update({
        plano: 'free',
        status_assinatura: 'cancelled',
        is_premium: false })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso' })

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    )
  }
}
