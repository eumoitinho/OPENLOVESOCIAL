-- Fix notification system schema to match the application code
-- This migration fixes the schema discrepancies between database and application

-- 1. Add missing sender_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add missing content column (alias for message for backward compatibility)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS content TEXT;

-- 3. Update existing notifications to populate content field (skip if message column doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN
        UPDATE notifications 
        SET content = message 
        WHERE content IS NULL AND message IS NOT NULL;
    END IF;
END $$;

-- 4. Create index for sender_id for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);

-- 5. Update the notification creation function to include sender_id
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_sender_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    user_settings RECORD;
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;
    END IF;
    
    -- Verificar configurações do usuário
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = p_user_id;
    
    -- Se não existir configuração, criar padrão
    IF user_settings IS NULL THEN
        INSERT INTO notification_settings (user_id)
        VALUES (p_user_id);
        user_settings.in_app_notifications := TRUE;
    END IF;
    
    -- Só criar notificação se o usuário permitir
    IF user_settings.in_app_notifications THEN
        INSERT INTO notifications (user_id, type, title, message, content, data, sender_id)
        VALUES (p_user_id, p_type, p_title, p_message, p_message, p_data, p_sender_id)
        RETURNING id INTO notification_id;
        
        RETURN notification_id;
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update notification functions to include sender_id
CREATE OR REPLACE FUNCTION notify_new_like(
    p_liker_id UUID,
    p_post_owner_id UUID,
    p_post_id UUID
) RETURNS VOID AS $$
DECLARE
    liker_name TEXT;
    post_title TEXT;
BEGIN
    -- Obter nome de quem deu like
    SELECT name INTO liker_name 
    FROM users 
    WHERE id = p_liker_id;
    
    -- Obter título do post
    SELECT title INTO post_title 
    FROM posts 
    WHERE id = p_post_id;
    
    -- Criar notificação com sender_id
    PERFORM create_notification(
        p_post_owner_id,
        'like',
        'Novo like',
        liker_name || ' curtiu seu post',
        jsonb_build_object(
            'liker_id', p_liker_id,
            'liker_name', liker_name,
            'post_id', p_post_id,
            'post_title', post_title
        ),
        p_liker_id -- sender_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update comment notification function
CREATE OR REPLACE FUNCTION notify_new_comment(
    p_commenter_id UUID,
    p_post_owner_id UUID,
    p_post_id UUID,
    p_comment_text TEXT
) RETURNS VOID AS $$
DECLARE
    commenter_name TEXT;
    comment_preview TEXT;
BEGIN
    -- Obter nome de quem comentou
    SELECT name INTO commenter_name 
    FROM users 
    WHERE id = p_commenter_id;
    
    -- Criar preview do comentário
    comment_preview := LEFT(p_comment_text, 50);
    IF LENGTH(p_comment_text) > 50 THEN
        comment_preview := comment_preview || '...';
    END IF;
    
    -- Criar notificação com sender_id
    PERFORM create_notification(
        p_post_owner_id,
        'comment',
        'Novo comentário',
        commenter_name || ' comentou: ' || comment_preview,
        jsonb_build_object(
            'commenter_id', p_commenter_id,
            'commenter_name', commenter_name,
            'post_id', p_post_id,
            'comment_preview', comment_preview
        ),
        p_commenter_id -- sender_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update follow notification function
CREATE OR REPLACE FUNCTION notify_new_follower(
    p_follower_id UUID,
    p_followed_id UUID
) RETURNS VOID AS $$
DECLARE
    follower_name TEXT;
BEGIN
    -- Obter nome do seguidor
    SELECT name INTO follower_name 
    FROM users 
    WHERE id = p_follower_id;
    
    -- Criar notificação com sender_id
    PERFORM create_notification(
        p_followed_id,
        'follow',
        'Novo seguidor',
        follower_name || ' começou a seguir você',
        jsonb_build_object(
            'follower_id', p_follower_id,
            'follower_name', follower_name
        ),
        p_follower_id -- sender_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update message notification function
CREATE OR REPLACE FUNCTION notify_new_message(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_message_text TEXT
) RETURNS VOID AS $$
DECLARE
    sender_name TEXT;
    message_preview TEXT;
BEGIN
    -- Obter nome do remetente
    SELECT name INTO sender_name 
    FROM users 
    WHERE id = p_sender_id;
    
    -- Criar preview da mensagem
    message_preview := LEFT(p_message_text, 50);
    IF LENGTH(p_message_text) > 50 THEN
        message_preview := message_preview || '...';
    END IF;
    
    -- Criar notificação com sender_id
    PERFORM create_notification(
        p_receiver_id,
        'message',
        'Nova mensagem de ' || sender_name,
        message_preview,
        jsonb_build_object(
            'sender_id', p_sender_id,
            'sender_name', sender_name,
            'message_preview', message_preview
        ),
        p_sender_id -- sender_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update mention notification function
CREATE OR REPLACE FUNCTION notify_mention(
    p_mentioner_id UUID,
    p_mentioned_id UUID,
    p_context TEXT,
    p_post_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    mentioner_name TEXT;
BEGIN
    -- Obter nome de quem mencionou
    SELECT name INTO mentioner_name 
    FROM users 
    WHERE id = p_mentioner_id;
    
    -- Criar notificação com sender_id
    PERFORM create_notification(
        p_mentioned_id,
        'mention',
        'Você foi mencionado',
        mentioner_name || ' mencionou você',
        jsonb_build_object(
            'mentioner_id', p_mentioner_id,
            'mentioner_name', mentioner_name,
            'context', p_context,
            'post_id', p_post_id
        ),
        p_mentioner_id -- sender_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create test notification function
CREATE OR REPLACE FUNCTION create_test_notification(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    SELECT create_notification(
        p_user_id,
        'system',
        'Notificação de Teste',
        'Esta é uma notificação de teste do sistema OpenLove',
        jsonb_build_object(
            'test', true,
            'timestamp', NOW()
        ),
        NULL -- system notification, no sender
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Update RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- 13. Verify schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('id', 'user_id', 'sender_id', 'type', 'title', 'message', 'content', 'data', 'is_read', 'created_at');