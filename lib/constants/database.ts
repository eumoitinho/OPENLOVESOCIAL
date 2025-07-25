// ================================================================
// DATABASE CONSTANTS - OpenLove Unified System
// ================================================================
// Purpose: Centralized database constants for consistency
// Date: 2025-01-20
// 
// This file contains all database-related constants to ensure
// consistency across the entire application
// ================================================================

// ================================================================
// TABLE NAMES
// ================================================================
export const TABLES = {
  // Core tables
  USERS: 'users',
  FOLLOWS: 'follows',
  FRIENDS: 'friends',
  BLOCKED_USERS: 'blocked_users',
  
  // Content tables
  POSTS: 'posts',
  COMMENTS: 'comments',
  POST_LIKES: 'post_likes',
  COMMENT_LIKES: 'comment_likes',
  SAVED_POSTS: 'saved_posts',
  POLLS: 'polls',
  POLL_VOTES: 'poll_votes',
  
  // Chat system
  CONVERSATIONS: 'conversations',
  CONVERSATION_PARTICIPANTS: 'conversation_participants',
  MESSAGES: 'messages',
  MESSAGE_REACTIONS: 'message_reactions',
  MESSAGE_READS: 'message_reads',
  CALLS: 'calls',
  CALL_PARTICIPANTS: 'call_participants',
  
  // Events system
  EVENTS: 'events',
  EVENT_PARTICIPANTS: 'event_participants',
  EVENT_INVITATIONS: 'event_invitations',
  EVENT_UPDATES: 'event_updates',
  EVENT_PHOTOS: 'event_photos',
  
  // Communities system
  COMMUNITIES: 'communities',
  COMMUNITY_MEMBERS: 'community_members',
  COMMUNITY_POSTS: 'community_posts',
  COMMUNITY_INVITATIONS: 'community_invitations',
  COMMUNITY_RULES: 'community_rules',
  COMMUNITY_MODERATION_LOGS: 'community_moderation_logs',
  
  // Support tables
  NOTIFICATIONS: 'notifications',
  PROFILE_VIEWS: 'profile_views',
  PAYMENT_INTENTS: 'payment_intents',
  WEBHOOK_LOGS: 'webhook_logs',
  USER_MONTHLY_USAGE: 'user_monthly_usage',
  USER_MONTHLY_EVENTS: 'user_monthly_events',
} as const

// ================================================================
// PLAN TYPES (UNIFIED ENGLISH NOMENCLATURE)
// ================================================================
export const PLAN_TYPES = {
  FREE: 'free',
  GOLD: 'gold',
  DIAMOND: 'diamond',
  DIAMOND_ANNUAL: 'diamond_annual'
} as const

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES]

// ================================================================
// USER STATUS VALUES
// ================================================================
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DEACTIVATED: 'deactivated',
  PENDING_VERIFICATION: 'pending_verification'
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

// ================================================================
// SUBSCRIPTION STATUS VALUES
// ================================================================
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// ================================================================
// POST TYPES AND VISIBILITY
// ================================================================
export const POST_TYPES = {
  TEXT: 'text',
  MEDIA: 'media',
  POLL: 'poll',
  PREMIUM: 'premium',
  EVENT_SHARE: 'event_share',
  COMMUNITY_SHARE: 'community_share'
} as const

export type PostType = typeof POST_TYPES[keyof typeof POST_TYPES]

export const POST_VISIBILITY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private'
} as const

export type PostVisibility = typeof POST_VISIBILITY[keyof typeof POST_VISIBILITY]

// ================================================================
// MESSAGE TYPES
// ================================================================
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
  SYSTEM: 'system'
} as const

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]

// ================================================================
// CONVERSATION TYPES
// ================================================================
export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  EVENT: 'event',
  COMMUNITY: 'community'
} as const

export type ConversationType = typeof CONVERSATION_TYPES[keyof typeof CONVERSATION_TYPES]

// ================================================================
// EVENT STATUS VALUES
// ================================================================
export const EVENT_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

// ================================================================
// EVENT PARTICIPANT STATUS
// ================================================================
export const EVENT_PARTICIPANT_STATUS = {
  INTERESTED: 'interested',
  GOING: 'going',
  MAYBE: 'maybe',
  NOT_GOING: 'not_going',
  REMOVED: 'removed'
} as const

