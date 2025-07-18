'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Switch } from '@heroui/react'
import CheckoutForm from './CheckoutForm' // Mercado Pago
import CheckoutFormStripe from './CheckoutFormStripe' // Stripe
import { STRIPE_PRODUCTS } from '@/types/stripe'

interface PaymentProviderProps {
  planType: keyof typeof STRIPE_PRODUCTS
  userEmail: string
  userId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

// Feature flag para controlar qual processador usar
const PAYMENT_CONFIG = {
  useStripe: true, // Alterar para true para usar Stripe
  showBothOptions: false, // Mostrar ambas as opções
  defaultProvider: 'stripe' as 'stripe' | 'mercadopago'
}

export default function PaymentProvider({
  planType,
  userEmail,
  userId,
  onSuccess,
  onError
}: PaymentProviderProps) {
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'mercadopago'>(
    PAYMENT_CONFIG.defaultProvider
  )

  // Se configurado para usar apenas Stripe
  if (PAYMENT_CONFIG.useStripe && !PAYMENT_CONFIG.showBothOptions) {
    return (
      <CheckoutFormStripe
        planType={planType}
        userEmail={userEmail}
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />
    )
  }

  // Se configurado para usar apenas Mercado Pago
  if (!PAYMENT_CONFIG.useStripe && !PAYMENT_CONFIG.showBothOptions) {
    return (
      <CheckoutForm
        user={{ id: userId, email: userEmail }}
        plano={planType as any}
        onSuccess={onSuccess}
        onError={onError}
      />
    )
  }

  // Mostrar ambas as opções
  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardBody className="p-4">
          <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento</h3>
          
          <div className="space-y-3">
            <div 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedProvider === 'stripe' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProvider('stripe')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-sm text-gray-600">Cartão de crédito/débito</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedProvider === 'stripe' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            <div 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedProvider === 'mercadopago' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProvider('mercadopago')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mercado Pago</p>
                  <p className="text-sm text-gray-600">Cartão, PIX, boleto</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedProvider === 'mercadopago' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6">
        {selectedProvider === 'stripe' ? (
          <CheckoutFormStripe
            planType={planType}
            userEmail={userEmail}
            userId={userId}
            onSuccess={onSuccess}
            onError={onError}
          />
        ) : (
          <CheckoutForm
            user={{ id: userId, email: userEmail }}
            plano={planType as any}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </div>
    </div>
  )
}