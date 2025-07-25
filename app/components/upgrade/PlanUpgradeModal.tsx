"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Crown, Check, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface UpgradeOption {
  plan: string
  name: string
  price: string
  description: string
  features?: string[]
}

interface PlanUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
}

export default function PlanUpgradeModal({ isOpen, onClose, currentPlan }: PlanUpgradeModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchUpgradeOptions()
    }
  }, [isOpen, user])

  const fetchUpgradeOptions = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/upgrade-plan?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setUpgradeOptions(data.data.upgradeOptions)
      }
    } catch (error) {
      console.error('Erro ao buscar opções de upgrade:', error)
    }
  }

  const handleUpgrade = async (targetPlan: string) => {
    if (!user) return

    setLoading(true)
    setSelectedPlan(targetPlan)

    try {
      // Primeiro, atualizar o status do plano para pending
      const upgradeResponse = await fetch('/api/users/upgrade-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPlan: targetPlan,
          currentPlan: currentPlan || 'free'
        })
      })

      const upgradeData = await upgradeResponse.json()

      if (upgradeData.success) {
        // Redirecionar para checkout
        router.push(`/checkout?plano=${targetPlan}&upgrade=true`)
        onClose()
      } else {
        console.error('Erro no upgrade:', upgradeData.error)
        alert('Erro ao processar upgrade: ' + upgradeData.error)
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error)
      alert('Erro ao processar upgrade. Tente novamente.')
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const getPlanFeatures = (plan: string): string[] => {
    const features = {
      gold: [
        'Participar de até 3 comunidades',
        'Criar até 2 eventos/mês',
        'Mensagens com fotos',
        'Upload ilimitado de fotos',
        'Chat com vídeo',
        'Suporte por email'
      ],
      diamond: [
        'Participar de até 5 comunidades',
        'Criar até 10 eventos/mês',
        'Chamadas de voz e vídeo',
        'Upload ilimitado',
        'Badge verificado',
        'Analytics avançados',
        'Suporte prioritário'
      ],
      diamond_annual: [
        'Todos os recursos Diamond',
        'Desconto de 17% no valor anual',
        'Suporte prioritário',
        'Beta de novas funcionalidades',
        'Sem taxa de setup'
      ]
    }
    return features[plan as keyof typeof features] || []
  }

  const getPlanColor = (plan: string) => {
    const colors = {
      gold: 'from-yellow-400 to-yellow-600',
      diamond: 'from-blue-400 to-blue-600',
      diamond_annual: 'from-purple-400 to-purple-600'
    }
    return colors[plan as keyof typeof colors] || 'from-gray-400 to-gray-600'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade de Plano</h2>
            <p className="text-gray-600 mt-1">
              Escolha o plano ideal para você
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Plan Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Plano atual:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {currentPlan === 'free' ? 'Gratuito' : 
               currentPlan === 'gold' ? 'Gold' :
               currentPlan === 'diamond' ? 'Diamond' :
               currentPlan === 'diamond_annual' ? 'Diamond Anual' : 'Gratuito'}
            </span>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="p-6">
          {upgradeOptions.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Você já tem o melhor plano!
              </h3>
              <p className="text-gray-600">
                Não há upgrades disponíveis para seu plano atual.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upgradeOptions.map((option) => (
                <div
                  key={option.plan}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative"
                >
                  {/* Plan Header */}
                  <div className={`w-full h-2 bg-gradient-to-r ${getPlanColor(option.plan)} rounded-t-lg absolute top-0 left-0 right-0`}></div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {option.name}
                      </h3>
                      <Crown className={`w-6 h-6 ${option.plan === 'gold' ? 'text-yellow-500' : 'text-blue-500'}`} />
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {option.price}
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Incluído:</h4>
                      <ul className="space-y-2">
                        {getPlanFeatures(option.plan).slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {getPlanFeatures(option.plan).length > 4 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{getPlanFeatures(option.plan).length - 4} outros recursos
                        </p>
                      )}
                    </div>

                    {/* Upgrade Button */}
                    <button
                      onClick={() => handleUpgrade(option.plan)}
                      disabled={loading && selectedPlan === option.plan}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                        loading && selectedPlan === option.plan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${getPlanColor(option.plan)} text-white hover:opacity-90`
                      }`}
                    >
                      {loading && selectedPlan === option.plan ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <span>Fazer Upgrade</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>💳 Pagamento seguro com Stripe</p>
              <p>🔄 Cancele a qualquer momento</p>
            </div>
            <div className="text-right">
              <p>Dúvidas? Entre em contato</p>
              <p className="text-blue-600">suporte@openlove.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}