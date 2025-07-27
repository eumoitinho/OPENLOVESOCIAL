'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Lock, Sparkles } from "lucide-react"
import { useCanAccess } from "@/lib/plans/hooks"
import { usePaywall } from "@/lib/plans/paywall"
import PaywallModal from '@/components/plan-limits/PaywallModal'

interface PremiumLockBadgeProps {
  feature: string
  requiredPlan?: 'gold' | 'diamond'
  children?: React.ReactNode
  className?: string
  showUpgradeButton?: boolean
}

export default function PremiumLockBadge({ 
  feature, 
  requiredPlan = 'gold',
  children,
  className = "",
  showUpgradeButton = true
}: PremiumLockBadgeProps) {
  const canAccess = useCanAccess()
  const { paywall, requireFeature, closePaywall } = usePaywall()
  const [showDetails, setShowDetails] = useState(false)

  // Verificar se o usuário pode acessar a funcionalidade
  const canAccessFeature = (() => {
    switch (feature) {
      case 'upload_image':
        return canAccess.canUploadImages
      case 'upload_video':
        return canAccess.canUploadVideos
      case 'send_message':
        return canAccess.canSendMessages
      case 'create_event':
        return canAccess.canCreateEvents
      case 'create_poll':
        return canAccess.canCreatePolls
      case 'voice_call':
        return canAccess.canMakeVoiceCalls
      case 'video_call':
        return canAccess.canMakeVideoCalls
      case 'create_community':
        return canAccess.canCreateCommunities
      default:
        return true
    }
  })()

  // Se pode acessar, mostrar o conteúdo normalmente
  if (canAccessFeature) {
    return <>{children}</>
  }

  const getFeatureInfo = () => {
    switch (feature) {
      case 'upload_image':
        return {
          title: 'Upload de Imagens',
          description: 'Faça upload de imagens para seus posts',
          icon: '🖼️'
        }
      case 'upload_video':
        return {
          title: 'Upload de Vídeos',
          description: 'Compartilhe vídeos com seus seguidores',
          icon: '🎥'
        }
      case 'send_message':
        return {
          title: 'Mensagens Privadas',
          description: 'Envie mensagens privadas para outros usuários',
          icon: '💬'
        }
      case 'create_event':
        return {
          title: 'Criar Eventos',
          description: 'Organize eventos para sua comunidade',
          icon: '📅'
        }
      case 'create_poll':
        return {
          title: 'Criar Enquetes',
          description: 'Crie enquetes para engajar sua audiência',
          icon: '📊'
        }
      case 'voice_call':
        return {
          title: 'Chamadas de Voz',
          description: 'Faça chamadas de voz com outros usuários',
          icon: '📞'
        }
      case 'video_call':
        return {
          title: 'Chamadas de Vídeo',
          description: 'Faça chamadas de vídeo com outros usuários',
          icon: '📹'
        }
      case 'create_community':
        return {
          title: 'Criar Comunidades',
          description: 'Crie suas próprias comunidades privadas',
          icon: '👥'
        }
      default:
        return {
          title: 'Funcionalidade Premium',
          description: 'Esta funcionalidade está disponível apenas para assinantes',
          icon: '⭐'
        }
    }
  }

  const featureInfo = getFeatureInfo()

  const handleUpgradeClick = () => {
    requireFeature(feature)
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Conteúdo bloqueado com overlay */}
        <div className="relative">
          {children}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">{featureInfo.icon}</div>
              <Badge variant="secondary" className="mb-2">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
              <p className="text-sm text-white font-medium mb-2">
                {featureInfo.title}
              </p>
              {showUpgradeButton && (
                <Button 
                  size="sm" 
                  onClick={handleUpgradeClick}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de plano necessário */}
        <div className="absolute -top-2 -right-2">
          <Badge 
            variant={requiredPlan === 'diamond' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {requiredPlan === 'diamond' ? (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Diamond
              </>
            ) : (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Gold
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Modal de Paywall */}
      <PaywallModal 
        isOpen={paywall.isOpen}
        onClose={closePaywall}
        feature={feature}
        title={featureInfo.title}
        description={featureInfo.description}
        requiredPlan={requiredPlan}
      />
    </>
  )
}
