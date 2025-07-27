"use client"

import { ImageIcon, Video, Mic, FileImage } from 'lucide-react'
import { Button } from "@heroui/react"
import PremiumLockBadge from '@/app/components/premium/PremiumLockBadge'
import { usePremiumFeatures } from '@/lib/hooks/usePremiumFeatures'

interface MediaUploadButtonsProps {
  onImageUpload?: () => void
  onVideoUpload?: () => void
  onAudioUpload?: () => void
  onMediaUpload?: () => void
  disabled?: boolean
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function MediaUploadButtons({ 
  onImageUpload,
  onVideoUpload, 
  onAudioUpload,
  onMediaUpload,
  disabled = false,
  showLabels = false,
  size = 'md',
  className = ''
}: MediaUploadButtonsProps) {
  const { features } = usePremiumFeatures()

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão de Upload de Mídia Geral */}
      {onMediaUpload && (
        <PremiumLockBadge 
          feature="canSendMedia"
          size="sm"
          disabled={!features.canSendMedia}
        >
          <Button
            isIconOnly={!showLabels}
            variant="light"
            size={buttonSize}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            onClick={onMediaUpload}
            disabled={disabled || !features.canSendMedia}
            title="Enviar mídia"
          >
            <FileImage className={iconSize} />
            {showLabels && <span className="ml-2">Mídia</span>}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Upload de Imagem */}
      {onImageUpload && (
        <PremiumLockBadge 
          feature="canSendMedia"
          size="sm"
          disabled={!features.canSendMedia}
        >
          <Button
            isIconOnly={!showLabels}
            variant="light"
            size={buttonSize}
            className="text-gray-600 hover:text-green-600 hover:bg-green-50"
            onClick={onImageUpload}
            disabled={disabled || !features.canSendMedia}
            title="Enviar imagem"
          >
            <ImageIcon className={iconSize} />
            {showLabels && <span className="ml-2">Imagem</span>}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Upload de Vídeo */}
      {onVideoUpload && (
        <PremiumLockBadge 
          feature="canSendVideo"
          size="sm"
          disabled={!features.canSendVideo}
        >
          <Button
            isIconOnly={!showLabels}
            variant="light"
            size={buttonSize}
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            onClick={onVideoUpload}
            disabled={disabled || !features.canSendVideo}
            title="Enviar vídeo"
          >
            <Video className={iconSize} />
            {showLabels && <span className="ml-2">Vídeo</span>}
          </Button>
        </PremiumLockBadge>
      )}

      {/* Botão de Upload de Áudio */}
      {onAudioUpload && (
        <PremiumLockBadge 
          feature="canSendAudio"
          size="sm"
          disabled={!features.canSendAudio}
        >
          <Button
            isIconOnly={!showLabels}
            variant="light"
            size={buttonSize}
            className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            onClick={onAudioUpload}
            disabled={disabled || !features.canSendAudio}
            title="Gravar áudio"
          >
            <Mic className={iconSize} />
            {showLabels && <span className="ml-2">Áudio</span>}
          </Button>
        </PremiumLockBadge>
      )}
    </div>
  )
}

// Versão compacta para chat
export function ChatMediaButtons({ onImageUpload, onVideoUpload, onAudioUpload }: MediaUploadButtonsProps) {
  return (
    <MediaUploadButtons 
      onImageUpload={onImageUpload}
      onVideoUpload={onVideoUpload}
      onAudioUpload={onAudioUpload}
      size="sm"
      showLabels={false}
    />
  )
}

// Versão completa para criar post
export function PostMediaButtons({ onImageUpload, onVideoUpload, onAudioUpload }: MediaUploadButtonsProps) {
  return (
    <MediaUploadButtons 
      onImageUpload={onImageUpload}
      onVideoUpload={onVideoUpload}
      onAudioUpload={onAudioUpload}
      size="md"
      showLabels={true}
      className="flex-wrap"
    />
  )
}

// Versão para toolbar
export function MediaToolbar({ onMediaUpload }: MediaUploadButtonsProps) {
  return (
    <MediaUploadButtons 
      onMediaUpload={onMediaUpload}
      size="sm"
      showLabels={false}
    />
  )
}