import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/app/lib/supabase'
import { pixStripeIntegration } from '@/lib/abacatepay/stripe-integration'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    console.log('Webhook AbacatePay recebido:', webhookData)
    
    // Verificar se é um webhook válido do AbacatePay
    if (!webhookData.id || (!webhookData.status && !webhookData.event)) {
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
    }

    // Processar evento billing.paid
    if (webhookData.event === 'billing.paid') {
      // Para billing.paid, o status é sempre 'paid'
      webhookData.status = 'paid'
    }

    const supabase = createSupabaseAdmin()
    
    // Buscar payment_intent pelo abacatepay_payment_id
    const { data: paymentIntent, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('abacatepay_payment_id', webhookData.id)
      .single()

    if (paymentError || !paymentIntent) {
      console.warn('Payment intent não encontrado para webhook:', webhookData.id)
      return NextResponse.json({ error: 'Payment intent não encontrado' }, { status: 404 })
    }

    // Processar webhook através da integração
    await pixStripeIntegration.processAbacatePayWebhook(webhookData)
    
    // Atualizar status no banco
    const newStatus = webhookData.status === 'paid' ? 'completed' : 
                     webhookData.status === 'expired' ? 'expired' :
                     webhookData.status === 'cancelled' ? 'cancelled' : 'pending'

    await supabase
      .from('payment_intents')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(webhookData.status === 'paid' && { paid_at: new Date().toISOString() })
      })
      .eq('id', paymentIntent.id)

    // Se pagamento foi aprovado, atualizar plano do usuário
    if (webhookData.status === 'paid') {
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
        .eq('id', paymentIntent.user_id)
      
      console.log(`Plano atualizado para usuário ${paymentIntent.user_id}: ${paymentIntent.plan_type}`)
    }

    // Log do webhook processado
    await supabase
      .from('webhook_logs')
      .insert({
        provider: 'abacatepay',
        event_type: webhookData.event || 'payment_status_change',
        payment_id: webhookData.id,
        status: webhookData.status,
        data: webhookData,
        processed_at: new Date().toISOString()
      })

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao processar webhook AbacatePay:', error)
    
    // Log do erro
    try {
      const supabase = createSupabaseAdmin()
      await supabase
        .from('webhook_logs')
        .insert({
          provider: 'abacatepay',
          event_type: 'webhook_error',
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          data: await request.json().catch(() => ({})),
          processed_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Erro ao salvar log de webhook:', logError)
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}