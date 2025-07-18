import { Database } from './database'

// ===== BASE TYPES =====
export type PostId = string
export type UserId = string
export type CommentId = string

// ===== ENUMS =====
export enum PostVisibility {
  PUBLIC = 'public',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document'
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum PostType {
  TEXT = 'text',
  MEDIA = 'media',
  POLL = 'poll',
  EVENT = 'event',
  PREMIUM = 'premium'
}

// ===== MEDIA INTERFACES =====
export interface MediaFile {
  id: string
  url: string
  type: MediaType
  size: number
  width?: number
  height?: number
  duration?: number // for video/audio
  thumbnailUrl?: string
  altText?: string
}

export interface MediaUploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

// ===== LOCATION INTERFACE =====
export interface PostLocation {
  latitude: number
  longitude: number
  name: string
  city?: string
  state?: string
  country?: string
}

// ===== POLL INTERFACES =====
export interface PollOption {
  id: string
  text: string
  votes: number
  voters: UserId[]
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  expiresAt?: Date
  allowMultipleVotes: boolean
  isVotingClosed: boolean
  userVote?: string[] // option IDs that current user voted for
}

// ===== EVENT INTERFACES =====
export interface EventDetails {
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  location?: PostLocation
  isOnline: boolean
  maxAttendees?: number
  currentAttendees: number
  isAttending?: boolean
}

// ===== ENGAGEMENT INTERFACES =====
export interface PostStats {
  likes: number
  comments: number
  shares: number
  views: number
  reactions: Record<ReactionType, number>
}

export interface UserReaction {
  userId: UserId
  type: ReactionType
  createdAt: Date
}

export interface PostEngagement {
  isLiked: boolean
  isSaved: boolean
  isShared: boolean
  userReaction?: ReactionType
  hasViewed: boolean
}

// ===== COMMENT INTERFACES =====
export interface Comment {
  id: CommentId
  postId: PostId
  userId: UserId
  content: string
  parentId?: CommentId // for replies
  createdAt: Date
  updatedAt?: Date
  stats: {
    likes: number
    replies: number
  }
  isLiked?: boolean
  isEdited: boolean
  user?: PostUser // populated in API responses
  replies?: Comment[] // populated when fetching with replies
}

export interface CommentCreate {
  postId: PostId
  content: string
  parentId?: CommentId
}

export interface CommentUpdate {
  content: string
}

// ===== USER INTERFACE =====
export interface PostUser {
  id: UserId
  username: string
  displayName: string
  avatarUrl?: string
  isVerified: boolean
  isPremium: boolean
  followerCount?: number
  isFollowing?: boolean
  isFollowedBy?: boolean
}

// ===== MAIN POST INTERFACE =====
export interface Post {
  id: PostId
  userId: UserId
  content: string
  type: PostType
  visibility: PostVisibility
  createdAt: Date
  updatedAt?: Date
  
  // Media
  media: MediaFile[]
  
  // Social features
  hashtags: string[]
  mentions: UserId[]
  location?: PostLocation
  
  // Engagement
  stats: PostStats
  engagement: PostEngagement
  
  // Special content types
  poll?: Poll
  eventDetails?: EventDetails
  
  // Premium content
  isPremiumContent: boolean
  price?: number
  
  // Metadata
  isEdited: boolean
  isDeleted: boolean
  deletedAt?: Date
  
  // User data (populated in API responses)
  user?: PostUser
  
  // Comments (populated when requested)
  comments?: Comment[]
  topComments?: Comment[] // first few comments for preview
}

// ===== POST CREATION/UPDATE INTERFACES =====
export interface PostCreate {
  content: string
  type: PostType
  visibility: PostVisibility
  media?: Omit<MediaFile, 'id'>[]
  hashtags?: string[]
  mentions?: UserId[]
  location?: PostLocation
  poll?: Omit<Poll, 'id' | 'totalVotes' | 'userVote'>
  eventDetails?: Omit<EventDetails, 'currentAttendees' | 'isAttending'>
  isPremiumContent?: boolean
  price?: number
}

export interface PostUpdate {
  content?: string
  visibility?: PostVisibility
  location?: PostLocation
  hashtags?: string[]
  mentions?: UserId[]
}

export interface PostDraft extends Partial<PostCreate> {
  id: string
  lastSaved: Date
}

// ===== API RESPONSE TYPES =====
export interface PostsResponse {
  posts: Post[]
  nextCursor?: string
  hasMore: boolean
  totalCount?: number
}

export interface CommentsResponse {
  comments: Comment[]
  nextCursor?: string
  hasMore: boolean
  totalCount: number
}

export interface PostResponse {
  post: Post
}

// ===== API REQUEST TYPES =====
export interface PostsQuery {
  cursor?: string
  limit?: number
  userId?: UserId
  visibility?: PostVisibility[]
  type?: PostType[]
  hasMedia?: boolean
  hashtag?: string
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
  dateFrom?: Date
  dateTo?: Date
  sortBy?: 'created_at' | 'engagement' | 'trending'
  sortOrder?: 'asc' | 'desc'
}

export interface CommentsQuery {
  postId: PostId
  cursor?: string
  limit?: number
  sortBy?: 'created_at' | 'likes'
  sortOrder?: 'asc' | 'desc'
  includeReplies?: boolean
}

// ===== ERROR TYPES =====
export interface PostError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

export interface PostValidationError extends PostError {
  field: string
  code: 'VALIDATION_ERROR'
}

export interface PostNotFoundError extends PostError {
  code: 'POST_NOT_FOUND'
  postId: PostId
}

export interface PostPermissionError extends PostError {
  code: 'PERMISSION_DENIED'
  action: string
}

// ===== FORM TYPES =====
export interface PostFormData {
  content: string
  visibility: PostVisibility
  media: File[]
  location?: PostLocation
  poll?: {
    question: string
    options: string[]
    allowMultipleVotes: boolean
    expiresIn?: number // hours
  }
  eventDetails?: {
    title: string
    description?: string
    startDate: Date
    endDate?: Date
    location?: PostLocation
    isOnline: boolean
    maxAttendees?: number
  }
  isPremiumContent: boolean
  price?: number
}

// ===== STATE MANAGEMENT TYPES =====
export interface PostState {
  posts: Record<PostId, Post>
  comments: Record<CommentId, Comment>
  drafts: Record<string, PostDraft>
  loading: {
    posts: boolean
    comments: Record<PostId, boolean>
    creating: boolean
    updating: Record<PostId, boolean>
  }
  errors: {
    posts?: PostError
    comments: Record<PostId, PostError | undefined>
    creating?: PostError
    updating: Record<PostId, PostError | undefined>
  }
  pagination: {
    posts: {
      cursor?: string
      hasMore: boolean
    }
    comments: Record<PostId, {
      cursor?: string
      hasMore: boolean
    }>
  }
}

// ===== UTILITY TYPES =====
export type PostWithUser = Post & { user: PostUser }
export type CommentWithUser = Comment & { user: PostUser }
export type PostPreview = Pick<Post, 'id' | 'content' | 'media' | 'stats' | 'createdAt' | 'user'>

// ===== TYPE GUARDS =====
export function isMediaPost(post: Post): post is Post & { media: MediaFile[] } {
  return post.type === PostType.MEDIA && post.media.length > 0
}

export function isPollPost(post: Post): post is Post & { poll: Poll } {
  return post.type === PostType.POLL && !!post.poll
}

export function isEventPost(post: Post): post is Post & { eventDetails: EventDetails } {
  return post.type === PostType.EVENT && !!post.eventDetails
}

export function isPremiumPost(post: Post): boolean {
  return post.isPremiumContent && !!post.price
}

// ===== CONSTANTS =====
export const POST_CONSTANTS = {
  MAX_CONTENT_LENGTH: 2000,
  MAX_MEDIA_FILES: 10,
  MAX_MEDIA_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_POLL_OPTIONS: 10,
  MAX_POLL_OPTION_LENGTH: 100,
  MAX_HASHTAGS: 20,
  MAX_MENTIONS: 50,
  DEFAULT_POSTS_LIMIT: 20,
  DEFAULT_COMMENTS_LIMIT: 10,
} as const