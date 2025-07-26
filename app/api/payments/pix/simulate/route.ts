import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/app/lib/supabase-server'
import { verifyAuth } from '@/app/lib/auth-helpers'
import { pixStripeIntegration } from '@/lib/abacatepay/stripe-integration'

export async function POST(request: NextRequest) {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Simulação não disponível em produção' 
    }, { status: 403 })
  }

  try {
    const { user, error: authError } = await verifyAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { abacatePayId } = await request.json()

    if (!abacatePayId) {
      return NextResponse.json({ 
        error: 'abacatePayId é obrigatório' 
      }, { status: 400 })
    }

    const supabase = await createServerComponentClient()
    
    // Verificar se o pagamento pertence ao usuário
    const { data: paymentIntent, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('user_id', user.id)
      .eq('abacatepay_payment_id', abacatePayId)
      .single()

    if (paymentError || !paymentIntent) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Simular pagamento no AbacatePay
    await pixStripeIntegration.simulatePixPayment(abacatePayId)
    
    // Aguardar um pouco para o webhook processar
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verificar status atualizado
    const statusResult = await pixStripeIntegration.checkPixPaymentStatus(
      abacatePayId,
      paymentIntent.stripe_payment_intent_id
    )

    // Atualizar status no banco
    await supabase
      .from('payment_intents')
      .update({ 
        status: 'completed',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentIntent.id)

    // Atualizar plano do usuário
    await supabase
      .from('profiles')
      .update({
        plan_type: paymentIntent.plan_type,
        plan_status: 'active',
        subscription_expires_at: paymentIntent.plan_type === 'diamante_anual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),  // 30 dias
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Pagamento simulado com sucesso',
      data: {
        pixStatus: 'paid',
        stripeStatus: statusResult.stripeStatus,
        paymentIntent: {
          id: paymentIntent.id,
          status: 'completed',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          planType: paymentIntent.plan_type,
          paidAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Erro ao simular pagamento PIX:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}