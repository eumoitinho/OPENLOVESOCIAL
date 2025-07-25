'use client'

import { useState, useEffect } from 'react'
import { Heart, ThumbsUp, Laugh, Eye, Frown, Angry } from 'lucide-react'
import { Button } from '@nextui-org/react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  targetId: string
  targetType: 'post' | 'comment'
  initialLiked?: boolean
  initialCount?: number
  initialReaction?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCount?: boolean
  showReactionPicker?: boolean
  className?: string
  onLikeChange?: (isLiked: boolean, count: number, reaction: string | null) => void
}

const reactionTypes = [
  { type: 'like', icon: Heart, label: 'Curtir', color: 'text-red-500' },
  { type: 'love', icon: Heart, label: 'Amei', color: 'text-pink-500' },
  { type: 'laugh', icon: Laugh, label: 'Haha', color: 'text-yellow-500' },
  { type: 'wow', icon: Eye, label: 'Uau', color: 'text-blue-500' },
  { type: 'sad', icon: Frown, label: 'Triste', color: 'text-gray-500' },
  { type: 'angry', icon: Angry, label: 'Raiva', color: 'text-red-600' }
]

export default function LikeButton({
  targetId,
  targetType,
  initialLiked = false,
  initialCount = 0,
  initialReaction = null,
  size = 'md',
  showCount = true,
  showReactionPicker = true,
  className,
  onLikeChange
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [currentReaction, setCurrentReaction] = useState(initialReaction)
  const [showPicker, setShowPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const CurrentIcon = currentReaction 
    ? reactionTypes.find(r => r.type === currentReaction)?.icon || Heart
    : Heart

  const currentColor = currentReaction
    ? reactionTypes.find(r => r.type === currentReaction)?.color || 'text-red-500'
    : 'text-red-500'

  const handleReaction = async (reactionType: string) => {
    if (isLoading) return

    setIsLoading(true)
    setShowPicker(false)

    try {
      const endpoint = targetType === 'post' 
        ? `/api/posts/${targetId}/like`
        : `/api/comments/${targetId}/like`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction_type: reactionType })
      })

      if (!response.ok) {
        throw new Error('Erro ao curtir')
      }

      const data = await response.json()
      
      setIsLiked(data.data.isLiked)
      setLikesCount(data.data.likesCount)
      setCurrentReaction(data.data.reaction)

      onLikeChange?.(data.data.isLiked, data.data.likesCount, data.data.reaction)
    } catch (error) {
      console.error('Erro ao curtir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLike = () => {
    if (showReactionPicker) {
      setShowPicker(!showPicker)
    } else {
      handleReaction('like')
    }
  }

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="relative">
      <Button
        size={size}
        variant={isLiked ? 'solid' : 'ghost'}
        color={isLiked ? 'danger' : 'default'}
        startContent={
          <CurrentIcon 
            className={cn(
              sizeClasses[size],
              isLiked ? currentColor : 'text-gray-500',
              isLoading && 'animate-pulse'
            )}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        }
        className={cn(
          'min-w-unit-12',
          isLiked && 'bg-red-50 text-red-600 border-red-200',
          className
        )}
        onPress={handleQuickLike}
        isDisabled={isLoading}
      >
        {showCount && likesCount > 0 && (
          <span className="text-xs">{likesCount}</span>
        )}
      </Button>

      {showPicker && showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-50">
          {reactionTypes.map((reaction) => {
            const Icon = reaction.icon
            return (
              <Button
                key={reaction.type}
                size="sm"
                variant="ghost"
                isIconOnly
                className={cn(
                  'min-w-unit-8 h-8',
                  currentReaction === reaction.type && 'bg-gray-100'
                )}
                onPress={() => handleReaction(reaction.type)}
              >
                <Icon 
                  className={cn('w-4 h-4', reaction.color)}
                  fill={currentReaction === reaction.type ? 'currentColor' : 'none'}
                />
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}