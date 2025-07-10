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
} from "lucide-react"
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
    verified: boolean
    premium: boolean
  }
  comments: Comment[]
  onAddComment: (content: string) => void
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
  onLikeComment,
}: CommentsDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    // Implementar lógica de formatação de tempo
    return timestamp
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">Comentários</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Post Preview */}
          <div className="border-b pb-4 mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={postAuthor.avatar} alt={postAuthor.name} />
                <AvatarFallback>{postAuthor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{postAuthor.name}</span>
                  {postAuthor.verified && (
                    <BadgeCheckIcon className="w-4 h-4 fill-sky-500 text-white" />
                  )}
                  {postAuthor.premium && (
                    <Badge variant="outline" className="text-xs border-pink-600 text-pink-600">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{postContent}</p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.author.name}</span>
                      {comment.author.verified && (
                        <BadgeCheckIcon className="w-3 h-3 fill-sky-500 text-white" />
                      )}
                      {comment.author.premium && (
                        <Badge variant="outline" className="text-xs border-pink-600 text-pink-600">
                          Premium
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLikeComment(comment.id)}
                        className={cn(
                          "h-6 px-2 text-xs",
                          comment.isLiked && "text-orange-500"
                        )}
                      >
                        <Flame className={cn("w-3 h-3 mr-1", comment.isLiked && "fill-orange-500")} />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Responder
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
                maxLength={500}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="self-end"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {newComment.length}/500
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
