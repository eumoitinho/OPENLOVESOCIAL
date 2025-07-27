'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Crown, Zap, X, ArrowRight, Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCanAccess } from '@/lib/plans/hooks'
import { motion } from 'framer-motion'

interface TimelineAdCardProps {
  targetPlan?: 'gold' | 'diamante' | 'diamante_anual'
  adType?: 'upgrade' | 'features' | 'discount'
  position?: number
  onClose?: () => void
}

export default function TimelineAdCard({ 
  targetPlan = 'gold',
  adType = 'upgrade',
  position = 0,
  onClose
}: TimelineAdCardProps) {
  const router = useRouter()
  const canAccess = useCanAccess()
  const [dismissed, setDismissed] = useState(false)

  const planConfig = {
    gold: {
      name: 'Open Ouro',
      price: 'R$ 25,00',
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      mockFeatures: ['Upload de 5 imagens', 'Vídeos até 25MB', 'Mensagens privadas']
    },
    diamante: {
      name: 'Open Diamante',
      price: 'R$ 45,90',
      icon: Crown,
      color: 'from-purple-400 to-pink-500',
      gradient: 'bg-gradient-to-r from-purple-400 to-pink-500',
      mockFeatures: ['Upload ilimitado', 'Chamadas de voz', 'Criar comunidades']
    },
    diamante_anual: {
      name: 'Open Diamante Anual',
      price: 'R$ 459,00',
      icon: Crown,
      color: 'from-purple-400 to-pink-500',
      gradient: 'bg-gradient-to-r from-purple-400 to-pink-500',
      mockFeatures: ['16% de desconto', '2 meses grátis', 'Pagamento único']
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

  const getAdContent = () => {
    const contents = {
      upgrade: {
        title: `Descubra o poder do ${config.name}`,
        description: `Por apenas ${config.price}/mês, tenha acesso a recursos que vão transformar sua experiência no OpenLove.`,
        cta: 'Fazer Upgrade',
        mockPost: 'Imagine poder enviar fotos e vídeos sem limite para seus matches...'
      },
      features: {
        title: 'Recursos Premium que você está perdendo',
        description: `Com o ${config.name}, você pode fazer muito mais do que imagina.`,
        cta: 'Ver Recursos',
        mockPost: 'Usuários premium têm 3x mais matches e conversas...'
      },
      discount: {
        title: 'Oferta especial por tempo limitado!',
        description: `${config.name} com desconto exclusivo. Não perca essa oportunidade única.`,
        cta: 'Aproveitar Oferta',
        mockPost: '🔥 Promoção relâmpago: Upgrade com desconto!'
      }
    }
    return contents[adType]
  }

  const content = getAdContent()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: position * 0.1 }}
    >
      <Card className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-700 shadow-lg relative overflow-hidden">
        {/* Indicador de AD */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            ANÚNCIO
          </Badge>
        </div>

        {/* Botão de fechar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Cabeçalho do AD */}
        <CardHeader className="pb-3 pt-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/openlove-logo.png" />
              <AvatarFallback className={cn("text-white", config.gradient)}>
                <IconComponent className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">OpenLove Premium</h3>
              <p className="text-xs text-gray-500">Patrocinado</p>
            </div>
          </div>
        </CardHeader>

        {/* Conteúdo do AD */}
        <CardContent className="space-y-4">
          {/* Mock post premium */}
          <div className={cn(
            "p-4 rounded-lg bg-gradient-to-r text-white relative overflow-hidden",
            config.color
          )}>
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">{content.title}</h4>
              <p className="text-sm opacity-90 mb-3">{content.description}</p>
              
              {/* Mock features */}
              <div className="space-y-1 mb-4">
                {config.mockFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="text-xs">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Preço */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold">{config.price}</span>
                <span className="text-sm opacity-75">/mês</span>
              </div>
            </div>

            {/* Padrão de background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
          </div>

          {/* Ações do AD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Heart className="w-4 h-4 mr-1" />
                Curtir
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <MessageCircle className="w-4 h-4 mr-1" />
                Comentar
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleUpgrade}
              className={cn(
                "w-full bg-gradient-to-r text-white hover:scale-105 transition-transform",
                config.color
              )}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {content.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">
            Upgrade para {config.name} e transforme sua experiência no OpenLove
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}