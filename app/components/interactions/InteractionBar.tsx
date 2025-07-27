'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from "@heroui/react"
import { cn } from '@/lib/utils'
import LikeButton from './LikeButton'
import SaveButton from './SaveButton'
import ShareButton from './ShareButton'

interface InteractionBarProps {
  postId: string
  postContent?: string
  postAuthor?: string
  initialLiked?: boolean
  initialLikesCount?: number
  initialCommentsCount?: number
  initialSharesCount?: number
  initialSaved?: boolean
  currentReaction?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCounts?: boolean
  showLabels?: boolean
  onCommentClick?: () => void
  onInteractionChange?: (type: string, data: any) => void
  className?: string
}

export default function InteractionBar({
  postId,
  postContent = '',
  postAuthor = '',
  initialLiked = false,
  initialLikesCount = 0,
  initialCommentsCount = 0,
  initialSharesCount = 0,
  initialSaved = false,
  currentReaction = null,
  size = 'md',
  showCounts = true,
  showLabels = false,
  onCommentClick,
  onInteractionChange,
  className
}: InteractionBarProps) {

  const handleLikeChange = (isLiked: boolean, count: number, reaction: string | null) => {
    onInteractionChange?.('like', { isLiked, count, reaction })
  }

  const handleSaveChange = (isSaved: boolean, folder?: string) => {
    onInteractionChange?.('save', { isSaved, folder })
  }

  const handleShareChange = (sharesCount: number) => {
    onInteractionChange?.('share', { sharesCount })
  }

  return (
    <div className={cn(
      'flex items-center justify-between w-full',
      'border-t border-gray-100 pt-3 mt-3',
      className
    )}>
      {/* Like Button */}
      <div className="flex items-center">
        <LikeButton
          targetId={postId}
          targetType="post"
          initialLiked={initialLiked}
          initialCount={initialLikesCount}
          initialReaction={currentReaction}
          size={size}
          showCount={showCounts}
          onLikeChange={handleLikeChange}
        />
        {showLabels && (
          <span className="ml-2 text-sm text-gray-600">
            Curtir
          </span>
        )}
      </div>

      {/* Comment Button */}
      <div className="flex items-center">
        <Button
          size={size}
          variant="ghost"
          startContent={<MessageCircle className="w-4 h-4" />}
          onPress={onCommentClick}
          className="min-w-unit-12"
        >
          {showCounts && initialCommentsCount > 0 && (
            <span className="text-xs">{initialCommentsCount}</span>
          )}
        </Button>
        {showLabels && (
          <span className="ml-2 text-sm text-gray-600">
            Comentar
          </span>
        )}
      </div>

      {/* Share Button */}
      <div className="flex items-center">
        <ShareButton
          postId={postId}
          postContent={postContent}
          postAuthor={postAuthor}
          initialSharesCount={initialSharesCount}
          size={size}
          showCount={showCounts}
          onShareChange={handleShareChange}
        />
        {showLabels && (
          <span className="ml-2 text-sm text-gray-600">
            Compartilhar
          </span>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center">
        <SaveButton
          postId={postId}
          initialSaved={initialSaved}
          size={size}
          onSaveChange={handleSaveChange}
        />
        {showLabels && (
          <span className="ml-2 text-sm text-gray-600">
            Salvar
          </span>
        )}
      </div>
    </div>
  )
}