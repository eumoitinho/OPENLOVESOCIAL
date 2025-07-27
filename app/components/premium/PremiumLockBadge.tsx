"use client"

import { Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePremiumFeatures, type PlanType } from '@/lib/hooks/usePremiumFeatures'
import { useState } from 'react'
import { Button } from "@heroui/react"
import { getPlanName } from '@/lib/hooks/usePremiumFeatures'

interface PremiumLockBadgeProps {
  feature: keyof typeof FEATURE_REQUIREMENTS
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  onUpgradeClick?: () => void
  disabled?: boolean
}

// Mapear funcionalidades para planos necessários (baseado em lib/plans/config.ts)
const FEATURE_REQUIREMENTS = {
  canSendMessages: 'gold' as PlanType,
  canSendMedia: 'gold' as PlanType,
  canSendAudio: 'gold' as PlanType,
  canSendVideo: 'gold' as PlanType,
  canMakeVoiceCalls: 'gold' as PlanType,
  canMakeVideoCalls: 'diamond' as PlanType,
  canUploadAudio: 'gold' as PlanType,
  canUploadVideo: 'gold' as PlanType,
  canCreateEvents: 'gold' as PlanType,
  canCreateCommunities: 'gold' as PlanType,
  canCreatePolls: 'gold' as PlanType,
  canCreatePaidContent: 'diamond' as PlanType,
  canAccessAnalytics: 'gold' as PlanType,
  canGetVerifiedBadge: 'diamond' as PlanType,
  hasAdvancedAnalytics: 'diamond' as PlanType,
  hasCustomColors: 'diamond' as PlanType,
  hasNoAds: 'gold' as PlanType,
  canExportData: 'diamond' as PlanType,
  hasAdvancedModeration: 'diamond' as PlanType
}

const FEATURE_DESCRIPTIONS = {
  canSendMessages: 'Envie mensagens privadas ilimitadas',
  canSendMedia: 'Compartilhe fotos e mídias nas mensagens',
  canSendAudio: 'Envie mensagens de áudio',
  canSendVideo: 'Compartilhe vídeos nas mensagens',
  canMakeVoiceCalls: 'Faça chamadas de voz ilimitadas',
  canMakeVideoCalls: 'Faça chamadas de vídeo HD',
  canUploadAudio: 'Faça upload de áudios nos posts',
  canUploadVideo: 'Faça upload de vídeos nos posts',
  canCreateEvents: 'Crie eventos exclusivos',
  canCreateCommunities: 'Crie suas próprias comunidades',
  canCreatePolls: 'Crie enquetes interativas',
  canCreatePaidContent: 'Monetize seu conteúdo',
  canAccessAnalytics: 'Veja estatísticas básicas',
  canGetVerifiedBadge: 'Tenha verificação oficial',
  hasAdvancedAnalytics: 'Analytics detalhados e insights',
  hasCustomColors: 'Personalize cores do perfil',
  hasNoAds: 'Navegue sem anúncios',
  canExportData: 'Exporte seus dados completos',
  hasAdvancedModeration: 'Ferramentas avançadas de moderação'
}

export default function PremiumLockBadge({ 
  feature, 
  children, 
  className = '',
  size = 'md',
  showTooltip = true,
  onUpgradeClick,
  disabled = false
}: PremiumLockBadgeProps) {
  const { features, isPremium, planType } = usePremiumFeatures()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const requiredPlan = FEATURE_REQUIREMENTS[feature]
  const featureDescription = FEATURE_DESCRIPTIONS[feature]
  const hasAccess = features[feature] as boolean
  
  // Se o usuário tem acesso ou é premium, não mostrar o badge
  if (hasAccess || isPremium) {
    return <>{children}</>
  }
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'w-4 h-4 top-0 right-0',
          crown: 'w-2.5 h-2.5',
          tooltip: 'text-xs p-2 max-w-48'
        }
      case 'lg':
        return {
          badge: 'w-7 h-7 top-1 right-1',
          crown: 'w-4 h-4',
          tooltip: 'text-base p-4 max-w-80'
        }
      default:
        return {
          badge: 'w-5 h-5 top-0.5 right-0.5',
          crown: 'w-3 h-3',
          tooltip: 'text-sm p-3 max-w-64'
        }
    }
  }
  
  const sizeClasses = getSizeClasses()
  
  const handleClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick()
    } else {
      // Redirecionar para página de upgrade
      window.location.href = '/upgrade'
    }
  }
  
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowUpgradeModal(true)
  }
  
  return (
    <>
      <div 
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Conteúdo com overlay */}
        <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {children}
          
          {/* Overlay sutil quando bloqueado */}
          {disabled && (
            <div className="absolute inset-0 bg-gray-500/20 backdrop-blur-[1px] rounded-lg pointer-events-none" />
          )}
        </div>
        
        {/* Badge de Premium */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            absolute ${sizeClasses.badge} 
            bg-gradient-to-br from-yellow-400 to-yellow-600 
            rounded-full shadow-lg cursor-pointer z-10
            flex items-center justify-center
            border-2 border-white dark:border-gray-800
            transition-all duration-200
            hover:shadow-xl hover:from-yellow-300 hover:to-yellow-500
          `}
          onClick={handleBadgeClick}
          title="Recurso Premium"
        >
          <Crown className={`${sizeClasses.crown} text-white drop-shadow-sm`} />
        </motion.div>
        
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl
                ${sizeClasses.tooltip} z-50 pointer-events-none
              `}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold">Recurso Premium</span>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  {featureDescription}
                </p>
                
                <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                  Disponível no plano <span className="font-semibold text-yellow-400">{getPlanName(requiredPlan)}</span>
                </div>
              </div>
              
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modal de Upgrade */}
      <AnimatePresence>
        {showUpgradeModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowUpgradeModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Recurso Premium
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {featureDescription}
                  </p>
                </div>
                
                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Disponível no plano {getPlanName(requiredPlan)}:
                  </h4>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {requiredPlan === 'gold' && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                          <span>Mensagens privadas ilimitadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                          <span>Upload de mídias sem restrições</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                          <span>Perfil destacado e sem anúncios</span>
                        </div>
                      </>
                    )}
                    
                    {requiredPlan === 'diamond' && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span>Todas as funcionalidades Gold</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span>Chamadas de voz e vídeo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span>Analytics avançados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span>Verificação oficial</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="light"
                    className="flex-1"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    Mais tarde
                  </Button>
                  
                  <Button
                    color="warning"
                    className="flex-1 font-semibold"
                    onClick={handleClick}
                  >
                    Fazer upgrade
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Wrapper mais simples para casos específicos
export function PremiumFeatureWrapper({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: keyof typeof FEATURE_REQUIREMENTS
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { features } = usePremiumFeatures()
  const hasAccess = features[feature] as boolean
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  if (fallback) {
    return <>{fallback}</>
  }
  
  return (
    <PremiumLockBadge feature={feature} disabled>
      {children}
    </PremiumLockBadge>
  )
}