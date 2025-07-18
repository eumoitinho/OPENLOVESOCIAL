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

    const { abacatePayId, stripePaymentIntentId } = await request.json()

    if (!abacatePayId || !stripePaymentIntentId) {
      return NextResponse.json({ 
        error: 'abacatePayId e stripePaymentIntentId são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    // Verificar se o pagamento pertence ao usuário
    const { data: paymentIntent, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('user_id', user.id)
      .eq('abacatepay_payment_id', abacatePayId)
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .single()

    if (paymentError || !paymentIntent) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Verificar status no AbacatePay e Stripe
    const statusResult = await pixStripeIntegration.checkPixPaymentStatus(
      abacatePayId,
      stripePaymentIntentId
    )

    // Atualizar status no banco de dados
    const newStatus = statusResult.pixStatus === 'paid' ? 'completed' : 
                     statusResult.pixStatus === 'expired' ? 'expired' :
                     statusResult.pixStatus === 'cancelled' ? 'cancelled' : 'pending'

    if (paymentIntent.status !== newStatus) {
      await supabase
        .from('payment_intents')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(statusResult.pixStatus === 'paid' && { paid_at: new Date().toISOString() })
        })
        .eq('id', paymentIntent.id)
    }

    // Se o pagamento foi aprovado, atualizar plano do usuário
    if (statusResult.pixStatus === 'paid' && paymentIntent.status !== 'completed') {
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
    }

    return NextResponse.json({
      success: true,
      data: {
        pixStatus: statusResult.pixStatus,
        stripeStatus: statusResult.stripeStatus,
        updated: statusResult.updated,
        paymentIntent: {
          id: paymentIntent.id,
          status: newStatus,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          planType: paymentIntent.plan_type,
          expiresAt: paymentIntent.expires_at,
          createdAt: paymentIntent.created_at,
          ...(statusResult.pixStatus === 'paid' && { paidAt: new Date().toISOString() })
        }
      }
    })

  } catch (error) {
    console.error('Erro ao verificar status PIX:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}