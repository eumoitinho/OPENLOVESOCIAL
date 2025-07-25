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

    // Determinar URLs corretas - AbacatePay precisa de URLs públicas válidas
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // Se não configurado ou for localhost, usar ngrok ou URL temporária para desenvolvimento
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      // Para desenvolvimento, usar um serviço de túnel público ou URL temporária
      // Em produção, NEXT_PUBLIC_APP_URL deve estar configurado corretamente
      console.warn('NEXT_PUBLIC_APP_URL não configurado ou é localhost. AbacatePay requer URLs públicas.')
      
      // Tentar detectar se está em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        // Usar webhook.site temporário para testes ou solicitar configuração de ngrok
        baseUrl = 'https://webhook.site/unique-id-here'
        console.log('⚠️ AVISO: Usando URL temporária para desenvolvimento. Configure ngrok para testes reais.')
      } else {
        return NextResponse.json(
          { 
            error: 'Configure NEXT_PUBLIC_APP_URL com uma URL pública válida. AbacatePay não aceita URLs localhost.',
            details: 'Para desenvolvimento, use ngrok: npx ngrok http 3000'
          },
          { status: 500 }
        )
      }
    }
    
    const returnUrl = successUrl || `${baseUrl}/timeline?payment=success`
    const webhookUrl = `${baseUrl}/api/abacatepay/webhook`
    
    // Verificar se as URLs são válidas e públicas
    try {
      const returnUrlObj = new URL(returnUrl)
      const webhookUrlObj = new URL(webhookUrl)
      
      // Verificar se não são URLs locais
      const isLocalUrl = (url: URL) => {
        return url.hostname === 'localhost' || 
               url.hostname === '127.0.0.1' || 
               url.hostname.endsWith('.local')
      }
      
      if (isLocalUrl(returnUrlObj) || isLocalUrl(webhookUrlObj)) {
        return NextResponse.json(
          { 
            error: 'AbacatePay requer URLs públicas. Configure NEXT_PUBLIC_APP_URL ou use ngrok para desenvolvimento.',
            details: {
              current_urls: { returnUrl, webhookUrl },
              solution: 'Para desenvolvimento: npx ngrok http 3000, depois configure NEXT_PUBLIC_APP_URL=https://xxxx.ngrok.io'
            }
          },
          { status: 500 }
        )
      }
      
    } catch (error) {
      console.error('URLs inválidas:', { returnUrl, webhookUrl, error })
      return NextResponse.json(
        { error: 'URLs malformadas. Verifique NEXT_PUBLIC_APP_URL.' },
        { status: 500 }
      )
    }
    
    console.log('URLs configuradas:', { baseUrl, returnUrl, webhookUrl })

    // Criar cobrança usando o SDK oficial
    const billing = await abacatePaySDK.billing.create({
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [{
        externalId: `PLAN_${plan.toUpperCase()}`,
        name: planConfig.name || `Plano ${plan}`,
        quantity: 1,
        price: planConfig.price! // Preço em centavos
      }],
      returnUrl: returnUrl,
      completionUrl: webhookUrl,
      customer: {
        name: userName,
        email: userEmail,
        cellphone: "+5511999999999", // Placeholder - idealmente vir do cadastro
        taxId: "09240529020" // Placeholder - idealmente vir do cadastro
      }
    })

    console.log('AbacatePay Billing Response:', JSON.stringify(billing, null, 2))

    // Verificar se a resposta do billing é válida
    if (!billing || 'error' in billing) {
      console.error('Erro na resposta do AbacatePay:', billing)
      return NextResponse.json(
        { error: 'Erro ao criar cobrança no AbacatePay' },
        { status: 500 }
      )
    }

    // Obter ID do billing (assumindo que pode estar em billing.id ou billing.data.id)
    const billingId = (billing as any).data?.id || (billing as any).id

    // Salvar transação no banco
    try {
      await supabase
        .from('transactions')
        .insert({
          id: billingId,
          user_id: userId,
          provider: 'abacatepay',
          provider_transaction_id: billingId,
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
    const paymentUrl = (billing as any).url || (billing as any).payment_url || (billing as any).checkoutUrl || (billing as any).checkout_url
    
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
      billing_id: billingId,
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