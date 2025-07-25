-- ================================================================
-- NOTIFICATION TRIGGERS SYSTEM
-- ================================================================
-- Purpose: Create automatic notification triggers for all events
-- Date: 2025-01-25
-- ================================================================

-- ================================================================
-- HELPER FUNCTIONS FOR NOTIFICATIONS
-- ================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_id UUID,
    p_sender_id UUID,
    p_type VARCHAR(50),
    p_title TEXT,
    p_content TEXT DEFAULT NULL,
    p_icon VARCHAR(50) DEFAULT NULL,
    p_related_data JSONB DEFAULT '{}',
    p_action_text VARCHAR(50) DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Don't create self-notifications
    IF p_recipient_id = p_sender_id THEN
        RETURN NULL;
    END IF;
    
    -- Check if recipient exists and has notifications enabled
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = p_recipient_id 
        AND is_active = true
        AND (notification_settings->>'push_notifications')::boolean = true
    ) THEN
        RETURN NULL;
    END IF;
    
    INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        icon,
        related_data,
        action_text,
        action_url,
        is_read,
        created_at
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
        false,
        NOW()
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- ================================================================
-- FOLLOW NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    follower_name TEXT;
    follower_username TEXT;
BEGIN
    -- Get follower info
    SELECT name, username INTO follower_name, follower_username
    FROM public.users
    WHERE id = NEW.follower_id;
    
    -- Create notification
    PERFORM create_notification(
        NEW.followed_id,                           -- recipient
        NEW.follower_id,                          -- sender
        'follow',                                 -- type
        follower_name || ' começou a seguir você',  -- title
        '@' || follower_username || ' agora está seguindo você',  -- content
        'user-plus',                              -- icon
        jsonb_build_object(
            'follow_id', NEW.id,
            'follower_id', NEW.follower_id,
            'follower_name', follower_name,
            'follower_username', follower_username
        ),
        'Ver perfil',                             -- action_text
        '/profile/' || follower_username          -- action_url
    );
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- LIKE NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    liker_name TEXT;
    liker_username TEXT;
    post_author_id UUID;
    post_content TEXT;
BEGIN
    -- Get post author
    SELECT user_id, content INTO post_author_id, post_content
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Get liker info
    SELECT name, username INTO liker_name, liker_username
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        post_author_id,                           -- recipient
        NEW.user_id,                             -- sender
        'post_like',                             -- type
        liker_name || ' curtiu seu post',        -- title
        '@' || liker_username || ' curtiu: "' || LEFT(post_content, 50) || '..."',  -- content
        'heart',                                 -- icon
        jsonb_build_object(
            'like_id', NEW.id,
            'post_id', NEW.post_id,
            'liker_id', NEW.user_id,
            'liker_name', liker_name,
            'liker_username', liker_username
        ),
        'Ver post',                              -- action_text
        '/post/' || NEW.post_id                  -- action_url
    );
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- COMMENT NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    commenter_name TEXT;
    commenter_username TEXT;
    post_author_id UUID;
    post_content TEXT;
BEGIN
    -- Get post author
    SELECT user_id, content INTO post_author_id, post_content
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Get commenter info
    SELECT name, username INTO commenter_name, commenter_username
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        post_author_id,                           -- recipient
        NEW.user_id,                             -- sender
        'post_comment',                          -- type
        commenter_name || ' comentou seu post',  -- title
        '@' || commenter_username || ' disse: "' || LEFT(NEW.content, 50) || '..."',  -- content
        'message-circle',                        -- icon
        jsonb_build_object(
            'comment_id', NEW.id,
            'post_id', NEW.post_id,
            'commenter_id', NEW.user_id,
            'commenter_name', commenter_name,
            'commenter_username', commenter_username,
            'comment_content', NEW.content
        ),
        'Ver comentário',                        -- action_text
        '/post/' || NEW.post_id || '#comment-' || NEW.id  -- action_url
    );
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- REPOST NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_post_repost()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reposter_name TEXT;
    reposter_username TEXT;
    original_post_author_id UUID;
    original_post_content TEXT;
BEGIN
    -- Only notify on repost (not original posts)
    IF NEW.repost_of_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get original post author
    SELECT user_id, content INTO original_post_author_id, original_post_content
    FROM public.posts
    WHERE id = NEW.repost_of_id;
    
    -- Get reposter info
    SELECT name, username INTO reposter_name, reposter_username
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        original_post_author_id,                 -- recipient
        NEW.user_id,                            -- sender
        'post_share',                           -- type
        reposter_name || ' compartilhou seu post',  -- title
        '@' || reposter_username || ' compartilhou: "' || LEFT(original_post_content, 50) || '..."',  -- content
        'repeat',                               -- icon
        jsonb_build_object(
            'repost_id', NEW.id,
            'original_post_id', NEW.repost_of_id,
            'reposter_id', NEW.user_id,
            'reposter_name', reposter_name,
            'reposter_username', reposter_username
        ),
        'Ver repost',                           -- action_text
        '/post/' || NEW.id                      -- action_url
    );
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- MESSAGE NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sender_name TEXT;
    sender_username TEXT;
    recipient_id UUID;
    conversation_id UUID;
