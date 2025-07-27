"use client"

import { Crown, Star, Zap, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@heroui/react"
import PremiumLockBadge from './PremiumLockBadge'
import { ChatHeaderCallButtons } from "@/app/components/chat/CallButtons"
import { PostMediaButtons } from "@/app/components/media/MediaUploadButtons"
import { CommunityPageActions } from "@/app/components/communities/CommunityPremiumButtons"
import { EventPageActions } from "@/app/components/events/EventPremiumButtons"
import { usePremiumFeatures, getPlanName } from "@/lib/hooks/usePremiumFeatures"

export default function PremiumFeatureShowcase() {
  const { features, planType, isPremium } = usePremiumFeatures()

  const premiumFeatures = [
    {
      icon: Crown,
      title: 'Verificação Oficial',
      description: 'Tenha o selo verificado no seu perfil',
      feature: 'hasVerifiedBadge' as const,
      plan: 'diamond'
    },
    {
      icon: Star,
      title: 'Analytics Avançados',
      description: 'Veja estatísticas detalhadas do seu perfil',
      feature: 'hasAdvancedAnalytics' as const,
      plan: 'diamond'
    },
    {
      icon: Zap,
      title: 'Sem Anúncios',
      description: 'Navegue sem interrupções publicitárias',
      feature: 'hasNoAds' as const,
      plan: 'gold'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header do Showcase */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recursos Premium
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isPremium 
            ? `Você tem o plano ${getPlanName(planType)}`
            : 'Desbloqueie funcionalidades exclusivas com nossos planos premium'
          }
        </p>
      </div>

      {/* Grid de Features Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {premiumFeatures.map((feature) => (
          <Card key={feature.title} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg 
                  ${features[feature.feature] 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {feature.title}
                  </CardTitle>
                  {features[feature.feature] && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Ativo</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {feature.description}
              </p>
              
              {!features[feature.feature] && (
                <PremiumLockBadge 
                  feature={feature.feature}
                  size="sm"
                  className="absolute top-2 right-2"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Showcase de Componentes com Badges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Funcionalidades em Ação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chamadas de Voz/Vídeo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chamadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Voz e vídeo</span>
                <ChatHeaderCallButtons 
                  onVoiceCall={() => console.log('Voice call')}
                  onVideoCall={() => console.log('Video call')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload de Mídia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload de Mídia</CardTitle>
            </CardHeader>
            <CardContent>
              <PostMediaButtons 
                onImageUpload={() => console.log('Image upload')}
                onVideoUpload={() => console.log('Video upload')}
                onAudioUpload={() => console.log('Audio upload')}
              />
            </CardContent>
          </Card>

          {/* Comunidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Comunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <CommunityPageActions 
                onCreateCommunity={() => console.log('Create community')}
              />
            </CardContent>
          </Card>

          {/* Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <EventPageActions 
                onCreateEvent={() => console.log('Create event')}
                eventCount={2}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA para Upgrade */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
          <CardContent className="text-center py-6">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Desbloqueie Todo o Potencial
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Acesse todas as funcionalidades premium e melhore sua experiência
            </p>
            <Button 
              color="warning"
              size="lg"
              startContent={<Crown className="w-4 h-4" />}
              onClick={() => window.location.href = '/upgrade'}
            >
              Fazer Upgrade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