export type EventParticipantStatus = typeof EVENT_PARTICIPANT_STATUS[keyof typeof EVENT_PARTICIPANT_STATUS]

// ================================================================
// COMMUNITY MEMBER ROLES
// ================================================================
export const COMMUNITY_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member'
} as const

export type CommunityRole = typeof COMMUNITY_ROLES[keyof typeof COMMUNITY_ROLES]

// ================================================================
// NOTIFICATION TYPES
// ================================================================
export const NOTIFICATION_TYPES = {
  // Social interactions
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPT: 'friend_accept',
  
  // Post interactions
  POST_LIKE: 'post_like',
  POST_COMMENT: 'post_comment',
  COMMENT_LIKE: 'comment_like',
  COMMENT_REPLY: 'comment_reply',
  POST_SHARE: 'post_share',
  MENTION: 'mention',
  
  // Events
  EVENT_INVITATION: 'event_invitation',
  EVENT_REMINDER: 'event_reminder',
  
  // Communities
  COMMUNITY_INVITATION: 'community_invitation',
  COMMUNITY_POST: 'community_post',
  
  // Messages
  MESSAGE: 'message',
  
  // Payments
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  
  // Verification
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  
  // System
  SYSTEM: 'system'
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

// ================================================================
// PAYMENT PROVIDERS
// ================================================================
export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  MERCADOPAGO: 'mercadopago',
  ABACATEPAY: 'abacatepay'
} as const

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS]

// ================================================================
// PAYMENT INTENT STATUS
// ================================================================
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// ================================================================
// REACTION TYPES
// ================================================================
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  LAUGH: 'laugh',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry'
} as const

export type ReactionType = typeof REACTION_TYPES[keyof typeof REACTION_TYPES]

// ================================================================
// CALL TYPES AND STATUS
// ================================================================
export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video'
} as const

export type CallType = typeof CALL_TYPES[keyof typeof CALL_TYPES]

export const CALL_STATUS = {
  INITIATING: 'initiating',
  RINGING: 'ringing',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  MISSED: 'missed',
  DECLINED: 'declined',
  FAILED: 'failed'
} as const

export type CallStatus = typeof CALL_STATUS[keyof typeof CALL_STATUS]

// ================================================================
// PROFILE TYPES
// ================================================================
export const PROFILE_TYPES = {
  SINGLE: 'single',
  COUPLE: 'couple',
  TRANS: 'trans',
  OTHER: 'other'
} as const

export type ProfileType = typeof PROFILE_TYPES[keyof typeof PROFILE_TYPES]

// ================================================================
// USER ROLES
// ================================================================
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Validate if a plan type is valid
 */
export function isValidPlanType(plan: string): plan is PlanType {
  return Object.values(PLAN_TYPES).includes(plan as PlanType)
}

/**
 * Check if a plan is premium (paid)
 */
export function isPremiumPlan(plan: PlanType): boolean {
  return plan !== PLAN_TYPES.FREE
}

/**
 * Get plan hierarchy level (for comparison)
 */
export function getPlanLevel(plan: PlanType): number {
  switch (plan) {
    case PLAN_TYPES.FREE: return 0
    case PLAN_TYPES.GOLD: return 1
    case PLAN_TYPES.DIAMOND: return 2
    case PLAN_TYPES.DIAMOND_ANNUAL: return 2 // Same level as diamond
    default: return -1
  }
}

/**
 * Check if a user status is active
 */
export function isUserActive(status: UserStatus): boolean {
  return status === USER_STATUS.ACTIVE
}

/**
 * Check if a subscription is active
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === SUBSCRIPTION_STATUS.ACTIVE
}

/**
 * Get effective plan based on subscription status
 */
export function getEffectivePlan(plan: PlanType, subscriptionStatus: SubscriptionStatus): PlanType {
  if (!isSubscriptionActive(subscriptionStatus)) {
    return PLAN_TYPES.FREE
  }
  return plan
}

// ================================================================
// LEGACY MAPPING (FOR MIGRATION COMPATIBILITY)
// ================================================================
export const LEGACY_PLAN_MAPPING: Record<string, PlanType> = {
  'diamante': PLAN_TYPES.DIAMOND,
  'diamante_anual': PLAN_TYPES.DIAMOND_ANNUAL,
  'ouro': PLAN_TYPES.GOLD,
  'free': PLAN_TYPES.FREE
} as const

/**
 * Convert legacy plan name to new format
 */
export function convertLegacyPlan(legacyPlan: string): PlanType {
  return LEGACY_PLAN_MAPPING[legacyPlan] || PLAN_TYPES.FREE
}

/**
 * Convert new plan name to legacy format (for backwards compatibility)
 */
export function convertToLegacyPlan(plan: PlanType): string {
  const reverseMapping: Record<PlanType, string> = {
    [PLAN_TYPES.DIAMOND]: 'diamante',
    [PLAN_TYPES.DIAMOND_ANNUAL]: 'diamante_anual',
    [PLAN_TYPES.GOLD]: 'ouro',
    [PLAN_TYPES.FREE]: 'free'
  }
  return reverseMapping[plan] || 'free'
}

// ================================================================
// TABLE COLUMN MAPPINGS (FOR QUERY BUILDING)
// ================================================================
export const COMMON_COLUMNS = {
  ID: 'id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const

export const USER_COLUMNS = {
  ...COMMON_COLUMNS,
  AUTH_ID: 'auth_id',
  USERNAME: 'username',
  EMAIL: 'email',
  FULL_NAME: 'full_name',
  BIO: 'bio',
  AVATAR_URL: 'avatar_url',
  IS_VERIFIED: 'is_verified',
  IS_PREMIUM: 'is_premium',
  PREMIUM_TYPE: 'premium_type',
  PREMIUM_STATUS: 'premium_status',
  STATUS: 'status',
  ROLE: 'role'
} as const

export const POST_COLUMNS = {
  ...COMMON_COLUMNS,
  AUTHOR_ID: 'author_id',
  CONTENT: 'content',
  MEDIA_URLS: 'media_urls',
  TYPE: 'type',
  VISIBILITY: 'visibility',
  IS_PREMIUM: 'is_premium',
  HASHTAGS: 'hashtags',
  MENTIONS: 'mentions',
  STATS: 'stats'
} as const

// ================================================================
// EXPORT ALL TYPES FOR TYPE CHECKING
// ================================================================
export type DatabaseConstants = {
  tables: typeof TABLES
  planTypes: typeof PLAN_TYPES
  userStatus: typeof USER_STATUS
  subscriptionStatus: typeof SUBSCRIPTION_STATUS
  postTypes: typeof POST_TYPES
  postVisibility: typeof POST_VISIBILITY
  messageTypes: typeof MESSAGE_TYPES
  conversationTypes: typeof CONVERSATION_TYPES
  eventStatus: typeof EVENT_STATUS
  notificationTypes: typeof NOTIFICATION_TYPES
  paymentProviders: typeof PAYMENT_PROVIDERS
  paymentStatus: typeof PAYMENT_STATUS
  reactionTypes: typeof REACTION_TYPES
  callTypes: typeof CALL_TYPES
  callStatus: typeof CALL_STATUS
  profileTypes: typeof PROFILE_TYPES
  userRoles: typeof USER_ROLES
}

// Make all constants available as a single object for importing
export const DATABASE_CONSTANTS: DatabaseConstants = {
  tables: TABLES,
  planTypes: PLAN_TYPES,
  userStatus: USER_STATUS,
  subscriptionStatus: SUBSCRIPTION_STATUS,
  postTypes: POST_TYPES,
  postVisibility: POST_VISIBILITY,
  messageTypes: MESSAGE_TYPES,
  conversationTypes: CONVERSATION_TYPES,
  eventStatus: EVENT_STATUS,
  notificationTypes: NOTIFICATION_TYPES,
  paymentProviders: PAYMENT_PROVIDERS,
  paymentStatus: PAYMENT_STATUS,
  reactionTypes: REACTION_TYPES,
  callTypes: CALL_TYPES,
  callStatus: CALL_STATUS,
  profileTypes: PROFILE_TYPES,
  userRoles: USER_ROLES
}