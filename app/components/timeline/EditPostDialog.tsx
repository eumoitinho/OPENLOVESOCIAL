"use client"

import { useState, useEffect } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Chip } from "@heroui/react"
import { 
  Image as ImageIcon, 
  Video, 
  X, 
  Save, 
  Loader2,
  AlertCircle,
  Edit3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Post {
  id: string | number
  content: string
  images?: string[] | null
  video?: string | null
  audio?: string | null
  user?: {
    name?: string
    username?: string
    avatar?: string
  }
}

interface EditPostDialogProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  onSave: (updatedPost: Partial<Post>) => void
  currentUser?: {
    name: string
    username: string
    avatar: string
  }
}

export function EditPostDialog({
  isOpen,
  onClose,
  post,
  onSave,
  currentUser
}: EditPostDialogProps) {
  // Validar o ID do post
  if (!post.id || (typeof post.id !== 'string' && typeof post.id !== 'number')) {
    console.error('[EditPostDialog] ID do post inválido:', post.id)
    // Em vez de retornar null, vamos mostrar um erro no dialog
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Erro
            </DialogTitle>
            <DialogDescription>
              ID do post inválido. Não é possível editar este post.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  const [content, setContent] = useState(post.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)
  const maxChars = 280

  useEffect(() => {
    if (isOpen) {
      setContent(post.content || "")
      setCharCount(post.content?.length || 0)
      setError(null)
    }
  }, [isOpen, post.content])

  const handleContentChange = (value: string) => {
    if (value.length <= maxChars) {
      setContent(value)
      setCharCount(value.length)
      setError(null)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      setError("O conteúdo do post não pode estar vazio")
      return
    }

    if (content.trim() === post.content?.trim()) {
      toast.info("Nenhuma alteração foi feita")
      onClose()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[EditPostDialog] Post ID:', post.id, 'Type:', typeof post.id)
      
      // Garantir que o ID seja uma string válida
      let postId: string
      if (post.id === null || post.id === undefined || post.id === '') {
        throw new Error('ID do post é inválido')
      } else if (typeof post.id === 'number') {
        if (isNaN(post.id)) {
          throw new Error('ID do post é NaN')
        }
        postId = String(post.id)
      } else if (typeof post.id === 'string') {
        if (post.id === 'NaN' || post.id === 'undefined' || post.id === 'null') {
          throw new Error(`ID do post é inválido: ${post.id}`)
        }
        postId = post.id
      } else {
        throw new Error(`Tipo de ID inválido: ${typeof post.id}`)
      }
      
      console.log('[EditPostDialog] Using post ID:', postId)
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao editar post')
      }

      const updatedPost = await response.json()
      onSave({ content: content.trim() })
      toast.success("Post editado com sucesso")
      onClose()
    } catch (error) {
      console.error('Erro ao editar post:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error("Erro ao editar post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (content !== post.content && content.trim() !== "") {
      if (window.confirm("Descartar alterações?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Editar post
          </DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no seu post. As mídias anexadas não podem ser editadas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Header do usuário */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUser?.avatar || post.user?.avatar} />
              <AvatarFallback>
                {(currentUser?.name || post.user?.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {currentUser?.name || post.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">
                @{currentUser?.username || post.user?.username || "usuario"}
              </p>
            </div>
          </div>

          {/* Textarea para editar conteúdo */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="O que você está pensando?"
              className="min-h-[120px] resize-none border-gray-200 focus:border-pink-300 focus:ring-pink-200"
              disabled={isLoading}
            />
            
            {/* Contador de caracteres */}
            <div className="flex justify-between items-center text-xs">
              <span className={cn(
                "transition-colors",
                charCount > maxChars * 0.9 ? "text-orange-500" : "text-gray-500",
                charCount >= maxChars ? "text-red-500" : ""
              )}>
                {charCount}/{maxChars}
              </span>
              
              {charCount >= maxChars && (
                <Badge variant="destructive" className="text-xs">
                  Limite excedido
                </Badge>
              )}
            </div>
          </div>

          {/* Prévia das mídias (não editáveis) */}
          {(post.images?.length || post.video || post.audio) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mídia anexada (não editável):
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                {/* Imagens */}
                {post.images && post.images.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                    <span>{post.images.length} imagem{post.images.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                
                {/* Vídeo */}
                {post.video && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Video className="w-4 h-4" />
                    <span>1 vídeo</span>
                  </div>
                )}
                
                {/* Áudio */}
                {post.audio && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Video className="w-4 h-4" />
                    <span>1 áudio</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isLoading || !content.trim() || charCount > maxChars}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
