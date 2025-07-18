"use client"

import { ReactNode } from 'react'
import { useCanAccess } from '@/lib/plans/hooks'
import { usePaywall } from '@/lib/plans/paywall'
import PaywallModal from '@/components/plan-limits/PaywallModal'
import { Crown, Star, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PremiumFeatureProps {
  children: ReactNode
  feature: string
  requiredPlan: 'gold' | 'diamante'
  fallback?: ReactNode
  showUpgradeButton?: boolean
  className?: string
}

export default function PremiumFeature({
  children,
  feature,
  requiredPlan,
  fallback,
  showUpgradeButton = true,
  className
}: PremiumFeatureProps) {
  const canAccess = useCanAccess()
  const { paywall, requireFeature, closePaywall } = usePaywall()

  const hasAccess = canAccess.plan !== 'free' && (
    requiredPlan === 'gold' ? 
      ['gold', 'diamante'].includes(canAccess.plan) :
      canAccess.plan === 'diamante'
  )

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center space-y-3 p-4">
            <div className="flex items-center justify-center">
              {requiredPlan === 'gold' ? (
                <Crown className="w-8 h-8 text-yellow-500" />
              ) : (
                <Star className="w-8 h-8 text-purple-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {requiredPlan === 'gold' ? 'Open Ouro' : 'Open Diamante'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Este recurso está disponível apenas para assinantes
              </p>
            </div>
            {showUpgradeButton && (
              <Button
                size="sm"
                onClick={() => requireFeature(feature)}
                className={cn(
                  "bg-gradient-to-r text-white font-medium",
                  requiredPlan === 'gold' 
                    ? "from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700" 
                    : "from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700"
                )}
              >
                <Lock className="w-4 h-4 mr-2" />
                Assinar {requiredPlan === 'gold' ? 'Open Ouro' : 'Open Diamante'}
              </Button>
            )}
          </div>
        </div>
        <div className="opacity-20 pointer-events-none select-none">
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