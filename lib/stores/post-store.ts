import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Post,
  PostId,
  Comment,
  CommentId,
  PostState,
  PostCreate,
  PostUpdate,
  CommentCreate,
  PostError,
  PostsQuery,
  CommentsQuery,
  ReactionType,
  PostEngagement,
  UserId
} from '@/types/post'

interface PostActions {
  // Post CRUD operations
  createPost: (data: PostCreate) => Promise<Post>
  updatePost: (id: PostId, data: PostUpdate) => Promise<Post>
  deletePost: (id: PostId) => Promise<void>
  fetchPost: (id: PostId) => Promise<Post>
  fetchPosts: (query?: PostsQuery) => Promise<void>
  
  // Engagement actions
  toggleLike: (postId: PostId) => Promise<void>
  addReaction: (postId: PostId, reaction: ReactionType) => Promise<void>
  removeReaction: (postId: PostId) => Promise<void>
  toggleSave: (postId: PostId) => Promise<void>
  sharePost: (postId: PostId) => Promise<void>
  viewPost: (postId: PostId) => Promise<void>
  
  // Comment operations
  fetchComments: (postId: PostId, query?: CommentsQuery) => Promise<void>
  createComment: (data: CommentCreate) => Promise<Comment>
  updateComment: (id: CommentId, content: string) => Promise<Comment>
  deleteComment: (id: CommentId) => Promise<void>
  toggleCommentLike: (commentId: CommentId) => Promise<void>
  
  // State management
  setPost: (post: Post) => void
  setPosts: (posts: Post[]) => void
  updatePostInStore: (id: PostId, updates: Partial<Post>) => void
  removePost: (id: PostId) => void
  setComments: (postId: PostId, comments: Comment[]) => void
  addComment: (comment: Comment) => void
  updateComment: (id: CommentId, updates: Partial<Comment>) => void
  removeComment: (id: CommentId) => void
  
  // Loading states
  setPostsLoading: (loading: boolean) => void
  setCommentsLoading: (postId: PostId, loading: boolean) => void
  setCreatingPost: (loading: boolean) => void
  setUpdatingPost: (postId: PostId, loading: boolean) => void
  
  // Error handling
  setPostsError: (error?: PostError) => void
  setCommentsError: (postId: PostId, error?: PostError) => void
  setCreatingError: (error?: PostError) => void
  setUpdatingError: (postId: PostId, error?: PostError) => void
  clearErrors: () => void
  
  // Pagination
  setPostsPagination: (cursor?: string, hasMore?: boolean) => void
  setCommentsPagination: (postId: PostId, cursor?: string, hasMore?: boolean) => void
  
  // Utility functions
  getPostById: (id: PostId) => Post | undefined
  getCommentById: (id: CommentId) => Comment | undefined
  getPostComments: (postId: PostId) => Comment[]
  getPostEngagement: (postId: PostId) => PostEngagement | undefined
  
  // Real-time updates
  handleRealtimeUpdate: (payload: any) => void
  subscribeToPost: (postId: PostId) => void
  unsubscribeFromPost: (postId: PostId) => void
}

type PostStore = PostState & PostActions

const initialState: PostState = {
  posts: {},
  comments: {},
  drafts: {},
  loading: {
    posts: false,
    comments: {},
    creating: false,
    updating: {},
  },
  errors: {
    posts: undefined,
    comments: {},
    creating: undefined,
    updating: {},
  },
  pagination: {
    posts: {
      cursor: undefined,
      hasMore: true,
    },
    comments: {},
  },
}

export const usePostStore = create<PostStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,
      
      // ===== POST CRUD OPERATIONS =====
      createPost: async (data: PostCreate) => {
        set((state) => {
          state.loading.creating = true
          state.errors.creating = undefined
        })
        
        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to create post')
          }
          
          const { post } = await response.json()
          
          set((state) => {
            state.posts[post.id] = post
            state.loading.creating = false
          })
          
          return post
        } catch (error) {
          const postError: PostError = {
            code: 'CREATE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create post'
          }
          
          set((state) => {
            state.loading.creating = false
            state.errors.creating = postError
          })
          
          throw postError
        }
      },
      
      updatePost: async (id: PostId, data: PostUpdate) => {
        set((state) => {
          state.loading.updating[id] = true
          state.errors.updating[id] = undefined
        })
        
        try {
          const response = await fetch(`/api/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update post')
          }
          
          const { post } = await response.json()
          
          set((state) => {
            state.posts[id] = post
            state.loading.updating[id] = false
          })
          
          return post
        } catch (error) {
          const postError: PostError = {
            code: 'UPDATE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to update post'
          }
          
          set((state) => {
            state.loading.updating[id] = false
            state.errors.updating[id] = postError
          })
          
          throw postError
        }
      },
      
      deletePost: async (id: PostId) => {
        try {
          const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to delete post')
          }
          
          set((state) => {
            delete state.posts[id]
          })
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to delete post')
        }
      },
      
      fetchPost: async (id: PostId) => {
        try {
          const response = await fetch(`/api/posts/${id}`)
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to fetch post')
          }
          
          const { post } = await response.json()
          
          set((state) => {
            state.posts[id] = post
          })
          
          return post
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to fetch post')
        }
      },
      
      fetchPosts: async (query?: PostsQuery) => {
        set((state) => {
          state.loading.posts = true
          state.errors.posts = undefined
        })
        
        try {
          const searchParams = new URLSearchParams()
          if (query) {
            Object.entries(query).forEach(([key, value]) => {
              if (value !== undefined) {
                searchParams.append(key, String(value))
              }
            })
          }
          
          const response = await fetch(`/api/posts?${searchParams}`)
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to fetch posts')
          }
          
          const { posts, nextCursor, hasMore } = await response.json()
          
          set((state) => {
            // Add new posts to store
            posts.forEach((post: Post) => {
              state.posts[post.id] = post
            })
            
            // Update pagination
            state.pagination.posts.cursor = nextCursor
            state.pagination.posts.hasMore = hasMore
            state.loading.posts = false
          })
        } catch (error) {
          const postError: PostError = {
            code: 'FETCH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch posts'
          }
          
          set((state) => {
            state.loading.posts = false
            state.errors.posts = postError
          })
          
          throw postError
        }
      },
      
      // ===== ENGAGEMENT ACTIONS =====
      toggleLike: async (postId: PostId) => {
        const post = get().posts[postId]
        if (!post) return
        
        // Optimistic update
        const isLiked = post.engagement.isLiked
        const newLikesCount = isLiked ? post.stats.likes - 1 : post.stats.likes + 1
        
        set((state) => {
          const post = state.posts[postId]
          if (post) {
            post.engagement.isLiked = !isLiked
            post.stats.likes = newLikesCount
          }
        })
        
        try {
          const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
          })
          
          if (!response.ok) {
            // Revert optimistic update
            set((state) => {
              const post = state.posts[postId]
              if (post) {
                post.engagement.isLiked = isLiked
                post.stats.likes = post.stats.likes
              }
            })
            throw new Error('Failed to toggle like')
          }
          
          const { post: updatedPost } = await response.json()
          set((state) => {
            state.posts[postId] = updatedPost
          })
        } catch (error) {
          // Error handling is done above with optimistic update revert
          console.error('Failed to toggle like:', error)
        }
      },
      
      addReaction: async (postId: PostId, reaction: ReactionType) => {
        try {
          const response = await fetch(`/api/posts/${postId}/reaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reaction }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to add reaction')
          }
          
          const { post } = await response.json()
          set((state) => {
            state.posts[postId] = post
          })
        } catch (error) {
          console.error('Failed to add reaction:', error)
        }
      },
      
      removeReaction: async (postId: PostId) => {
        try {
          const response = await fetch(`/api/posts/${postId}/reaction`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            throw new Error('Failed to remove reaction')
          }
          
          const { post } = await response.json()
          set((state) => {
            state.posts[postId] = post
          })
        } catch (error) {
          console.error('Failed to remove reaction:', error)
        }
      },
      
      toggleSave: async (postId: PostId) => {
        const post = get().posts[postId]
        if (!post) return
        
        // Optimistic update
        const isSaved = post.engagement.isSaved
        
        set((state) => {
          const post = state.posts[postId]
          if (post) {
            post.engagement.isSaved = !isSaved
          }
        })
        
        try {
          const response = await fetch('/api/posts/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId }),
          })
          
          if (!response.ok) {
            // Revert optimistic update
            set((state) => {
              const post = state.posts[postId]
              if (post) {
                post.engagement.isSaved = isSaved
              }
            })
            throw new Error('Failed to toggle save')
          }
        } catch (error) {
          console.error('Failed to toggle save:', error)
        }
      },
      
      sharePost: async (postId: PostId) => {
        try {
          const response = await fetch(`/api/posts/${postId}/share`, {
            method: 'POST',
          })
          
          if (!response.ok) {
            throw new Error('Failed to share post')
          }
          
          // Update share count
          set((state) => {
            const post = state.posts[postId]
            if (post) {
              post.stats.shares += 1
              post.engagement.isShared = true
            }
          })
        } catch (error) {
          console.error('Failed to share post:', error)
        }
      },
      
      viewPost: async (postId: PostId) => {
        const post = get().posts[postId]
        if (!post || post.engagement.hasViewed) return
        
        // Optimistic update
        set((state) => {
          const post = state.posts[postId]
          if (post) {
            post.engagement.hasViewed = true
            post.stats.views += 1
          }
        })
        
        try {
          await fetch(`/api/posts/${postId}/view`, {
            method: 'POST',
          })
        } catch (error) {
          console.error('Failed to record view:', error)
        }
      },
      
      // ===== COMMENT OPERATIONS =====
      fetchComments: async (postId: PostId, query?: CommentsQuery) => {
        set((state) => {
          state.loading.comments[postId] = true
          state.errors.comments[postId] = undefined
        })
        
        try {
          const searchParams = new URLSearchParams({ postId })
          if (query) {
            Object.entries(query).forEach(([key, value]) => {
              if (value !== undefined && key !== 'postId') {
                searchParams.append(key, String(value))
              }
            })
          }
          
          const response = await fetch(`/api/posts/${postId}/comments?${searchParams}`)
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to fetch comments')
          }
          
          const { comments, nextCursor, hasMore } = await response.json()
          
          set((state) => {
            // Add comments to store
            comments.forEach((comment: Comment) => {
              state.comments[comment.id] = comment
            })
            
            // Update pagination
            if (!state.pagination.comments[postId]) {
              state.pagination.comments[postId] = { cursor: undefined, hasMore: true }
            }
            state.pagination.comments[postId].cursor = nextCursor
            state.pagination.comments[postId].hasMore = hasMore
            state.loading.comments[postId] = false
          })
        } catch (error) {
          const postError: PostError = {
            code: 'FETCH_COMMENTS_FAILED',
            message: error instanceof Error ? error.message : 'Failed to fetch comments'
          }
          
          set((state) => {
            state.loading.comments[postId] = false
            state.errors.comments[postId] = postError
          })
          
          throw postError
        }
      },
      
      createComment: async (data: CommentCreate) => {
        try {
          const response = await fetch(`/api/posts/${data.postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to create comment')
          }
          
          const { comment } = await response.json()
          
          set((state) => {
            state.comments[comment.id] = comment
            // Update post comment count
            const post = state.posts[data.postId]
            if (post) {
              post.stats.comments += 1
            }
          })
          
          return comment
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to create comment')
        }
      },
      
      updateComment: async (id: CommentId, content: string) => {
        try {
          const response = await fetch(`/api/comments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update comment')
          }
          
          const { comment } = await response.json()
          
          set((state) => {
            state.comments[id] = comment
          })
          
          return comment
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to update comment')
        }
      },
      
      deleteComment: async (id: CommentId) => {
        const comment = get().comments[id]
        if (!comment) return
        
        try {
          const response = await fetch(`/api/comments/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to delete comment')
          }
          
          set((state) => {
            delete state.comments[id]
            // Update post comment count
            const post = state.posts[comment.postId]
            if (post) {
              post.stats.comments -= 1
            }
          })
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to delete comment')
        }
      },
      
      toggleCommentLike: async (commentId: CommentId) => {
        const comment = get().comments[commentId]
        if (!comment) return
        
        // Optimistic update
        const isLiked = comment.isLiked || false
        const newLikesCount = isLiked ? comment.stats.likes - 1 : comment.stats.likes + 1
        
        set((state) => {
          const comment = state.comments[commentId]
          if (comment) {
            comment.isLiked = !isLiked
            comment.stats.likes = newLikesCount
          }
        })
        
        try {
          const response = await fetch(`/api/comments/${commentId}/like`, {
            method: 'POST',
          })
          
          if (!response.ok) {
            // Revert optimistic update
            set((state) => {
              const comment = state.comments[commentId]
              if (comment) {
                comment.isLiked = isLiked
                comment.stats.likes = comment.stats.likes
              }
            })
            throw new Error('Failed to toggle comment like')
          }
          
          const { comment: updatedComment } = await response.json()
          set((state) => {
            state.comments[commentId] = updatedComment
          })
        } catch (error) {
          console.error('Failed to toggle comment like:', error)
        }
      },
      
      // ===== STATE MANAGEMENT =====
      setPost: (post: Post) => set((state) => {
        state.posts[post.id] = post
      }),
      
      setPosts: (posts: Post[]) => set((state) => {
        posts.forEach((post) => {
          state.posts[post.id] = post
        })
      }),
      
      updatePostInStore: (id: PostId, updates: Partial<Post>) => set((state) => {
        const post = state.posts[id]
        if (post) {
          Object.assign(post, updates)
        }
      }),
      
      removePost: (id: PostId) => set((state) => {
        delete state.posts[id]
      }),
      
      setComments: (postId: PostId, comments: Comment[]) => set((state) => {
        comments.forEach((comment) => {
          state.comments[comment.id] = comment
        })
      }),
      
      addComment: (comment: Comment) => set((state) => {
        state.comments[comment.id] = comment
      }),
      
      updateComment: (id: CommentId, updates: Partial<Comment>) => set((state) => {
        const comment = state.comments[id]
        if (comment) {
          Object.assign(comment, updates)
        }
      }),
      
      removeComment: (id: CommentId) => set((state) => {
        delete state.comments[id]
      }),
      
      // ===== LOADING STATES =====
      setPostsLoading: (loading: boolean) => set((state) => {
        state.loading.posts = loading
      }),
      
      setCommentsLoading: (postId: PostId, loading: boolean) => set((state) => {
        state.loading.comments[postId] = loading
      }),
      
      setCreatingPost: (loading: boolean) => set((state) => {
        state.loading.creating = loading
      }),
      
      setUpdatingPost: (postId: PostId, loading: boolean) => set((state) => {
        state.loading.updating[postId] = loading
      }),
      
      // ===== ERROR HANDLING =====
      setPostsError: (error?: PostError) => set((state) => {
        state.errors.posts = error
      }),
      
      setCommentsError: (postId: PostId, error?: PostError) => set((state) => {
        state.errors.comments[postId] = error
      }),
      
      setCreatingError: (error?: PostError) => set((state) => {
        state.errors.creating = error
      }),
      
      setUpdatingError: (postId: PostId, error?: PostError) => set((state) => {
        state.errors.updating[postId] = error
      }),
      
      clearErrors: () => set((state) => {
        state.errors = {
          posts: undefined,
          comments: {},
          creating: undefined,
          updating: {},
        }
      }),
      
      // ===== PAGINATION =====
      setPostsPagination: (cursor?: string, hasMore?: boolean) => set((state) => {
        if (cursor !== undefined) state.pagination.posts.cursor = cursor
        if (hasMore !== undefined) state.pagination.posts.hasMore = hasMore
      }),
      
      setCommentsPagination: (postId: PostId, cursor?: string, hasMore?: boolean) => set((state) => {
        if (!state.pagination.comments[postId]) {
          state.pagination.comments[postId] = { cursor: undefined, hasMore: true }
        }
        if (cursor !== undefined) state.pagination.comments[postId].cursor = cursor
        if (hasMore !== undefined) state.pagination.comments[postId].hasMore = hasMore
      }),
      
      // ===== UTILITY FUNCTIONS =====
      getPostById: (id: PostId) => get().posts[id],
      
      getCommentById: (id: CommentId) => get().comments[id],
      
      getPostComments: (postId: PostId) => 
        Object.values(get().comments).filter(comment => comment.postId === postId),
      
      getPostEngagement: (postId: PostId) => get().posts[postId]?.engagement,
      
      // ===== REAL-TIME UPDATES =====
      handleRealtimeUpdate: (payload: any) => {
        // Handle real-time updates from Supabase
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        switch (eventType) {
          case 'INSERT':
            if (newRecord.table === 'posts') {
              set((state) => {
                state.posts[newRecord.id] = newRecord
              })
            } else if (newRecord.table === 'comments') {
              set((state) => {
                state.comments[newRecord.id] = newRecord
              })
            }
            break
            
          case 'UPDATE':
            if (newRecord.table === 'posts') {
              set((state) => {
                state.posts[newRecord.id] = newRecord
              })
            } else if (newRecord.table === 'comments') {
              set((state) => {
                state.comments[newRecord.id] = newRecord
              })
            }
            break
            
          case 'DELETE':
            if (oldRecord.table === 'posts') {
              set((state) => {
                delete state.posts[oldRecord.id]
              })
            } else if (oldRecord.table === 'comments') {
              set((state) => {
                delete state.comments[oldRecord.id]
              })
            }
            break
        }
      },
      
      subscribeToPost: (postId: PostId) => {
        // Subscribe to real-time updates for a specific post
        // Implementation would depend on Supabase real-time setup
      },
      
      unsubscribeFromPost: (postId: PostId) => {
        // Unsubscribe from real-time updates for a specific post
        // Implementation would depend on Supabase real-time setup
      },
    }))
  )
)

// Utility hook for post-specific operations
export const usePost = (postId: PostId) => {
  const post = usePostStore((state) => state.posts[postId])
  const updatePost = usePostStore((state) => state.updatePostInStore)
  const engagement = usePostStore((state) => state.getPostEngagement(postId))
  
  return {
    post,
    engagement,
    updatePost: (updates: Partial<Post>) => updatePost(postId, updates),
  }
}

// Utility hook for comment-specific operations
export const useComment = (commentId: CommentId) => {
  const comment = usePostStore((state) => state.comments[commentId])
  const updateComment = usePostStore((state) => state.updateComment)
  
  return {
    comment,
    updateComment: (updates: Partial<Comment>) => updateComment(commentId, updates),
  }
}