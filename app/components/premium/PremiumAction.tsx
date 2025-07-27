"use client"

import { ReactNode, useState } from "react"
import { Button } from "@heroui/react"
import { useCanAccess } from "@/lib/plans/hooks"
import { usePaywall } from "@/lib/plans/paywall"
import PaywallModal from '@/components/plan-limits/PaywallModal'
import { Crown, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumActionProps {
  children: ReactNode
  feature: string
  requiredPlan?: 'gold' | 'diamond'
  fallback?: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export default function PremiumAction({
  children,
  feature,
  requiredPlan = 'gold',
  fallback,
  className,
  disabled = false,
  onClick
}: PremiumActionProps) {
  const canAccess = useCanAccess()
  const { paywall, requireFeature, closePaywall } = usePaywall()

  const handleClick = () => {
    // Verificar se o usuário tem acesso ao recurso
    const hasAccess = canAccess.plan !== 'free' && (
      requiredPlan === 'gold' ? 
        ['gold', 'diamond', 'diamond_annual'].includes(canAccess.plan) :
        ['diamond', 'diamond_annual'].includes(canAccess.plan)
    )

    if (hasAccess) {
      onClick?.()
    } else {
      requireFeature(feature)
    }
  }

  const isAccessible = canAccess.plan !== 'free' && (
    requiredPlan === 'gold' ? 
      ['gold', 'diamond', 'diamond_annual'].includes(canAccess.plan) :
      ['diamond', 'diamond_annual'].includes(canAccess.plan)
  )

  // Se o usuário não tem acesso e há um fallback, mostrar o fallback
  if (!isAccessible && fallback) {
    return <>{fallback}</>
  }

  // Se o usuário não tem acesso e não há fallback, mostrar versão bloqueada
  if (!isAccessible) {
    return (
      <>
        <div className={cn("relative", className)}>
          <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                {requiredPlan === 'gold' ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Star className="w-6 h-6 text-purple-500" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {requiredPlan === 'gold' ? 'Open Ouro' : 'Open Diamante'}
              </p>
              <Button
                size="sm"
                onClick={handleClick}
                className={cn(
                  "bg-gradient-to-r text-white text-xs",
                  requiredPlan === 'gold' 
                    ? "from-yellow-400 to-yellow-600" 
                    : "from-blue-400 to-purple-600"
                )}
              >
                Assinar
              </Button>
            </div>
          </div>
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        </div>

        {paywall.config && (
          <PaywallModal
            isOpen={paywall.isOpen}
            onClose={closePaywall}
            feature={paywall.config.feature}
            title={paywall.config.title}
            description={paywall.config.description}
            requiredPlan={paywall.config.requiredPlan}
          />
        )}
      </>
    )
  }

  // Se o usuário tem acesso, renderizar normalmente
  return (
    <>
      <div className={className} onClick={disabled ? undefined : handleClick}>
        {children}
      </div>

      {paywall.config && (
        <PaywallModal
          isOpen={paywall.isOpen}
          onClose={closePaywall}
          feature={paywall.config.feature}
          title={paywall.config.title}
          description={paywall.config.description}
          requiredPlan={paywall.config.requiredPlan}
        />
      )}
    </>
  )
} 
