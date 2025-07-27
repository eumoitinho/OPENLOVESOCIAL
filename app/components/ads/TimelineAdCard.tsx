"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Crown, Zap, X, ArrowRight, Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface TimelineAdCardProps {
  plan: 'gold' | 'diamante'
  onDismiss?: () => void
  className?: string
}

export default function TimelineAdCard({ 
  plan, 
  onDismiss, 
  className 
}: TimelineAdCardProps) {
  const router = useRouter()
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
        'Sem anúncios'
      ],
      badge: 'Mais Popular',
      badgeColor: 'bg-yellow-500',
      description: 'Destaque-se com recursos premium'
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
        'Chamadas de voz/vídeo'
      ],
      badge: 'Premium',
      badgeColor: 'bg-purple-500',
      description: 'A experiência completa do OpenLove'
    }
  }

  const config = planConfig[plan]
  const Icon = config.icon

  return (
    <Card className={cn(
      "relative border-2 border-dashed border-gray-200 dark:border-gray-700",
      "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
      "transition-all duration-300 hover:shadow-lg",
      className
    )}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600 z-10"
          onClick={handleDismiss}
        >
          <X size={14} />
        </Button>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/openlove-logo.png" />
            <AvatarFallback className={cn(
              "bg-gradient-to-r text-white font-bold",
              config.color
            )}>
              OL
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                OpenLove
              </h3>
              <Badge className={cn("text-xs", config.badgeColor)}>
                Patrocinado
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Promovido • {config.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r",
            config.color
          )}>
            <Icon size={24} className="text-white" />
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {config.name}
            </h4>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {config.price}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1">
                <Zap size={12} className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 text-xs">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleUpgrade}
            className={cn(
              "w-full bg-gradient-to-r text-white font-medium",
              config.color,
              "hover:shadow-lg transition-all duration-200"
            )}
          >
            Assinar {config.name}
            <ArrowRight size={14} className="ml-2" />
          </Button>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Cancele quando quiser • Sem taxas ocultas
          </div>
        </div>

        {/* Fake engagement buttons to make it look like a real post */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
              <Heart size={16} />
              <span className="text-sm">128</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle size={16} />
              <span className="text-sm">24</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
              <Share2 size={16} />
              <span className="text-sm">12</span>
            </button>
          </div>
          <div className="text-xs text-gray-400">
            há 2 horas
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 