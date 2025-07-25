"use client"

import { Users, Plus, Settings, Crown, BarChart3 } from 'lucide-react'
import { Button } from '@heroui/react'
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'
import { usePremiumFeatures } from '@/lib/hooks/usePremiumFeatures'

interface CommunityPremiumButtonsProps {
  onCreateCommunity?: () => void
  onViewAnalytics?: () => void
  onManageCommunity?: () => void
  disabled?: boolean
  showLabels?: boolean
  className?: string
}

export default function CommunityPremiumButtons({ 
  onCreateCommunity,
  onViewAnalytics,
  onManageCommunity,
  disabled = false,
  showLabels = true,
  className = ''
}: CommunityPremiumButtonsProps) {
  const { features } = usePremiumFeatures()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão de Criar Comunidade */}
      {onCreateCommunity && (
        <PremiumLockBadge 
          feature="canCreateCommunities"
          size="sm"
          disabled={!features.canCreateCommunities}
        >
          <Button
            color="primary"
            variant={features.canCreateCommunities ? "solid" : "bordered"}
            startContent={<Plus className="w-4 h-4" />}
            onClick={onCreateCommunity}
            disabled={disabled || !features.canCreateCommunities}
            className={!features.canCreateCommunities ? "opacity-60" : ""}
          >
            {showLabels ? "Criar Comunidade" : ""}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Analytics Avançados */}
      {onViewAnalytics && (
        <PremiumLockBadge 
          feature="hasAdvancedAnalytics"
          size="sm"
          disabled={!features.hasAdvancedAnalytics}
        >
          <Button
            variant="light"
            startContent={<BarChart3 className="w-4 h-4" />}
            onClick={onViewAnalytics}
            disabled={disabled || !features.hasAdvancedAnalytics}
            title="Analytics avançados"
            className={!features.hasAdvancedAnalytics ? "opacity-60" : ""}
          >
            {showLabels ? "Analytics" : ""}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Moderação Avançada */}
      {onManageCommunity && (
        <PremiumLockBadge 
          feature="hasAdvancedModeration"
          size="sm"
          disabled={!features.hasAdvancedModeration}
        >
          <Button
            variant="light"
            startContent={<Settings className="w-4 h-4" />}
            onClick={onManageCommunity}
            disabled={disabled || !features.hasAdvancedModeration}
            title="Moderação avançada"
            className={!features.hasAdvancedModeration ? "opacity-60" : ""}
          >
            {showLabels ? "Moderar" : ""}
          </Button>
        </PremiumLockBadge>
      )}
    </div>
  )
}

// Versão para header de comunidade
export function CommunityHeaderActions({ onViewAnalytics, onManageCommunity }: CommunityPremiumButtonsProps) {
  return (
    <CommunityPremiumButtons 
      onViewAnalytics={onViewAnalytics}
      onManageCommunity={onManageCommunity}
      showLabels={false}
      className="ml-auto"
    />
  )
}

// Versão para página de comunidades
export function CommunityPageActions({ onCreateCommunity }: CommunityPremiumButtonsProps) {
  return (
    <CommunityPremiumButtons 
      onCreateCommunity={onCreateCommunity}
      showLabels={true}
      className="justify-center"
    />
  )
}

// Versão para sidebar
export function CommunitySidebarActions({ onCreateCommunity, onViewAnalytics }: CommunityPremiumButtonsProps) {
  return (
    <div className="space-y-2">
      <CommunityPremiumButtons 
        onCreateCommunity={onCreateCommunity}
        showLabels={true}
        className="w-full"
      />
      
      {onViewAnalytics && (
        <CommunityPremiumButtons 
          onViewAnalytics={onViewAnalytics}
          showLabels={true}
          className="w-full"
        />
      )}
    </div>
  )
}