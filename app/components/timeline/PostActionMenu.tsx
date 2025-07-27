"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  UserX,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PostActionMenuProps {
  postId: number | string
  postAuthor: {
    username: string
    name: string
    id?: string
  }
  currentUser: {
    username: string
    name: string
    id?: string
  }
  isOwnPost?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  onBlock?: () => void
  onHide?: () => void
  onUnlike?: () => void
  className?: string
}

export function PostActionMenu({
  postId,
  postAuthor,
  currentUser,
  isOwnPost = false,
  onEdit,
  onDelete,
  onReport,
  onBlock,
  onHide,
  onUnlike,
  className
}: PostActionMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${postId}`
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado para a área de transferência")
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  const handleOpenInNewTab = () => {
    const url = `${window.location.origin}/post/${postId}`
    window.open(url, '_blank')
  }

  const handleEdit = () => {
    onEdit?.()
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete?.()
    setShowDeleteDialog(false)
    toast.success("Post excluído com sucesso")
  }

  const handleReport = () => {
    setShowReportDialog(true)
  }

  const confirmReport = () => {
    onReport?.()
    setShowReportDialog(false)
    toast.success("Post denunciado. Nossa equipe irá revisar.")
  }

  const handleBlock = () => {
    setShowBlockDialog(true)
  }

  const confirmBlock = () => {
    onBlock?.()
    setShowBlockDialog(false)
    toast.success(`Usuário @${postAuthor.username} foi bloqueado`)
  }

  const handleHide = () => {
    onHide?.()
    toast.success("Post ocultado da sua timeline")
  }

  const handleUnlike = () => {
    onUnlike?.()
    toast.success("Post descurtido")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
              className
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">Mais opções</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          {/* Ações gerais */}
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar link do post
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleOpenInNewTab}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir em nova aba
          </DropdownMenuItem>

          {/* Ações do próprio usuário */}
          {isOwnPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar post
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir post
              </DropdownMenuItem>
            </>
          )}

          {/* Ações para posts de outros usuários */}
          {!isOwnPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUnlike}>
                <Copy className="w-4 h-4 mr-2" />
                Descurtir post
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleHide}>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar post
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleReport}
                className="text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400"
              >
                <Flag className="w-4 h-4 mr-2" />
                Denunciar post
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleBlock}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <UserX className="w-4 h-4 mr-2" />
                Bloquear @{postAuthor.username}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será permanentemente removido da sua timeline e dos feeds de outros usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para bloquear */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear @{postAuthor.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              Você não verá mais posts de @{postAuthor.username} e eles não poderão ver seus posts, seguir você ou enviar mensagens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBlock}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para denunciar */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta denúncia será enviada para nossa equipe de moderação. O post será revisado e ações apropriadas serão tomadas se necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReport}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              Denunciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
