'use client'

import { useState } from "react"
import { Card, CardBody } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CheckoutFormStripe from './CheckoutFormStripe'
import CheckoutFormAbacatePay from './CheckoutFormAbacatePay'
import { STRIPE_PRODUCTS } from "@/types/stripe"
import { CreditCard, Zap } from "lucide-react"

interface PaymentProviderProps {
  planType: keyof typeof STRIPE_PRODUCTS
  userEmail: string
  userId: string
  isUpgrade?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

type PaymentProvider = 'stripe' | 'abacatepay'

export default function PaymentProvider({
  planType,
  userEmail,
  userId,
  isUpgrade = false,
  onSuccess,
  onError
}: PaymentProviderProps) {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe')
  const [abacatePayUnavailable, setAbacatePayUnavailable] = useState(false)

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Seleção do Provedor */}
      <Card>
        <CardBody className="p-4">
          <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento</h3>
          
          <div className="space-y-3">
            {/* Stripe - Cartão (Padrão agora) */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedProvider === 'stripe' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProvider('stripe')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedProvider === 'stripe' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* AbacatePay - PIX */}
            {!abacatePayUnavailable && (
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedProvider === 'abacatepay' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvider('abacatepay')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">PIX, Boleto</p>
                      <p className="text-sm text-gray-600">Pagamento instantâneo via PIX ou boleto</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {selectedProvider === 'abacatepay' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Aviso se AbacatePay indisponível */}
            {abacatePayUnavailable && (
              <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">PIX temporariamente indisponível</p>
                    <p className="text-sm text-yellow-700">Use cartão de crédito para finalizar seu pagamento</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Formulário de Pagamento */}
      <div>
        {selectedProvider === 'stripe' ? (
          <CheckoutFormStripe
            planType={planType}
            userEmail={userEmail}
            userId={userId}
            isUpgrade={isUpgrade}
            onSuccess={onSuccess}
            onError={onError}
          />
        ) : (
          <CheckoutFormAbacatePay
            planType={planType}
            userEmail={userEmail}
            userId={userId}
            isUpgrade={isUpgrade}
            onSuccess={onSuccess}
            onError={(error: string) => {
              // Se erro de conectividade ou configuração, fazer fallback para Stripe
              if (error.includes('fetch failed') || 
                  error.includes('ENOTFOUND') || 
                  error.includes('não está configurado') ||
                  error.includes('URL de pagamento não foi gerada')) {
                setAbacatePayUnavailable(true)
                setSelectedProvider('stripe')
                if (onError) {
                  onError('PIX temporariamente indisponível. Usando cartão de crédito...')
                }
              } else {
                if (onError) onError(error)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
