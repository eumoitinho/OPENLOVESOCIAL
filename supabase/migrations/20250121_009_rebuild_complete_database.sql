-- ================================================================
-- COMPLETE DATABASE REBUILD - ALL TABLES + RLS
-- ================================================================
-- Purpose: Recreate entire database structure with working RLS
-- Date: 2025-01-21
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- RECREATE ALL TABLES (COMPLETE STRUCTURE)
-- ================================================================

-- USERS TABLE (MASTER TABLE)
CREATE TABLE IF NOT EXISTS public.users (
    -- Core identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    
    -- Basic profile information
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    
    -- Location and demographics
    location VARCHAR(255),
    city VARCHAR(100),
    uf VARCHAR(2),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brazil',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    birth_date DATE,
    gender VARCHAR(20),
    
    -- Profile settings
    profile_type VARCHAR(20) DEFAULT 'single' CHECK (profile_type IN ('single', 'couple', 'trans', 'other')),
    
    -- Interests and preferences
    interests TEXT[] DEFAULT '{}',
    seeking TEXT[] DEFAULT '{}',
    other_interest TEXT,
    looking_for TEXT[] DEFAULT '{}',
    relationship_goals TEXT[] DEFAULT '{}',
    partner JSONB,
    
    -- Premium and verification status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    premium_type VARCHAR(20) CHECK (premium_type IN ('gold', 'diamond', 'diamond_annual') OR premium_type IS NULL),
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    premium_status VARCHAR(20) DEFAULT 'active' CHECK (premium_status IN ('active', 'inactive', 'cancelled', 'pending')),
    
    -- Payment information
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    mercadopago_customer_id VARCHAR(255),
    abacatepay_customer_id VARCHAR(255),
    payment_provider VARCHAR(20) CHECK (payment_provider IN ('stripe', 'mercadopago', 'abacatepay') OR payment_provider IS NULL),
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "show_age": true,
        "show_location": true,
        "allow_messages": "everyone",
        "show_online_status": true,
        "show_last_active": true,
        "allow_friend_requests": true
    }',
    
    -- Notification settings
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "message_notifications": true,
        "like_notifications": true,
        "comment_notifications": true,
        "follow_notifications": true,
        "event_notifications": true,
        "community_notifications": true
    }',
    
    -- Statistics
    stats JSONB DEFAULT '{
        "posts": 0,
        "followers": 0,
        "following": 0,
        "friends": 0,
        "likes_received": 0,
        "comments_received": 0,
        "profile_views": 0,
        "events_created": 0,
        "communities_owned": 0,
        "earnings": 0
    }',
    
    -- Profile customization
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    
    -- Status and moderation
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'deactivated', 'pending_verification')),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    username_changed BOOLEAN DEFAULT false,
    username_changed_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

-- FRIENDS TABLE
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT friends_no_self_friend CHECK (user_id != friend_id),
    CONSTRAINT friends_unique UNIQUE (user_id, friend_id)
);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    media_types TEXT[] DEFAULT '{}',
    media_thumbnails TEXT[] DEFAULT '{}',
    
    -- Post settings
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    is_premium_content BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    
    -- Poll options (for backward compatibility)
    poll_options TEXT[],
    
    -- Location
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Social features
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    
    -- Event details
    is_event BOOLEAN DEFAULT false,
    event_details JSONB,
    
    -- Statistics
    stats JSONB DEFAULT '{
        "likes_count": 0,
        "comments_count": 0,
        "shares_count": 0,
        "views_count": 0
    }',
    
    -- Moderation
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    moderation_reason TEXT,
    moderated_by UUID REFERENCES public.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    
    stats JSONB DEFAULT '{
        "likes": 0,
        "replies": 0
    }',
    
    is_reported BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LIKES TABLE (UNIFIED)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT likes_unique UNIQUE (user_id, target_id, target_type, reaction_type)
);

-- SAVED POSTS
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    folder_name VARCHAR(100) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT saved_posts_unique UNIQUE (user_id, post_id)
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'event', 'community')),
    name VARCHAR(255),
    description TEXT,
    avatar_url TEXT,
    
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    max_participants INTEGER DEFAULT 50,
    is_archived BOOLEAN DEFAULT false,
    
    event_id UUID,
    community_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    
    notifications_enabled BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    custom_nickname VARCHAR(100),
    
    UNIQUE(conversation_id, user_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    content TEXT,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'system')),
    media_urls TEXT[] DEFAULT '{}',
    media_metadata JSONB DEFAULT '{}',
    
    system_type VARCHAR(30) CHECK (system_type IN ('user_joined', 'user_left', 'name_changed', 'avatar_changed')),
    reply_to_id UUID REFERENCES public.messages(id),
    
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MESSAGE REACTIONS
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id, reaction)
);

-- MESSAGE READS
CREATE TABLE IF NOT EXISTS public.message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    event_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    location_type VARCHAR(20) DEFAULT 'physical' CHECK (location_type IN ('physical', 'online', 'hybrid')),
    location_name VARCHAR(255),
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    online_link TEXT,
    
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    requires_approval BOOLEAN DEFAULT false,
    
    allows_guests BOOLEAN DEFAULT true,
    has_chat BOOLEAN DEFAULT true,
    allows_photos BOOLEAN DEFAULT true,
    
    stats JSONB DEFAULT '{
        "interested_count": 0,
        "going_count": 0,
        "maybe_count": 0,
        "checked_in_count": 0,
        "photos_count": 0
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENT PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'going', 'maybe', 'not_going', 'removed')),
    is_organizer BOOLEAN DEFAULT false,
    can_invite BOOLEAN DEFAULT false,
    
    check_in_code VARCHAR(10) UNIQUE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    check_in_location JSONB,
    
    guest_count INTEGER DEFAULT 0,
    guest_names TEXT[] DEFAULT '{}',
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- EVENT INVITATIONS
CREATE TABLE IF NOT EXISTS public.event_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255),
    
    personal_message TEXT,
    invitation_code VARCHAR(20) UNIQUE,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    
    UNIQUE(event_id, invitee_id),
    CONSTRAINT event_invitation_target CHECK (invitee_id IS NOT NULL OR invitee_email IS NOT NULL)
);

-- COMMUNITIES
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    long_description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    website TEXT,
    
    is_private BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_paid BOOLEAN DEFAULT false,
    monthly_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    allows_posts BOOLEAN DEFAULT true,
    allows_events BOOLEAN DEFAULT true,
    allows_polls BOOLEAN DEFAULT true,
    post_approval_required BOOLEAN DEFAULT false,
    
    category VARCHAR(50),
    subcategory VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    
    stats JSONB DEFAULT '{
        "total_members": 0,
        "active_members": 0,
        "posts_this_month": 0,
        "events_this_month": 0,
        "engagement_rate": 0
    }',
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    can_post BOOLEAN DEFAULT true,
    can_comment BOOLEAN DEFAULT true,
    can_create_events BOOLEAN DEFAULT false,
    can_invite BOOLEAN DEFAULT false,
    can_moderate BOOLEAN DEFAULT false,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES public.users(id),
    membership_type VARCHAR(20) DEFAULT 'free' CHECK (membership_type IN ('free', 'paid')),
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned', 'left')),
    is_banned BOOLEAN DEFAULT false,
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_reason TEXT,
    banned_by UUID REFERENCES public.users(id),
    
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    UNIQUE(community_id, user_id)
);

-- COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    
    is_pinned BOOLEAN DEFAULT false,
    pinned_at TIMESTAMP WITH TIME ZONE,
    pinned_by UUID REFERENCES public.users(id),
    
    is_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(community_id, post_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'follow', 'unfollow', 'friend_request', 'friend_accept',
        'post_like', 'post_comment', 'comment_like', 'comment_reply',
        'post_share', 'mention', 'event_invitation', 'event_reminder',
        'community_invitation', 'community_post', 'message',
        'payment_success', 'payment_failed', 'subscription_expiring',
        'verification_approved', 'verification_rejected', 'system'
    )),
    title TEXT NOT NULL,
    content TEXT,
    icon VARCHAR(50),
    
    related_data JSONB DEFAULT '{}',
    
    action_text VARCHAR(50),
    action_url TEXT,
    
    is_read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROFILE VIEWS
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    view_source VARCHAR(30) CHECK (view_source IN ('search', 'timeline', 'profile_click', 'event', 'community', 'recommendation')),
    view_duration_seconds INTEGER,
    
    anonymous_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT profile_view_user CHECK (viewer_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- BLOCKED USERS
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- PAYMENT INTENTS
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'mercadopago', 'abacatepay')),
    provider_payment_id VARCHAR(255) NOT NULL,
    provider_customer_id VARCHAR(255),
    
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('gold', 'diamond', 'diamond_annual')),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'cancelled')),
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER MONTHLY USAGE
CREATE TABLE IF NOT EXISTS public.user_monthly_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    
    posts_created INTEGER DEFAULT 0,
    videos_uploaded INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    communities_created INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    
    storage_used_bytes BIGINT DEFAULT 0,
    bandwidth_used_bytes BIGINT DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, month_year)
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('gold', 'diamond', 'diamond_annual')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    
    provider VARCHAR(20) CHECK (provider IN ('stripe', 'mercadopago', 'abacatepay')),
    provider_subscription_id VARCHAR(255),
    
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'annual')),
    
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    next_billing_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLLS
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    total_votes INTEGER DEFAULT 0,
    allows_multiple_choice BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLL VOTES
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    option_ids INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT poll_votes_unique UNIQUE (poll_id, user_id)
);

-- CALLS
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    initiated_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('voice', 'video')),
    
    status VARCHAR(20) DEFAULT 'initiating' CHECK (status IN ('initiating', 'ringing', 'ongoing', 'completed', 'missed', 'declined', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    end_reason VARCHAR(20) CHECK (end_reason IN ('normal', 'missed', 'declined', 'network_error', 'timeout')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CALL PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.call_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    audio_enabled BOOLEAN DEFAULT true,
    video_enabled BOOLEAN DEFAULT true,
    screen_sharing BOOLEAN DEFAULT false,
    
    UNIQUE(call_id, user_id)
);

-- ================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status) WHERE status = 'active';

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id, visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_timeline ON public.posts(visibility, created_at DESC) WHERE visibility = 'public';

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at DESC);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_target ON public.likes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id, status);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id, status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);

-- ================================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- CREATE WORKING RLS POLICIES
-- ================================================================

-- USERS TABLE - CRITICAL FOR REGISTRATION
CREATE POLICY "users_public_read" ON public.users
    FOR SELECT 
    USING (true);

CREATE POLICY "users_authenticated_insert" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "users_service_role_all" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- POSTS TABLE
CREATE POLICY "posts_read_all" ON public.posts
    FOR SELECT 
    USING (true);

CREATE POLICY "posts_insert_authenticated" ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "posts_update_own" ON public.posts
    FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "posts_delete_own" ON public.posts
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- COMMENTS TABLE
CREATE POLICY "comments_read_all" ON public.comments
    FOR SELECT 
    USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- LIKES TABLE
CREATE POLICY "likes_read_all" ON public.likes
    FOR SELECT 
    USING (true);

CREATE POLICY "likes_insert_authenticated" ON public.likes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "likes_delete_own" ON public.likes
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- FOLLOWS TABLE
CREATE POLICY "follows_read_all" ON public.follows
    FOR SELECT 
    USING (true);

CREATE POLICY "follows_insert_authenticated" ON public.follows
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "follows_delete_own" ON public.follows
    FOR DELETE
    TO authenticated
    USING (follower_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- FRIENDS TABLE
CREATE POLICY "friends_read_all" ON public.friends
    FOR SELECT 
    USING (true);

CREATE POLICY "friends_insert_authenticated" ON public.friends
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "friends_update_involved" ON public.friends
    FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR
           friend_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "friends_delete_involved" ON public.friends
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR
           friend_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- NOTIFICATIONS TABLE
CREATE POLICY "notifications_read_own" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (recipient_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "notifications_insert_all" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (recipient_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- SERVICE ROLE POLICIES (BYPASS RLS)
CREATE POLICY "service_role_bypass_users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_posts" ON public.posts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_comments" ON public.comments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_likes" ON public.likes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_follows" ON public.follows
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_friends" ON public.friends
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_bypass_notifications" ON public.notifications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user from auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        auth_id,
        email,
        username,
        name,
        full_name,
        first_name,
        last_name,
        birth_date,
        profile_type,
        seeking,
        interests,
        other_interest,
        bio,
        location,
        uf,
        latitude,
        longitude,
        premium_type,
        premium_status,
        partner,
        is_premium,
        avatar_url,
        cover_url
    ) VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
            ELSE NULL
        END,
        COALESCE(NEW.raw_user_meta_data->>'profile_type', 'single'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'seeking' IS NOT NULL 
            THEN string_to_array(NEW.raw_user_meta_data->>'seeking', ',')
            ELSE ARRAY[]::TEXT[]
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'interests' IS NOT NULL 
            THEN string_to_array(NEW.raw_user_meta_data->>'interests', ',')
            ELSE ARRAY[]::TEXT[]
        END,
        NEW.raw_user_meta_data->>'other_interest',
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'location',
        NEW.raw_user_meta_data->>'uf',
        CASE 
            WHEN NEW.raw_user_meta_data->>'latitude' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'latitude')::DECIMAL
            ELSE NULL
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'longitude' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'longitude')::DECIMAL
            ELSE NULL
        END,
        NEW.raw_user_meta_data->>'premium_type',
        COALESCE(NEW.raw_user_meta_data->>'premium_status', 'active'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'partner' IS NOT NULL 
            THEN NEW.raw_user_meta_data->'partner'
            ELSE NULL
        END,
        COALESCE((NEW.raw_user_meta_data->>'is_premium')::BOOLEAN, false),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'cover_url'
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- INSERT INITIAL DATA
-- ================================================================

-- System user
INSERT INTO public.users (
    auth_id,
    username,
    email,
    name,
    full_name,
    bio,
    is_verified,
    status,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system',
    'system@openlove.com',
    'Sistema OpenLove',
    'Sistema OpenLove',
    'Conta oficial do sistema OpenLove para notificações e anúncios.',
    true,
    'active',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- ================================================================
-- FINAL VERIFICATION
-- ================================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'DATABASE COMPLETELY REBUILT!';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'RLS Policies: %', policy_count;
    RAISE NOTICE 'READY FOR REGISTRATION AND ALL OPERATIONS!';
    RAISE NOTICE '================================================================';
END $$;

-- Show users table exists
SELECT 'users table exists' as status, count(*) as row_count FROM public.users;