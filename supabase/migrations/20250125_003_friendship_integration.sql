-- ================================================================
-- FRIENDSHIP AND FOLLOW INTEGRATION
-- ================================================================
-- Purpose: Create integration between friendship and follow systems
-- Date: 2025-01-25
-- ================================================================

-- Function to handle friendship acceptance and automatic following
CREATE OR REPLACE FUNCTION handle_friendship_accepted()
RETURNS TRIGGER AS $$
DECLARE
  friend_user_id UUID;
  requester_user_id UUID;
BEGIN
  -- Only process when status changes to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    friend_user_id := NEW.friend_id;
    requester_user_id := NEW.user_id;
    
    -- Make them follow each other automatically (if not already following)
    -- Friend follows requester
    INSERT INTO follows (follower_id, following_id, status)
    VALUES (friend_user_id, requester_user_id, 'active')
    ON CONFLICT (follower_id, following_id) DO NOTHING;
    
    -- Requester follows friend
    INSERT INTO follows (follower_id, following_id, status)
    VALUES (requester_user_id, friend_user_id, 'active')
    ON CONFLICT (follower_id, following_id) DO NOTHING;
    
    -- Update friend counters
    PERFORM increment_user_stats(friend_user_id, 'friends', 1);
    PERFORM increment_user_stats(requester_user_id, 'friends', 1);
    
    -- Note: Following counters will be updated by the follow triggers
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle friendship removal and optionally unfollow
CREATE OR REPLACE FUNCTION handle_friendship_removed()
RETURNS TRIGGER AS $$
BEGIN
  -- When friendship is deleted, decrement friend counters
  PERFORM decrement_user_stats(OLD.friend_id, 'friends', 1);
  PERFORM decrement_user_stats(OLD.user_id, 'friends', 1);
  
  -- Note: We don't automatically unfollow when friendship ends
  -- as users might want to keep following each other
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest friendship when mutual following occurs
CREATE OR REPLACE FUNCTION suggest_friendship_on_mutual_follow()
RETURNS TRIGGER AS $$
DECLARE
  mutual_follow_exists BOOLEAN;
  friendship_exists BOOLEAN;
  follower_user_data RECORD;
  following_user_data RECORD;
BEGIN
  -- Check if there's mutual following
  SELECT EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = NEW.following_id 
    AND following_id = NEW.follower_id 
    AND status = 'active'
  ) INTO mutual_follow_exists;
  
  IF mutual_follow_exists THEN
    -- Check if they're already friends or have pending friendship
    SELECT EXISTS(
      SELECT 1 FROM friends 
      WHERE (user_id = NEW.follower_id AND friend_id = NEW.following_id)
      OR (user_id = NEW.following_id AND friend_id = NEW.follower_id)
    ) INTO friendship_exists;
    
    IF NOT friendship_exists THEN
      -- Get user data for notification
      SELECT username, name, avatar_url INTO following_user_data
      FROM users WHERE id = NEW.following_id;
      
      -- Create friendship suggestion notification for the follower
      INSERT INTO notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        icon,
        related_data,
        action_text,
        action_url
      ) VALUES (
        NEW.follower_id,
        NULL, -- System notification
        'system',
        'Sugestão de amizade',
        'Vocês se seguem mutuamente. Que tal enviar uma solicitação de amizade?',
        'Users',
        jsonb_build_object(
          'suggested_friend_id', NEW.following_id,
          'username', following_user_data.username,
          'name', following_user_data.name,
          'avatar_url', following_user_data.avatar_url,
          'mutual_follow_suggestion', true
        ),
        'Enviar solicitação',
        '/profile/' || COALESCE(following_user_data.username, NEW.following_id::text)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check friendship status for API
CREATE OR REPLACE FUNCTION get_friendship_status(
  current_user_id UUID,
  target_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  friendship_data RECORD;
  result JSON;
BEGIN
  -- Check friendship status in both directions
  SELECT 
    f.status,
    f.user_id as requester_id,
    f.friend_id,
    f.created_at,
    f.accepted_at
  INTO friendship_data
  FROM friends f
  WHERE (f.user_id = current_user_id AND f.friend_id = target_user_id)
     OR (f.user_id = target_user_id AND f.friend_id = current_user_id)
  ORDER BY f.created_at DESC
  LIMIT 1;
  
  IF friendship_data IS NULL THEN
    result := json_build_object(
      'isFriend', false,
      'status', 'none',
      'canSendRequest', true
    );
  ELSE
    result := json_build_object(
      'isFriend', friendship_data.status = 'accepted',
      'status', friendship_data.status,
      'isRequester', friendship_data.requester_id = current_user_id,
      'canSendRequest', false,
      'acceptedAt', friendship_data.accepted_at
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_friendship_accepted ON friends;
CREATE TRIGGER trigger_friendship_accepted
  AFTER UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION handle_friendship_accepted();

DROP TRIGGER IF EXISTS trigger_friendship_removed ON friends;
CREATE TRIGGER trigger_friendship_removed
  AFTER DELETE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION handle_friendship_removed();

DROP TRIGGER IF EXISTS trigger_suggest_friendship_on_follow ON follows;
CREATE TRIGGER trigger_suggest_friendship_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION suggest_friendship_on_mutual_follow();

-- Add missing RLS policies for friends table
CREATE POLICY "friends_read_involved" ON public.friends
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR
         friend_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "friends_insert_authenticated" ON public.friends
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

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

-- Service role policies for friends
CREATE POLICY "service_role_bypass_friends" ON public.friends
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_friendship_status(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_friendship_accepted() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_friendship_removed() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION suggest_friendship_on_mutual_follow() TO authenticated, service_role;

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'FRIENDSHIP INTEGRATION COMPLETED!';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Features implemented:';
  RAISE NOTICE '- Automatic mutual following when friendship is accepted';
  RAISE NOTICE '- Friendship suggestions on mutual follows';
  RAISE NOTICE '- Friend counter synchronization';
  RAISE NOTICE '- Comprehensive RLS policies';
  RAISE NOTICE '- Helper functions for friendship status';
  RAISE NOTICE '================================================================';
END $$;