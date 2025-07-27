"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Textarea } from "../../../components/ui/textarea"
import { Badge } from "../../../components/ui/badge"
import {
  Send,
  Heart,
  MoreHorizontal,
  BadgeCheckIcon,
  Flame,
  Clock,
  Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface CommentsDialogProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postContent: string
  postAuthor: {
    name: string
    username: string
    avatar: string
    verified?: boolean
    premium?: boolean
  }
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  onLikeComment: (commentId: string) => void
}

export function CommentsDialog({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor,
  comments,
  onAddComment,
  onLikeComment }: CommentsDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      await onAddComment(newComment.trim())
      setNewComment("")
      console.log("[CommentsDialog] Comentário enviado com sucesso")
    } catch (error) {
      console.error("[CommentsDialog] Erro ao enviar comentário:", error)
      setSubmitError("Erro ao enviar comentário. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m`
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h`
      } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)}d`
      } else {
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'short' 
        })
      }
    } catch (error) {
      console.error("Erro ao formatar timestamp:", error)
      return "agora"
    }
  }

  const handleLikeComment = (commentId: string) => {
    console.log("[CommentsDialog] Curtindo comentário:", commentId)
    onLikeComment(commentId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">Comentários</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Post Preview */}
          <div className="border-b pb-4 mb-4 flex-shrink-0">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={postAuthor.avatar || "/placeholder.svg"} 
                  alt={postAuthor.name} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {postAuthor.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    {postAuthor.name || "Usuário"}
                  </span>
                  {postAuthor.verified && (
                    <BadgeCheckIcon className="w-4 h-4 fill-sky-500 text-white flex-shrink-0" />
                  )}
                  {postAuthor.premium && (
                    <Badge variant="outline" className="text-xs border-pink-600 text-pink-600 flex-shrink-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                  {postContent}
                </p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="font-medium mb-1">Nenhum comentário ainda</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 group">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage 
                      src={comment.author.avatar || "/placeholder.svg"} 
                      alt={comment.author.name} 
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                      {comment.author.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {comment.author.name}
                      </span>
                      {comment.author.verified && (
                        <BadgeCheckIcon className="w-3 h-3 fill-sky-500 text-white flex-shrink-0" />
                      )}
                      {comment.author.premium && (
                        <Badge variant="outline" className="text-xs border-pink-600 text-pink-600 flex-shrink-0">
                          Premium
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2 text-gray-800 dark:text-gray-200 break-words leading-relaxed">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        className={cn(
                          "h-6 px-2 text-xs transition-colors",
                          comment.isLiked 
                            ? "text-orange-500 hover:text-orange-600" 
                            : "text-gray-500 hover:text-orange-500"
                        )}
                      >
                        <Flame className={cn(
                          "w-3 h-3 mr-1", 
                          comment.isLiked && "fill-orange-500"
                        )} />
                        {comment.likes}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="border-t pt-4 mt-4 flex-shrink-0">
            {submitError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicione um comentário... (Ctrl+Enter para enviar)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[60px] resize-none flex-1"
                maxLength={500}
                disabled={isSubmitting}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="self-end flex-shrink-0"
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isSubmitting ? "Enviando..." : "Ctrl+Enter para enviar"}
              </div>
              <div className={cn(
                "text-xs",
                newComment.length > 450 ? "text-red-500" : "text-gray-500 dark:text-gray-400"
              )}>
                {newComment.length}/500
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
