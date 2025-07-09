"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Heart, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    isPremium: boolean
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface CommentsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  comments: Comment[]
  newComment: string
  setNewComment: (comment: string) => void
  handleSendComment: () => void
  post?: any
}

export function CommentsDialog({
  isOpen,
  setIsOpen,
  comments,
  newComment,
  setNewComment,
  handleSendComment,
  post,
}: CommentsDialogProps) {
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      handleSendComment()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-card border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">Comentários</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Post Preview */}
          {post && (
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-foreground">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">@{post.author.username}</p>
                </div>
              </div>
              <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
            </div>
          )}
        </DialogHeader>

        {/* Comments List */}
        <ScrollArea className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {comment.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground">{comment.author.name}</p>
                      {comment.author.isPremium && (
                        <Badge className="text-xs bg-primary text-primary-foreground">Premium</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment.id)}
                      className="h-8 px-2 hover:bg-orange-50 text-muted-foreground hover:text-orange-600"
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4 mr-1",
                          likedComments.has(comment.id) && "fill-orange-500 text-orange-500",
                        )}
                      />
                      {comment.likes + (likedComments.has(comment.id) && !comment.isLiked ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <Separator />

        {/* Comment Input */}
        <div className="p-6 pt-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-muted border-border rounded-xl"
              />
              <Button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
