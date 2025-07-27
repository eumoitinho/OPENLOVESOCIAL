import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"

export interface MonthlyUsage {
  videos: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  audios: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  posts: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  events: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  communities: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
  messages: {
    used: number
    limit: number
    remaining: number
    percentage: number
  }
}

export interface UsageType {
  type: 'videos' | 'audios' | 'posts' | 'events' | 'communities' | 'messages'
  action: 'increment' | 'decrement'
  amount?: number
}

export const useMonthlyUsage = () => {
  const { user } = useAuth()
  const [usage, setUsage] = useState<MonthlyUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar uso mensal
  const loadUsage = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/users/monthly-usage')
      if (!response.ok) {
        throw new Error('Erro ao carregar uso mensal')
      }

      const data = await response.json()
      setUsage(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar uso mensal:', err)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar uso
  const updateUsage = async (updates: UsageType[]) => {
    if (!user) return

    try {
      const response = await fetch('/api/users/monthly-usage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar uso')
      }

      const data = await response.json()
      setUsage(data)
      return data
    } catch (err) {
      console.error('Erro ao atualizar uso:', err)
      throw err
    }
  }

  // Incrementar uso específico
  const incrementUsage = async (type: UsageType['type'], amount: number = 1) => {
    return updateUsage([{ type, action: 'increment', amount }])
  }

  // Decrementar uso específico
  const decrementUsage = async (type: UsageType['type'], amount: number = 1) => {
    return updateUsage([{ type, action: 'decrement', amount }])
  }

  // Verificar se pode usar recurso
  const canUseResource = (type: UsageType['type'], amount: number = 1): boolean => {
    if (!usage) return false
    
    const resourceUsage = usage[type]
    if (resourceUsage.limit === -1) return true // Ilimitado
    
    return resourceUsage.remaining >= amount
  }

  // Obter status de um recurso específico
  const getResourceStatus = (type: UsageType['type']) => {
    if (!usage) return null

    const resourceUsage = usage[type]
    const isUnlimited = resourceUsage.limit === -1
    const isNearLimit = resourceUsage.percentage >= 80
    const isAtLimit = resourceUsage.remaining <= 0

    return {
      ...resourceUsage,
      isUnlimited,
      isNearLimit,
      isAtLimit,
      status: isAtLimit ? 'blocked' : isNearLimit ? 'warning' : 'normal'
    }
  }

  // Obter recursos que estão próximos do limite
  const getResourcesNearLimit = (threshold: number = 80) => {
    if (!usage) return []

    return Object.entries(usage).filter(([_, resourceUsage]) => {
      return resourceUsage.limit > 0 && resourceUsage.percentage >= threshold
    }).map(([type, resourceUsage]) => ({
      type,
      ...resourceUsage
    }))
  }

  // Obter recursos que atingiram o limite
  const getResourcesAtLimit = () => {
    if (!usage) return []

    return Object.entries(usage).filter(([_, resourceUsage]) => {
      return resourceUsage.limit > 0 && resourceUsage.remaining <= 0
    }).map(([type, resourceUsage]) => ({
      type,
      ...resourceUsage
    }))
  }

  // Calcular dias restantes no mês
  const getDaysRemainingInMonth = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const diffTime = lastDay.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calcular uso médio diário
  const getDailyAverageUsage = (type: UsageType['type']) => {
    if (!usage) return 0

    const now = new Date()
    const currentDay = now.getDate()
    const resourceUsage = usage[type]
    
    return currentDay > 0 ? resourceUsage.used / currentDay : 0
  }

  // Prever se o limite será atingido
  const willReachLimit = (type: UsageType['type']) => {
    if (!usage) return false

    const resourceUsage = usage[type]
    if (resourceUsage.limit === -1) return false

    const dailyAverage = getDailyAverageUsage(type)
    const daysRemaining = getDaysRemainingInMonth()
    const projectedUsage = resourceUsage.used + (dailyAverage * daysRemaining)

    return projectedUsage > resourceUsage.limit
  }

  // Resetar uso (para teste ou admin)
  const resetUsage = async (type?: UsageType['type']) => {
    if (!user) return

    try {
      const response = await fetch('/api/users/monthly-usage/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('Erro ao resetar uso')
      }

      await loadUsage()
    } catch (err) {
      console.error('Erro ao resetar uso:', err)
      throw err
    }
  }

  // Carregar uso ao montar componente e quando user mudar
  useEffect(() => {
    loadUsage()
  }, [user])

  // Recarregar a cada 5 minutos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(loadUsage, 5 * 60 * 1000) // 5 minutos
    return () => clearInterval(interval)
  }, [user])

  return {
    usage,
    loading,
    error,
    loadUsage,
    updateUsage,
    incrementUsage,
    decrementUsage,
    canUseResource,
    getResourceStatus,
    getResourcesNearLimit,
    getResourcesAtLimit,
    getDaysRemainingInMonth,
    getDailyAverageUsage,
    willReachLimit,
    resetUsage,
    
    // Helpers para recursos específicos
    videos: usage?.videos,
    audios: usage?.audios,
    posts: usage?.posts,
    events: usage?.events,
    communities: usage?.communities,
    messages: usage?.messages
  }
}

// Hook específico para um tipo de recurso
export const useResourceUsage = (type: UsageType['type']) => {
  const {
    usage,
    loading,
    error,
    incrementUsage,
    decrementUsage,
    canUseResource,
    getResourceStatus
  } = useMonthlyUsage()

  const resourceUsage = usage?.[type]
  const status = getResourceStatus(type)

  return {
    usage: resourceUsage,
    status,
    loading,
    error,
    canUse: (amount?: number) => canUseResource(type, amount),
    increment: (amount?: number) => incrementUsage(type, amount),
    decrement: (amount?: number) => decrementUsage(type, amount)
  }
}
