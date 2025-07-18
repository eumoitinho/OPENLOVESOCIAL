"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Crown, Zap, ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCanAccess } from '@/lib/plans/hooks'

interface PlanAdCardProps {
  plan: 'gold' | 'diamante'
  position?: 'sidebar' | 'timeline' | 'profile'
  onDismiss?: () => void
  className?: string
}

export default function PlanAdCard({ 
  plan, 
  position = 'sidebar', 
  onDismiss, 
  className 
}: PlanAdCardProps) {
  const router = useRouter()
  const canAccess = useCanAccess()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleUpgrade = () => {
    router.push(`/checkout?plano=${plan}`)
  }

  const planConfig = {
    gold: {
      name: 'Open Ouro',
      price: 'R$ 25,00/mês',
      color: 'from-yellow-400 to-yellow-600',
      icon: Crown,
      features: [
        'Upload de imagens ilimitado',
        'Vídeos até 25MB',
        'Perfil destacado',
        'Sem anúncios',
        'Suporte prioritário'
      ],
      badge: 'Mais Popular',
      badgeColor: 'bg-yellow-500'
    },
    diamante: {
      name: 'Open Diamante',
      price: 'R$ 45,90/mês',
      color: 'from-blue-400 to-purple-600',
      icon: Star,
      features: [
        'Tudo do Open Ouro',
        'Vídeos até 50MB',
        'Áudio e enquetes',
        'Comunidades ilimitadas',
        'Chamadas de voz/vídeo',
        'Analytics avançados'
      ],
      badge: 'Premium',
      badgeColor: 'bg-purple-500'
    }
  }

  const config = planConfig[plan]
  const Icon = config.icon

  return (
    <Card className={cn(
      "relative border-2 border-dashed transition-all duration-300 hover:shadow-lg",
      position === 'timeline' && "max-w-md mx-auto",
      position === 'sidebar' && "w-full",
      position === 'profile' && "w-full max-w-sm",
      className
    )}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600"
          onClick={handleDismiss}
        >
          <X size={14} />
        </Button>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-full bg-gradient-to-r",
              config.color
            )}>
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="text-sm">{config.price}</CardDescription>
            </div>
          </div>
          <Badge className={cn("text-xs", config.badgeColor)}>
            {config.badge}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {config.features.slice(0, position === 'sidebar' ? 3 : 5).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Zap size={12} className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
          {position === 'sidebar' && config.features.length > 3 && (
            <div className="text-xs text-gray-500">
              +{config.features.length - 3} recursos adicionais
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpgrade}
          className={cn(
            "w-full bg-gradient-to-r text-white font-medium",
            config.color,
            "hover:shadow-lg transition-all duration-200"
          )}
        >
          Assinar Agora
          <ArrowRight size={14} className="ml-2" />
        </Button>

        {position === 'timeline' && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Cancele quando quiser • Sem taxas ocultas
          </div>
        )}
      </CardContent>
    </Card>
  )
} 