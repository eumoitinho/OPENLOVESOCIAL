'use client'

import { useState, useEffect } from "react"
import React from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { STRIPE_PRODUCTS } from "@/types/stripe"

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
  const [isReady, setIsReady] = useState(false)

  const plan = STRIPE_PRODUCTS[planType]

  // Verificar se Stripe está carregado
  useEffect(() => {
    if (stripe) {
      setIsReady(true)
    }
  }, [stripe])

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
          email: userEmail
        }
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          paymentMethodId: paymentMethod.id,
          planType,
          userId
        })
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Informações do Cartão
          </label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white relative">
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <CardElement
              options={{
                style: {
                    base: {
                      fontSize: '16px',
                      color: '#32325d',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSmoothing: 'antialiased',
                      '::placeholder': {
                        color: '#a0aec0'
                      },
                      '::selection': {
                        color: '#fff',
                        backgroundColor: '#0070f3'
                      }
                    },
                    invalid: {
                      color: '#e25950',
                      iconColor: '#e25950'
                    }
                },
                hidePostalCode: true
              }}
              className="py-2"
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
          className="w-full"
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
