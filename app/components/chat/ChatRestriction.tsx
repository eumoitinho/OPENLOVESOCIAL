"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Crown, Star, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCanAccess } from '@/lib/plans/hooks'

interface ChatRestrictionProps {
  recipientPlan?: 'free' | 'gold' | 'diamante'
  messageType?: 'direct' | 'group'
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
    if (canAccess.plan === 'free') {
      return {
        title: 'Mensagens Limitadas',
        description: 'Usuários gratuitos podem enviar apenas 5 mensagens por dia.',
        requiredPlan: 'gold' as const,
        icon: Crown,
        color: 'from-yellow-400 to-yellow-600'
      }
    }

    if (messageType === 'group' && canAccess.plan === 'gold') {
      return {
        title: 'Grupos Premium',
        description: 'Grupos com mais de 10 pessoas requerem Open Diamante.',
        requiredPlan: 'diamante' as const,
        icon: Star,
        color: 'from-blue-400 to-purple-600'
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
        <CardTitle className="text-lg">{restriction.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {restriction.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {restriction.requiredPlan === 'gold' ? 'Mensagens ilimitadas' : 'Grupos ilimitados'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {restriction.requiredPlan === 'gold' ? 'Suporte prioritário' : 'Chamadas de voz/vídeo'}
            </span>
          </div>
        </div>

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
      </CardContent>
    </Card>
  )
} 