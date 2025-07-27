"use client"

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react"
import { MessageCircle, Crown, Star, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCanAccess } from '@/lib/plans/hooks'

interface ChatRestrictionProps {
  recipientPlan?: 'free' | 'gold' | 'diamond'
  messageType?: 'direct' | 'group' | 'video_call' | 'voice_call'
  onUpgrade?: () => void
}

export default function ChatRestriction({ 
  recipientPlan = 'free', 
  messageType = 'direct',
  onUpgrade 
}: ChatRestrictionProps) {
  const router = useRouter()
  const canAccess = useCanAccess()

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push('/checkout?plano=gold')
    }
  }

  const getRestrictionMessage = () => {
    // ✅ CORRIGIDO: Gratuito não pode enviar mensagens
    if (canAccess.currentPlan === 'free') {
      return {
        title: 'Mensagens Premium',
        description: 'Upgrade para enviar mensagens e se conectar com outros usuários.',
        requiredPlan: 'gold' as const,
        icon: Crown,
        color: 'from-yellow-400 to-yellow-600',
        features: [
          'Mensagens ilimitadas',
          'Mensagens de voz',
          'Chamadas de voz',
          'Upload de arquivos'
        ]
      }
    }

    // ✅ NOVO: Ouro não pode fazer chamadas de vídeo
    if (messageType === 'video_call' && canAccess.currentPlan === 'gold') {
      return {
        title: 'Chamadas de Vídeo Premium',
        description: 'Chamadas de vídeo requerem Open Diamante.',
        requiredPlan: 'diamond' as const,
        icon: Star,
        color: 'from-blue-400 to-purple-600',
        features: [
          'Chamadas de vídeo ilimitadas',
          'Qualidade HD',
          'Gravação de chamadas',
          'Chamadas em grupo'
        ]
      }
    }

    // ✅ NOVO: Ouro não pode criar grupos
    if (messageType === 'group' && canAccess.currentPlan === 'gold') {
      return {
        title: 'Grupos Premium',
        description: 'Criação de grupos requer Open Diamante.',
        requiredPlan: 'diamond' as const,
        icon: Users,
        color: 'from-blue-400 to-purple-600',
        features: [
          'Criar grupos ilimitados',
          'Grupos com até 100 pessoas',
          'Moderação avançada',
          'Grupos privados'
        ]
      }
    }

    return null
  }

  const restriction = getRestrictionMessage()

  if (!restriction) {
    return null
  }

  const Icon = restriction.icon

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className={cn(
            "p-3 rounded-full bg-gradient-to-r",
            restriction.color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">{restriction.title}</h3>
      </CardHeader>

      <CardBody className="space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {restriction.description}
        </p>

        {/* ✅ NOVO: Lista de recursos do plano */}
        {restriction.features && (
          <div className="space-y-2">
            {restriction.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={handleUpgrade}
          className={cn(
            "w-full bg-gradient-to-r text-white font-medium",
            restriction.color,
            "hover:shadow-lg transition-all duration-200"
          )}
        >
          <Lock className="w-4 h-4 mr-2" />
          Assinar {restriction.requiredPlan === 'gold' ? 'Open Ouro' : 'Open Diamante'}
        </Button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Cancele quando quiser • Sem taxas ocultas
        </div>
      </CardBody>
    </Card>
  )
} 