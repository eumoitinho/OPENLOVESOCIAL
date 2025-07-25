// ================================================================
// DATABASE TYPES - OpenLove Unified Schema
// ================================================================
// Auto-generated types based on the unified database schema
// Date: 2025-01-20
// Version: 2.0 (Unified and Consistent)
// 
// This file contains TypeScript types that exactly match the
// database schema defined in the SQL migrations
// ================================================================

import type { 
  PlanType, 
  UserStatus, 
  SubscriptionStatus, 
  PostType, 
  PostVisibility,
  MessageType,
  ConversationType,
  EventStatus,
  EventParticipantStatus,
  CommunityRole,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  ReactionType,
  CallType,
  CallStatus,
  ProfileType,
  UserRole
} from '@/lib/constants/database'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ================================================================
// CORE USER TYPES
// ================================================================

export interface UserPrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private'
  show_location: boolean
  allow_messages: 'everyone' | 'friends' | 'none'
  show_online_status: boolean
  show_last_active: boolean
  allow_friend_requests: boolean
}

export interface UserNotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  message_notifications: boolean
  like_notifications: boolean
  comment_notifications: boolean
  follow_notifications: boolean
  event_notifications: boolean
  community_notifications: boolean
}

export interface UserStats {
  posts_count: number
  followers_count: number
  following_count: number
  friends_count: number
  likes_received: number
  profile_views: number
  events_created: number
  communities_owned: number
}

export interface UserSocialLinks {
  instagram?: string
  twitter?: string
  tiktok?: string
  linkedin?: string
  website?: string
}

// ================================================================
// POST TYPES
// ================================================================

export interface PostStats {
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  premium_purchases?: number
}

// ================================================================
// COMMENT TYPES
// ================================================================

export interface CommentStats {
  likes_count: number
  replies_count: number
}

// ================================================================
// CONVERSATION TYPES
// ================================================================

export interface MessageMetadata {
  duration?: number // for audio/video
  size?: number // file size
  width?: number // for images/videos
  height?: number // for images/videos
  fileName?: string // for files
  mimeType?: string
}

// ================================================================
// EVENT TYPES
// ================================================================

export interface EventStats {
  interested_count: number
  going_count: number
  maybe_count: number
  checked_in_count: number
  photos_count: number
}

export interface CheckInLocation {
  lat: number
  lng: number
  accuracy?: number
  timestamp: string
}

// ================================================================
// COMMUNITY TYPES
// ================================================================

export interface CommunityStats {
  total_members: number
  active_members: number
  posts_this_month: number
  events_this_month: number
  engagement_rate: number
}

// ================================================================
// NOTIFICATION TYPES
// ================================================================

export interface NotificationRelatedData {
  post_id?: string
  comment_id?: string
  event_id?: string
  community_id?: string
  user_id?: string
  message_id?: string
  payment_id?: string
  [key: string]: any
}

// ================================================================
// MAIN DATABASE INTERFACE
// ================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          username: string
          email: string
          name: string | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          location: string | null
          city: string | null
          uf: string | null
          state: string | null
          country: string
          latitude: number | null
          longitude: number | null
          birth_date: string | null
          gender: string | null
          interests: string[]
          seeking: string[]
          other_interest: string | null
          partner: Json | null
          is_verified: boolean
          is_active: boolean
          is_premium: boolean
          premium_type: PlanType | null
          premium_expires_at: string | null
          premium_status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          mercadopago_customer_id: string | null
          abacatepay_customer_id: string | null
          payment_provider: PaymentProvider | null
          privacy_settings: UserPrivacySettings
          notification_settings: UserNotificationSettings
          stats: UserStats
          profile_type: ProfileType
          website: string | null
          social_links: UserSocialLinks
          status: UserStatus
          role: UserRole
          last_active_at: string
          username_changed: boolean
          username_changed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          username: string
          email: string
          name?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          location?: string | null
          city?: string | null
          uf?: string | null
          state?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          birth_date?: string | null
          gender?: string | null
          interests?: string[]
          seeking?: string[]
          other_interest?: string | null
          partner?: Json | null
          is_verified?: boolean
          is_active?: boolean
          is_premium?: boolean
          premium_type?: PlanType | null
          premium_expires_at?: string | null
          premium_status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          mercadopago_customer_id?: string | null
          abacatepay_customer_id?: string | null
          payment_provider?: PaymentProvider | null
          privacy_settings?: UserPrivacySettings
          notification_settings?: UserNotificationSettings
          stats?: UserStats
          profile_type?: ProfileType
          website?: string | null
          social_links?: UserSocialLinks
          status?: UserStatus
          role?: UserRole
          last_active_at?: string
          username_changed?: boolean
          username_changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          username?: string
          email?: string
          name?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          location?: string | null
          city?: string | null
          uf?: string | null
          state?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          birth_date?: string | null
          gender?: string | null
          interests?: string[]
          seeking?: string[]
          other_interest?: string | null
          partner?: Json | null
          is_verified?: boolean
          is_active?: boolean
          is_premium?: boolean
          premium_type?: PlanType | null
          premium_expires_at?: string | null
          premium_status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          mercadopago_customer_id?: string | null
          abacatepay_customer_id?: string | null
          payment_provider?: PaymentProvider | null
          privacy_settings?: UserPrivacySettings
          notification_settings?: UserNotificationSettings
          stats?: UserStats
          profile_type?: ProfileType
          website?: string | null
          social_links?: UserSocialLinks
          status?: UserStatus
          role?: UserRole
          last_active_at?: string
          username_changed?: boolean
          username_changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: 'active' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: 'active' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: 'active' | 'blocked'
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'accepted' | 'blocked'
          became_friends_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'accepted' | 'blocked'
          became_friends_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'accepted' | 'blocked'
          became_friends_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string | null
          media_urls: string[]
          media_types: string[]
          media_thumbnails: string[]
          visibility: PostVisibility
          is_premium_content: boolean
          price: number | null
          location: string | null
          latitude: number | null
          longitude: number | null
          hashtags: string[]
          mentions: string[]
          poll_options: string[] | null
          is_event: boolean
          event_details: Json | null
          stats: PostStats
          is_reported: boolean
          is_hidden: boolean
          moderation_reason: string | null
          moderated_by: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          media_urls?: string[]
          media_types?: string[]
          media_thumbnails?: string[]
          visibility?: PostVisibility
          is_premium_content?: boolean
          price?: number | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          hashtags?: string[]
          mentions?: string[]
          poll_options?: string[] | null
          is_event?: boolean
          event_details?: Json | null
          stats?: PostStats
          is_reported?: boolean
          is_hidden?: boolean
          moderation_reason?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          media_urls?: string[]
          media_types?: string[]
          media_thumbnails?: string[]
          visibility?: PostVisibility
          is_premium_content?: boolean
          price?: number | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          hashtags?: string[]
          mentions?: string[]
          poll_options?: string[] | null
          is_event?: boolean
          event_details?: Json | null
          stats?: PostStats
          is_reported?: boolean
          is_hidden?: boolean
          moderation_reason?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_id: string | null
          content: string
          media_urls: string[]
          stats: CommentStats
          is_reported: boolean
          is_hidden: boolean
          is_edited: boolean
          edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_id?: string | null
          content: string
          media_urls?: string[]
          stats?: CommentStats
          is_reported?: boolean
          is_hidden?: boolean
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          media_urls?: string[]
          stats?: CommentStats
          is_reported?: boolean
          is_hidden?: boolean
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: 'post' | 'comment'
          reaction_type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: 'post' | 'comment'
          reaction_type?: ReactionType
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: 'post' | 'comment'
          reaction_type?: ReactionType
          created_at?: string
        }
      }
      saved_posts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          folder_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          folder_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          folder_name?: string
          created_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          post_id: string
          question: string
          options: Json
          total_votes: number
          allows_multiple_choice: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          question: string
          options: Json
          total_votes?: number
          allows_multiple_choice?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          question?: string
          options?: Json
          total_votes?: number
          allows_multiple_choice?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_ids: number[]
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_ids: number[]
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          option_ids?: number[]
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: ConversationType
          name: string | null
          description: string | null
          avatar_url: string | null
          last_message_id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          created_by: string | null
          max_participants: number
          is_archived: boolean
          event_id: string | null
          community_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: ConversationType
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          last_message_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          created_by?: string | null
          max_participants?: number
          is_archived?: boolean
          event_id?: string | null
          community_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: ConversationType
          name?: string | null
          description?: string | null
          avatar_url?: string | null
          last_message_id?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          created_by?: string | null
          max_participants?: number
          is_archived?: boolean
          event_id?: string | null
          community_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'admin' | 'moderator' | 'member'
          status: 'active' | 'left' | 'removed' | 'banned'
          joined_at: string
          left_at: string | null
          last_read_at: string
          unread_count: number
          notifications_enabled: boolean
          is_pinned: boolean
          custom_nickname: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: 'admin' | 'moderator' | 'member'
          status?: 'active' | 'left' | 'removed' | 'banned'
          joined_at?: string
          left_at?: string | null
          last_read_at?: string
          unread_count?: number
          notifications_enabled?: boolean
          is_pinned?: boolean
          custom_nickname?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'admin' | 'moderator' | 'member'
          status?: 'active' | 'left' | 'removed' | 'banned'
          joined_at?: string
          left_at?: string | null
          last_read_at?: string
          unread_count?: number
          notifications_enabled?: boolean
          is_pinned?: boolean
          custom_nickname?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          type: MessageType
          media_urls: string[]
          media_metadata: MessageMetadata | null
          system_type: string | null
          reply_to_id: string | null
          is_edited: boolean
          edited_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          delivered_at: string | null
          read_count: number
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          type?: MessageType
          media_urls?: string[]
          media_metadata?: MessageMetadata | null
          system_type?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          delivered_at?: string | null
          read_count?: number
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          type?: MessageType
          media_urls?: string[]
          media_metadata?: MessageMetadata | null
          system_type?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          delivered_at?: string | null
          read_count?: number
          is_read?: boolean
          created_at?: string
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          reaction: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          reaction?: string
          created_at?: string
        }
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          conversation_id: string
          initiated_by: string
          type: CallType
          status: CallStatus
          started_at: string
          answered_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          quality_rating: number | null
          end_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          initiated_by: string
          type: CallType
          status?: CallStatus
          started_at?: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          quality_rating?: number | null
          end_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          initiated_by?: string
          type?: CallType
          status?: CallStatus
          started_at?: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          quality_rating?: number | null
          end_reason?: string | null
          created_at?: string
        }
      }
      call_participants: {
        Row: {
          id: string
          call_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          audio_enabled: boolean
          video_enabled: boolean
          screen_sharing: boolean
        }
        Insert: {
          id?: string
          call_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          audio_enabled?: boolean
          video_enabled?: boolean
          screen_sharing?: boolean
        }
        Update: {
          id?: string
          call_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          audio_enabled?: boolean
          video_enabled?: boolean
          screen_sharing?: boolean
        }
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          cover_image_url: string | null
          event_type: string
          category: string | null
          tags: string[]
          start_date: string
          end_date: string | null
          timezone: string
          location_type: 'physical' | 'online' | 'hybrid'
          location_name: string | null
          location_address: string | null
          latitude: number | null
          longitude: number | null
          online_link: string | null
          max_participants: number | null
          current_participants: number
          is_paid: boolean
          price: number | null
          currency: string
          visibility: PostVisibility
          status: EventStatus
          requires_approval: boolean
          allows_guests: boolean
          has_chat: boolean
          allows_photos: boolean
          stats: EventStats
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          event_type: string
          category?: string | null
          tags?: string[]
          start_date: string
          end_date?: string | null
          timezone?: string
          location_type?: 'physical' | 'online' | 'hybrid'
          location_name?: string | null
          location_address?: string | null
          latitude?: number | null
          longitude?: number | null
          online_link?: string | null
          max_participants?: number | null
          current_participants?: number
          is_paid?: boolean
          price?: number | null
          currency?: string
          visibility?: PostVisibility
          status?: EventStatus
          requires_approval?: boolean
          allows_guests?: boolean
          has_chat?: boolean
          allows_photos?: boolean
          stats?: EventStats
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          event_type?: string
          category?: string | null
          tags?: string[]
          start_date?: string
          end_date?: string | null
          timezone?: string
          location_type?: 'physical' | 'online' | 'hybrid'
          location_name?: string | null
          location_address?: string | null
          latitude?: number | null
          longitude?: number | null
          online_link?: string | null
          max_participants?: number | null
          current_participants?: number
          is_paid?: boolean
          price?: number | null
          currency?: string
          visibility?: PostVisibility
          status?: EventStatus
          requires_approval?: boolean
          allows_guests?: boolean
          has_chat?: boolean
          allows_photos?: boolean
          stats?: EventStats
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: EventParticipantStatus
          is_organizer: boolean
          can_invite: boolean
          check_in_code: string | null
          checked_in_at: string | null
          check_in_location: CheckInLocation | null
          guest_count: number
          guest_names: string[]
          joined_at: string
          status_changed_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: EventParticipantStatus
          is_organizer?: boolean
          can_invite?: boolean
          check_in_code?: string | null
          checked_in_at?: string | null
          check_in_location?: CheckInLocation | null
          guest_count?: number
          guest_names?: string[]
          joined_at?: string
          status_changed_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: EventParticipantStatus
          is_organizer?: boolean
          can_invite?: boolean
          check_in_code?: string | null
          checked_in_at?: string | null
          check_in_location?: CheckInLocation | null
          guest_count?: number
          guest_names?: string[]
          joined_at?: string
          status_changed_at?: string
        }
      }
      event_invitations: {
        Row: {
          id: string
          event_id: string
          inviter_id: string
          invitee_id: string | null
          invitee_email: string | null
          personal_message: string | null
          invitation_code: string | null
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          sent_at: string
          responded_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          event_id: string
          inviter_id: string
          invitee_id?: string | null
          invitee_email?: string | null
          personal_message?: string | null
          invitation_code?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          sent_at?: string
          responded_at?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          inviter_id?: string
          invitee_id?: string | null
          invitee_email?: string | null
          personal_message?: string | null
          invitation_code?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          sent_at?: string
          responded_at?: string | null
          expires_at?: string
        }
      }
      event_updates: {
        Row: {
          id: string
          event_id: string
          author_id: string
          content: string
          update_type: 'announcement' | 'schedule_change' | 'location_change' | 'cancellation'
          is_important: boolean
          notify_all: boolean
          notify_going_only: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          author_id: string
          content: string
          update_type?: 'announcement' | 'schedule_change' | 'location_change' | 'cancellation'
          is_important?: boolean
          notify_all?: boolean
          notify_going_only?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          author_id?: string
          content?: string
          update_type?: 'announcement' | 'schedule_change' | 'location_change' | 'cancellation'
          is_important?: boolean
          notify_all?: boolean
          notify_going_only?: boolean
          created_at?: string
        }
      }
      event_photos: {
        Row: {
          id: string
          event_id: string
          uploader_id: string
          photo_url: string
          thumbnail_url: string | null
          caption: string | null
          is_approved: boolean
          is_reported: boolean
          taken_at: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          event_id: string
          uploader_id: string
          photo_url: string
          thumbnail_url?: string | null
          caption?: string | null
          is_approved?: boolean
          is_reported?: boolean
          taken_at?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          uploader_id?: string
          photo_url?: string
          thumbnail_url?: string | null
          caption?: string | null
          is_approved?: boolean
          is_reported?: boolean
          taken_at?: string | null
          uploaded_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string | null
          long_description: string | null
          avatar_url: string | null
          cover_url: string | null
          website: string | null
          is_private: boolean
          requires_approval: boolean
          is_verified: boolean
          is_paid: boolean
          monthly_price: number | null
          currency: string
          allows_posts: boolean
          allows_events: boolean
          allows_polls: boolean
          post_approval_required: boolean
          category: string | null
          subcategory: string | null
          tags: string[]
          location: string | null
          member_count: number
          post_count: number
          event_count: number
          stats: CommunityStats
          status: 'active' | 'suspended' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          description?: string | null
          long_description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          website?: string | null
          is_private?: boolean
          requires_approval?: boolean
          is_verified?: boolean
          is_paid?: boolean
          monthly_price?: number | null
          currency?: string
          allows_posts?: boolean
          allows_events?: boolean
          allows_polls?: boolean
          post_approval_required?: boolean
          category?: string | null
          subcategory?: string | null
          tags?: string[]
          location?: string | null
          member_count?: number
          post_count?: number
          event_count?: number
          stats?: CommunityStats
          status?: 'active' | 'suspended' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          description?: string | null
          long_description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          website?: string | null
          is_private?: boolean
          requires_approval?: boolean
          is_verified?: boolean
          is_paid?: boolean
          monthly_price?: number | null
          currency?: string
          allows_posts?: boolean
          allows_events?: boolean
          allows_polls?: boolean
          post_approval_required?: boolean
          category?: string | null
          subcategory?: string | null
          tags?: string[]
          location?: string | null
          member_count?: number
          post_count?: number
          event_count?: number
          stats?: CommunityStats
          status?: 'active' | 'suspended' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          role: CommunityRole
          can_post: boolean
          can_comment: boolean
          can_create_events: boolean
          can_invite: boolean
          can_moderate: boolean
          joined_at: string
          invited_by: string | null
          membership_type: 'free' | 'paid'
          status: 'active' | 'banned' | 'left'
          is_banned: boolean
          banned_at: string | null
          banned_reason: string | null
          banned_by: string | null
          last_active_at: string
          post_count: number
          comment_count: number
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          role?: CommunityRole
          can_post?: boolean
          can_comment?: boolean
          can_create_events?: boolean
          can_invite?: boolean
          can_moderate?: boolean
          joined_at?: string
          invited_by?: string | null
          membership_type?: 'free' | 'paid'
          status?: 'active' | 'banned' | 'left'
          is_banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          banned_by?: string | null
          last_active_at?: string
          post_count?: number
          comment_count?: number
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          role?: CommunityRole
          can_post?: boolean
          can_comment?: boolean
          can_create_events?: boolean
          can_invite?: boolean
          can_moderate?: boolean
          joined_at?: string
          invited_by?: string | null
          membership_type?: 'free' | 'paid'
          status?: 'active' | 'banned' | 'left'
          is_banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          banned_by?: string | null
          last_active_at?: string
          post_count?: number
          comment_count?: number
        }
      }
      community_posts: {
        Row: {
          id: string
          community_id: string
          post_id: string
          is_pinned: boolean
          pinned_at: string | null
          pinned_by: string | null
          is_approved: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          post_id: string
          is_pinned?: boolean
          pinned_at?: string | null
          pinned_by?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          post_id?: string
          is_pinned?: boolean
          pinned_at?: string | null
          pinned_by?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      community_invitations: {
        Row: {
          id: string
          community_id: string
          inviter_id: string
          invitee_id: string | null
          invitee_email: string | null
          personal_message: string | null
          invitation_code: string | null
          suggested_role: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at: string
          expires_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          community_id: string
          inviter_id: string
          invitee_id?: string | null
          invitee_email?: string | null
          personal_message?: string | null
          invitation_code?: string | null
          suggested_role?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          community_id?: string
          inviter_id?: string
          invitee_id?: string | null
          invitee_email?: string | null
          personal_message?: string | null
          invitation_code?: string | null
          suggested_role?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
      }
      community_rules: {
        Row: {
          id: string
          community_id: string
          rule_number: number
          title: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          rule_number: number
          title: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          rule_number?: number
          title?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      community_moderation_logs: {
        Row: {
          id: string
          community_id: string
          moderator_id: string
          target_user_id: string | null
          target_post_id: string | null
          action: string
          reason: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          moderator_id: string
          target_user_id?: string | null
          target_post_id?: string | null
          action: string
          reason?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          moderator_id?: string
          target_user_id?: string | null
          target_post_id?: string | null
          action?: string
          reason?: string | null
          details?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: NotificationType
          title: string
          content: string | null
          icon: string | null
          related_data: NotificationRelatedData
          action_text: string | null
          action_url: string | null
          is_read: boolean
          is_deleted: boolean
          delivered_at: string
          read_at: string | null
          sent_via_email: boolean
          sent_via_push: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: NotificationType
          title: string
          content?: string | null
          icon?: string | null
          related_data?: NotificationRelatedData
          action_text?: string | null
          action_url?: string | null
          is_read?: boolean
          is_deleted?: boolean
          delivered_at?: string
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_push?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: NotificationType
          title?: string
          content?: string | null
          icon?: string | null
          related_data?: NotificationRelatedData
          action_text?: string | null
          action_url?: string | null
          is_read?: boolean
          is_deleted?: boolean
          delivered_at?: string
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_push?: boolean
          created_at?: string
        }
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string | null
          viewed_id: string
          view_source: string | null
          view_duration_seconds: number | null
          anonymous_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          viewer_id?: string | null
          viewed_id: string
          view_source?: string | null
          view_duration_seconds?: number | null
          anonymous_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          viewer_id?: string | null
          viewed_id?: string
          view_source?: string | null
          view_duration_seconds?: number | null
          anonymous_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          reason?: string | null
          created_at?: string
        }
      }
      payment_intents: {
        Row: {
          id: string
          user_id: string
          provider: PaymentProvider
          provider_payment_id: string
          provider_customer_id: string | null
          amount: number
          currency: string
          plan_type: PlanType
          status: PaymentStatus
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: PaymentProvider
          provider_payment_id: string
          provider_customer_id?: string | null
          amount: number
          currency?: string
          plan_type: PlanType
          status?: PaymentStatus
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: PaymentProvider
          provider_payment_id?: string
          provider_customer_id?: string | null
          amount?: number
          currency?: string
          plan_type?: PlanType
          status?: PaymentStatus
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      webhook_logs: {
        Row: {
          id: string
          provider: PaymentProvider
          event_type: string
          payment_id: string | null
          data: Json
          headers: Json | null
          processed: boolean
          processing_error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: PaymentProvider
          event_type: string
          payment_id?: string | null
          data: Json
          headers?: Json | null
          processed?: boolean
          processing_error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: PaymentProvider
          event_type?: string
          payment_id?: string | null
          data?: Json
          headers?: Json | null
          processed?: boolean
          processing_error?: string | null
          created_at?: string
        }
      }
      user_monthly_usage: {
        Row: {
          id: string
          user_id: string
          month_year: string
          posts_created: number
          videos_uploaded: number
          events_created: number
          communities_created: number
          messages_sent: number
          storage_used_bytes: number
          bandwidth_used_bytes: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          posts_created?: number
          videos_uploaded?: number
          events_created?: number
          communities_created?: number
          messages_sent?: number
          storage_used_bytes?: number
          bandwidth_used_bytes?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          posts_created?: number
          videos_uploaded?: number
          events_created?: number
          communities_created?: number
          messages_sent?: number
          storage_used_bytes?: number
          bandwidth_used_bytes?: number
          updated_at?: string
        }
      }
      user_monthly_events: {
        Row: {
          id: string
          user_id: string
          month_year: string
          events_created: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          events_created?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          events_created?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ================================================================
// CONVENIENCE TYPE EXPORTS
// ================================================================

// Extract Row types for easier use
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

export type Follow = Database['public']['Tables']['follows']['Row']
export type Friend = Database['public']['Tables']['friends']['Row']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export type Event = Database['public']['Tables']['events']['Row']
export type EventParticipant = Database['public']['Tables']['event_participants']['Row']
export type EventInvitation = Database['public']['Tables']['event_invitations']['Row']

export type Community = Database['public']['Tables']['communities']['Row']
export type CommunityMember = Database['public']['Tables']['community_members']['Row']
export type CommunityPost = Database['public']['Tables']['community_posts']['Row']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type PaymentIntent = Database['public']['Tables']['payment_intents']['Row']
export type WebhookLog = Database['public']['Tables']['webhook_logs']['Row']

export type ProfileView = Database['public']['Tables']['profile_views']['Row']
export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']

export type UserMonthlyUsage = Database['public']['Tables']['user_monthly_usage']['Row']
export type UserMonthlyEvents = Database['public']['Tables']['user_monthly_events']['Row']

// ================================================================
// UTILITY TYPES FOR JOINS
// ================================================================

export type PostWithAuthor = Post & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified' | 'is_premium'>
}

export type CommentWithAuthor = Comment & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'>
}

export type MessageWithSender = Message & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export type EventWithCreator = Event & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'>
}

export type CommunityWithCreator = Community & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'>
}

export type NotificationWithSender = Notification & {
  users: Pick<User, 'id' | 'username' | 'full_name' | 'avatar_url'> | null
}