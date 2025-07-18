-- Fix follows trigger that tries to access non-existent user_id field
-- The issue is that update_user_stats() function tries to access NEW.user_id for posts table
-- but when called from follows table, it should use follower_id and following_id

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;

-- Also fix the original update_user_stats function to be more robust
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'::jsonb), 
                '{posts}', 
                COALESCE(((stats->>'posts')::int + 1), 1)::text::jsonb
            )
            WHERE id = NEW.user_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Atualizar posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(
                COALESCE(stats, '{}'::jsonb), 
                '{posts}', 
                GREATEST(COALESCE(((stats->>'posts')::int - 1), 0), 0)::text::jsonb
            )
            WHERE id = OLD.user_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a separate function specifically for follows table
CREATE OR REPLACE FUNCTION update_user_follows_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment followers count for the user being followed
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'::jsonb), 
            '{followers}', 
            COALESCE(((stats->>'followers')::int + 1), 1)::text::jsonb
        )
        WHERE id = NEW.following_id;
        
        -- Increment following count for the user doing the following
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'::jsonb), 
            '{following}', 
            COALESCE(((stats->>'following')::int + 1), 1)::text::jsonb
        )
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement followers count for the user being unfollowed
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'::jsonb), 
            '{followers}', 
            GREATEST(COALESCE(((stats->>'followers')::int - 1), 0), 0)::text::jsonb
        )
        WHERE id = OLD.following_id;
        
        -- Decrement following count for the user doing the unfollowing
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}'::jsonb), 
            '{following}', 
            GREATEST(COALESCE(((stats->>'following')::int - 1), 0), 0)::text::jsonb
        )
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger with the correct function
CREATE TRIGGER update_user_follows_stats
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follows_stats();

-- Also ensure the follows table has proper RLS policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see follows where they are involved
CREATE POLICY "Users can view follows where they are involved" ON follows
    FOR SELECT USING (
        auth.uid() = follower_id OR 
        auth.uid() = following_id OR
        auth.role() = 'service_role'
    );

-- Policy to allow users to insert follows where they are the follower
CREATE POLICY "Users can insert follows where they are the follower" ON follows
    FOR INSERT WITH CHECK (
        auth.uid() = follower_id OR
        auth.role() = 'service_role'
    );

-- Policy to allow users to delete follows where they are the follower
CREATE POLICY "Users can delete follows where they are the follower" ON follows
    FOR DELETE USING (
        auth.uid() = follower_id OR
        auth.role() = 'service_role'
    );

-- Ensure users table has proper default stats
UPDATE users 
SET stats = COALESCE(stats, '{}'::jsonb) || '{"posts": 0, "followers": 0, "following": 0}'::jsonb
WHERE stats IS NULL OR NOT (stats ? 'followers') OR NOT (stats ? 'following');