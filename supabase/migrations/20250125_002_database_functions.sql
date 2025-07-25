-- ================================================================
-- DATABASE FUNCTIONS FOR INTERACTIONS
-- ================================================================
-- Purpose: Create helper functions for increment/decrement operations
-- Date: 2025-01-25
-- ================================================================

-- Function to increment post stats
CREATE OR REPLACE FUNCTION increment_post_stats(
  post_id UUID,
  stat_type TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    COALESCE((stats->stat_type)::INTEGER, 0) + increment_by
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post stats
CREATE OR REPLACE FUNCTION decrement_post_stats(
  post_id UUID,
  stat_type TEXT,
  decrement_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by)
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comment stats
CREATE OR REPLACE FUNCTION increment_comment_stats(
  comment_id UUID,
  stat_type TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE comments 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    COALESCE((stats->stat_type)::INTEGER, 0) + increment_by
  )
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment stats
CREATE OR REPLACE FUNCTION decrement_comment_stats(
  comment_id UUID,
  stat_type TEXT,
  decrement_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE comments 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by)
  )
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment user stats
CREATE OR REPLACE FUNCTION increment_user_stats(
  user_id UUID,
  stat_type TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    COALESCE((stats->stat_type)::INTEGER, 0) + increment_by
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement user stats
CREATE OR REPLACE FUNCTION decrement_user_stats(
  user_id UUID,
  stat_type TEXT,
  decrement_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    ARRAY[stat_type],
    GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get notification stats for a user
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'unread', COUNT(*) FILTER (WHERE is_read = false),
    'by_type', json_object_agg(
      type, 
      json_build_object(
        'total', type_counts.total,
        'unread', type_counts.unread
      )
    )
  ) INTO result
  FROM (
    SELECT 
      type,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_read = false) as unread
    FROM notifications 
    WHERE recipient_id = p_user_id 
      AND is_deleted = false
    GROUP BY type
  ) type_counts;
  
  RETURN COALESCE(result, '{"total": 0, "unread": 0, "by_type": {}}'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to create notification with deduplication
CREATE OR REPLACE FUNCTION create_notification_safe(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_icon TEXT DEFAULT NULL,
  p_related_data JSONB DEFAULT NULL,
  p_action_text TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_dedup_minutes INTEGER DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  existing_notification UUID;
BEGIN
  -- Check for recent similar notification to avoid spam
  SELECT id INTO existing_notification
  FROM notifications
  WHERE recipient_id = p_recipient_id
    AND sender_id = p_sender_id
    AND type = p_type
    AND created_at > NOW() - INTERVAL '1 minute' * p_dedup_minutes
    AND is_deleted = false
  LIMIT 1;

  -- If found recent similar notification, update it instead of creating new
  IF existing_notification IS NOT NULL THEN
    UPDATE notifications
    SET 
      title = p_title,
      content = p_content,
      icon = COALESCE(p_icon, icon),
      related_data = COALESCE(p_related_data, related_data),
      action_text = COALESCE(p_action_text, action_text),
      action_url = COALESCE(p_action_url, action_url),
      created_at = NOW(),
      is_read = false
    WHERE id = existing_notification;
    
    RETURN existing_notification;
  END IF;

  -- Create new notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    title,
    content,
    icon,
    related_data,
    action_text,
    action_url,
    is_read
  ) VALUES (
    p_recipient_id,
    p_sender_id,
    p_type,
    p_title,
    p_content,
    p_icon,
    p_related_data,
    p_action_text,
    p_action_url,
    false
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update post stats when comments are added/removed
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_stats(NEW.post_id, 'comments_count', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_stats(OLD.post_id, 'comments_count', 1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic post comment counting
DROP TRIGGER IF EXISTS trigger_update_post_comments_count_insert ON comments;
CREATE TRIGGER trigger_update_post_comments_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count_delete ON comments;
CREATE TRIGGER trigger_update_post_comments_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Trigger function to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      PERFORM increment_post_stats(NEW.target_id, 'likes_count', 1);
    ELSIF NEW.target_type = 'comment' THEN
      PERFORM increment_comment_stats(NEW.target_id, 'likes', 1);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      PERFORM decrement_post_stats(OLD.target_id, 'likes_count', 1);
    ELSIF OLD.target_type = 'comment' THEN
      PERFORM decrement_comment_stats(OLD.target_id, 'likes', 1);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic like counting
DROP TRIGGER IF EXISTS trigger_update_like_counts_insert ON likes;
CREATE TRIGGER trigger_update_like_counts_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

DROP TRIGGER IF EXISTS trigger_update_like_counts_delete ON likes;
CREATE TRIGGER trigger_update_like_counts_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Trigger function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    PERFORM increment_user_stats(NEW.follower_id, 'following', 1);
    -- Increment followers count for followed user
    PERFORM increment_user_stats(NEW.following_id, 'followers', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    PERFORM decrement_user_stats(OLD.follower_id, 'following', 1);
    -- Decrement followers count for followed user
    PERFORM decrement_user_stats(OLD.following_id, 'followers', 1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic follow counting
DROP TRIGGER IF EXISTS trigger_update_follow_counts_insert ON follows;
CREATE TRIGGER trigger_update_follow_counts_insert
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

DROP TRIGGER IF EXISTS trigger_update_follow_counts_delete ON follows;
CREATE TRIGGER trigger_update_follow_counts_delete
  AFTER DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_post_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION decrement_post_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_comment_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION decrement_comment_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_user_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION decrement_user_stats(UUID, TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_notification_stats(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_notification_safe(UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, INTEGER) TO authenticated, service_role;

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'DATABASE FUNCTIONS CREATED SUCCESSFULLY!';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '- increment_post_stats';
  RAISE NOTICE '- decrement_post_stats';
  RAISE NOTICE '- increment_comment_stats';
  RAISE NOTICE '- decrement_comment_stats';
  RAISE NOTICE '- increment_user_stats';
  RAISE NOTICE '- decrement_user_stats';
  RAISE NOTICE '- get_notification_stats';
  RAISE NOTICE '- create_notification_safe';
  RAISE NOTICE 'Triggers created for automatic counting';
  RAISE NOTICE '================================================================';
END $$;