-- EXECUTE THIS SQL DIRECTLY IN SUPABASE TO FIX THE FOLLOW TRIGGER ERROR
-- This fixes the error: record "new" has no field "user_id"

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;

-- 2. Create a new function specifically for follows table
CREATE OR REPLACE FUNCTION update_user_follows_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment followers count for the user being followed
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb, 
            '{followers}', 
            COALESCE(((stats->>'followers')::int + 1), 1)::text::jsonb
        )
        WHERE id = NEW.following_id;
        
        -- Increment following count for the user doing the following
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb, 
            '{following}', 
            COALESCE(((stats->>'following')::int + 1), 1)::text::jsonb
        )
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement followers count for the user being unfollowed
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb, 
            '{followers}', 
            GREATEST(COALESCE(((stats->>'followers')::int - 1), 0), 0)::text::jsonb
        )
        WHERE id = OLD.following_id;
        
        -- Decrement following count for the user doing the unfollowing
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb, 
            '{following}', 
            GREATEST(COALESCE(((stats->>'following')::int - 1), 0), 0)::text::jsonb
        )
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the new trigger
CREATE TRIGGER update_user_follows_stats
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follows_stats();

-- 4. Ensure users have proper stats structure
UPDATE users 
SET stats = COALESCE(stats, '{}')::jsonb || '{"posts": 0, "followers": 0, "following": 0}'::jsonb
WHERE stats IS NULL OR NOT (stats ? 'followers') OR NOT (stats ? 'following');

-- 5. Fix RLS policies for follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view follows where they are involved" ON follows;
DROP POLICY IF EXISTS "Users can insert follows where they are the follower" ON follows;
DROP POLICY IF EXISTS "Users can delete follows where they are the follower" ON follows;

-- Create new policies
CREATE POLICY "Users can view follows where they are involved" ON follows
    FOR SELECT USING (
        auth.uid() = follower_id OR 
        auth.uid() = following_id
    );

CREATE POLICY "Users can insert follows where they are the follower" ON follows
    FOR INSERT WITH CHECK (
        auth.uid() = follower_id
    );

CREATE POLICY "Users can delete follows where they are the follower" ON follows
    FOR DELETE USING (
        auth.uid() = follower_id
    );