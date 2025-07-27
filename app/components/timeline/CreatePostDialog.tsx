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
      <DialogContent
        className="max-w-lg bg-white dark:bg-gray-900 p-0 sm:p-6 sm:rounded-2xl sm:max-w-lg w-full h-full sm:h-auto fixed sm:relative top-0 left-0 right-0 bottom-0 sm:top-auto sm:left-auto sm:right-auto sm:bottom-auto z-50"
        style={{
          borderRadius: undefined,
          maxWidth: undefined }}
      >
        <DialogHeader className="px-4 pt-4 pb-2 sm:px-0 sm:pt-0 sm:pb-0">
          <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl">Criar Novo Post</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4 sm:px-0 sm:pb-0">
          <CreatePostForm newPost={newPost} setNewPost={setNewPost} handleCreatePost={handleCreatePost} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
