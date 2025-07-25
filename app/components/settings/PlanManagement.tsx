"use client"

import { useState, useEffect } from "react"
import { Crown, Calendar, CreditCard, ArrowUpRight, Check, X } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import UpgradePlanButton from "@/app/components/UpgradePlanButton"

interface PlanInfo {
  id: string
  name: string
  currentPlan: string
  planStatus: string
  memberSince: string
}

interface UpgradeOption {
  plan: string
  name: string
  price: string
  description: string
}

interface PlanChange {
  id: string
  from_plan: string
  to_plan: string
  status: string
  created_at: string
}

export default function PlanManagement() {
  const { user } = useAuth()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([])
  const [planHistory, setPlanHistory] = useState<PlanChange[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPlanInfo()
    }
  }, [user])

  const fetchPlanInfo = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/upgrade-plan?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setPlanInfo(data.data.user)
        setUpgradeOptions(data.data.upgradeOptions)
        setPlanHistory(data.data.planHistory)
      }
    } catch (error) {
      console.error('Erro ao buscar informações do plano:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      diamond: 'bg-blue-100 text-blue-800',
      diamond_annual: 'bg-purple-100 text-purple-800'
    }
    return colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPlanName = (plan: string) => {
    const names = {
      free: 'Gratuito',
      gold: 'Gold',
      diamond: 'Diamond',
      diamond_annual: 'Diamond Anual'
    }
    return names[plan as keyof typeof names] || 'Desconhecido'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="w-4 h-4 text-green-500" />
      case 'pending':
        return <CreditCard className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      active: 'Ativo',
      pending: 'Aguardando Pagamento',
      cancelled: 'Cancelado',
      expired: 'Expirado'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!planInfo) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar informações
          </h3>
          <p className="text-gray-600">
            Não foi possível carregar as informações do seu plano.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plano Atual */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Seu Plano Atual</h2>
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-gray-600" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(planInfo.currentPlan)}`}>
              {getPlanName(planInfo.currentPlan)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Status</p>
            <div className="flex items-center space-x-2">
              {getStatusIcon(planInfo.planStatus)}
              <span className="font-medium">{getStatusText(planInfo.planStatus)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">Membro desde</p>
            <p className="font-medium">{formatDate(planInfo.memberSince)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">E-mail</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Opções de Upgrade */}
      {upgradeOptions.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upgrades Disponíveis</h2>
              <p className="text-gray-600 mt-1">Desbloqueie mais recursos com um plano premium</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgradeOptions.map((option) => (
              <div
                key={option.plan}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{option.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${
                    option.plan === 'gold' ? 'bg-yellow-400' :
                    option.plan === 'diamond' ? 'bg-blue-400' : 
                    'bg-purple-400'
                  }`}></div>
                </div>
                
                <p className="text-2xl font-bold text-gray-900 mb-2">{option.price}</p>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                
                <UpgradePlanButton
                  currentPlan={planInfo.currentPlan}
                  targetPlan={option.plan as "gold" | "diamond" | "diamond_annual"}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Mudanças */}
      {planHistory.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Planos</h2>
          
          <div className="space-y-3">
            {planHistory.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {getPlanName(change.from_plan)} → {getPlanName(change.to_plan)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(change.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(change.status)}
                  <span className="text-sm text-gray-600">
                    {getStatusText(change.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Precisa de ajuda?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Entre em contato conosco se tiver dúvidas sobre seu plano ou quiser fazer um downgrade.
            </p>
            <p className="text-sm text-blue-600 mt-2">suporte@openlove.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}