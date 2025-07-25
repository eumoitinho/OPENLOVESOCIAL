"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"
import PaymentProvider from "@/app/components/PaymentProvider"
import { Shield, CreditCard, CheckCircle } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const plano = searchParams.get("plano") as "gold" | "diamond" | "diamond_annual"
  const userId = searchParams.get("userId")
  const email = searchParams.get("email")
  const isUpgrade = searchParams.get("upgrade") === "true"

  useEffect(() => {
    // Se não tiver userId e email (vindo do signup), verificar se o usuário está logado
    if (!userId && !email) {
      if (!authLoading && !user) {
        router.push("/auth/signin?redirectTo=/checkout?plano=" + plano)
        return
      }
    }

    // Se temos userId e email dos parâmetros (vindo do signup), permitir acesso
    if (userId && email) {
      console.log("Checkout com dados do signup:", { userId, email, plano })
    }

    if (!plano || !["gold", "diamond", "diamond_annual"].includes(plano)) {
      setError("Plano inválido")
      return
    }
  }, [user, authLoading, plano, userId, email, router])

  // Se estamos aguardando auth e não temos dados do signup, mostrar loading
  if (authLoading && !userId && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Se não tiver user nem dados do signup, aguardar ou redirecionar
  if (!user && !userId && !email) {
    return null // Será redirecionado pelo useEffect
  }

  // Usar dados do usuário logado ou dos parâmetros (signup)
  const currentUser = user || { id: userId, email: email }
  const currentUserId = user?.id || userId || ''
  const currentEmail = user?.email || email || ''

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/pricing")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Voltar aos Planos
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Processado!</h1>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isUpgrade ? "Upgrade de Plano" : "Finalizar Assinatura"}
          </h1>
          <p className="text-gray-600">
            {isUpgrade 
              ? `Faça o upgrade para o plano ${plano === "gold" ? "Gold" : plano === "diamond" ? "Diamond" : "Diamond Anual"}`
              : `Complete seu pagamento para acessar o plano ${plano === "gold" ? "Gold" : plano === "diamond" ? "Diamond" : "Diamond Anual"}`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <PaymentProvider
              planType={plano}
              userEmail={currentEmail}
              userId={currentUserId}
              isUpgrade={isUpgrade}
              onSuccess={() => {
                setSuccess(true)
                // Redirecionar para timeline após sucesso
                setTimeout(() => {
                  router.push('/timeline?payment=success&upgrade=' + isUpgrade)
                }, 2000)
              }}
              onError={(error: string) => setError(error)}
            />
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6">
            {/* Resumo do Plano */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo do Plano</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plano:</span>
                  <span className="font-medium">
                    {plano === "gold" ? "Gold" : 
                     plano === "diamond" ? "Diamond" : "Diamond Anual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium">
                    R$ {plano === "gold" ? "25,00" : 
                        plano === "diamond" ? "45,90" : "459,00"} /{plano === "diamond_annual" ? "ano" : "mês"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usuário:</span>
                  <span className="font-medium">{currentEmail}</span>
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Benefícios Inclusos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {plano === "gold" ? (
                  <>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Participar de até 3 comunidades
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Eventos ilimitados
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Criar até 2 eventos/mês
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Mensagens com fotos
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Upload ilimitado de fotos
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Participar de até 5 comunidades
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Criar até 10 eventos/mês
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Chamadas de voz e vídeo
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Upload ilimitado
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Badge verificado
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Segurança */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Pagamento Seguro</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Seus dados estão protegidos com criptografia SSL de 256 bits.
              </p>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-xs text-gray-500">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 