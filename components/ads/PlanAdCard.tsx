'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Crown, Zap, ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCanAccess } from '@/lib/plans/hooks'

interface PlanAdCardProps {
  variant?: 'compact' | 'full' | 'banner'
  targetPlan?: 'gold' | 'diamante' | 'diamante_anual'
  showClose?: boolean
  onClose?: () => void
  className?: string
}

export default function PlanAdCard({ 
  variant = 'compact', 
  targetPlan = 'gold',
  showClose = false,
  onClose,
  className 
}: PlanAdCardProps) {
  const router = useRouter()
  const canAccess = useCanAccess()
  const [dismissed, setDismissed] = useState(false)

  const planConfig = {
    gold: {
      name: 'Open Ouro',
      price: 'R$ 25,00',
      period: '/mês',
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      benefits: [
        'Upload de 5 imagens por post',
        'Vídeos até 25MB',
        'Mensagens privadas',
        'Criar enquetes',
        'Participar de 3 comunidades'
      ],
      cta: 'Seja Premium',
      badge: 'Mais Popular'
    },
    diamante: {
      name: 'Open Diamante',
      price: 'R$ 45,90',
      period: '/mês',
      icon: Crown,
      color: 'from-purple-400 to-pink-500',
      benefits: [
        'Upload ilimitado de mídia',
        'Vídeos até 50MB',
        'Chamadas de voz e vídeo',
        'Criar comunidades privadas',
        'Badge verificado'
      ],
      cta: 'Seja VIP',
      badge: 'Completo'
    },
    diamante_anual: {
      name: 'Open Diamante Anual',
      price: 'R$ 459,00',
      period: '/ano',
      icon: Crown,
      color: 'from-purple-400 to-pink-500',
      benefits: [
        'Tudo do Diamante',
        '2 meses grátis',
        '16% de desconto',
        'Pagamento único',
        'Sem renovação mensal'
      ],
      cta: 'Economize 16%',
      badge: 'Melhor Oferta'
    }
  }

  const config = planConfig[targetPlan]
  const IconComponent = config.icon

  // Não mostrar se usuário já tem plano superior
  if (canAccess.currentPlan === 'diamante' || canAccess.currentPlan === 'diamante_anual') {
    return null
  }

  if (dismissed) {
    return null
  }

  const handleClose = () => {
    setDismissed(true)
    onClose?.()
  }

  const handleUpgrade = () => {
    router.push(`/pricing?plan=${targetPlan}`)
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-r p-1",
        config.color,
        className
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full bg-gradient-to-r text-white",
                config.color
              )}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{config.name}</h3>
                <p className="text-sm text-gray-600">
                  {config.price}{config.period} • {config.benefits[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("bg-gradient-to-r text-white", config.color)}>
                {config.badge}
              </Badge>
              <Button onClick={handleUpgrade} size="sm">
                {config.cta}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              {showClose && (
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        {showClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          config.color
        )} />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full bg-gradient-to-r text-white",
                config.color
              )}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription className="text-sm">
                  {config.price}{config.period}
                </CardDescription>
              </div>
            </div>
            <Badge className={cn("bg-gradient-to-r text-white", config.color)}>
              {config.badge}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 mb-4">
            {config.benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button onClick={handleUpgrade} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            {config.cta}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // variant === 'full'
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {showClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        config.color
      )} />
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className={cn(
            "p-4 rounded-full bg-gradient-to-r text-white",
            config.color
          )}>
            <IconComponent className="w-8 h-8" />
          </div>
        </div>
        
        <CardTitle className="text-2xl">{config.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-primary">
            {config.price}
          </span>
          <span className="text-gray-600">{config.period}</span>
        </CardDescription>
        
        <Badge className={cn("bg-gradient-to-r text-white w-fit mx-auto", config.color)}>
          {config.badge}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {config.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
        
        <Button onClick={handleUpgrade} className="w-full" size="lg">
          <Zap className="w-4 h-4 mr-2" />
          {config.cta}
        </Button>
      </CardContent>
    </Card>
  )
}