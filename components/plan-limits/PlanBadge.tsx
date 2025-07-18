'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, Star, Crown, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlanType } from '@/lib/plans/config'

interface PlanBadgeProps {
  plan: PlanType
  verified?: boolean
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
}

export default function PlanBadge({ plan, verified = false, variant = 'default', className }: PlanBadgeProps) {
  const planConfig = {
    free: {
      label: 'Gratuito',
      icon: null,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      show: false // Não mostrar badge para usuários gratuitos
    },
    gold: {
      label: 'Ouro',
      icon: Star,
      color: 'bg-amber-100 text-amber-700 border-amber-300'
    },
    diamante: {
      label: 'Diamante',
      icon: Crown,
      color: 'bg-purple-100 text-purple-700 border-purple-300'
    },
    diamante_anual: {
      label: 'Diamante',
      icon: Crown,
      color: 'bg-purple-100 text-purple-700 border-purple-300'
    }
  }

  const config = planConfig[plan]
  
  // Não mostrar badge para usuários gratuitos
  if (plan === 'free' && !verified) {
    return null
  }

  const IconComponent = config.icon
  const VerifiedIcon = CheckCircle

  if (variant === 'icon-only') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {IconComponent && <IconComponent className="w-4 h-4 text-amber-500" />}
        {verified && <VerifiedIcon className="w-4 h-4 text-blue-500" />}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Badge variant="secondary" className={cn(config.color, "text-xs", className)}>
        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
        {config.label}
        {verified && <VerifiedIcon className="w-3 h-3 ml-1" />}
      </Badge>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="secondary" className={cn(config.color, "text-xs")}>
        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
      {verified && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
          <VerifiedIcon className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      )}
    </div>
  )
}