import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  ABACATEPAY_PRODUCTS, 
  ABACATEPAY_ENVIRONMENTS,
  CreateAbacatePayTransactionRequest,
  type AbacatePayResponse,
  type AbacatePayTransaction,
  type PaymentMethod
} from '@/types/abacatepay'

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

const ABACATEPAY_CONFIG = {
  apiKey: process.env.ABACATEPAY_API_KEY!,
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'production' | 'sandbox'
}

class AbacatePayAPI {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.apiKey = ABACATEPAY_CONFIG.apiKey
    this.baseUrl = ABACATEPAY_ENVIRONMENTS[ABACATEPAY_CONFIG.environment].baseUrl
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<AbacatePayResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'unknown_error',
          message: data.error?.message || 'Erro desconhecido',
          details: data.error?.details
        }
      }
    }

    return {
      success: true,
      data
    }
  }

  async createCustomer(customerData: {
    name: string
    email: string
    document?: string
    phone?: string
  }) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: customerData.name,
        email: customerData.email,
        document: customerData.document || '000.000.000-00', // CPF placeholder
        phone: customerData.phone || '11999999999',
        address: {
          street: 'Rua Exemplo',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01000-000',
          country: 'BR'
        }
      })
    })
  }

  async createTransaction(transactionData: CreateAbacatePayTransactionRequest) {
    return this.request<AbacatePayTransaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    })
  }

  async getTransaction(transactionId: string) {
    return this.request<AbacatePayTransaction>(`/transactions/${transactionId}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      plan, 
      userId, 
      email,
      paymentMethod = 'pix',
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
    const planConfig = ABACATEPAY_PRODUCTS[plan as keyof typeof ABACATEPAY_PRODUCTS]
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Verificar método de pagamento
    const validPaymentMethods: PaymentMethod[] = ['pix', 'credit_card', 'boleto']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    const abacatePay = new AbacatePayAPI()

    // Tentar buscar usuário no banco
    const { data: userData } = await supabase
      .from('users')
      .select('abacatepay_customer_id, name, email')
      .eq('id', userId)
      .single()

    let customerId = userData?.abacatepay_customer_id

    // Criar cliente no AbacatePay se não existir
    if (!customerId) {
      const customerResult = await abacatePay.createCustomer({
        name: userData?.name || 'Usuário OpenLove',
        email: userData?.email || email
      })

      if (!customerResult.success) {
        return NextResponse.json(
          { error: `Erro ao criar cliente: ${customerResult.error?.message}` },
          { status: 400 }
        )
      }

      customerId = customerResult.data.id

      // Atualizar o banco se o usuário existir
      if (userData) {
        await supabase
          .from('users')
          .update({ 
            abacatepay_customer_id: customerId,
            payment_provider: 'abacatepay'
          })
          .eq('id', userId)
      }
    }

    // Criar transação
    const transactionRequest: CreateAbacatePayTransactionRequest = {
      customer_id: customerId,
      amount: planConfig.price!,
      currency: 'BRL',
      description: `${planConfig.name} - ${planConfig.description}`,
      external_reference: `openlove_${userId}_${Date.now()}`,
      payment_method: paymentMethod,
      expires_in_minutes: paymentMethod === 'pix' ? 30 : undefined,
      return_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/timeline?payment=success`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/abacatepay/webhook`,
      metadata: {
        user_id: userId,
        plan: plan,
        environment: ABACATEPAY_CONFIG.environment
      }
    }

    const transactionResult = await abacatePay.createTransaction(transactionRequest)

    if (!transactionResult.success) {
      return NextResponse.json(
        { error: `Erro ao criar transação: ${transactionResult.error?.message}` },
        { status: 400 }
      )
    }

    const transaction = transactionResult.data

    // Salvar transação no banco (opcional)
    try {
      await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          user_id: userId,
          provider: 'abacatepay',
          provider_transaction_id: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          payment_method: transaction.payment_method,
          plan: plan,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Erro ao salvar transação no banco:', error)
      // Não falhar a operação por causa disso
    }

    // Preparar resposta baseada no método de pagamento
    const response: any = {
      success: true,
      transaction_id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      expires_at: transaction.expires_at
    }

    if (paymentMethod === 'pix' && transaction.pix_qr_code) {
      response.pix = {
        qr_code: transaction.pix_qr_code,
        qr_code_base64: transaction.pix_qr_code_base64,
        copy_paste_code: transaction.payment_details?.method === 'pix' 
          ? (transaction.payment_details as any).copy_paste_code 
          : null
      }
    }

    if (transaction.checkout_url) {
      response.checkout_url = transaction.checkout_url
    }

    return NextResponse.json(response)

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
    const transactionId = searchParams.get('transaction_id')
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação é obrigatório' },
        { status: 400 }
      )
    }

    const abacatePay = new AbacatePayAPI()
    const result = await abacatePay.getTransaction(transactionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction: result.data
    })

  } catch (error) {
    console.error('Erro ao buscar transação:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}