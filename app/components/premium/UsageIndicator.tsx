'use client'

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Image, 
  Video, 
  MessageCircle, 
  Calendar, 
  Users, 
  Crown,
  AlertTriangle,
  TrendingUp
} from "lucide-react"
import { usePlanUsage, useUpgradeInfo } from "@/lib/plans/hooks"
import { usePaywall } from "@/lib/plans/paywall"
import PaywallModal from '@/components/plan-limits/PaywallModal'

interface UsageIndicatorProps {
  showDetails?: boolean
  className?: string
}

export default function UsageIndicator({ showDetails = false, className = "" }: UsageIndicatorProps) {
  const usage = usePlanUsage()
  const { nearLimits, usagePercentage, currentPlan } = useUpgradeInfo()
  const { paywall, closePaywall } = usePaywall()
  const [showAllMetrics, setShowAllMetrics] = useState(showDetails)

  const metrics = [
    {
      key: 'images',
      label: 'Imagens',
      icon: Image,
      current: usage.imagesThisMonth,
      max: usage.maxImagesPerMonth,
      percentage: usagePercentage.images,
      color: 'bg-blue-500'
    },
    {
      key: 'videos',
      label: 'Vídeos',
      icon: Video,
      current: usage.videosThisMonth,
      max: usage.maxVideosPerMonth,
      percentage: (usage.videosThisMonth / usage.maxVideosPerMonth) * 100,
      color: 'bg-purple-500'
    },
    {
      key: 'messages',
      label: 'Mensagens',
      icon: MessageCircle,
      current: usage.messagesSentThisMonth,
      max: usage.maxMessagesPerMonth,
      percentage: usagePercentage.messages,
      color: 'bg-green-500'
    },
    {
      key: 'events',
      label: 'Eventos',
      icon: Calendar,
      current: usage.eventsCreatedThisMonth,
      max: usage.maxEventsPerMonth,
      percentage: usagePercentage.events,
      color: 'bg-orange-500'
    }
  ]

  const visibleMetrics = showAllMetrics ? metrics : metrics.slice(0, 2)

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Uso do Plano
            </CardTitle>
            <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
              {currentPlan === 'free' ? 'Gratuito' : 
               currentPlan === 'gold' ? 'Open Ouro' : 
               currentPlan === 'diamond' ? 'Open Diamante' : currentPlan}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Métricas principais */}
          <div className="space-y-3">
            {visibleMetrics.map((metric) => {
              const Icon = metric.icon
              const isNearLimit = metric.percentage >= 80
              const isAtLimit = metric.percentage >= 100
              
              return (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{metric.label}</span>
                      {isNearLimit && !isAtLimit && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      {isAtLimit && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {metric.current}/{metric.max === -1 ? '∞' : metric.max}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(metric.percentage, 100)} 
                    className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
                  />
                  
                  {isAtLimit && (
                    <p className="text-xs text-red-600">
                      Limite mensal atingido
                    </p>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <p className="text-xs text-yellow-600">
                      Próximo do limite
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Avisos de limites próximos */}
          {nearLimits.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Limites próximos:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    {nearLimits.map((limit, index) => (
                      <li key={index} className="text-xs">• {limit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botão para upgrade */}
          {currentPlan !== 'diamond' && currentPlan !== 'diamond_annual' && (
            <div className="pt-2">
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                onClick={() => {
                  // Abrir modal de upgrade
                  console.log('Abrir modal de upgrade')
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                {currentPlan === 'free' ? 'Fazer Upgrade' : 'Upgrade para Diamond'}
              </Button>
            </div>
          )}

          {/* Botão para mostrar mais métricas */}
          {!showAllMetrics && metrics.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setShowAllMetrics(true)}
            >
              Ver mais métricas
            </Button>
          )}

          {/* Botão para esconder métricas */}
          {showAllMetrics && metrics.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setShowAllMetrics(false)}
            >
              Ver menos
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modal de Paywall */}
      <PaywallModal 
        isOpen={paywall.isOpen}
        onClose={closePaywall}
      />
    </>
  )
} 