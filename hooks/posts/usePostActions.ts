import { useCallback } from "react"
import { usePostStore } from "@/lib/stores/post-store"
import { toast } from "sonner"
import type { 
  PostId, 
  CommentId, 
  PostCreate, 
  PostUpdate, 
  CommentCreate, 
  ReactionType 
} from '@/types/post'

export function usePostActions() {
  const {
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addReaction,
    removeReaction,
    toggleSave,
    sharePost,
    viewPost,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    clearErrors } = usePostStore()

  // Post actions with error handling and user feedback
  const handleCreatePost = useCallback(async (data: PostCreate) => {
    try {
      const post = await createPost(data)
      toast.success('Post criado com sucesso!')
      return post
    } catch (error) {
      toast.error('Erro ao criar post. Tente novamente.')
      throw error
    }
  }, [createPost])

  const handleUpdatePost = useCallback(async (id: PostId, data: PostUpdate) => {
    try {
      const post = await updatePost(id, data)
      toast.success('Post atualizado com sucesso!')
      return post
    } catch (error) {
      toast.error('Erro ao atualizar post. Tente novamente.')
      throw error
    }
  }, [updatePost])

  const handleDeletePost = useCallback(async (id: PostId) => {
    try {
      await deletePost(id)
      toast.success('Post excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir post. Tente novamente.')
      throw error
    }
  }, [deletePost])

  // Engagement actions with optimistic updates
  const handleToggleLike = useCallback(async (postId: PostId) => {
    try {
      await toggleLike(postId)
    } catch (error) {
      toast.error('Erro ao curtir post. Tente novamente.')
    }
  }, [toggleLike])

  const handleAddReaction = useCallback(async (postId: PostId, reaction: ReactionType) => {
    try {
      await addReaction(postId, reaction)
    } catch (error) {
      toast.error('Erro ao reagir ao post. Tente novamente.')
    }
  }, [addReaction])

  const handleRemoveReaction = useCallback(async (postId: PostId) => {
    try {
      await removeReaction(postId)
    } catch (error) {
      toast.error('Erro ao remover reação. Tente novamente.')
    }
  }, [removeReaction])

  const handleToggleSave = useCallback(async (postId: PostId) => {
    try {
      await toggleSave(postId)
    } catch (error) {
      toast.error('Erro ao salvar post. Tente novamente.')
    }
  }, [toggleSave])

  const handleSharePost = useCallback(async (postId: PostId) => {
    try {
      await sharePost(postId)
      toast.success('Post compartilhado!')
    } catch (error) {
      toast.error('Erro ao compartilhar post. Tente novamente.')
    }
  }, [sharePost])

  const handleViewPost = useCallback(async (postId: PostId) => {
    try {
      await viewPost(postId)
    } catch (error) {
      // Silent error for view tracking
      console.error('Failed to track post view:', error)
    }
  }, [viewPost])

  // Comment actions with user feedback
  const handleCreateComment = useCallback(async (data: CommentCreate) => {
    try {
      const comment = await createComment(data)
      toast.success('Comentário adicionado!')
      return comment
    } catch (error) {
      toast.error('Erro ao comentar. Tente novamente.')
      throw error
    }
  }, [createComment])

  const handleUpdateComment = useCallback(async (id: CommentId, content: string) => {
    try {
      const comment = await updateComment(id, content)
      toast.success('Comentário atualizado!')
      return comment
    } catch (error) {
      toast.error('Erro ao atualizar comentário. Tente novamente.')
      throw error
    }
  }, [updateComment])

  const handleDeleteComment = useCallback(async (id: CommentId) => {
    try {
      await deleteComment(id)
      toast.success('Comentário excluído!')
    } catch (error) {
      toast.error('Erro ao excluir comentário. Tente novamente.')
      throw error
    }
  }, [deleteComment])

  const handleToggleCommentLike = useCallback(async (commentId: CommentId) => {
    try {
      await toggleCommentLike(commentId)
    } catch (error) {
      toast.error('Erro ao curtir comentário. Tente novamente.')
    }
  }, [toggleCommentLike])

  // Utility actions
  const handleClearErrors = useCallback(() => {
    clearErrors()
  }, [clearErrors])

  return {
    // Post actions
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    
    // Engagement actions
    toggleLike: handleToggleLike,
    addReaction: handleAddReaction,
    removeReaction: handleRemoveReaction,
    toggleSave: handleToggleSave,
    sharePost: handleSharePost,
    viewPost: handleViewPost,
    
    // Comment actions
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    toggleCommentLike: handleToggleCommentLike,
    
    // Utility
    clearErrors: handleClearErrors }
}

// Specialized hook for post engagement
export function usePostEngagement(postId: PostId) {
  const post = usePostStore((state) => state.getPostById(postId))
  const engagement = usePostStore((state) => state.getPostEngagement(postId))
  const { toggleLike, addReaction, removeReaction, toggleSave, sharePost } = usePostActions()

  const handleLike = useCallback(() => {
    toggleLike(postId)
  }, [postId, toggleLike])

  const handleReaction = useCallback((reaction: ReactionType) => {
    if (engagement?.userReaction === reaction) {
      removeReaction(postId)
    } else {
      addReaction(postId, reaction)
    }
  }, [postId, engagement?.userReaction, addReaction, removeReaction])

  const handleSave = useCallback(() => {
    toggleSave(postId)
  }, [postId, toggleSave])

  const handleShare = useCallback(() => {
    sharePost(postId)
  }, [postId, sharePost])

  return {
    post,
    engagement,
    actions: {
      like: handleLike,
      reaction: handleReaction,
      save: handleSave,
      share: handleShare } }
}

// Hook for comment engagement
export function useCommentEngagement(commentId: CommentId) {
  const comment = usePostStore((state) => state.getCommentById(commentId))
  const { toggleCommentLike } = usePostActions()

  const handleLike = useCallback(() => {
    toggleCommentLike(commentId)
  }, [commentId, toggleCommentLike])

  return {
    comment,
    actions: {
      like: handleLike } }
}
