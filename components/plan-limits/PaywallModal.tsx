'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from '@heroui/react'
import { Crown, Check, X, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlanLimits, useUpgradeInfo } from '@/lib/plans/hooks'
import { PLAN_NAMES, PLAN_PRICES } from '@/lib/plans/config'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  title: string
  description: string
  requiredPlan?: 'gold' | 'diamante'
}

export default function PaywallModal({ 
  isOpen, 
  onClose, 
  feature, 
  title, 
  description, 
  requiredPlan = 'gold' 
}: PaywallModalProps) {
  const router = useRouter()
  const limits = usePlanLimits()
  const { currentPlan, suggestions } = useUpgradeInfo()
  
  const targetPlan = requiredPlan
  const planName = PLAN_NAMES[targetPlan]
  const planPrice = PLAN_PRICES[targetPlan]
  
  const handleUpgrade = () => {
    router.push(`/checkout?plano=${targetPlan}`)
    onClose()
  }
  
  const getFeaturesBenefit = () => {
    switch (targetPlan) {
      case 'gold':
        return [
          'Mensagens privadas com fotos e vídeos',
          'Participar de até 3 comunidades',
          'Criar até 2 eventos por mês',
          'Upload ilimitado de fotos',
          'Upload de até 10 vídeos mensais',
          'Perfil com destaque visual',
          'Suporte prioritário'
        ]
      case 'diamante':
        return [
          'Participar de até 5 comunidades',
          'Criar até 10 eventos por mês',
          'Chamadas de voz e vídeo',
          'Upload ilimitado de fotos e vídeos',
          'Badge verificado',
          'Criar comunidades privadas',
          'Estatísticas e analytics',
          'Suporte VIP'
        ]
      default:
        return []
    }
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      placement="center"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Recurso Premium</h3>
              <p className="text-sm text-gray-500">Upgrade necessário para continuar</p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="py-6">
          <div className="space-y-6">
            {/* Limitação atual */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-red-800">{title}</h4>
                  <p className="text-sm text-red-600 mt-1">{description}</p>
                </div>
              </div>
            </div>
            
            {/* Plano recomendado */}
            <Card className="border-2 border-gradient-to-r from-amber-500 to-orange-500">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{planName}</h4>
                    <p className="text-sm text-gray-600">Recomendado para você</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">
                      R$ {planPrice.monthly.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">por mês</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Recursos inclusos:
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {getFeaturesBenefit().map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
            
            {/* Call to action */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
              <div className="text-center">
                <h5 className="font-medium text-gray-900 mb-2">
                  Desbloqueie {feature} agora!
                </h5>
                <p className="text-sm text-gray-600">
                  Upgrade para {planName} e tenha acesso a todos os recursos premium
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={onClose}
          >
            Voltar
          </Button>
          <Button 
            color="primary" 
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            onPress={handleUpgrade}
          >
            Fazer Upgrade - R$ {planPrice.monthly.toFixed(2)}/mês
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}