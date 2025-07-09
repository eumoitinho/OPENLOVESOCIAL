"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, Crown, Zap } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Plan {
  id: string
  name: string
  price: number
  priceId: string
  description: string
  features: string[]
  limitations: string[]
  popular?: boolean
  icon: React.ReactNode
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    priceId: "",
    description: "Perfeito para começar a se conectar",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Participar de até 3 comunidades",
      "Criar até 2 eventos por mês",
      "Mensagens privadas básicas",
      "Upload de até 10 fotos",
      "Perfil básico",
    ],
    limitations: ["Limite de 3 comunidades", "Limite de 2 eventos/mês", "Sem prioridade no suporte"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.9,
    priceId: "price_premium_monthly", // Substituir pelo ID real do Stripe
    description: "Para usuários ativos que querem mais",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    features: [
      "Comunidades ilimitadas",
      "Eventos ilimitados",
      "Mensagens privadas avançadas",
      "Upload de fotos e vídeos ilimitado",
      "Perfil destacado",
      "Estatísticas detalhadas",
      "Suporte prioritário",
    ],
    limitations: [],
  },
  {
    id: "pro",
    name: "Pro",
    price: 39.9,
    priceId: "price_pro_monthly", // Substituir pelo ID real do Stripe
    description: "Para organizadores e influenciadores",
    icon: <Crown className="w-6 h-6 text-purple-500" />,
    features: [
      "Todos os recursos Premium",
      "Criar comunidades privadas",
      "Eventos pagos",
      "Analytics avançados",
      "Moderação avançada",
      "API access",
      "Suporte dedicado",
      "Badge verificado",
    ],
    limitations: [],
  },
]

const PricingContent: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      window.location.href = "/auth/signin?redirectTo=/pricing"
      return
    }

    if (plan.id === "free") {
      // Plano gratuito - não precisa de pagamento
      return
    }

    setLoading(plan.id)

    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planType: plan.id,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error("Erro no checkout:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao criar sessão:", error)
      alert("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <a href="/" className="text-2xl font-bold text-blue-600">
              ConnectHub
            </a>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </a>
              <a href="/communities" className="text-gray-700 hover:text-blue-600">
                Comunidades
              </a>
              <a href="/events" className="text-gray-700 hover:text-blue-600">
                Eventos
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha seu plano</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do ConnectHub e conecte-se com pessoas incríveis
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
                plan.popular ? "border-blue-500 scale-105" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        plan.popular ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && <span className="text-gray-600">/mês</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Recursos inclusos:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Limitações:</h4>
                    <ul className="space-y-3">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? "Processando..." : plan.price === 0 ? "Começar Grátis" : "Assinar Agora"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso aos recursos
                premium até o final do período pago.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Como funciona o plano gratuito?</h3>
              <p className="text-gray-600">
                O plano gratuito permite que você experimente o ConnectHub com algumas limitações. É perfeito para
                começar e ver se a plataforma atende às suas necessidades.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Posso fazer upgrade ou downgrade do meu plano?</h3>
              <p className="text-gray-600">
                Sim! Você pode alterar seu plano a qualquer momento. As mudanças entrarão em vigor no próximo ciclo de
                cobrança.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingContent
