"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Users, 
  Lock, 
  Crown, 
  Star, 
  Shield, 
  Zap, 
  Settings,
  UserPlus,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useCanAccess } from "@/lib/plans/hooks"
import PremiumFeature from '@/app/components/premium/PremiumFeature'

interface PremiumCommunityFeaturesProps {
  communityId?: string
  isOwner?: boolean
  onCreateCommunity?: (data: any) => void
  className?: string
}

export default function PremiumCommunityFeatures({
  communityId,
  isOwner = false,
  onCreateCommunity,
  className
}: PremiumCommunityFeaturesProps) {
  const canAccess = useCanAccess()
  const [isPrivate, setIsPrivate] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [maxMembers, setMaxMembers] = useState(50)
  const [hasCustomRoles, setHasCustomRoles] = useState(false)

  const features = [
    {
      title: 'Comunidades Privadas',
      description: 'Crie comunidades exclusivas apenas para convidados',
      icon: Lock,
      requiredPlan: 'gold' as const,
      available: canAccess.currentPlan !== 'free'
    },
    {
      title: 'Aprovação Manual',
      description: 'Controle quem pode entrar na sua comunidade',
      icon: Shield,
      requiredPlan: 'gold' as const,
      available: canAccess.currentPlan !== 'free'
    },
    {
      title: 'Mais Membros',
      description: 'Até 500 membros por comunidade',
      icon: Users,
      requiredPlan: 'gold' as const,
      available: canAccess.currentPlan !== 'free'
    },
    {
      title: 'Funções Personalizadas',
      description: 'Crie funções customizadas para membros',
      icon: Crown,
      requiredPlan: 'diamond' as const,
      available: canAccess.currentPlan === 'diamond'
    },
    {
      title: 'Eventos Exclusivos',
      description: 'Organize eventos apenas para membros',
      icon: Calendar,
      requiredPlan: 'diamond' as const,
      available: canAccess.currentPlan === 'diamond'
    },
    {
      title: 'Analytics Avançados',
      description: 'Estatísticas detalhadas da comunidade',
      icon: Zap,
      requiredPlan: 'diamond' as const,
      available: canAccess.currentPlan === 'diamond'
    }
  ]

  const handleCreateCommunity = () => {
    const communityData = {
      isPrivate,
      requiresApproval,
      maxMembers,
      hasCustomRoles,
      plan: canAccess.currentPlan
    }
    
    onCreateCommunity?.(communityData)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Recursos Premium para Comunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index}>
                {feature.available ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {feature.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {feature.requiredPlan === 'gold' ? 'Ouro' : 'Diamante'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <PremiumFeature
                    feature="premium_communities"
                    requiredPlan={feature.requiredPlan}
                    showUpgradeButton={false}
                  >
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {feature.requiredPlan === 'gold' ? 'Ouro' : 'Diamante'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </PremiumFeature>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Settings */}
      {(isOwner || onCreateCommunity) && canAccess.currentPlan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Configurações da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Privacy Settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Comunidade Privada
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apenas membros convidados podem ver o conteúdo
                </p>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={canAccess.currentPlan === 'free'}
              />
            </div>

            {/* Approval Settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Aprovação Manual
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Novos membros precisam ser aprovados
                </p>
              </div>
              <Switch
                checked={requiresApproval}
                onCheckedChange={setRequiresApproval}
                disabled={canAccess.currentPlan === 'free'}
              />
            </div>

            {/* Member Limit */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Limite de Membros
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  min={10}
                  max={canAccess.currentPlan === 'diamante' ? 1000 : 500}
                  className="w-32"
                  disabled={canAccess.currentPlan === 'free'}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  máximo {canAccess.currentPlan === 'diamante' ? '1000' : '500'} membros
                </span>
              </div>
            </div>

            {/* Custom Roles */}
            {canAccess.currentPlan === 'diamante' && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Funções Personalizadas
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crie funções customizadas para membros
                  </p>
                </div>
                <Switch
                  checked={hasCustomRoles}
                  onCheckedChange={setHasCustomRoles}
                />
              </div>
            )}

            {onCreateCommunity && (
              <Button
                onClick={handleCreateCommunity}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              >
                Criar Comunidade Premium
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users */}
      {canAccess.currentPlan === 'free' && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Desbloqueie Recursos Premium
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Crie comunidades privadas e muito mais com Open Ouro
                </p>
              </div>
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                Assinar Open Ouro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