BEGIN
    -- Get conversation info
    SELECT c.id INTO conversation_id
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id;
    
    -- Get recipient (the other person in conversation)
    SELECT u.id INTO recipient_id
    FROM public.conversation_participants cp
    JOIN public.users u ON u.id = cp.user_id
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
    LIMIT 1;
    
    -- Get sender info
    SELECT name, username INTO sender_name, sender_username
    FROM public.users
    WHERE id = NEW.sender_id;
    
    -- Create notification
    PERFORM create_notification(
        recipient_id,                            -- recipient
        NEW.sender_id,                          -- sender
        'message',                              -- type
        'Nova mensagem de ' || sender_name,     -- title
        '@' || sender_username || ': ' || LEFT(NEW.content, 50) || '...',  -- content
        'message-square',                       -- icon
        jsonb_build_object(
            'message_id', NEW.id,
            'conversation_id', NEW.conversation_id,
            'sender_id', NEW.sender_id,
            'sender_name', sender_name,
            'sender_username', sender_username
        ),
        'Responder',                            -- action_text
        '/messages/' || NEW.conversation_id     -- action_url
    );
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- MENTION NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_mention()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    mentioner_name TEXT;
    mentioner_username TEXT;
    mentioned_user_id UUID;
    mentioned_username TEXT;
    mention_match TEXT[];
BEGIN
    -- Get mentioner info
    SELECT name, username INTO mentioner_name, mentioner_username
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Find mentions in content using regex
    FOR mention_match IN
        SELECT regexp_split_to_array(unnest(regexp_split_to_array(NEW.content, '@')), '\s+')
        WHERE unnest(regexp_split_to_array(NEW.content, '@')) != ''
    LOOP
        IF array_length(mention_match, 1) > 0 THEN
            mentioned_username := mention_match[1];
            
            -- Remove common punctuation
            mentioned_username := regexp_replace(mentioned_username, '[.,!?;:]$', '');
            
            -- Get mentioned user ID
            SELECT id INTO mentioned_user_id
            FROM public.users
            WHERE username = mentioned_username
            AND is_active = true;
            
            -- Create notification if user exists
            IF mentioned_user_id IS NOT NULL THEN
                PERFORM create_notification(
                    mentioned_user_id,              -- recipient
                    NEW.user_id,                   -- sender
                    'mention',                     -- type
                    mentioner_name || ' mencionou você',  -- title
                    '@' || mentioner_username || ' te mencionou: "' || LEFT(NEW.content, 50) || '..."',  -- content
                    'at-sign',                     -- icon
                    jsonb_build_object(
                        'post_id', NEW.id,
                        'mentioner_id', NEW.user_id,
                        'mentioner_name', mentioner_name,
                        'mentioner_username', mentioner_username,
                        'mentioned_username', mentioned_username
                    ),
                    'Ver post',                    -- action_text
                    '/post/' || NEW.id             -- action_url
                );
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- PREMIUM/PLAN NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_premium_expiring()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    days_remaining INTEGER;
BEGIN
    -- Only check when premium_expires_at is updated
    IF OLD.premium_expires_at IS NOT DISTINCT FROM NEW.premium_expires_at THEN
        RETURN NEW;
    END IF;
    
    -- Calculate days remaining
    days_remaining := EXTRACT(DAY FROM (NEW.premium_expires_at - NOW()));
    
    -- Send notification if expires in 7 days or less
    IF days_remaining <= 7 AND days_remaining > 0 THEN
        PERFORM create_notification(
            NEW.id,                              -- recipient (self)
            NEW.id,                              -- sender (self)
            'subscription_expiring',             -- type
            'Seu plano premium expira em ' || days_remaining || ' dia' || 
                CASE WHEN days_remaining > 1 THEN 's' ELSE '' END,  -- title
            'Renove agora para continuar aproveitando todos os benefícios premium.',  -- content
            'crown',                             -- icon
            jsonb_build_object(
                'days_remaining', days_remaining,
                'expires_at', NEW.premium_expires_at,
                'premium_type', NEW.premium_type
            ),
            'Renovar plano',                     -- action_text
            '/settings/billing'                  -- action_url
        );
    END IF;
    
    -- Send notification when expired
    IF NEW.premium_expires_at < NOW() AND NEW.is_premium = false AND OLD.is_premium = true THEN
        PERFORM create_notification(
            NEW.id,                              -- recipient (self)
            NEW.id,                              -- sender (self)
            'subscription_expiring',             -- type
            'Seu plano premium expirou',         -- title
            'Renove agora para continuar aproveitando todos os benefícios premium.',  -- content
            'crown-off',                         -- icon
            jsonb_build_object(
                'expired_at', NEW.premium_expires_at,
                'premium_type', OLD.premium_type
            ),
            'Renovar plano',                     -- action_text
            '/settings/billing'                  -- action_url
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- EVENT NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_event_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    hours_until_event INTEGER;
    event_name TEXT;
BEGIN
    -- Only check when event date is updated
    IF OLD.date IS NOT DISTINCT FROM NEW.date THEN
        RETURN NEW;
    END IF;
    
    -- Calculate hours until event
    hours_until_event := EXTRACT(HOUR FROM (NEW.date - NOW()));
    
    -- Send reminder if event is in 24 hours or less
    IF hours_until_event <= 24 AND hours_until_event > 0 THEN
        -- Get event name
        SELECT title INTO event_name FROM public.events WHERE id = NEW.id;
        
        -- Notify all participants
        INSERT INTO public.notifications (
            recipient_id,
            sender_id,
            type,
            title,
            content,
            icon,
            related_data,
            action_text,
            action_url,
            is_read,
            created_at
        )
        SELECT 
            ep.user_id,                          -- recipient
            NEW.created_by,                      -- sender (event creator)
            'event_reminder',                    -- type
            'Lembrete: ' || event_name,          -- title
            'O evento "' || event_name || '" acontece em ' || 
                CASE 
                    WHEN hours_until_event <= 1 THEN 'menos de 1 hora'
                    ELSE hours_until_event || ' horas'
                END,                             -- content
            'calendar',                          -- icon
            jsonb_build_object(
                'event_id', NEW.id,
                'event_name', event_name,
                'event_date', NEW.date,
                'hours_remaining', hours_until_event
            ),
            'Ver evento',                        -- action_text
            '/events/' || NEW.id                 -- action_url
        FROM public.event_participants ep
        WHERE ep.event_id = NEW.id
        AND ep.status = 'confirmed';
    END IF;
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- COMMUNITY NOTIFICATIONS
-- ================================================================

CREATE OR REPLACE FUNCTION notify_community_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    poster_name TEXT;
    poster_username TEXT;
    community_name TEXT;
BEGIN
    -- Get poster info
    SELECT name, username INTO poster_name, poster_username
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Get community name
    SELECT name INTO community_name
    FROM public.communities
    WHERE id = NEW.community_id;
    
    -- Notify all community members (except poster)
    INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        type,
        title,
        content,
        icon,
        related_data,
        action_text,
        action_url,
        is_read,
        created_at
    )
    SELECT 
        cm.user_id,                              -- recipient
        NEW.user_id,                            -- sender
        'community_post',                       -- type
        'Nova publicação em ' || community_name, -- title
        poster_name || ' publicou: "' || LEFT(NEW.content, 50) || '..."',  -- content
        'users',                                -- icon
        jsonb_build_object(
            'post_id', NEW.id,
            'community_id', NEW.community_id,
            'community_name', community_name,
            'poster_id', NEW.user_id,
            'poster_name', poster_name,
            'poster_username', poster_username
        ),
        'Ver post',                             -- action_text
        '/communities/' || NEW.community_id || '/posts/' || NEW.id  -- action_url
    FROM public.community_members cm
    WHERE cm.community_id = NEW.community_id
    AND cm.user_id != NEW.user_id
    AND cm.status = 'active'
    AND cm.notifications_enabled = true;
    
    RETURN NEW;
