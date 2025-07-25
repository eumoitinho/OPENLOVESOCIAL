import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('AbacatePay Webhook recebido:', JSON.stringify(body, null, 2))

    // Extrair dados do webhook
    const { event, data } = body

    if (!event || !data) {
      console.error('Webhook inválido - faltando event ou data')
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
    }

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'billing.paid':
        await handleBillingPaid(data)
        break
      case 'billing.cancelled':
        await handleBillingCancelled(data)
        break
      case 'billing.expired':
        await handleBillingExpired(data)
        break
      default:
        console.log(`Evento não processado: ${event}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro no webhook AbacatePay:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleBillingPaid(billingData: any) {
  try {
    console.log('Processando pagamento aprovado:', billingData.id)

    // Buscar metadados da transação
    const userId = billingData.metadata?.user_id
    const plan = billingData.metadata?.plan

    if (!userId || !plan) {
      console.error('Metadados faltando no pagamento:', { userId, plan })
      return
    }

    // Atualizar status da transação no banco
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'authorized',
        updated_at: new Date().toISOString()
      })
      .eq('provider_transaction_id', billingData.id)

    if (transactionError) {
      console.error('Erro ao atualizar transação:', transactionError)
    }

    // Ativar plano premium do usuário
    const premiumExpiresAt = new Date()
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1) // 1 mês

    const { error: userError } = await supabase
      .from('users')
      .update({
        premium_type: plan,
        premium_status: 'active',
        is_premium: true,
        premium_expires_at: premiumExpiresAt.toISOString(),
        payment_provider: 'abacatepay',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      console.error('Erro ao ativar premium:', userError)
      return
    }

    console.log(`Premium ativado para usuário ${userId} com plano ${plan}`)

    // Registrar mudança de plano no histórico
    try {
      await supabase
        .from('plan_changes')
        .insert({
          user_id: userId,
          from_plan: 'free',
          to_plan: plan,
          status: 'completed',
          created_at: new Date().toISOString()
        })
    } catch (historyError) {
      console.error('Erro ao registrar histórico:', historyError)
    }

  } catch (error) {
    console.error('Erro ao processar pagamento aprovado:', error)
  }
}

async function handleBillingCancelled(billingData: any) {
  try {
    console.log('Processando pagamento cancelado:', billingData.id)

    // Atualizar status da transação
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('provider_transaction_id', billingData.id)

    if (error) {
      console.error('Erro ao atualizar transação cancelada:', error)
    }

  } catch (error) {
    console.error('Erro ao processar cancelamento:', error)
  }
}

async function handleBillingExpired(billingData: any) {
  try {
    console.log('Processando pagamento expirado:', billingData.id)

    // Atualizar status da transação
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('provider_transaction_id', billingData.id)

    if (error) {
      console.error('Erro ao atualizar transação expirada:', error)
    }

  } catch (error) {
    console.error('Erro ao processar expiração:', error)
  }
}