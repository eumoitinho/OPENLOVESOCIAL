-- ================================================================
-- FIX JSONB_SET TYPE ERROR IN STATS FUNCTIONS
-- ================================================================
-- Purpose: Fix type error where INTEGER is passed instead of JSONB
-- Date: 2025-01-26
-- Error: function jsonb_set(jsonb, text[], integer) does not exist
-- ================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS increment_post_stats(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS decrement_post_stats(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS increment_comment_stats(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS decrement_comment_stats(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS increment_user_stats(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS decrement_user_stats(UUID, TEXT, INTEGER);

-- Recreate function to increment post stats with proper type casting
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
    to_jsonb(COALESCE((stats->stat_type)::INTEGER, 0) + increment_by)
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate function to decrement post stats with proper type casting
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
    to_jsonb(GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by))
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate function to increment comment stats with proper type casting
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
    to_jsonb(COALESCE((stats->stat_type)::INTEGER, 0) + increment_by)
  )
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate function to decrement comment stats with proper type casting
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
    to_jsonb(GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by))
  )
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate function to increment user stats with proper type casting
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

-- Recreate function to decrement user stats with proper type casting
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
    to_jsonb(GREATEST(0, COALESCE((stats->stat_type)::INTEGER, 0) - decrement_by))
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ALSO FIX ANY TRIGGER FUNCTIONS THAT USE JSONB_SET
-- ================================================================

-- Check and fix update_post_stats trigger function
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{likes}', 
                to_jsonb(COALESCE((stats->>'likes')::int, 0) + 1)
            )
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{likes}', 
                to_jsonb(GREATEST(COALESCE((stats->>'likes')::int, 0) - 1, 0))
            )
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Check and fix update_comment_stats trigger function
CREATE OR REPLACE FUNCTION update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'), 
            '{comments}', 
            to_jsonb(COALESCE((stats->>'comments')::int, 0) + 1)
        )
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'), 
            '{comments}', 
            to_jsonb(GREATEST(COALESCE((stats->>'comments')::int, 0) - 1, 0))
        )
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Check and fix update_user_stats trigger function
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{posts}', 
                to_jsonb(COALESCE((stats->>'posts')::int, 0) + 1)
            )
            WHERE id = NEW.user_id;
        END IF;
        
        -- Update followers count
        IF TG_TABLE_NAME = 'follows' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{followers}', 
                to_jsonb(COALESCE((stats->>'followers')::int, 0) + 1)
            )
            WHERE id = NEW.following_id;
            
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{following}', 
                to_jsonb(COALESCE((stats->>'following')::int, 0) + 1)
            )
            WHERE id = NEW.follower_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{posts}', 
                to_jsonb(GREATEST(COALESCE((stats->>'posts')::int, 0) - 1, 0))
            )
            WHERE id = OLD.user_id;
        END IF;
        
        -- Update followers count
        IF TG_TABLE_NAME = 'follows' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{followers}', 
                to_jsonb(GREATEST(COALESCE((stats->>'followers')::int, 0) - 1, 0))
            )
            WHERE id = OLD.following_id;
            
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'), 
                '{following}', 
                to_jsonb(GREATEST(COALESCE((stats->>'following')::int, 0) - 1, 0))
            )
            WHERE id = OLD.follower_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Ensure triggers are properly attached
DROP TRIGGER IF EXISTS update_post_stats_trigger ON likes;
CREATE TRIGGER update_post_stats_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_post_stats();

DROP TRIGGER IF EXISTS update_comment_stats_trigger ON comments;
CREATE TRIGGER update_comment_stats_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_stats();

DROP TRIGGER IF EXISTS update_user_posts_stats_trigger ON posts;
CREATE TRIGGER update_user_posts_stats_trigger
AFTER INSERT OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS update_user_follows_stats_trigger ON follows;
CREATE TRIGGER update_user_follows_stats_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();