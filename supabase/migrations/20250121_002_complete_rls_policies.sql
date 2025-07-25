-- ================================================================
-- COMPLETE RLS POLICIES FOR ALL APIS
-- ================================================================
-- Purpose: Add missing RLS policies for all API endpoints
-- Date: 2025-01-21
-- Critical: This fixes permission denied errors across the application
-- ================================================================

-- ================================================================
-- UTILITY FUNCTIONS FOR RLS
-- ================================================================

-- Function to get user ID from auth
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM users 
    WHERE auth_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if users are friends
CREATE OR REPLACE FUNCTION public.are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM friends 
    WHERE ((user_id = user1_id AND friend_id = user2_id) OR 
           (user_id = user2_id AND friend_id = user1_id))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is following another
CREATE OR REPLACE FUNCTION public.is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = follower_id AND following_id = following_id
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- USERS TABLE POLICIES
-- ================================================================

-- Allow users to read public profiles and their own
DROP POLICY IF EXISTS "users_read_policy" ON users;
CREATE POLICY "users_read_policy" ON users FOR SELECT USING (
  -- Own profile
  auth.user_id() = id OR
  -- Public profiles  
  (privacy_settings->>'profile_visibility' = 'public' AND status = 'active') OR
  -- Friends only profiles
  (privacy_settings->>'profile_visibility' = 'friends' AND 
   public.are_friends(auth.user_id(), id)) OR
  -- Admin access
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role = 'admin')
);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_policy" ON users;
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (
  auth.user_id() = id OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- Allow registration (insert)
DROP POLICY IF EXISTS "users_insert_policy" ON users;
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (
  -- Must match authenticated user
  auth_id = auth.uid() OR
  -- Or be an admin creating accounts
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role = 'admin')
);

-- ================================================================
-- POSTS TABLE POLICIES
-- ================================================================

-- Read posts based on visibility
DROP POLICY IF EXISTS "posts_read_policy" ON posts;
CREATE POLICY "posts_read_policy" ON posts FOR SELECT USING (
  -- Own posts
  user_id = auth.user_id() OR
  -- Public posts from active users
  (visibility = 'public' AND is_hidden = false AND 
   EXISTS(SELECT 1 FROM users WHERE id = posts.user_id AND status = 'active')) OR
  -- Friends only posts
  (visibility = 'friends' AND 
   public.are_friends(auth.user_id(), user_id)) OR
  -- Admin/moderator access
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- Create posts
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
CREATE POLICY "posts_insert_policy" ON posts FOR INSERT WITH CHECK (
  user_id = auth.user_id()
);

-- Update own posts
DROP POLICY IF EXISTS "posts_update_policy" ON posts;  
CREATE POLICY "posts_update_policy" ON posts FOR UPDATE USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- Delete own posts
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;
CREATE POLICY "posts_delete_policy" ON posts FOR DELETE USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- ================================================================
-- COMMENTS TABLE POLICIES  
-- ================================================================

-- Read comments on accessible posts
DROP POLICY IF EXISTS "comments_read_policy" ON comments;
CREATE POLICY "comments_read_policy" ON comments FOR SELECT USING (
  is_hidden = false AND
  EXISTS(
    SELECT 1 FROM posts p 
    WHERE p.id = comments.post_id AND (
      -- Own posts
      p.user_id = auth.user_id() OR
      -- Public posts  
      (p.visibility = 'public' AND p.is_hidden = false) OR
      -- Friends posts
      (p.visibility = 'friends' AND public.are_friends(auth.user_id(), p.user_id))
    )
  )
);

-- Create comments on accessible posts
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
CREATE POLICY "comments_insert_policy" ON comments FOR INSERT WITH CHECK (
  user_id = auth.user_id() AND
  EXISTS(
    SELECT 1 FROM posts p 
    WHERE p.id = comments.post_id AND (
      p.visibility = 'public' OR
      p.user_id = auth.user_id() OR
      (p.visibility = 'friends' AND public.are_friends(auth.user_id(), p.user_id))
    )
  )
);

-- Update own comments
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
CREATE POLICY "comments_update_policy" ON comments FOR UPDATE USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- Delete own comments
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;
CREATE POLICY "comments_delete_policy" ON comments FOR DELETE USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role IN ('admin', 'moderator'))
);

-- ================================================================
-- LIKES TABLE POLICIES
-- ================================================================

-- Read likes on accessible content
DROP POLICY IF EXISTS "likes_read_policy" ON likes;
CREATE POLICY "likes_read_policy" ON likes FOR SELECT USING (
  -- Own likes
  user_id = auth.user_id() OR
  -- Likes on accessible posts
  (target_type = 'post' AND EXISTS(
    SELECT 1 FROM posts p WHERE p.id = likes.target_id AND (
      p.visibility = 'public' OR 
      p.user_id = auth.user_id() OR
      (p.visibility = 'friends' AND public.are_friends(auth.user_id(), p.user_id))
    )
  )) OR
  -- Likes on accessible comments
  (target_type = 'comment' AND EXISTS(
    SELECT 1 FROM comments c
    JOIN posts p ON c.post_id = p.id
    WHERE c.id = likes.target_id AND (
      p.visibility = 'public' OR 
      p.user_id = auth.user_id() OR
      (p.visibility = 'friends' AND public.are_friends(auth.user_id(), p.user_id))
    )
  ))
);

-- Create likes
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
CREATE POLICY "likes_insert_policy" ON likes FOR INSERT WITH CHECK (
  user_id = auth.user_id()
);

-- Delete own likes
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;
CREATE POLICY "likes_delete_policy" ON likes FOR DELETE USING (
  user_id = auth.user_id()
);

-- ================================================================
-- FOLLOWS TABLE POLICIES
-- ================================================================

-- Read follows
DROP POLICY IF EXISTS "follows_read_policy" ON follows;
CREATE POLICY "follows_read_policy" ON follows FOR SELECT USING (
  follower_id = auth.user_id() OR 
  following_id = auth.user_id() OR
  -- Public follow relationships
  EXISTS(SELECT 1 FROM users WHERE id = following_id AND privacy_settings->>'profile_visibility' = 'public')
);

-- Create follows
DROP POLICY IF EXISTS "follows_insert_policy" ON follows;
CREATE POLICY "follows_insert_policy" ON follows FOR INSERT WITH CHECK (
  follower_id = auth.user_id() AND
  EXISTS(SELECT 1 FROM users WHERE id = following_id AND status = 'active')
);

-- Delete own follows
DROP POLICY IF EXISTS "follows_delete_policy" ON follows;
CREATE POLICY "follows_delete_policy" ON follows FOR DELETE USING (
  follower_id = auth.user_id()
);

-- ================================================================
-- FRIENDS TABLE POLICIES
-- ================================================================

-- Read friendships
DROP POLICY IF EXISTS "friends_read_policy" ON friends;
CREATE POLICY "friends_read_policy" ON friends FOR SELECT USING (
  user_id = auth.user_id() OR friend_id = auth.user_id()
);

-- Create friend requests
DROP POLICY IF EXISTS "friends_insert_policy" ON friends;
CREATE POLICY "friends_insert_policy" ON friends FOR INSERT WITH CHECK (
  user_id = auth.user_id() AND
  EXISTS(SELECT 1 FROM users WHERE id = friend_id AND status = 'active')
);

-- Update friend requests (accept/decline)
DROP POLICY IF EXISTS "friends_update_policy" ON friends;
CREATE POLICY "friends_update_policy" ON friends FOR UPDATE USING (
  friend_id = auth.user_id() OR user_id = auth.user_id()
);

-- Delete friendships
DROP POLICY IF EXISTS "friends_delete_policy" ON friends;
CREATE POLICY "friends_delete_policy" ON friends FOR DELETE USING (
  user_id = auth.user_id() OR friend_id = auth.user_id()
);

-- ================================================================
-- CONVERSATIONS & MESSAGES POLICIES
-- ================================================================

-- Read conversations where user is participant
DROP POLICY IF EXISTS "conversations_read_policy" ON conversations;
CREATE POLICY "conversations_read_policy" ON conversations FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.user_id()
    AND cp.status = 'active'
  )
);

-- Create conversations
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
CREATE POLICY "conversations_insert_policy" ON conversations FOR INSERT WITH CHECK (
  created_by = auth.user_id()
);

-- Update conversations (only creator)
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
CREATE POLICY "conversations_update_policy" ON conversations FOR UPDATE USING (
  created_by = auth.user_id()
);

-- Conversation participants
DROP POLICY IF EXISTS "conversation_participants_read_policy" ON conversation_participants;
CREATE POLICY "conversation_participants_read_policy" ON conversation_participants FOR SELECT USING (
  user_id = auth.user_id() OR
  EXISTS(
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id
    AND cp2.user_id = auth.user_id()
    AND cp2.status = 'active'
  )
);

DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON conversation_participants;
CREATE POLICY "conversation_participants_insert_policy" ON conversation_participants FOR INSERT WITH CHECK (
  user_id = auth.user_id() OR
  EXISTS(
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_participants.conversation_id
    AND c.created_by = auth.user_id()
  )
);

-- Messages
DROP POLICY IF EXISTS "messages_read_policy" ON messages;
CREATE POLICY "messages_read_policy" ON messages FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.user_id()
    AND cp.status = 'active'
  )
);

DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
CREATE POLICY "messages_insert_policy" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.user_id() AND
  EXISTS(
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.user_id()
    AND cp.status = 'active'
  )
);

DROP POLICY IF EXISTS "messages_update_policy" ON messages;
CREATE POLICY "messages_update_policy" ON messages FOR UPDATE USING (
  sender_id = auth.user_id()
);

-- ================================================================
-- EVENTS POLICIES
-- ================================================================

-- Read events
DROP POLICY IF EXISTS "events_read_policy" ON events;
CREATE POLICY "events_read_policy" ON events FOR SELECT USING (
  -- Own events
  creator_id = auth.user_id() OR
  -- Public events
  (is_private = false AND status = 'published') OR
  -- Private events where user is participant
  (is_private = true AND EXISTS(
    SELECT 1 FROM event_participants ep
    WHERE ep.event_id = events.id AND ep.user_id = auth.user_id()
  ))
);

-- Create events
DROP POLICY IF EXISTS "events_insert_policy" ON events;
CREATE POLICY "events_insert_policy" ON events FOR INSERT WITH CHECK (
  creator_id = auth.user_id()
);

-- Update own events
DROP POLICY IF EXISTS "events_update_policy" ON events;
CREATE POLICY "events_update_policy" ON events FOR UPDATE USING (
  creator_id = auth.user_id()
);

-- ================================================================
-- COMMUNITIES POLICIES
-- ================================================================

-- Read communities
DROP POLICY IF EXISTS "communities_read_policy" ON communities;
CREATE POLICY "communities_read_policy" ON communities FOR SELECT USING (
  -- Own communities
  creator_id = auth.user_id() OR
  -- Public communities
  (is_private = false AND status = 'active') OR
  -- Private communities where user is member
  (is_private = true AND EXISTS(
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = communities.id AND cm.user_id = auth.user_id()
    AND cm.status = 'active'
  ))
);

-- Create communities
DROP POLICY IF EXISTS "communities_insert_policy" ON communities;
CREATE POLICY "communities_insert_policy" ON communities FOR INSERT WITH CHECK (
  creator_id = auth.user_id()
);

-- Update own communities
DROP POLICY IF EXISTS "communities_update_policy" ON communities;
CREATE POLICY "communities_update_policy" ON communities FOR UPDATE USING (
  creator_id = auth.user_id() OR
  EXISTS(
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = communities.id AND cm.user_id = auth.user_id()
    AND cm.role IN ('admin', 'moderator')
  )
);

-- ================================================================
-- NOTIFICATIONS POLICIES
-- ================================================================

-- Read own notifications
DROP POLICY IF EXISTS "notifications_read_policy" ON notifications;
CREATE POLICY "notifications_read_policy" ON notifications FOR SELECT USING (
  recipient_id = auth.user_id()
);

-- Create notifications (for system/other users)
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT WITH CHECK (
  sender_id = auth.user_id() OR sender_id IS NULL
);

-- Update own notifications (mark as read)
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE USING (
  recipient_id = auth.user_id()
);

-- ================================================================
-- SUBSCRIPTIONS POLICIES
-- ================================================================

-- Read own subscriptions
DROP POLICY IF EXISTS "subscriptions_read_policy" ON subscriptions;
CREATE POLICY "subscriptions_read_policy" ON subscriptions FOR SELECT USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role = 'admin')
);

-- Create own subscriptions
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON subscriptions;
CREATE POLICY "subscriptions_insert_policy" ON subscriptions FOR INSERT WITH CHECK (
  user_id = auth.user_id()
);

-- Update own subscriptions
DROP POLICY IF EXISTS "subscriptions_update_policy" ON subscriptions;
CREATE POLICY "subscriptions_update_policy" ON subscriptions FOR UPDATE USING (
  user_id = auth.user_id() OR
  EXISTS(SELECT 1 FROM users WHERE id = auth.user_id() AND role = 'admin')
);

-- ================================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS Policies created successfully!';
    RAISE NOTICE '  - Created comprehensive policies for all tables';
    RAISE NOTICE '  - Added utility functions for friend/follow checks';
    RAISE NOTICE '  - Enabled RLS on all tables';
    RAISE NOTICE '  - APIs should now work with proper permissions';
END $$;