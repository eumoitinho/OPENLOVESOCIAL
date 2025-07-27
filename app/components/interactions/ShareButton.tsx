'use client'

import { useState } from "react"
import { Share2, MessageSquare, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Input, Textarea, Divider, User } from "@heroui/react"
import { cn } from "@/lib/utils"
import { DropdownMenu } from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  postId: string
  postContent?: string
  postAuthor?: string
  initialSharesCount?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'bordered' | 'ghost'
  showCount?: boolean
  className?: string
  onShareChange?: (sharesCount: number) => void
}

interface ShareOption {
  key: string
  label: string
  icon: React.ReactNode
  description?: string
}

const shareOptions: ShareOption[] = [
  {
    key: 'timeline',
    label: 'Compartilhar no timeline',
    icon: <Share2 className="w-4 h-4" />,
    description: 'Compartilhe com seus seguidores'
  },
  {
    key: 'direct_message',
    label: 'Enviar por mensagem',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Envie para amigos específicos'
  },
  {
    key: 'copy_link',
    label: 'Copiar link',
    icon: <Copy className="w-4 h-4" />,
    description: 'Copie o link do post'
  },
  {
    key: 'external',
    label: 'Compartilhar fora do app',
    icon: <ExternalLink className="w-4 h-4" />,
    description: 'WhatsApp, Telegram, etc.'
  }
]

export default function ShareButton({
  postId,
  postContent = '',
  postAuthor = '',
  initialSharesCount = 0,
  size = 'md',
  variant = 'ghost',
  showCount = true,
  className,
  onShareChange
}: ShareButtonProps) {
  const [sharesCount, setSharesCount] = useState(initialSharesCount)
  const [isLoading, setIsLoading] = useState(false)
  const [shareContent, setShareContent] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [linkCopied, setLinkCopied] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [shareType, setShareType] = useState<string>('')

  const handleShareOption = (key: string) => {
    setShareType(key)
    
    if (key === 'copy_link') {
      handleCopyLink()
    } else if (key === 'external') {
      handleExternalShare()
    } else {
      onOpen()
    }
  }

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/posts/${postId}`
      await navigator.clipboard.writeText(postUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  const handleExternalShare = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        const shareUrl = data.data.share_url
        const shareText = `Confira este post no OpenLove: ${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}`
        
        if (navigator.share) {
          await navigator.share({
            title: 'OpenLove',
            text: shareText,
            url: shareUrl
          })
        } else {
          // Fallback para desktop - abrir opções de compartilhamento
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
          window.open(whatsappUrl, '_blank')
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar externamente:', error)
    }
  }

  const handleShare = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const body: any = { share_type: shareType }
      
      if (shareType === 'timeline') {
        body.content = shareContent
      } else if (shareType === 'direct_message') {
        body.content = shareContent
        body.recipient_ids = selectedUsers
      }

      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Erro ao compartilhar')
      }

      const data = await response.json()
      setSharesCount(data.data.shares_count)
      onShareChange?.(data.data.shares_count)
      
      onClose()
      setShareContent('')
      setSelectedUsers([])
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            size={size}
            variant={variant}
            startContent={<Share2 className="w-4 h-4" />}
            className={cn(
              'min-w-unit-12',
              className
            )}
          >
            {showCount && sharesCount > 0 && (
              <span className="text-xs">{sharesCount}</span>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Opções de compartilhamento"
          onAction={(key) => handleShareOption(key as string)}
        >
          {shareOptions.map((option) => (
            <DropdownItem
              key={option.key}
              startContent={option.icon}
              description={option.description}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {linkCopied && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          Link copiado!
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {shareType === 'timeline' && 'Compartilhar no Timeline'}
                {shareType === 'direct_message' && 'Enviar por Mensagem'}
              </ModalHeader>
              <ModalBody className="pb-6">
                {shareType === 'timeline' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Share2 className="w-4 h-4" />
                        Compartilhando post de {postAuthor}
                      </div>
                      <p className="text-sm line-clamp-3">{postContent}</p>
                    </div>
                    
                    <Textarea
                      label="Adicione um comentário (opcional)"
                      placeholder="O que você pensa sobre isso?"
                      value={shareContent}
                      onValueChange={setShareContent}
                      maxRows={3}
                    />
                    
                    <Button
                      color="primary"
                      onPress={handleShare}
                      isLoading={isLoading}
                      className="w-full"
                    >
                      Compartilhar no Timeline
                    </Button>
                  </div>
                )}

                {shareType === 'direct_message' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        Enviando post de {postAuthor}
                      </div>
                      <p className="text-sm line-clamp-3">{postContent}</p>
                    </div>
                    
                    <Input
                      label="Pesquisar amigos"
                      placeholder="Digite o nome de um amigo..."
                      // TODO: Implementar busca de usuários
                    />
                    
                    <Textarea
                      label="Mensagem (opcional)"
                      placeholder="Adicione uma mensagem..."
                      value={shareContent}
                      onValueChange={setShareContent}
                      maxRows={2}
                    />
                    
                    <Button
                      color="primary"
                      onPress={handleShare}
                      isLoading={isLoading}
                      className="w-full"
                      isDisabled={selectedUsers.length === 0}
                    >
                      Enviar Mensagem
                    </Button>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
