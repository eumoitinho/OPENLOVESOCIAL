'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserMinus, UserCheck } from 'lucide-react'
import { Button } from '@heroui/react'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  initialFollowersCount?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'bordered' | 'ghost'
  showCount?: boolean
  showIcon?: boolean
  followText?: string
  followingText?: string
  className?: string
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  initialFollowersCount = 0,
  size = 'md',
  variant = 'solid',
  showCount = false,
  showIcon = true,
  followText = 'Seguir',
  followingText = 'Seguindo',
  className,
  onFollowChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Fetch current follow status on mount
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/follow`)
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.data.isFollowing)
          setFollowersCount(data.data.followersCount)
        }
      } catch (error) {
        console.error('Erro ao buscar status de seguir:', error)
      }
    }

    fetchFollowStatus()
  }, [userId])

  const handleFollow = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao seguir/deixar de seguir')
      }

      const data = await response.json()
      
      setIsFollowing(data.data.isFollowing)
      setFollowersCount(data.data.followersCount)

      onFollowChange?.(data.data.isFollowing, data.data.followersCount)
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonContent = () => {
    if (isFollowing) {
      if (isHovered) {
        return (
          <>
            {showIcon && <UserMinus className="w-4 h-4" />}
            Deixar de seguir
          </>
        )
      }
      return (
        <>
          {showIcon && <UserCheck className="w-4 h-4" />}
          {followingText}
          {showCount && followersCount > 0 && (
            <span className="ml-1 text-xs opacity-70">({followersCount})</span>
          )}
        </>
      )
    }

    return (
      <>
        {showIcon && <UserPlus className="w-4 h-4" />}
        {followText}
        {showCount && followersCount > 0 && (
          <span className="ml-1 text-xs opacity-70">({followersCount})</span>
        )}
      </>
    )
  }

  const getButtonColor = () => {
    if (isFollowing) {
      return isHovered ? 'danger' : 'success'
    }
    return 'primary'
  }

  const getButtonVariant = () => {
    if (isFollowing && variant === 'solid') {
      return isHovered ? 'bordered' : 'solid'
    }
    return variant
  }

  return (
    <Button
      size={size}
      color={getButtonColor()}
      variant={getButtonVariant()}
      onPress={handleFollow}
      isDisabled={isLoading}
      isLoading={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'transition-all duration-200',
        isFollowing && isHovered && 'border-danger-300 text-danger-600',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  )
}