END;
$$;

-- ================================================================
-- CREATE TRIGGERS
-- ================================================================

-- Follow notifications
DROP TRIGGER IF EXISTS trigger_notify_new_follow ON public.follows;
CREATE TRIGGER trigger_notify_new_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_follow();

-- Like notifications
DROP TRIGGER IF EXISTS trigger_notify_post_like ON public.post_likes;
CREATE TRIGGER trigger_notify_post_like
    AFTER INSERT ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_post_like();

-- Comment notifications
DROP TRIGGER IF EXISTS trigger_notify_post_comment ON public.comments;
CREATE TRIGGER trigger_notify_post_comment
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_post_comment();

-- Repost notifications
DROP TRIGGER IF EXISTS trigger_notify_post_repost ON public.posts;
CREATE TRIGGER trigger_notify_post_repost
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION notify_post_repost();

-- Message notifications
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- Mention notifications
DROP TRIGGER IF EXISTS trigger_notify_mention ON public.posts;
CREATE TRIGGER trigger_notify_mention
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION notify_mention();

-- Premium expiring notifications
DROP TRIGGER IF EXISTS trigger_notify_premium_expiring ON public.users;
CREATE TRIGGER trigger_notify_premium_expiring
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION notify_premium_expiring();

-- Event reminder notifications (if events table exists)
DROP TRIGGER IF EXISTS trigger_notify_event_reminder ON public.events;
CREATE TRIGGER trigger_notify_event_reminder
    AFTER UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION notify_event_reminder();

-- Community post notifications (if community_posts table exists)
DROP TRIGGER IF EXISTS trigger_notify_community_post ON public.community_posts;
CREATE TRIGGER trigger_notify_community_post
    AFTER INSERT ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION notify_community_post();

-- ================================================================
-- NOTIFICATION CLEANUP FUNCTION
-- ================================================================

-- Function to clean old notifications (optional)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 90 days
    DELETE FROM public.notifications
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'trigger_notify_%';
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'NOTIFICATION TRIGGERS SYSTEM INSTALLED!';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Notification triggers created: %', trigger_count;
    RAISE NOTICE 'System ready for automatic notifications!';
    RAISE NOTICE '================================================================';
END $$;