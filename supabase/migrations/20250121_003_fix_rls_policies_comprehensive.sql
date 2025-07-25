-- ================================================================
-- FIX RLS POLICIES - COMPREHENSIVE SOLUTION
-- ================================================================
-- Purpose: Fix all RLS policies to allow proper CRUD operations
-- Date: 2025-01-21
-- ================================================================

-- ================================================================
-- DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- ================================================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || 
                ' ON ' || quote_ident(policy_record.schemaname) || '.' || quote_ident(policy_record.tablename);
    END LOOP;
END $$;

-- ================================================================
-- USERS TABLE POLICIES
-- ================================================================

-- Anyone can view active users
CREATE POLICY "users_public_read" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "users_own_update" ON users
    FOR UPDATE USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Users can insert their own profile (handled by trigger but needed for some edge cases)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth_id = auth.uid());

-- ================================================================
-- FOLLOWS TABLE POLICIES
-- ================================================================

-- Anyone can view follows
CREATE POLICY "follows_public_read" ON follows
    FOR SELECT USING (true);

-- Users can create follows
CREATE POLICY "follows_insert" ON follows
    FOR INSERT WITH CHECK (
        follower_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own follows
CREATE POLICY "follows_delete_own" ON follows
    FOR DELETE USING (
        follower_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- FRIENDS TABLE POLICIES
-- ================================================================

-- Anyone can view friends
CREATE POLICY "friends_public_read" ON friends
    FOR SELECT USING (true);

-- Users can create friend requests
CREATE POLICY "friends_insert" ON friends
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can update friend requests they're involved in
CREATE POLICY "friends_update" ON friends
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own friend relationships
CREATE POLICY "friends_delete" ON friends
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- POSTS TABLE POLICIES
-- ================================================================

-- Public posts are readable by everyone
CREATE POLICY "posts_public_read" ON posts
    FOR SELECT USING (
        visibility = 'public' OR
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friends 
            WHERE status = 'accepted' 
            AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                 (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
        ))
    );

-- Users can create their own posts
CREATE POLICY "posts_insert" ON posts
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can update their own posts
CREATE POLICY "posts_update_own" ON posts
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own posts
CREATE POLICY "posts_delete_own" ON posts
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- COMMENTS TABLE POLICIES
-- ================================================================

-- Comments are readable if the post is readable
CREATE POLICY "comments_read" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = comments.post_id 
            AND (
                posts.visibility = 'public' OR
                posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Users can create comments
CREATE POLICY "comments_insert" ON comments
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_id 
            AND (
                posts.visibility = 'public' OR
                posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Users can update their own comments
CREATE POLICY "comments_update_own" ON comments
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- LIKES TABLE POLICIES
-- ================================================================

-- Anyone can view likes
CREATE POLICY "likes_public_read" ON likes
    FOR SELECT USING (true);

-- Users can create likes
CREATE POLICY "likes_insert" ON likes
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own likes
CREATE POLICY "likes_delete_own" ON likes
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- SAVED POSTS POLICIES
-- ================================================================

-- Users can only see their own saved posts
CREATE POLICY "saved_posts_own_read" ON saved_posts
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can save posts
CREATE POLICY "saved_posts_insert" ON saved_posts
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their saved posts
CREATE POLICY "saved_posts_delete_own" ON saved_posts
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- CONVERSATIONS POLICIES
-- ================================================================

-- Users can see conversations they're part of
CREATE POLICY "conversations_participant_read" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can create conversations
CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT WITH CHECK (
        created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Participants can update conversations
CREATE POLICY "conversations_update" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
            AND role IN ('admin', 'moderator')
        )
    );

-- ================================================================
-- CONVERSATION PARTICIPANTS POLICIES
-- ================================================================

-- Users can see participants of conversations they're in
CREATE POLICY "conversation_participants_read" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp2.status = 'active'
        )
    );

-- Users can be added to conversations
CREATE POLICY "conversation_participants_insert" ON conversation_participants
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversation_participants.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
            AND role IN ('admin', 'moderator')
        )
    );

-- Users can update their own participation
CREATE POLICY "conversation_participants_update" ON conversation_participants
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- MESSAGES POLICIES
-- ================================================================

-- Users can read messages in conversations they're part of
CREATE POLICY "messages_conversation_read" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can send messages to conversations they're part of
CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can update their own messages
CREATE POLICY "messages_update_own" ON messages
    FOR UPDATE USING (
        sender_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own messages
CREATE POLICY "messages_delete_own" ON messages
    FOR DELETE USING (
        sender_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- MESSAGE REACTIONS POLICIES
-- ================================================================

-- Users can see reactions in conversations they're part of
CREATE POLICY "message_reactions_read" ON message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- Users can add reactions
CREATE POLICY "message_reactions_insert" ON message_reactions
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = message_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- Users can remove their own reactions
CREATE POLICY "message_reactions_delete_own" ON message_reactions
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- MESSAGE READS POLICIES
-- ================================================================

-- Users can see read status in conversations they're part of
CREATE POLICY "message_reads_read" ON message_reads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = message_reads.message_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- Users can mark messages as read
CREATE POLICY "message_reads_insert" ON message_reads
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
            WHERE m.id = message_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- ================================================================
-- EVENTS POLICIES
-- ================================================================

-- Public events are readable by everyone
CREATE POLICY "events_public_read" ON events
    FOR SELECT USING (
        visibility = 'public' OR
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friends 
            WHERE status = 'accepted' 
            AND ((user_id = events.creator_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                 (friend_id = events.creator_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
        ))
    );

-- Users can create events
CREATE POLICY "events_insert" ON events
    FOR INSERT WITH CHECK (
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can update their own events
CREATE POLICY "events_update_own" ON events
    FOR UPDATE USING (
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own events
CREATE POLICY "events_delete_own" ON events
    FOR DELETE USING (
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- EVENT PARTICIPANTS POLICIES
-- ================================================================

-- Anyone can see participants of visible events
CREATE POLICY "event_participants_read" ON event_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_participants.event_id
            AND (
                events.visibility = 'public' OR
                events.creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (events.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = events.creator_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = events.creator_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Users can join events
CREATE POLICY "event_participants_insert" ON event_participants
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can update their participation
CREATE POLICY "event_participants_update" ON event_participants
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can leave events
CREATE POLICY "event_participants_delete" ON event_participants
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- EVENT INVITATIONS POLICIES
-- ================================================================

-- Users can see invitations sent to them or by them
CREATE POLICY "event_invitations_read" ON event_invitations
    FOR SELECT USING (
        inviter_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        invitee_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can create invitations
CREATE POLICY "event_invitations_insert" ON event_invitations
    FOR INSERT WITH CHECK (
        inviter_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM event_participants
            WHERE event_id = event_invitations.event_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND (is_organizer = true OR can_invite = true)
        )
    );

-- Users can update invitations sent to them
CREATE POLICY "event_invitations_update" ON event_invitations
    FOR UPDATE USING (
        invitee_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- COMMUNITIES POLICIES
-- ================================================================

-- Public communities are readable by everyone
CREATE POLICY "communities_public_read" ON communities
    FOR SELECT USING (
        is_private = false OR
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can create communities
CREATE POLICY "communities_insert" ON communities
    FOR INSERT WITH CHECK (
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Admins can update communities
CREATE POLICY "communities_update" ON communities
    FOR UPDATE USING (
        creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = communities.id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
            AND role IN ('owner', 'admin')
        )
    );

-- ================================================================
-- COMMUNITY MEMBERS POLICIES
-- ================================================================

-- Members of communities can see other members
CREATE POLICY "community_members_read" ON community_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_members.community_id
            AND (
                is_private = false OR
                creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                EXISTS (
                    SELECT 1 FROM community_members cm2
                    WHERE cm2.community_id = communities.id
                    AND cm2.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
                    AND cm2.status = 'active'
                )
            )
        )
    );

-- Users can join public communities
CREATE POLICY "community_members_insert" ON community_members
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_id
            AND (is_private = false OR requires_approval = false)
        )
    );

-- Members can update their own membership
CREATE POLICY "community_members_update" ON community_members
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Members can leave communities
CREATE POLICY "community_members_delete" ON community_members
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- COMMUNITY POSTS POLICIES
-- ================================================================

-- Community posts follow community visibility
CREATE POLICY "community_posts_read" ON community_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_posts.community_id
            AND (
                is_private = false OR
                creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                EXISTS (
                    SELECT 1 FROM community_members
                    WHERE community_id = communities.id
                    AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
                    AND status = 'active'
                )
            )
        )
    );

-- Members can post to communities
CREATE POLICY "community_posts_insert" ON community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = community_posts.community_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
            AND can_post = true
        )
    );

-- ================================================================
-- NOTIFICATIONS POLICIES
-- ================================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_own_read" ON notifications
    FOR SELECT USING (
        recipient_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System and users can create notifications
CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        sender_id = (SELECT id FROM users WHERE username = 'system')
    );

-- Users can update their own notifications
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (
        recipient_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON notifications
    FOR DELETE USING (
        recipient_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- PROFILE VIEWS POLICIES
-- ================================================================

-- Users can see who viewed their profile
CREATE POLICY "profile_views_own_read" ON profile_views
    FOR SELECT USING (
        viewed_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Anyone can create profile views
CREATE POLICY "profile_views_insert" ON profile_views
    FOR INSERT WITH CHECK (true);

-- ================================================================
-- BLOCKED USERS POLICIES
-- ================================================================

-- Users can see their own blocks
CREATE POLICY "blocked_users_own_read" ON blocked_users
    FOR SELECT USING (
        blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
        blocked_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can block other users
CREATE POLICY "blocked_users_insert" ON blocked_users
    FOR INSERT WITH CHECK (
        blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- Users can unblock users
CREATE POLICY "blocked_users_delete" ON blocked_users
    FOR DELETE USING (
        blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- PAYMENT INTENTS POLICIES
-- ================================================================

-- Users can see their own payment intents
CREATE POLICY "payment_intents_own_read" ON payment_intents
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System can create payment intents
CREATE POLICY "payment_intents_insert" ON payment_intents
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System can update payment intents
CREATE POLICY "payment_intents_update" ON payment_intents
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- USER MONTHLY USAGE POLICIES
-- ================================================================

-- Users can see their own usage
CREATE POLICY "user_monthly_usage_own_read" ON user_monthly_usage
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System can track usage
CREATE POLICY "user_monthly_usage_insert" ON user_monthly_usage
    FOR INSERT WITH CHECK (true);

-- System can update usage
CREATE POLICY "user_monthly_usage_update" ON user_monthly_usage
    FOR UPDATE USING (true);

-- ================================================================
-- SUBSCRIPTIONS POLICIES
-- ================================================================

-- Users can see their own subscriptions
CREATE POLICY "subscriptions_own_read" ON subscriptions
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System can create subscriptions
CREATE POLICY "subscriptions_insert" ON subscriptions
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- System can update subscriptions
CREATE POLICY "subscriptions_update" ON subscriptions
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- POLLS POLICIES
-- ================================================================

-- Polls are readable if the post is readable
CREATE POLICY "polls_read" ON polls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = polls.post_id 
            AND (
                posts.visibility = 'public' OR
                posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Post owners can create polls
CREATE POLICY "polls_insert" ON polls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts
            WHERE posts.id = post_id
            AND posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
    );

-- ================================================================
-- POLL VOTES POLICIES
-- ================================================================

-- Users can see votes on visible polls
CREATE POLICY "poll_votes_read" ON poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls
            JOIN posts ON posts.id = polls.post_id
            WHERE polls.id = poll_votes.poll_id
            AND (
                posts.visibility = 'public' OR
                posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Users can vote on polls
CREATE POLICY "poll_votes_insert" ON poll_votes
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM polls
            JOIN posts ON posts.id = polls.post_id
            WHERE polls.id = poll_id
            AND (
                posts.visibility = 'public' OR
                posts.user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
                (posts.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friends 
                    WHERE status = 'accepted' 
                    AND ((user_id = posts.user_id AND friend_id = (SELECT id FROM users WHERE auth_id = auth.uid())) OR
                         (friend_id = posts.user_id AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())))
                ))
            )
        )
    );

-- Users can change their vote
CREATE POLICY "poll_votes_update" ON poll_votes
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    );

-- ================================================================
-- CALLS POLICIES
-- ================================================================

-- Participants can see calls
CREATE POLICY "calls_read" ON calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = calls.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Participants can initiate calls
CREATE POLICY "calls_insert" ON calls
    FOR INSERT WITH CHECK (
        initiated_by = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = calls.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- Participants can update calls
CREATE POLICY "calls_update" ON calls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = calls.conversation_id
            AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND status = 'active'
        )
    );

-- ================================================================
-- CALL PARTICIPANTS POLICIES
-- ================================================================

-- Participants can see call participants
CREATE POLICY "call_participants_read" ON call_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM calls
            JOIN conversation_participants cp ON cp.conversation_id = calls.conversation_id
            WHERE calls.id = call_participants.call_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- Users can join calls
CREATE POLICY "call_participants_insert" ON call_participants
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM calls
            JOIN conversation_participants cp ON cp.conversation_id = calls.conversation_id
            WHERE calls.id = call_id
            AND cp.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
            AND cp.status = 'active'
        )
    );

-- Users can update their participation
CREATE POLICY "call_participants_update" ON call_participants
    FOR UPDATE USING (
        user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
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
    
    RAISE NOTICE 'RLS POLICIES FIXED!';
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE 'All basic CRUD operations should now work properly';
END $$;

-- Final status
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;