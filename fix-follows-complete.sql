-- COMPLETE FIX FOR FOLLOWS TABLE TRIGGERS
-- This fixes ALL triggers that cause the "user_id" field error

-- 1. DROP ALL PROBLEMATIC TRIGGERS
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;
DROP TRIGGER IF EXISTS create_smart_notification_follows ON follows;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;
DROP TRIGGER IF EXISTS trigger_new_follower ON follows;

-- 2. CREATE CORRECT STATS FUNCTION FOR FOLLOWS
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

-- 3. CREATE CORRECT NOTIFICATION FUNCTION FOR FOLLOWS
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    user_settings RECORD;
BEGIN
    -- Check if notifications are enabled for the user being followed
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = NEW.following_id;
    
    -- If user has disabled follow notifications, skip
    IF user_settings.follows_enabled = FALSE THEN
        RETURN NEW;
    END IF;
    
    -- Get the name of the user doing the following
    SELECT name INTO sender_name FROM users WHERE id = NEW.follower_id;
    
    -- Create notification for the user being followed
    INSERT INTO notifications (
        user_id, sender_id, type, title, content, 
        notification_data, priority, created_at
    ) VALUES (
        NEW.following_id,           -- user being followed gets the notification
        NEW.follower_id,            -- user doing the following is the sender
        'follow',
        sender_name || ' começou a seguir você',
        'Você tem um novo seguidor',
        jsonb_build_object(
            'follower_id', NEW.follower_id,
            'follower_name', sender_name
        ),
        'normal',
        NOW()
    );
    
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

-- 6. ENSURE PROPER NOTIFICATION SETTINGS
-- First check if notification_settings table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        -- Only insert for users that actually exist in users table
        INSERT INTO notification_settings (user_id, follows_enabled, likes_enabled, comments_enabled, messages_enabled, saves_enabled)
        SELECT u.id, true, true, true, true, true
        FROM users u
        LEFT JOIN notification_settings ns ON u.id = ns.user_id
        WHERE ns.user_id IS NULL;
    ELSE
        -- Create notification_settings table if it doesn't exist
        CREATE TABLE IF NOT EXISTS notification_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            follows_enabled BOOLEAN DEFAULT true,
            likes_enabled BOOLEAN DEFAULT true,
            comments_enabled BOOLEAN DEFAULT true,
            messages_enabled BOOLEAN DEFAULT true,
            saves_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        -- Insert default settings for all users
        INSERT INTO notification_settings (user_id, follows_enabled, likes_enabled, comments_enabled, messages_enabled, saves_enabled)
        SELECT id, true, true, true, true, true
        FROM users;
    END IF;
END $$;

-- 7. ENSURE PROPER RLS POLICIES
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

-- 8. VERIFY THE FIX
SELECT 'Setup complete! Testing triggers...' as status;

-- Test query to verify triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
AND trigger_name IN ('update_user_follows_stats', 'create_follow_notification');

SELECT 'Fix applied successfully!' as result;