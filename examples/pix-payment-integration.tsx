// Exemplo de integração do AbacatePay com PIX
// Este arquivo demonstra como usar os componentes criados

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PaymentMethodSelector from '@/components/payments/PaymentMethodSelector'
import PixPayment from '@/components/payments/PixPayment'
import { toast } from '@/components/ui/use-toast'

// Exemplo 1: Página de assinatura completa
export function SubscriptionPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'gold' | 'diamante' | 'diamante_anual'>('gold')

  const handlePaymentSuccess = () => {
    toast({
      title: 'Pagamento Aprovado!',
      description: 'Sua assinatura foi ativada com sucesso'
    })
    router.push('/dashboard')
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Erro no Pagamento',
      description: error,
      variant: 'destructive'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Escolha seu Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'gold', name: 'Open Ouro', price: 'R$ 25,00' },
                { id: 'diamante', name: 'Open Diamante', price: 'R$ 45,90' },
                { id: 'diamante_anual', name: 'Open Diamante Anual', price: 'R$ 459,00' }
              ].map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id as any)}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-lg font-bold text-primary">{plan.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSelector 
          planType={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  )
}

// Exemplo 2: Modal de upgrade
export function UpgradeModal({ isOpen, onClose, planType }: {
  isOpen: boolean
  onClose: () => void
  planType: 'gold' | 'diamante' | 'diamante_anual'
}) {
  const handleSuccess = () => {
    onClose()
    window.location.reload() // Recarregar para atualizar o plano
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upgrade de Plano</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        <PaymentMethodSelector 
          planType={planType}
          onSuccess={handleSuccess}
          onError={(error) => console.error('Erro no pagamento:', error)}
        />
      </div>
    </div>
  )
}

// Exemplo 3: Uso direto do componente PIX
export function DirectPixPayment() {
  const [showPayment, setShowPayment] = useState(false)

  if (!showPayment) {
    return (
      <Button onClick={() => setShowPayment(true)}>
        Pagar com PIX
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setShowPayment(false)}
      >
        ← Voltar
      </Button>
      
      <PixPayment 
        planType="gold"
        onSuccess={() => {
          alert('Pagamento realizado com sucesso!')
          setShowPayment(false)
        }}
        onError={(error) => {
          alert(`Erro: ${error}`)
          setShowPayment(false)
        }}
      />
    </div>
  )
}

// Exemplo 4: Hook personalizado para gerenciar pagamentos
export function usePixPayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPixPayment = async (planType: 'gold' | 'diamante' | 'diamante_anual') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          paymentMethodId: 'pm_pix_custom'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento')
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (abacatePayId: string, stripePaymentIntentId: string) => {
    try {
      const response = await fetch('/api/payments/pix/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abacatePayId,
          stripePaymentIntentId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao verificar status')
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    }
  }

  return {
    createPixPayment,
    checkPaymentStatus,
    loading,
    error
  }
}

// Exemplo 5: Componente de status de pagamento
export function PaymentStatus({ abacatePayId, stripePaymentIntentId }: {
  abacatePayId: string
  stripePaymentIntentId: string
}) {
  const [status, setStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(false)
  const { checkPaymentStatus } = usePixPayment()

  const handleCheckStatus = async () => {
    setLoading(true)
    try {
      const result = await checkPaymentStatus(abacatePayId, stripePaymentIntentId)
      setStatus(result.pixStatus)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Status do Pagamento:</span>
            <span className={`font-semibold ${
              status === 'paid' ? 'text-green-600' : 
              status === 'pending' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {status === 'paid' ? 'Pago' : 
               status === 'pending' ? 'Pendente' : 
               'Expirado'}
            </span>
          </div>
          
          <Button 
            onClick={handleCheckStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar Status'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Exemplo 6: Integração com sistema de planos existente
export function PlanUpgrade({ currentPlan, targetPlan }: {
  currentPlan: 'free' | 'gold' | 'diamante'
  targetPlan: 'gold' | 'diamante' | 'diamante_anual'
}) {
  const [showPayment, setShowPayment] = useState(false)

  const canUpgrade = () => {
    const planHierarchy = { free: 0, gold: 1, diamante: 2, diamante_anual: 2 }
    return planHierarchy[currentPlan] < planHierarchy[targetPlan]
  }

  if (!canUpgrade()) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Você já tem um plano igual ou superior
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showPayment) {
    return (
      <PaymentMethodSelector 
        planType={targetPlan}
        onSuccess={() => {
          setShowPayment(false)
          toast({
            title: 'Upgrade realizado!',
            description: 'Seu plano foi atualizado com sucesso'
          })
        }}
        onError={(error) => {
          setShowPayment(false)
          toast({
            title: 'Erro no upgrade',
            description: error,
            variant: 'destructive'
          })
        }}
      />
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Button 
          onClick={() => setShowPayment(true)}
          className="w-full"
        >
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  )
}