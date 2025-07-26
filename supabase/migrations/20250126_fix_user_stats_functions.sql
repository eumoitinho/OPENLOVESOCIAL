-- Fix jsonb_set type error in user stats functions
-- The third parameter of jsonb_set must be a jsonb value, not an integer

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;

-- Fix increment_user_stats function
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
    to_jsonb(COALESCE((stats->stat_type)::INTEGER, 0) + increment_by)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Fix decrement_user_stats function
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
    to_jsonb(GREATEST(COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by, 0))
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Also fix the trigger function if needed
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