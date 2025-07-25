'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button, Tooltip } from '@nextui-org/react'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  postId: string
  initialSaved?: boolean
  initialFolder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'bordered' | 'ghost'
  showTooltip?: boolean
  className?: string
  onSaveChange?: (isSaved: boolean, folder?: string) => void
}

export default function SaveButton({
  postId,
  initialSaved = false,
  initialFolder = 'default',
  size = 'md',
  variant = 'ghost',
  showTooltip = true,
  className,
  onSaveChange
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [folder, setFolder] = useState(initialFolder)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current save status on mount
  useEffect(() => {
    const fetchSaveStatus = async () => {
      try {
        const response = await fetch(`/api/posts/save?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.data.saved)
          setFolder(data.data.folder || 'default')
        }
      } catch (error) {
        console.error('Erro ao buscar status de salvamento:', error)
      }
    }

    fetchSaveStatus()
  }, [postId])

  const handleSave = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/posts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId,
          folder_name: folder 
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar/remover post')
      }

      const data = await response.json()
      
      setIsSaved(data.data.saved)
      setFolder(data.data.folder || 'default')

      onSaveChange?.(data.data.saved, data.data.folder)
    } catch (error) {
      console.error('Erro ao salvar/remover post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const Icon = isSaved ? BookmarkCheck : Bookmark

  const buttonContent = (
    <Button
      size={size}
      variant={variant}
      color={isSaved ? 'success' : 'default'}
      isIconOnly
      onPress={handleSave}
      isDisabled={isLoading}
      isLoading={isLoading}
      className={cn(
        'transition-all duration-200',
        isSaved && 'text-green-600',
        className
      )}
    >
      <Icon 
        className={cn(
          'w-4 h-4',
          isSaved && 'fill-current'
        )}
      />
    </Button>
  )

  if (showTooltip) {
    return (
      <Tooltip 
        content={isSaved ? 'Remover dos salvos' : 'Salvar post'}
        placement="top"
      >
        {buttonContent}
      </Tooltip>
    )
  }

  return buttonContent
}