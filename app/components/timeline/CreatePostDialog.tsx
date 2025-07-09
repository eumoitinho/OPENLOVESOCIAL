"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreatePostForm } from "./CreatePostForm"

interface CreatePostDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  newPost: any
  setNewPost: (post: any) => void
  handleCreatePost: () => void
}

export function CreatePostDialog({ isOpen, setIsOpen, newPost, setNewPost, handleCreatePost }: CreatePostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Post</DialogTitle>
        </DialogHeader>
        <CreatePostForm newPost={newPost} setNewPost={setNewPost} handleCreatePost={handleCreatePost} />
      </DialogContent>
    </Dialog>
  )
}
