'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from "@heroui/react"
import { STRIPE_PRODUCTS } from '@/types/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormStripeProps {
  planType: keyof typeof STRIPE_PRODUCTS
  userEmail: string
  userId: string
  isUpgrade?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

function CheckoutFormContent({ planType, userEmail, userId, isUpgrade = false, onSuccess, onError }: CheckoutFormStripeProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = STRIPE_PRODUCTS[planType]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Elemento do cartão não encontrado')
      setLoading(false)
      return
    }

    try {
      // Criar método de pagamento
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: userEmail,
        },
      })

      if (paymentError) {
        setError(paymentError.message || 'Erro ao processar cartão')
        setLoading(false)
        return
      }

      // Criar assinatura via API
      const response = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          paymentMethodId: paymentMethod.id,
          planType,
          userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao criar assinatura')
        setLoading(false)
        return
      }

      // Verificar se precisa de ação adicional (3D Secure)
      if (result.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret)
        
        if (confirmError) {
          setError(confirmError.message || 'Erro na confirmação do pagamento')
          setLoading(false)
          return
        }
      }

      // Sucesso!
      onSuccess?.()
      
    } catch (error) {
      console.error('Erro no checkout:', error)
      setError('Erro interno. Tente novamente.')
      onError?.(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Assinar Plano {plan.name}
        </h2>
        <p className="text-2xl font-bold text-blue-600">
          R$ {(plan.price / 100).toFixed(2)}
          <span className="text-sm font-normal text-gray-600">
            /{plan.interval === 'month' ? 'mês' : 'ano'}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informações do Cartão
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : `Assinar por R$ ${(plan.price / 100).toFixed(2)}`}
        </Button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Pagamento seguro processado pelo Stripe</p>
        <p>Cancele a qualquer momento</p>
      </div>
    </div>
  )
}

export default function CheckoutFormStripe(props: CheckoutFormStripeProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent {...props} />
    </Elements>
  )
}