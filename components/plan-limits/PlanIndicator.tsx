'use client'

import { Badge, Card, CardBody, Progress, Button } from "@heroui/react"
import { Crown, Star, Zap, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlanLimits, useCanAccess, usePlanUsage } from "@/lib/plans/hooks"
import { PLAN_NAMES, PLAN_PRICES } from "@/lib/plans/config"

interface PlanIndicatorProps {
  variant?: 'compact' | 'detailed'
  showUpgrade?: boolean
}

export default function PlanIndicator({ variant = 'compact', showUpgrade = true }: PlanIndicatorProps) {
  const router = useRouter()
  const limits = usePlanLimits()
  const canAccess = useCanAccess()
  const usage = usePlanUsage()
  
  const getPlanIcon = () => {
    switch (canAccess.currentPlan) {
      case 'diamond':
      case 'diamond_annual':
        return <Crown className="w-4 h-4 text-purple-500" />
      case 'gold':
        return <Star className="w-4 h-4 text-amber-500" />
      default:
        return <Zap className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getPlanColor = () => {
    switch (canAccess.currentPlan) {
      case 'diamond':
      case 'diamond_annual':
        return 'secondary'
      case 'gold':
        return 'warning'
      default:
        return 'default'
    }
  }
  
  const getProgressColor = (used: number, max: number) => {
    const percentage = max > 0 ? (used / max) * 100 : 0
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    return 'success'
  }
  
  const handleUpgrade = () => {
    if (canAccess.currentPlan === 'free') {
      router.push('/checkout?plano=gold')
    } else if (canAccess.currentPlan === 'gold') {
      router.push('/checkout?plano=diamond')
    }
  }
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          color={getPlanColor() as any}
          variant="flat"
          startContent={getPlanIcon()}
        >
          {PLAN_NAMES[canAccess.currentPlan]}
        </Badge>
        
        {showUpgrade && canAccess.currentPlan !== 'diamond' && canAccess.currentPlan !== 'diamond_annual' && (
          <Button
            size="sm"
            color="primary"
            variant="light"
            onPress={handleUpgrade}
            startContent={<TrendingUp className="w-3 h-3" />}
          >
            Upgrade
          </Button>
        )}
      </div>
    )
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getPlanIcon()}
            <div>
              <h3 className="font-semibold text-sm">
                {PLAN_NAMES[canAccess.currentPlan]}
              </h3>
              <p className="text-xs text-gray-500">
                {canAccess.currentPlan === 'free' ? 'Gratuito' : `R$ ${PLAN_PRICES[canAccess.currentPlan].monthly.toFixed(2)}/mês`}
              </p>
            </div>
          </div>
          
          <Badge 
            color={canAccess.isActive ? 'success' : 'danger'}
            variant="flat"
            size="sm"
          >
            {canAccess.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        
        {/* Limites de uso */}
        <div className="space-y-3">
          {/* Vídeos mensais */}
          {limits.maxVideosPerMonth > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Vídeos este mês</span>
                <span>{usage.videosThisMonth}/{limits.maxVideosPerMonth === -1 ? '∞' : limits.maxVideosPerMonth}</span>
              </div>
              <Progress 
                value={limits.maxVideosPerMonth === -1 ? 0 : (usage.videosThisMonth / limits.maxVideosPerMonth) * 100}
                color={getProgressColor(usage.videosThisMonth, limits.maxVideosPerMonth)}
                size="sm"
              />
            </div>
          )}
          
          {/* Eventos mensais */}
          {limits.maxEventsPerMonth > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Eventos este mês</span>
                <span>{usage.eventsCreatedThisMonth}/{limits.maxEventsPerMonth === -1 ? '∞' : limits.maxEventsPerMonth}</span>
              </div>
              <Progress 
                value={limits.maxEventsPerMonth === -1 ? 0 : (usage.eventsCreatedThisMonth / limits.maxEventsPerMonth) * 100}
                color={getProgressColor(usage.eventsCreatedThisMonth, limits.maxEventsPerMonth)}
                size="sm"
              />
            </div>
          )}
          
          {/* Comunidades */}
          {limits.maxCommunities > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Comunidades</span>
                <span>{usage.communitiesJoined}/{limits.maxCommunities === -1 ? '∞' : limits.maxCommunities}</span>
              </div>
              <Progress 
                value={limits.maxCommunities === -1 ? 0 : (usage.communitiesJoined / limits.maxCommunities) * 100}
                color={getProgressColor(usage.communitiesJoined, limits.maxCommunities)}
                size="sm"
              />
            </div>
          )}
        </div>
        
        {/* Botão de upgrade */}
        {showUpgrade && canAccess.currentPlan !== 'diamond' && canAccess.currentPlan !== 'diamond_annual' && (
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onPress={handleUpgrade}
            className="w-full mt-4"
            startContent={<TrendingUp className="w-4 h-4" />}
          >
            {canAccess.currentPlan === 'free' ? 'Começar Premium' : 'Fazer Upgrade'}
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
