'use client'

import { Badge } from "@/components/ui/badge"
import { Star, Crown, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlanType } from "@/lib/plans/config"

interface PlanBadgeProps {
  plan: PlanType
  verified?: boolean
  variant?: 'default' | 'compact' | 'icon-only' | 'responsive'
  className?: string
}

export default function PlanBadge({ plan, verified = false, variant = 'default', className }: PlanBadgeProps) {
  // Configuração dos planos
  const planConfig = {
    free: {
      label: 'Gratuito',
      icon: null,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      hover: 'hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400' },
    gold: {
      label: 'Ouro',
      icon: Star,
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      hover: 'hover:bg-amber-200 hover:text-amber-900 hover:border-amber-400' },
    diamante: {
      label: 'Diamante',
      icon: Crown,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      hover: 'hover:bg-purple-200 hover:text-purple-900 hover:border-purple-400' },
    diamante_anual: {
      label: 'Diamante',
      icon: Crown,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      hover: 'hover:bg-purple-200 hover:text-purple-900 hover:border-purple-400' }
  } as const

  const config = planConfig[plan as keyof typeof planConfig]
  const IconComponent = config.icon
  const VerifiedIcon = CheckCircle
  const NotVerifiedIcon = XCircle

  // Variant responsivo - mostra texto no desktop, ícone no mobile
  if (variant === 'responsive') {
    // Gratuito não verificado
    if (plan === 'free' && !verified) {
      return (
        <span className={cn("inline-flex items-center", className)}>
          <Badge
            variant="secondary"
            className={cn(
              "bg-red-100 text-red-700 border-red-300 text-xs px-2 py-0.5 border",
              "hover:bg-red-200 hover:text-red-900 hover:border-red-400",
              "hidden sm:flex items-center gap-1"
            )}
          >
            <NotVerifiedIcon className="w-3 h-3" />
            <span>Não verificado</span>
          </Badge>
          <NotVerifiedIcon className="w-4 h-4 text-red-500 sm:hidden" aria-label="Não verificado" />
        </span>
      )
    }

    // Gratuito verificado
    if (plan === 'free' && verified) {
      return (
        <span className={cn("inline-flex items-center", className)}>
          <Badge
            variant="secondary"
            className={cn(
              "bg-blue-100 text-blue-700 border-blue-300 text-xs px-2 py-0.5 border",
              "hover:bg-blue-200 hover:text-blue-900 hover:border-blue-400",
              "hidden sm:flex items-center gap-1"
            )}
          >
            <VerifiedIcon className="w-3 h-3" />
            <span>Verificado</span>
          </Badge>
          <VerifiedIcon className="w-4 h-4 text-blue-500 sm:hidden" aria-label="Verificado" />
        </span>
      )
    }

    // Planos pagos
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <Badge
          variant="secondary"
          className={cn(
            config.color,
            config.hover,
            "text-xs px-2 py-0.5 border hidden sm:flex items-center gap-1"
          )}
        >
          {IconComponent && <IconComponent className="w-3 h-3" />}
          <span>{config.label}</span>
          {verified && <VerifiedIcon className="w-3 h-3 text-blue-500" />}
        </Badge>
        <span className="flex items-center gap-1 sm:hidden">
          {IconComponent && <IconComponent className="w-4 h-4" />}
          {verified && <VerifiedIcon className="w-4 h-4 text-blue-500" />}
        </span>
      </span>
    )
  }

  // Badge para gratuito sem verificação: badge vermelho inverso do verificado
  if (plan === 'free' && !verified) {
    if (variant === 'icon-only') {
      return (
        <span className={cn("flex items-center gap-1 w-fit", className)}>
          <NotVerifiedIcon className="w-4 h-4 text-red-500" aria-label="Não verificado" />
        </span>
      )
    }
    if (variant === 'compact') {
      return (
        <Badge
          variant="secondary"
          className={cn(
            "bg-red-100 text-red-700 border-red-300 text-xs w-fit px-2 py-0.5 border",
            "hover:bg-red-200 hover:text-red-900 hover:border-red-400",
            className
          )}
        >
          <NotVerifiedIcon className="w-3 h-3 mr-1" />
          Não verificado
        </Badge>
      )
    }
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-red-100 text-red-700 border-red-300 text-xs w-fit px-2 py-0.5 border flex items-center gap-1",
          "hover:bg-red-200 hover:text-red-900 hover:border-red-400",
          className
        )}
      >
        <NotVerifiedIcon className="w-3 h-3 mr-1" />
        Não verificado
      </Badge>
    )
  }

  // Gratuito verificado: só mostra o badge de verificado
  if (plan === 'free' && verified) {
    if (variant === 'icon-only') {
      return (
        <span className={cn("flex items-center gap-1 w-fit", className)}>
          <VerifiedIcon className="w-4 h-4 text-blue-500" aria-label="Verificado" />
        </span>
      )
    }
    if (variant === 'compact') {
      return (
        <Badge
          variant="secondary"
          className={cn(
            "bg-blue-100 text-blue-700 border-blue-300 text-xs w-fit px-2 py-0.5 border",
            "hover:bg-blue-200 hover:text-blue-900 hover:border-blue-400",
            className
          )}
        >
          <VerifiedIcon className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      )
    }
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-blue-100 text-blue-700 border-blue-300 text-xs w-fit px-2 py-0.5 border flex items-center gap-1",
          "hover:bg-blue-200 hover:text-blue-900 hover:border-blue-400",
          className
        )}
      >
        <VerifiedIcon className="w-3 h-3 mr-1" />
        Verificado
      </Badge>
    )
  }

  // Planos pagos
  if (variant === 'icon-only') {
    return (
      <span className={cn("flex items-center gap-1 w-fit", className)}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        {verified && <VerifiedIcon className="w-4 h-4 text-blue-500" />}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <Badge
        variant="secondary"
        className={cn(
          config.color,
          config.hover,
          "text-xs w-fit px-2 py-0.5 border flex items-center",
          className
        )}
      >
        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
        {config.label}
        {verified && <VerifiedIcon className="w-3 h-3 ml-1 text-blue-500" />}
      </Badge>
    )
  }

  // Default: badge do plano + badge de verificado (se houver)
  return (
    <span className={cn("flex items-center gap-2 w-fit", className)}>
      <Badge
        variant="secondary"
        className={cn(
          config.color,
          config.hover,
          "text-xs w-fit px-2 py-0.5 border flex items-center",
        )}
      >
        {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
      {verified && (
        <Badge
          variant="secondary"
          className={cn(
            "bg-blue-100 text-blue-700 border-blue-300 text-xs w-fit px-2 py-0.5 border flex items-center",
            "hover:bg-blue-200 hover:text-blue-900 hover:border-blue-400"
          )}
        >
          <VerifiedIcon className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      )}
    </span>
  )
}
