'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCanAccess } from '@/lib/plans/hooks'
import { usePaywall } from '@/lib/plans/paywall'
import PaywallModal from '@/components/plan-limits/PaywallModal'
import { Crown, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumActionProps {
  feature: string
  requiredPlan?: 'gold' | 'diamante' | 'diamante_anual'
  children: ReactNode
  className?: string
  disabled?: boolean
  fallbackAction?: () => void
  showPremiumBadge?: boolean
}

export default function PremiumAction({
  feature,
  requiredPlan = 'gold',
  children,
  className,
  disabled = false,
  fallbackAction,
  showPremiumBadge = true
}: PremiumActionProps) {
  const canAccess = useCanAccess()
  const { paywall, requireFeature, closePaywall } = usePaywall()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const planConfig = {
    gold: { icon: Star, color: 'text-yellow-500', name: 'Ouro' },
    diamante: { icon: Crown, color: 'text-purple-500', name: 'Diamante' },
    diamante_anual: { icon: Crown, color: 'text-purple-500', name: 'Diamante' }
  }

  const config = planConfig[requiredPlan]
  const IconComponent = config.icon

  // Verificar se usuário pode usar o recurso
  const canUseFeature = () => {
    switch (feature) {
      case 'upload_multiple_images':
        return canAccess.canUploadImages
      case 'upload_video':
        return canAccess.canUploadVideo
      case 'create_event':
        return canAccess.canCreateEvents
      case 'create_community':
        return canAccess.canCreateCommunities
      case 'send_message':
        return canAccess.canSendMessages
      case 'create_poll':
        return canAccess.canCreatePolls
      case 'voice_call':
        return canAccess.canMakeVoiceCalls
      case 'video_call':
        return canAccess.canMakeVideoCalls
      case 'create_paid_content':
        return canAccess.canCreatePaidContent
      case 'analytics':
        return canAccess.canAccessAnalytics
      default:
        return canAccess.currentPlan !== 'free'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    if (!canUseFeature()) {
      e.preventDefault()
      
      // Mostrar paywall
      if (!requireFeature(feature)) {
        setShowUpgrade(true)
      }
      
      // Executar ação alternativa se fornecida
      fallbackAction?.()
      return
    }

    // Se chegou aqui, usuário pode usar o recurso
    // O evento continua normalmente
  }

  const getFeatureDescription = () => {
    const descriptions = {
      upload_multiple_images: 'Upload de múltiplas imagens',
      upload_video: 'Upload de vídeos',
      create_event: 'Criação de eventos',
      create_community: 'Criação de comunidades',
      send_message: 'Mensagens privadas',
      create_poll: 'Criação de enquetes',
      voice_call: 'Chamadas de voz',
      video_call: 'Chamadas de vídeo',
      create_paid_content: 'Conteúdo pago',
      analytics: 'Estatísticas avançadas'
    }
    return descriptions[feature as keyof typeof descriptions] || 'Recurso premium'
  }

  // Renderizar o componente filho com eventos interceptados
  const renderChild = () => {
    if (typeof children === 'object' && children !== null && 'type' in children) {
      // Se é um componente React, clonar com props adicionais
      return (
        <div 
          onClick={handleClick}
          className={cn(
            "relative",
            !canUseFeature() && "cursor-pointer",
            className
          )}
        >
          {children}
          
          {/* Badge premium se necessário */}
          {showPremiumBadge && !canUseFeature() && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white",
                requiredPlan === 'gold' ? 'from-yellow-400 to-orange-500' : 'from-purple-400 to-pink-500'
              )}>
                <IconComponent className="w-3 h-3" />
                {config.name}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Se é um elemento simples, envolver em div
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "relative",
          !canUseFeature() && "cursor-pointer",
          className
        )}
      >
        {children}
        
        {/* Badge premium se necessário */}
        {showPremiumBadge && !canUseFeature() && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white",
              requiredPlan === 'gold' ? 'from-yellow-400 to-orange-500' : 'from-purple-400 to-pink-500'
            )}>
              <IconComponent className="w-3 h-3" />
              {config.name}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {renderChild()}
      
      {/* Modal de paywall */}
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

// Componente especial para botões premium
export function PremiumButton({
  feature,
  requiredPlan = 'gold',
  children,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: PremiumActionProps & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}) {
  const canAccess = useCanAccess()
  const { requireFeature } = usePaywall()

  const canUseFeature = () => {
    switch (feature) {
      case 'upload_multiple_images':
        return canAccess.canUploadImages
      case 'upload_video':
        return canAccess.canUploadVideo
      case 'create_event':
        return canAccess.canCreateEvents
      case 'create_community':
        return canAccess.canCreateCommunities
      case 'send_message':
        return canAccess.canSendMessages
      case 'create_poll':
        return canAccess.canCreatePolls
      case 'voice_call':
        return canAccess.canMakeVoiceCalls
      case 'video_call':
        return canAccess.canMakeVideoCalls
      case 'create_paid_content':
        return canAccess.canCreatePaidContent
      case 'analytics':
        return canAccess.canAccessAnalytics
      default:
        return canAccess.currentPlan !== 'free'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!canUseFeature()) {
      e.preventDefault()
      requireFeature(feature)
      return
    }
    
    // Chamar onClick original se existir
    props.onClick?.(e)
  }

  const planConfig = {
    gold: { icon: Star, name: 'Ouro' },
    diamante: { icon: Crown, name: 'Diamante' },
    diamante_anual: { icon: Crown, name: 'Diamante' }
  }

  const config = planConfig[requiredPlan]
  const IconComponent = config.icon

  return (
    <Button
      {...props}
      className={cn(
        "relative",
        !canUseFeature() && "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600",
        className
      )}
      variant={canUseFeature() ? variant : 'default'}
      size={size}
      onClick={handleClick}
    >
      {!canUseFeature() && (
        <IconComponent className="w-4 h-4 mr-2" />
      )}
      {children}
      {!canUseFeature() && (
        <span className="ml-2 text-xs">• {config.name}</span>
      )}
    </Button>
  )
}