"use client"

import { Crown, Star, Zap } from 'lucide-react'
import { usePremiumFeatures, getPlanName, getPlanColor, type PlanType } from '@/lib/hooks/usePremiumFeatures'

interface PremiumBadgeProps {
  planType?: PlanType
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function PremiumBadge({ 
  planType, 
  size = 'md', 
  showText = true, 
  className = '' 
}: PremiumBadgeProps) {
  const { planType: userPlanType, isPremium } = usePremiumFeatures()
  
  const currentPlan = planType || userPlanType
  
  // Não mostrar badge para usuários gratuitos
  if (currentPlan === 'free' || !isPremium) {
    return null
  }
  
  const planColor = getPlanColor(currentPlan)
  const planName = getPlanName(currentPlan)
  
  const getIcon = () => {
    switch (currentPlan) {
      case 'gold':
        return <Crown className={`${getSizeClasses().icon} text-yellow-600`} />
      case 'diamond':
      case 'diamond_annual':
        return <Star className={`${getSizeClasses().icon} text-blue-600`} />
      default:
        return <Zap className={`${getSizeClasses().icon} text-gray-600`} />
    }
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          text: 'text-xs'
        }
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          text: 'text-base'
        }
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          text: 'text-sm'
        }
    }
  }
  
  const getColorClasses = () => {
    switch (planColor) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }
  
  const sizeClasses = getSizeClasses()
  const colorClasses = getColorClasses()
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium
      ${sizeClasses.container} ${colorClasses} ${className}
    `}>
      {getIcon()}
      {showText && (
        <span className={sizeClasses.text}>
          {planName}
        </span>
      )}
    </div>
  )
}

// Componente específico para verificação
export function VerifiedBadge({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const { hasVerifiedBadge } = usePremiumFeatures()
  
  if (!hasVerifiedBadge()) {
    return null
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`} title="Perfil verificado">
      <Star className={`${getSizeClasses()} text-blue-500 fill-blue-500`} />
    </div>
  )
}