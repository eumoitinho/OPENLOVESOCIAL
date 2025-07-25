'use client'

import { useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import { STRIPE_PRODUCTS } from '@/types/stripe'
import { QrCode, Copy, CreditCard, FileText, Check } from 'lucide-react'

interface CheckoutFormAbacatePayProps {
  planType: keyof typeof STRIPE_PRODUCTS
  userEmail: string
  userId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

type PaymentMethod = 'pix' | 'credit_card' | 'boleto'

interface PixData {
  qr_code: string
  qr_code_base64: string
  copy_paste_code: string
}

export default function CheckoutFormAbacatePay({
  planType,
  userEmail,
  userId,
  onSuccess,
  onError
}: CheckoutFormAbacatePayProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
          paymentMethod,
          successUrl: `${window.location.origin}/timeline?payment=success`,
          cancelUrl: `${window.location.origin}/timeline?payment=cancelled`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      setTransactionId(data.transaction_id)

      // Se for PIX, mostrar o QR Code
      if (paymentMethod === 'pix' && data.pix) {
        setPixData(data.pix)
      }

      // Se tiver URL de checkout, redirecionar
      if (data.checkout_url) {
        setCheckoutUrl(data.checkout_url)
        // Para cartão e boleto, redirecionar automaticamente
        if (paymentMethod !== 'pix') {
          window.location.href = data.checkout_url
          return
        }
      }

      // Iniciar polling para verificar pagamento (PIX)
      if (paymentMethod === 'pix') {
        startPaymentPolling(data.transaction_id)
      }

    } catch (error) {
      console.error('Erro no pagamento:', error)
      onError?.(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const startPaymentPolling = (transactionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/abacatepay/checkout?transaction_id=${transactionId}`)
        const data = await response.json()

        if (data.success && data.transaction) {
          const status = data.transaction.status
          
          if (status === 'paid') {
            clearInterval(pollInterval)
            onSuccess?.()
          } else if (['cancelled', 'expired', 'failed'].includes(status)) {
            clearInterval(pollInterval)
            onError?.('Pagamento cancelado ou expirado')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error)
      }
    }, 3000) // Verificar a cada 3 segundos

    // Parar polling após 30 minutos
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 30 * 60 * 1000)
  }

  const copyPixCode = async () => {
    if (pixData?.copy_paste_code) {
      try {
        await navigator.clipboard.writeText(pixData.copy_paste_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Erro ao copiar código PIX:', error)
      }
    }
  }

  const downloadQRCode = () => {
    if (pixData?.qr_code_base64) {
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${pixData.qr_code_base64}`
      link.download = 'qr-code-pix.png'
      link.click()
    }
  }

  // Se já temos dados do PIX, mostrar a tela de pagamento
  if (pixData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardBody className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Pagamento via PIX</h3>
            
            {/* QR Code */}
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg inline-block border">
                <img 
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Escaneie o QR Code com seu app do banco
              </p>
            </div>

            {/* Código PIX */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Ou copie o código PIX:</p>
              <div className="bg-gray-100 p-3 rounded-lg border">
                <code className="text-sm break-all">
                  {pixData.copy_paste_code}
                </code>
              </div>
              <Button
                onClick={copyPixCode}
                variant="flat"
                size="sm"
                className="mt-2"
                startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copiado!' : 'Copiar código'}
              </Button>
            </div>

            {/* Instruções */}
            <div className="text-left bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Como pagar:</h4>
              <ol className="text-sm space-y-1">
                <li>1. Abra o app do seu banco</li>
                <li>2. Procure por "PIX" ou "Pagar com QR Code"</li>
                <li>3. Escaneie o código ou cole o código PIX</li>
                <li>4. Confirme o pagamento</li>
              </ol>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              O pagamento será confirmado automaticamente. Esta página se atualizará quando o pagamento for aprovado.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
        </h3>

        {/* Seleção do método de pagamento */}
        <div className="space-y-3 mb-6">
          <p className="font-medium">Método de pagamento:</p>
          
          {/* PIX */}
          <div 
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'pix' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('pix')}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">PIX</p>
                <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              </div>
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'pix' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cartão de Crédito */}
          <div 
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'credit_card' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('credit_card')}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Cartão de Crédito</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
              </div>
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'credit_card' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Boleto */}
          <div 
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'boleto' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('boleto')}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Boleto Bancário</p>
                <p className="text-sm text-gray-600">Vencimento em 3 dias</p>
              </div>
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'boleto' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de pagamento */}
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
          color="primary"
          size="lg"
        >
          {loading ? 'Processando...' : 
           paymentMethod === 'pix' ? 'Gerar PIX' :
           paymentMethod === 'boleto' ? 'Gerar Boleto' :
           'Pagar com Cartão'}
        </Button>

        {/* Informações de segurança */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Pagamento seguro processado pelo AbacatePay
        </p>
      </CardBody>
    </Card>
  )
}