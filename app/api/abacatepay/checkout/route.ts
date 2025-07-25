import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import AbacatePaySDK from 'abacatepay-nodejs-sdk'
import * as AbacatePay from '@/types/abacatepay'

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

// Inicializar SDK do AbacatePay
const abacatePaySDK = AbacatePaySDK(process.env.ABACATEPAY_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Verificar se AbacatePay está configurado
    if (!process.env.ABACATEPAY_API_KEY) {
      console.error('ABACATEPAY_API_KEY não configurada')
      return NextResponse.json(
        { error: 'AbacatePay não está configurado. Configure ABACATEPAY_API_KEY nas variáveis de ambiente.' },
        { status: 503 }
      )
    }

    const { 
      plan, 
      userId, 
      email,
      successUrl,
      cancelUrl 
    } = await request.json()

    console.log('AbacatePay configurado, processando pagamento para plano:', plan)

    // Validar entrada
    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const planConfig = AbacatePay.ABACATEPAY_PRODUCTS[plan as keyof typeof AbacatePay.ABACATEPAY_PRODUCTS]
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('name, email, first_name, last_name')
      .eq('id', userId)
      .single()

    const userName = userData?.name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'Usuário OpenLove'
    const userEmail = userData?.email || email

    // Determinar URLs corretas
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = successUrl || `${baseUrl}/timeline?payment=success`
    const webhookUrl = `${baseUrl}/api/abacatepay/webhook`
    
    console.log('URLs configuradas:', { baseUrl, returnUrl, webhookUrl })

    // Criar cobrança usando o SDK oficial
    const billing = await abacatePaySDK.billing.create({
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [{
        externalId: `PLAN_${plan.toUpperCase()}`,
        name: planConfig.name,
        quantity: 1,
        price: planConfig.price! // Preço em centavos
      }],
      returnUrl: returnUrl,
      customer: {
        name: userName,
        email: userEmail,
        cellphone: "+5511999999999", // Placeholder - idealmente vir do cadastro
        taxId: "09240529020" // Placeholder - idealmente vir do cadastro
      }
      // Removendo completionUrl temporariamente para testar
    })

    console.log('AbacatePay Billing Response:', JSON.stringify(billing, null, 2))

    // Salvar transação no banco
    try {
      await supabase
        .from('transactions')
        .insert({
          id: billing.id,
          user_id: userId,
          provider: 'abacatepay',
          provider_transaction_id: billing.id,
          amount: planConfig.price!,
          currency: 'BRL',
          status: 'pending',
          payment_method: 'pix',
          plan: plan,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar transação no banco:', error)
      // Não falhar a operação por causa disso
    }

    // Verificar se a URL de pagamento foi retornada
    const paymentUrl = billing.url || billing.payment_url || billing.checkoutUrl || billing.checkout_url
    
    if (!paymentUrl) {
      console.error('URL de pagamento não encontrada na resposta:', billing)
      return NextResponse.json(
        { error: 'Erro ao gerar URL de pagamento. Verifique a configuração do AbacatePay.' },
        { status: 500 }
      )
    }

    // Retornar resposta com URL de pagamento
    return NextResponse.json({
      success: true,
      billing_id: billing.id,
      payment_url: paymentUrl,
      amount: planConfig.price!,
      currency: 'BRL',
      plan: plan,
      status: 'pending'
    })

  } catch (error) {
    console.error('Erro no checkout AbacatePay:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billingId = searchParams.get('billing_id')
    
    if (!billingId) {
      return NextResponse.json(
        { error: 'ID da cobrança é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar informações da cobrança usando o SDK
    const billing = await abacatePaySDK.billing.retrieve(billingId)

    return NextResponse.json({
      success: true,
      billing: billing
    })

  } catch (error) {
    console.error('Erro ao buscar cobrança:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}