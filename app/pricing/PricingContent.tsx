"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, Crown, Zap } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { loadStripe } from "@stripe/stripe-js"
import CheckoutForm from "@/app/components/CheckoutForm"

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
    description: "Ideal para começar e explorar recursos básicos (participação apenas em comunidades/eventos verificados)",
    icon: <Zap className="w-6 h-6" />, 
    features: [
      "Participar de comunidades e eventos verificados",
      "Upload ilimitado de fotos",
      "Upload de 1 vídeo",
      "Perfil básico",
    ],
    limitations: [
      "Não pode enviar mensagens",
      "Não pode criar eventos",
      "Não pode criar comunidades",
      "Sem suporte prioritário",
      "Sem destaque no perfil",
      "Sem estatísticas",
      "Sem chamadas de voz/vídeo",
      "Sem envio de áudio/vídeo no chat"
    ],
  },
  {
    id: "ouro",
    name: "Open Ouro",
    price: 25.0,
    priceId: "price_ouro_monthly", // Substituir pelo ID real do Stripe
    description: "Mais recursos para quem quer se destacar e interagir mais",
    icon: <Crown className="w-6 h-6 text-yellow-500" />, 
    popular: true,
    features: [
      "Participar de até 3 comunidades",
      "Participar de eventos ilimitados",
      "Criar até 2 eventos por mês",
      "Mensagens privadas com envio de fotos",
      "Upload ilimitado de fotos",
      "Upload de até 10 vídeos",
      "Perfil com destaque visual",
      "Estatísticas básicas de participação",
      "Suporte prioritário"
    ],
    limitations: [
      "Não pode criar comunidades",
      "Não pode enviar áudio/vídeo no chat",
      "Não pode fazer chamadas de voz/vídeo",
      "Sem badge verificado",
      "Sem moderação avançada",
      "Sem analytics avançado"
    ],
  },
  {
    id: "diamante",
    name: "Open Diamante",
    price: 45.9,
    priceId: "price_diamante_monthly", // Substituir pelo ID real do Stripe
    description: "Para quem quer o máximo de liberdade, alcance e recursos",
    icon: <Crown className="w-6 h-6 text-blue-500" />, 
    features: [
      "Participar de comunidades e eventos verificados",
      "Participar de até 5 comunidades",
      "Criar até 10 eventos por mês",
      "Eventos ilimitados",
      "Mensagens privadas com envio de fotos, vídeos e áudios",
      "Chamadas de voz e vídeo",
      "Upload ilimitado de fotos e vídeos",
      "Perfil super destacado + badge verificado",
      "Estatísticas e analytics avançados",
      "Criar comunidades privadas",
      "Moderação avançada",
      "Suporte dedicado"
    ],
    limitations: [
      "Sem acesso à API"
    ],
  },
]

const PricingContent: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const handleSubscribe = (plan: Plan) => {
    if (!user) {
      window.location.href = "/auth/signin?redirectTo=/pricing"
      return
    }
    if (plan.id === "free") return
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Escolha seu plano</h1>
        <p className="text-base sm:text-lg text-center text-muted-foreground mb-8">Desbloqueie todo o potencial do OpenLove e conecte-se com pessoas incríveis</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 flex flex-col items-center p-6 transition-all ${plan.popular ? "border-pink-500 scale-105" : "border-gray-200 dark:border-white/10"}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow">MAIS POPULAR</span>
              )}
              <div className="mb-3">{plan.icon}</div>
              <h2 className="text-xl font-bold mb-1 text-center">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mb-2 text-center">{plan.description}</p>
              <div className="text-3xl font-extrabold mb-2 text-center">{plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}<span className="text-base font-normal">/mês</span></div>
              <ul className="mb-4 space-y-1 text-sm text-left w-full max-w-xs mx-auto">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-green-600 dark:text-green-400"><Check className="w-4 h-4" />{f}</li>
                ))}
                {plan.limitations.length > 0 && <li className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">Limitações:</li>}
                {plan.limitations.map((l, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400 dark:text-gray-500"><X className="w-4 h-4" />{l}</li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-lg font-semibold mt-auto transition-all ${plan.id === "free" ? "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300" : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg"}`}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
              >
                {plan.id === "free" ? "Seu plano atual" : loading === plan.id ? "Processando..." : "Assinar"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de pagamento Mercado Pago */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={() => setShowCheckout(false)}>&times;</button>
            <CheckoutForm user={user} plano={selectedPlan.id === "ouro" ? "gold" : "diamante"} onSuccess={() => setShowCheckout(false)} onError={() => setShowCheckout(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingContent
