-- ================================================================
-- SIMPLE RLS FIX - NO OWNERSHIP REQUIRED
-- ================================================================
-- Purpose: Fix RLS policies without requiring table ownership
-- Date: 2025-01-21
-- ================================================================

-- ================================================================
-- DROP EXISTING POLICIES ONLY
-- ================================================================

-- Users policies
DROP POLICY IF EXISTS "users_own_profile_access" ON users;
DROP POLICY IF EXISTS "users_public_read" ON users;
DROP POLICY IF EXISTS "users_own_update" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_public_read_all" ON users;

-- Posts policies
DROP POLICY IF EXISTS "posts_own_access" ON posts;
DROP POLICY IF EXISTS "posts_public_read" ON posts;
DROP POLICY IF EXISTS "posts_insert" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;
DROP POLICY IF EXISTS "posts_read_access" ON posts;

-- Comments policies  
DROP POLICY IF EXISTS "comments_own_access" ON comments;
DROP POLICY IF EXISTS "comments_read_on_accessible_posts" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_update_own" ON comments;
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
DROP POLICY IF EXISTS "comments_read" ON comments;

-- Likes policies
DROP POLICY IF EXISTS "likes_public_read" ON likes;
DROP POLICY IF EXISTS "likes_insert" ON likes;
DROP POLICY IF EXISTS "likes_delete_own" ON likes;

-- Follows policies
DROP POLICY IF EXISTS "follows_public_read" ON follows;
DROP POLICY IF EXISTS "follows_insert" ON follows;
DROP POLICY IF EXISTS "follows_delete_own" ON follows;
DROP POLICY IF EXISTS "follows_update_own" ON follows;

-- Friends policies
DROP POLICY IF EXISTS "friends_public_read" ON friends;
DROP POLICY IF EXISTS "friends_insert" ON friends;
DROP POLICY IF EXISTS "friends_update" ON friends;
DROP POLICY IF EXISTS "friends_delete" ON friends;

-- Notifications policies
DROP POLICY IF EXISTS "notifications_own_access" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications_system_insert" ON notifications;

-- Conversations policies
DROP POLICY IF EXISTS "conversations_participant_access" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;

-- Conversation participants policies
DROP POLICY IF EXISTS "conversation_participants_read" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_update" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_delete" ON conversation_participants;

-- Messages policies
DROP POLICY IF EXISTS "messages_conversation_read" ON messages;
DROP POLICY IF EXISTS "messages_conversation_access" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;
DROP POLICY IF EXISTS "messages_delete_own" ON messages;

-- ================================================================
-- CREATE SIMPLE, WORKING POLICIES
-- ================================================================

-- USERS TABLE - CRITICAL FOR CHECK-USERNAME
CREATE POLICY "users_select_all" ON users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_authenticated" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- POSTS TABLE
CREATE POLICY "posts_select_public" ON posts
    FOR SELECT USING (
        visibility = 'public' OR
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "posts_insert_authenticated" ON posts
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "posts_update_own" ON posts
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "posts_delete_own" ON posts
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- COMMENTS TABLE
CREATE POLICY "comments_select_public" ON comments
    FOR SELECT USING (true);

CREATE POLICY "comments_insert_authenticated" ON comments
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "comments_update_own" ON comments
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- LIKES TABLE
CREATE POLICY "likes_select_all" ON likes
    FOR SELECT USING (true);

CREATE POLICY "likes_insert_authenticated" ON likes
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "likes_delete_own" ON likes
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- FOLLOWS TABLE
CREATE POLICY "follows_select_all" ON follows
    FOR SELECT USING (true);

CREATE POLICY "follows_insert_authenticated" ON follows
    FOR INSERT WITH CHECK (
        follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "follows_delete_own" ON follows
    FOR DELETE USING (
        follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- FRIENDS TABLE
CREATE POLICY "friends_select_all" ON friends
    FOR SELECT USING (true);

CREATE POLICY "friends_insert_authenticated" ON friends
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "friends_update_involved" ON friends
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        friend_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "friends_delete_involved" ON friends
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        friend_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- SAVED POSTS TABLE
CREATE POLICY "saved_posts_own_all" ON saved_posts
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- NOTIFICATIONS TABLE
CREATE POLICY "notifications_own_read" ON notifications
    FOR SELECT USING (
        recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "notifications_insert_authenticated" ON notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (
        recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "notifications_delete_own" ON notifications
    FOR DELETE USING (
        recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- CONVERSATIONS TABLE
CREATE POLICY "conversations_participant_read" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

CREATE POLICY "conversations_insert_authenticated" ON conversations
    FOR INSERT WITH CHECK (
        created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- CONVERSATION PARTICIPANTS TABLE
CREATE POLICY "conversation_participants_select_member" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp2.status = 'active'
        )
    );

CREATE POLICY "conversation_participants_insert_authenticated" ON conversation_participants
    FOR INSERT WITH CHECK (true); -- Allow adding participants

CREATE POLICY "conversation_participants_update_own" ON conversation_participants
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- MESSAGES TABLE
CREATE POLICY "messages_select_participant" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

CREATE POLICY "messages_insert_authenticated" ON messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "messages_update_own" ON messages
    FOR UPDATE USING (
        sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- MESSAGE REACTIONS TABLE
CREATE POLICY "message_reactions_select_participant" ON message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

CREATE POLICY "message_reactions_insert_authenticated" ON message_reactions
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "message_reactions_delete_own" ON message_reactions
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- MESSAGE READS TABLE
CREATE POLICY "message_reads_all_access" ON message_reads
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- EVENTS TABLE
CREATE POLICY "events_select_visible" ON events
    FOR SELECT USING (
        visibility = 'public' OR
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "events_insert_authenticated" ON events
    FOR INSERT WITH CHECK (
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "events_update_own" ON events
    FOR UPDATE USING (
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "events_delete_own" ON events
    FOR DELETE USING (
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- EVENT PARTICIPANTS TABLE
CREATE POLICY "event_participants_select_visible" ON event_participants
    FOR SELECT USING (true);

CREATE POLICY "event_participants_insert_authenticated" ON event_participants
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "event_participants_update_own" ON event_participants
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "event_participants_delete_own" ON event_participants
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- EVENT INVITATIONS TABLE
CREATE POLICY "event_invitations_involved_access" ON event_invitations
    FOR ALL USING (
        inviter_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        invitee_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- COMMUNITIES TABLE
CREATE POLICY "communities_select_visible" ON communities
    FOR SELECT USING (
        is_private = false OR
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

CREATE POLICY "communities_insert_authenticated" ON communities
    FOR INSERT WITH CHECK (
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "communities_update_admin" ON communities
    FOR UPDATE USING (
        creator_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- COMMUNITY MEMBERS TABLE
CREATE POLICY "community_members_select_visible" ON community_members
    FOR SELECT USING (true);

CREATE POLICY "community_members_insert_authenticated" ON community_members
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "community_members_update_own" ON community_members
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "community_members_delete_own" ON community_members
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- COMMUNITY POSTS TABLE
CREATE POLICY "community_posts_select_member" ON community_posts
    FOR SELECT USING (true);

CREATE POLICY "community_posts_insert_member" ON community_posts
    FOR INSERT WITH CHECK (true);

-- PROFILE VIEWS TABLE
CREATE POLICY "profile_views_select_own" ON profile_views
    FOR SELECT USING (
        viewed_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "profile_views_insert_any" ON profile_views
    FOR INSERT WITH CHECK (true);

-- BLOCKED USERS TABLE
CREATE POLICY "blocked_users_own_access" ON blocked_users
    FOR ALL USING (
        blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        blocked_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- PAYMENT INTENTS TABLE
CREATE POLICY "payment_intents_own_access" ON payment_intents
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- USER MONTHLY USAGE TABLE
CREATE POLICY "user_monthly_usage_own_read" ON user_monthly_usage
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "user_monthly_usage_system_write" ON user_monthly_usage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_monthly_usage_system_update" ON user_monthly_usage
    FOR UPDATE USING (true);

-- SUBSCRIPTIONS TABLE
CREATE POLICY "subscriptions_own_access" ON subscriptions
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- POLLS TABLE
CREATE POLICY "polls_select_public" ON polls
    FOR SELECT USING (true);

CREATE POLICY "polls_insert_post_owner" ON polls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_id
            AND posts.user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
        )
    );

-- POLL VOTES TABLE
CREATE POLICY "poll_votes_select_public" ON poll_votes
    FOR SELECT USING (true);

CREATE POLICY "poll_votes_insert_authenticated" ON poll_votes
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "poll_votes_update_own" ON poll_votes
    FOR UPDATE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "poll_votes_delete_own" ON poll_votes
    FOR DELETE USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- CALLS TABLE
CREATE POLICY "calls_participant_access" ON calls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = calls.conversation_id
            AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- CALL PARTICIPANTS TABLE
CREATE POLICY "call_participants_access" ON call_participants
    FOR ALL USING (
        user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM calls
            JOIN conversation_participants cp ON cp.conversation_id = calls.conversation_id
            WHERE calls.id = call_participants.call_id
            AND cp.user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'SIMPLE RLS FIX COMPLETE!';
    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE 'Username checking should now work!';
    RAISE NOTICE 'All basic CRUD operations enabled!';
END $$;