"use client"

import { Calendar, Plus, BarChart3, Settings, Users } from 'lucide-react'
import { Button } from "@heroui/react"
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'
import { usePremiumFeatures } from '@/lib/hooks/usePremiumFeatures'

interface EventPremiumButtonsProps {
  onCreateEvent?: () => void
  onViewAnalytics?: () => void
  onManageEvent?: () => void
  disabled?: boolean
  showLabels?: boolean
  className?: string
  eventCount?: number
}

export default function EventPremiumButtons({ 
  onCreateEvent,
  onViewAnalytics,
  onManageEvent,
  disabled = false,
  showLabels = true,
  className = '',
  eventCount = 0
}: EventPremiumButtonsProps) {
  const { features, canCreateMoreEvents } = usePremiumFeatures()

  const canCreateEvent = features.canCreateEvents && canCreateMoreEvents(eventCount)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão de Criar Evento */}
      {onCreateEvent && (
        <PremiumLockBadge 
          feature="canCreateEvents"
          size="sm"
          disabled={!canCreateEvent}
        >
          <Button
            color="primary"
            variant={canCreateEvent ? "solid" : "bordered"}
            startContent={<Calendar className="w-4 h-4" />}
            onClick={onCreateEvent}
            disabled={disabled || !canCreateEvent}
            className={!canCreateEvent ? "opacity-60" : ""}
          >
            {showLabels ? "Criar Evento" : ""}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Analytics de Eventos */}
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
            title="Analytics de eventos"
            className={!features.hasAdvancedAnalytics ? "opacity-60" : ""}
          >
            {showLabels ? "Analytics" : ""}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Gerenciar Evento */}
      {onManageEvent && (
        <PremiumLockBadge 
          feature="hasAdvancedModeration"
          size="sm"
          disabled={!features.hasAdvancedModeration}
        >
          <Button
            variant="light"
            startContent={<Settings className="w-4 h-4" />}
            onClick={onManageEvent}
            disabled={disabled || !features.hasAdvancedModeration}
            title="Gerenciar evento"
            className={!features.hasAdvancedModeration ? "opacity-60" : ""}
          >
            {showLabels ? "Gerenciar" : ""}
          </Button>
        </PremiumLockBadge>
      )}
    </div>
  )
}

// Componente para mostrar limite de eventos
export function EventLimitIndicator({ eventCount = 0 }: { eventCount?: number }) {
  const { features, canCreateMoreEvents } = usePremiumFeatures()
  
  if (features.maxEventsPerMonth === -1) {
    return (
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        Eventos ilimitados
      </div>
    )
  }

  const remaining = features.maxEventsPerMonth - eventCount
  const canCreate = canCreateMoreEvents(eventCount)

  return (
    <div className={`text-xs px-2 py-1 rounded ${
      canCreate ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
    }`}>
      {remaining > 0 ? `${remaining} eventos restantes este mês` : 'Limite de eventos atingido'}
    </div>
  )
}

// Versão para header de eventos
export function EventHeaderActions({ onViewAnalytics, onManageEvent }: EventPremiumButtonsProps) {
  return (
    <EventPremiumButtons 
      onViewAnalytics={onViewAnalytics}
      onManageEvent={onManageEvent}
      showLabels={false}
      className="ml-auto"
    />
  )
}

// Versão para página de eventos
export function EventPageActions({ onCreateEvent, eventCount }: EventPremiumButtonsProps) {
  return (
    <div className="space-y-2">
      <EventPremiumButtons 
        onCreateEvent={onCreateEvent}
        showLabels={true}
        className="justify-center"
        eventCount={eventCount}
      />
      
      <EventLimitIndicator eventCount={eventCount} />
    </div>
  )
}

// Versão para sidebar
export function EventSidebarActions({ onCreateEvent, onViewAnalytics, eventCount }: EventPremiumButtonsProps) {
  return (
    <div className="space-y-2">
      <EventPremiumButtons 
        onCreateEvent={onCreateEvent}
        showLabels={true}
        className="w-full"
        eventCount={eventCount}
      />
      
      {onViewAnalytics && (
        <EventPremiumButtons 
          onViewAnalytics={onViewAnalytics}
          showLabels={true}
          className="w-full"
        />
      )}
      
      <EventLimitIndicator eventCount={eventCount} />
    </div>
  )
}