-- ================================================================
-- QUICK FIX FOR JSONB_SET TYPE ERROR
-- ================================================================
-- Execute this SQL directly in Supabase Studio SQL Editor
-- This fixes the error: function jsonb_set(jsonb, text[], integer) does not exist
-- ================================================================

-- Fix the trigger functions that are causing the error

-- 1. Fix update_post_stats trigger function
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

-- 2. Fix update_comment_stats trigger function
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

-- 3. Fix update_user_stats trigger function
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

-- 4. Fix the helper functions if they exist
-- Drop and recreate increment functions
DROP FUNCTION IF EXISTS increment_post_stats(UUID, TEXT, INTEGER);
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

DROP FUNCTION IF EXISTS decrement_post_stats(UUID, TEXT, INTEGER);
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

-- Test: This should work without errors now
-- INSERT INTO likes (target_type, target_id, user_id) 
-- VALUES ('post', 'some-post-uuid', 'some-user-uuid');