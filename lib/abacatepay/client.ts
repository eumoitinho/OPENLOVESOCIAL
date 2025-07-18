// Cliente para AbacatePay API
export class AbacatePayClient {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey: string, isProduction: boolean = false) {
    this.baseUrl = 'https://api.abacatepay.com/v1'
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'OpenLove/1.0'
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`AbacatePay API Error: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AbacatePay API Error:', error)
      throw error
    }
  }

  // Criar customer
  async createCustomer(customerData: CreateCustomerParams): Promise<AbacatePayCustomer> {
    return this.request<AbacatePayCustomer>('/customer/create', 'POST', customerData)
  }

  // Criar cobrança PIX
  async createPixPayment(paymentData: CreatePixPaymentParams): Promise<AbacatePayPixPayment> {
    return this.request<AbacatePayPixPayment>('/billing/create', 'POST', paymentData)
  }

  // Verificar status do pagamento PIX
  async checkPixPaymentStatus(paymentId: string): Promise<AbacatePayPixPayment> {
    return this.request<AbacatePayPixPayment>(`/billing/list?id=${paymentId}`)
  }

  // Simular pagamento (desenvolvimento)
  async simulatePixPayment(paymentId: string): Promise<AbacatePayPixPayment> {
    // AbacatePay não tem simulação para billing, retornar sucesso em dev
    if (process.env.NODE_ENV === 'development') {
      return {
        id: paymentId,
        status: 'paid',
        amount: 0,
        description: 'Pagamento simulado',
        pixCode: 'simulated',
        pixQrCode: 'simulated',
        expiresAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    throw new Error('Simulação não disponível em produção')
  }

  // Listar customers
  async listCustomers(): Promise<AbacatePayCustomer[]> {
    return this.request<AbacatePayCustomer[]>('/customer/list')
  }

  // Criar cobrança
  async createBilling(billingData: CreateBillingParams): Promise<AbacatePayBilling> {
    return this.request<AbacatePayBilling>('/billing/create', 'POST', billingData)
  }
}

// Tipos para AbacatePay
export interface CreateCustomerParams {
  name: string
  email: string
  phone?: string
  taxId?: string // CPF/CNPJ
}

export interface CreatePixPaymentParams {
  amount: number // Valor em centavos
  description: string
  customerId?: string
  dueDate?: string // ISO 8601 date (para billing)
  metadata?: Record<string, any>
}

export interface CreateBillingParams {
  customerId: string
  amount: number
  description: string
  dueDate: string // ISO 8601 date
}

export interface AbacatePayCustomer {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}

export interface AbacatePayPixPayment {
  id: string
  amount: number
  description: string
  customerId?: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  pixCode?: string // Código copia-e-cola PIX
  pixQrCode?: string // Base64 da imagem QR Code
  url?: string // URL para pagamento (billing)
  dueDate?: string // Data de vencimento
  paidAt?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AbacatePayBilling {
  id: string
  customerId: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  dueDate: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// Instância única do cliente
export const abacatePayClient = new AbacatePayClient(
  process.env.ABACATEPAY_API_KEY || '',
  process.env.NODE_ENV === 'production'
)