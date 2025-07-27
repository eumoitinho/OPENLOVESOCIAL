"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { CheckIcon, NewIcon } from './notification-icons'
import { cn } from '@/lib/utils'

interface RobustAvatarProps {
  src?: string | null
  email?: string
  name?: string
  username?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  // Status do usuário
  isVerified?: boolean
  isPremium?: boolean
  isNew?: boolean
  isOnline?: boolean
  // Dados do usuário para verificar se é novo
  createdAt?: string
  // Callback para clique
  onClick?: () => void
}

// Função para gerar avatar padrão baseado no nome e email
const generateDefaultAvatar = (email: string, fullName: string): string => {
  // Usar initials como fallback
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase()
  
  // Gerar cor baseada no email/id
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const color = colors[Math.abs(hash) % colors.length]
  
  // Retornar URL do avatar gerado
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.replace('#', '')}&color=fff&size=200&font-size=0.4`
}

export function RobustAvatar({
  src,
  email,
  name,
  username,
  alt,
  size = 'md',
  className,
  isVerified = false,
  isPremium = false,
  isNew = false,
  isOnline = false,
  createdAt,
  onClick
}: RobustAvatarProps) {
  // Determinar o avatar a ser usado
  const avatarSrc = React.useMemo(() => {
    if (src) return src
    
    // Gerar avatar padrão usando email e nome
    const displayName = name || username || 'User'
    const emailForAvatar = email || 'user@example.com'
    
    return generateDefaultAvatar(emailForAvatar, displayName)
  }, [src, email, name, username])

  // Gerar fallback para iniciais
  const fallbackInitials = React.useMemo(() => {
    const displayName = name || username || 'User'
    return displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  }, [name, username])

  // Verificar se o usuário é novo (criado nas últimas 24 horas)
  const isUserNew = React.useMemo(() => {
    if (isNew) return true
    if (!createdAt) return false
    
    const createdDate = new Date(createdAt)
    const now = new Date()
    const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
    
    return diffInHours <= 24
  }, [isNew, createdAt])

  // Tamanhos do avatar
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  // Tamanhos do badge
  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  // Posicionamento do badge
  const badgePositionClasses = {
    sm: '-top-0.5 -right-0.5',
    md: '-top-1 -right-1',
    lg: '-top-1.5 -right-1.5',
    xl: '-top-2 -right-2'
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-transparent",
          sizeClasses[size],
          onClick && "cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all duration-200"
        )}
        onClick={onClick}
      >
        <Avatar className="w-full h-full rounded-full overflow-hidden">
          <AvatarImage 
            src={avatarSrc} 
            alt={alt || name || username} 
            className="rounded-full object-cover w-full h-full"
            onError={(e) => {
              // Em caso de erro, usar fallback
              console.log('Avatar loading error, using fallback')
            }}
          />
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white font-semibold rounded-full w-full h-full flex items-center justify-center">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Badge de Verificado */}
      {isVerified && (
        <div className={cn(
          'absolute bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900',
          badgeSizeClasses[size],
          badgePositionClasses[size]
        )}>
          <CheckIcon size={size === 'sm' ? 8 : size === 'md' ? 10 : size === 'lg' ? 12 : 16} />
        </div>
      )}

      {/* Badge de Premium */}
      {isPremium && !isVerified && (
        <div className={cn(
          'absolute bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900',
          badgeSizeClasses[size],
          badgePositionClasses[size]
        )}>
          <span className={cn(
            'font-bold',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-base'
          )}>
            P
          </span>
        </div>
      )}

      {/* Badge de Novo */}
      {isUserNew && (
        <div className={cn(
          'absolute bg-green-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900',
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8',
          badgePositionClasses[size]
        )}>
          <NewIcon size={size === 'sm' ? 8 : size === 'md' ? 10 : size === 'lg' ? 12 : 16} />
        </div>
      )}

      {/* Badge de Online */}
      {isOnline && !isVerified && !isPremium && !isUserNew && (
        <div className={cn(
          'absolute bg-green-500 rounded-full border-2 border-white dark:border-gray-900',
          badgeSizeClasses[size],
          badgePositionClasses[size]
        )} />
      )}

      {/* Badge de Novo (texto) - para avatars maiores */}
      {isUserNew && (size === 'lg' || size === 'xl') && (
        <div className={cn(
          'absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold border border-white dark:border-gray-900'
        )}>
          Novo
        </div>
      )}
    </div>
  )
}