"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, Crown, Zap } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { loadStripe } from "@stripe/stripe-js"
import PaymentProvider from "@/app/components/PaymentProvider"

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
    ] },
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
    ] },
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
    ] },
]

const PricingContent: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  console.log("PricingContent renderizado:", { user, showCheckout, selectedPlan });

  const handleSubscribe = (plan: Plan) => {
    console.log("handleSubscribe chamado com plano:", plan);
    
    if (!user) {
      console.log("Usuário não logado, redirecionando para login");
      window.location.href = "/auth/signin?redirectTo=/pricing"
      return
    }
    
    if (plan.id === "free") {
      console.log("Plano gratuito selecionado, não abrindo checkout");
      return
    }
    
    console.log("Abrindo checkout para plano:", plan.id);
    setSelectedPlan(plan)
    setShowCheckout(true)
  }

  const handleCloseCheckout = () => {
    console.log("Fechando checkout");
    setShowCheckout(false)
    setSelectedPlan(null)
  }

  const handleCheckoutSuccess = (data: any) => {
    console.log("Checkout sucesso:", data);
    handleCloseCheckout()
  }

  const handleCheckoutError = (error: string) => {
    console.log("Checkout erro:", error);
    handleCloseCheckout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 flex flex-col items-center justify-center py-12 lg:py-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-4">Escolha seu plano</h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">Desbloqueie todo o potencial do OpenLove e conecte-se com pessoas incríveis</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 flex flex-col items-center p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${plan.popular ? "border-pink-500 scale-105 shadow-pink-500/20" : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}>
              {plan.popular && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">MAIS POPULAR</span>
              )}
              
              {/* Ícone */}
              <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
                {plan.icon}
              </div>
              
              {/* Título */}
              <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-center">{plan.name}</h2>
              
              {/* Descrição */}
              <p className="text-sm lg:text-base text-muted-foreground mb-6 text-center leading-relaxed max-w-sm">{plan.description}</p>
              
              {/* Preço */}
              <div className="text-4xl lg:text-5xl font-extrabold mb-6 text-center">
                {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}
                <span className="text-lg lg:text-xl font-normal text-muted-foreground">/mês</span>
              </div>
              
              {/* Features */}
              <div className="w-full space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-center mb-4 text-green-600 dark:text-green-400">Recursos Inclusos:</h3>
                <ul className="space-y-3 text-sm lg:text-base">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-green-600 dark:text-green-400">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Limitações */}
                {plan.limitations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-center mb-4 text-gray-500 dark:text-gray-400">Limitações:</h3>
                    <ul className="space-y-3 text-sm lg:text-base">
                      {plan.limitations.map((l, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400 dark:text-gray-500">
                          <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Botão */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${plan.id === "free" ? "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700" : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl"}`}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
              >
                {plan.id === "free" ? "Seu plano atual" : loading === plan.id ? "Processando..." : "Assinar Agora"}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal de pagamento Stripe */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold z-10" 
              onClick={handleCloseCheckout}
            >
              ×
            </button>
            <div className="p-6">
              <PaymentProvider 
                planType={selectedPlan.id === "ouro" ? "gold" : "diamond"} 
                userEmail={user.email}
                userId={user.id}
                onSuccess={handleCheckoutSuccess} 
                onError={handleCheckoutError} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingContent
