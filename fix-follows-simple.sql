-- SIMPLE FIX FOR FOLLOWS TABLE TRIGGERS
-- This fixes the "user_id" field error with minimal changes

-- 1. DROP ALL PROBLEMATIC TRIGGERS
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;
DROP TRIGGER IF EXISTS create_smart_notification_follows ON follows;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;
DROP TRIGGER IF EXISTS trigger_new_follower ON follows;

-- 2. CREATE SIMPLE STATS FUNCTION FOR FOLLOWS
CREATE OR REPLACE FUNCTION update_user_follows_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment followers count for the user being followed
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('followers', 
            COALESCE((stats->>'followers')::int, 0) + 1)
        WHERE id = NEW.following_id;
        
        -- Increment following count for the user doing the following
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('following', 
            COALESCE((stats->>'following')::int, 0) + 1)
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement followers count for the user being unfollowed
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('followers', 
            GREATEST(COALESCE((stats->>'followers')::int, 0) - 1, 0))
        WHERE id = OLD.following_id;
        
        -- Decrement following count for the user doing the unfollowing
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('following', 
            GREATEST(COALESCE((stats->>'following')::int, 0) - 1, 0))
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. CREATE SIMPLE NOTIFICATION FUNCTION FOR FOLLOWS (OPTIONAL)
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get the name of the user doing the following
    SELECT COALESCE(name, username, 'Usuário') INTO sender_name 
    FROM users 
    WHERE id = NEW.follower_id;
    
    -- Create notification for the user being followed
    -- Only if notifications table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        INSERT INTO notifications (
            user_id, sender_id, type, title, content, 
            created_at
        ) VALUES (
            NEW.following_id,           -- user being followed gets the notification
            NEW.follower_id,            -- user doing the following is the sender
            'follow',
            sender_name || ' começou a seguir você',
            'Você tem um novo seguidor',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE THE CORRECT TRIGGERS
CREATE TRIGGER update_user_follows_stats
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follows_stats();

CREATE TRIGGER create_follow_notification
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_follow_notification();

-- 5. ENSURE PROPER USER STATS STRUCTURE
UPDATE users 
SET stats = COALESCE(stats, '{}')::jsonb || '{"posts": 0, "followers": 0, "following": 0}'::jsonb
WHERE stats IS NULL OR NOT (stats ? 'followers') OR NOT (stats ? 'following');

-- 6. ENSURE PROPER RLS POLICIES
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

-- 7. VERIFY THE FIX
SELECT 'Simple fix applied successfully!' as result;

-- Test query to verify triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
AND trigger_name IN ('update_user_follows_stats', 'create_follow_notification');