"use client"

import { useState } from "react"
import { Check, X, Crown, Zap, Star } from "lucide-react"
import PaymentProvider from "@/app/components/PaymentProvider"

interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  limitations: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    description: "Ideal para começar e explorar recursos básicos",
    icon: <Zap className="w-6 h-6" />,
    color: "gray",
    features: [
      "Participar de comunidades verificadas",
      "Upload ilimitado de fotos",
      "Upload de 1 vídeo",
      "Perfil básico"
    ],
    limitations: [
      "Não pode enviar mensagens",
      "Não pode criar eventos",
      "Sem suporte prioritário"
    ]
  },
  {
    id: "gold",
    name: "Open Gold",
    price: 25.0,
    description: "Mais recursos para quem quer se destacar",
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    color: "yellow",
    popular: true,
    features: [
      "Participar de até 3 comunidades",
      "Criar até 2 eventos por mês",
      "Mensagens privadas com fotos",
      "Upload ilimitado de fotos e vídeos",
      "Perfil com destaque visual",
      "Suporte prioritário"
    ],
    limitations: [
      "Não pode criar comunidades",
      "Sem chamadas de voz/vídeo",
      "Sem badge verificado"
    ]
  },
  {
    id: "diamond",
    name: "Open Diamond",
    price: 45.9,
    description: "Para quem quer o máximo de recursos",
    icon: <Star className="w-6 h-6 text-blue-500" />,
    color: "blue",
    features: [
      "Participar de até 5 comunidades",
      "Criar até 10 eventos por mês",
      "Mensagens com fotos, vídeos e áudios",
      "Chamadas de voz e vídeo",
      "Upload ilimitado",
      "Perfil super destacado + badge verificado",
      "Criar comunidades privadas",
      "Suporte dedicado"
    ],
    limitations: []
  }
]

interface PlanSelectionProps {
  onPlanSelect: (planId: string) => void
  selectedPlan: string
  userEmail: string
  userId: string
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
}

export default function PlanSelection({
  onPlanSelect,
  selectedPlan,
  userEmail,
  userId,
  onPaymentSuccess,
  onPaymentError
}: PlanSelectionProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null)

  const handlePlanClick = (plan: Plan) => {
    if (plan.id === 'free') {
      onPlanSelect(plan.id)
      return
    }
    
    // Para planos pagos, mostrar gateway de pagamento
    setPaymentPlan(plan)
    setShowPayment(true)
  }

  const handlePaymentClose = () => {
    setShowPayment(false)
    setPaymentPlan(null)
  }

  const handlePaymentSuccessInternal = () => {
    if (paymentPlan) {
      onPlanSelect(paymentPlan.id)
    }
    handlePaymentClose()
    onPaymentSuccess()
  }

  const getPlanBorderColor = (plan: Plan) => {
    if (selectedPlan === plan.id) {
      return plan.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
             plan.color === 'blue' ? 'border-blue-500 bg-blue-50' :
             'border-gray-500 bg-gray-50'
    }
    return plan.popular ? 'border-yellow-400' : 'border-gray-200'
  }

  const getButtonColor = (plan: Plan) => {
    if (plan.id === 'free') {
      return selectedPlan === plan.id 
        ? 'bg-gray-600 text-white' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
    
    if (plan.color === 'yellow') {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
    }
    
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha seu plano
        </h2>
        <p className="text-gray-600">
          Selecione o plano ideal para começar sua jornada no OpenLove
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${getPlanBorderColor(plan)}`}
            onClick={() => handlePlanClick(plan)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  MAIS POPULAR
                </span>
              </div>
            )}

            {/* Ícone e seleção */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  plan.color === 'yellow' ? 'bg-yellow-100' :
                  plan.color === 'blue' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/mês</span>}
                  </p>
                </div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id 
                  ? `border-${plan.color === 'yellow' ? 'yellow' : plan.color === 'blue' ? 'blue' : 'gray'}-500 bg-${plan.color === 'yellow' ? 'yellow' : plan.color === 'blue' ? 'blue' : 'gray'}-500`
                  : 'border-gray-300'
              }`}>
                {selectedPlan === plan.id && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>

            {/* Descrição */}
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm text-green-600">Incluído:</h4>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-xs">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.features.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{plan.features.length - 3} outros recursos
                </p>
              )}
            </div>

            {/* Limitations */}
            {plan.limitations.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-sm text-gray-500">Limitações:</h4>
                <ul className="space-y-1">
                  {plan.limitations.slice(0, 2).map((limitation, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs">
                      <X className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botão */}
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${getButtonColor(plan)}`}
              onClick={(e) => {
                e.stopPropagation()
                handlePlanClick(plan)
              }}
            >
              {selectedPlan === plan.id ? 'Selecionado' : 
               plan.id === 'free' ? 'Começar Grátis' : 'Selecionar'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal de pagamento */}
      {showPayment && paymentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" 
              onClick={handlePaymentClose}
            >
              ×
            </button>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Finalizar {paymentPlan.name}
                </h3>
                <p className="text-gray-600">
                  Complete seu pagamento para ativar o plano
                </p>
              </div>

              <PaymentProvider 
                planType={paymentPlan.id as "gold" | "diamond"} 
                userEmail={userEmail}
                userId={userId}
                onSuccess={handlePaymentSuccessInternal} 
                onError={(error) => {
                  handlePaymentClose()
                  onPaymentError(error)
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
