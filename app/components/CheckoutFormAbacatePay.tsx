'use client'

import { useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import { STRIPE_PRODUCTS } from '@/types/stripe'
import { QrCode } from 'lucide-react'

interface CheckoutFormAbacatePayProps {
  planType: keyof typeof STRIPE_PRODUCTS
  userEmail: string
  userId: string
  isUpgrade?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}


export default function CheckoutFormAbacatePay({
  planType,
  userEmail,
  userId,
  isUpgrade = false,
  onSuccess,
  onError
}: CheckoutFormAbacatePayProps) {
  const [loading, setLoading] = useState(false)

  const plan = STRIPE_PRODUCTS[planType]

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/abacatepay/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planType,
          userId,
          email: userEmail,
          successUrl: `${window.location.origin}/timeline?payment=success&upgrade=${isUpgrade}`,
          cancelUrl: `${window.location.origin}/timeline?payment=cancelled`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      console.log('Resposta da API AbacatePay:', data)

      // Redirecionar para a página de pagamento do AbacatePay
      if (data.payment_url) {
        console.log('Redirecionando para:', data.payment_url)
        window.location.href = data.payment_url
      } else {
        console.error('Dados recebidos:', data)
        throw new Error('URL de pagamento não foi gerada. Verifique sua configuração do AbacatePay.')
      }

    } catch (error) {
      console.error('Erro no pagamento:', error)
      onError?.(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card>
      <CardBody className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            R$ {plan.price.toFixed(2).replace('.', ',')}
            <span className="text-lg font-normal text-gray-600">/mês</span>
          </div>
          <p className="text-gray-600">
            {plan.description}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Pagamento via PIX</span>
          </div>
          <p className="text-sm text-green-700">
            Pagamento instantâneo e seguro processado pelo AbacatePay
          </p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {loading ? 'Processando...' : 'Pagar com PIX'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Pagamento seguro processado pelo AbacatePay<br/>
          Você será redirecionado para completar o pagamento
        </p>
      </CardBody>
    </Card>
  )
}