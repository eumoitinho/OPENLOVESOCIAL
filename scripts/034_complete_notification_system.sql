-- =====================================================
-- SISTEMA COMPLETO DE NOTIFICAÇÕES - OPENLOVE
-- =====================================================
-- Data: $(date)
-- Descrição: Sistema completo de notificações para rede social
-- =====================================================

-- =====================================================
-- 1. MELHORAR ESTRUTURA DA TABELA NOTIFICATIONS
-- =====================================================

-- Adicionar campos necessários se não existirem
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS notification_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Atualizar tipos de notificação para incluir todos os tipos necessários
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'like', 'comment', 'follow', 'message', 'mention', 'save', 'share',
    'event_invite', 'event_reminder', 'event_update', 'event_cancelled',
    'community_invite', 'community_update', 'community_post',
    'system', 'welcome', 'achievement', 'premium_offer', 'security_alert',
    'friend_request', 'match', 'open_date_interaction', 'open_date_match',
    'post_approved', 'post_rejected', 'content_warning', 'account_verification'
));

-- =====================================================
-- 2. CRIAR TABELA DE CONFIGURAÇÕES DE NOTIFICAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Configurações por tipo de notificação
    likes_enabled BOOLEAN DEFAULT TRUE,
    comments_enabled BOOLEAN DEFAULT TRUE,
    follows_enabled BOOLEAN DEFAULT TRUE,
    messages_enabled BOOLEAN DEFAULT TRUE,
    mentions_enabled BOOLEAN DEFAULT TRUE,
    saves_enabled BOOLEAN DEFAULT TRUE,
    shares_enabled BOOLEAN DEFAULT TRUE,
    events_enabled BOOLEAN DEFAULT TRUE,
    communities_enabled BOOLEAN DEFAULT TRUE,
    system_enabled BOOLEAN DEFAULT TRUE,
    matches_enabled BOOLEAN DEFAULT TRUE,
    open_dates_enabled BOOLEAN DEFAULT TRUE,
    
    -- Configurações de frequência
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    
    -- Configurações de horário
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAR TABELA DE NOTIFICAÇÕES PENDENTES (FILA)
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. FUNÇÃO PARA CRIAR NOTIFICAÇÕES INTELIGENTES
-- =====================================================

CREATE OR REPLACE FUNCTION create_smart_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_user_id UUID;
    sender_name TEXT;
    post_content TEXT;
    comment_content TEXT;
    event_title TEXT;
    should_create BOOLEAN := TRUE;
    user_settings RECORD;
BEGIN
    -- Verificar configurações do usuário
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = notification_user_id;
    
    -- Determinar o usuário que deve receber a notificação
    CASE TG_TABLE_NAME
        WHEN 'likes' THEN
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.target_id);
            IF NEW.target_type = 'post' AND notification_user_id != NEW.user_id THEN
                -- Verificar se likes estão habilitados
                IF user_settings.likes_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            END IF;
            
        WHEN 'comments' THEN
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.post_id);
            IF notification_user_id != NEW.user_id THEN
                -- Verificar se comentários estão habilitados
                IF user_settings.comments_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            END IF;
            
        WHEN 'follows' THEN
            notification_user_id := NEW.following_id;
            IF user_settings.follows_enabled = FALSE THEN
                should_create := FALSE;
            END IF;
            
        WHEN 'messages' THEN
            notification_user_id := (SELECT user_id FROM conversation_participants 
                                   WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1);
            IF user_settings.messages_enabled = FALSE THEN
                should_create := FALSE;
            END IF;
            
        WHEN 'saved_posts' THEN
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.post_id);
            IF notification_user_id != NEW.user_id THEN
                IF user_settings.saves_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            END IF;
            
        WHEN 'event_participants' THEN
            notification_user_id := (SELECT creator_id FROM events WHERE id = NEW.event_id);
            IF user_settings.events_enabled = FALSE THEN
                should_create := FALSE;
            END IF;
            
        ELSE
            should_create := FALSE;
    END CASE;
    
    -- Se não deve criar notificação, retornar
    IF NOT should_create THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Obter nome do remetente
    SELECT name INTO sender_name FROM users WHERE id = NEW.user_id;
    
    -- Criar notificação baseada no tipo
    CASE TG_TABLE_NAME
        WHEN 'likes' THEN
            IF NEW.target_type = 'post' THEN
                INSERT INTO notifications (
                    user_id, sender_id, type, title, content, 
                    related_post_id, notification_data, priority
                ) VALUES (
                    notification_user_id, NEW.user_id, 'like',
                    sender_name || ' curtiu seu post',
                    'Seu post recebeu uma nova curtida',
                    NEW.target_id,
                    jsonb_build_object(
                        'post_id', NEW.target_id,
                        'user_id', NEW.user_id,
                        'like_id', NEW.id
                    ),
                    'normal'
                );
            END IF;
            
        WHEN 'comments' THEN
            INSERT INTO notifications (
                user_id, sender_id, type, title, content,
                related_post_id, related_comment_id, notification_data, priority
            ) VALUES (
                notification_user_id, NEW.user_id, 'comment',
                sender_name || ' comentou em seu post',
                LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
                NEW.post_id, NEW.id,
                jsonb_build_object(
                    'post_id', NEW.post_id,
                    'comment_id', NEW.id,
                    'user_id', NEW.user_id,
                    'comment_content', NEW.content
                ),
                'normal'
            );
            
        WHEN 'follows' THEN
            INSERT INTO notifications (
                user_id, sender_id, type, title, content,
                related_user_id, notification_data, priority
            ) VALUES (
                notification_user_id, NEW.follower_id, 'follow',
                sender_name || ' começou a seguir você',
                'Você tem um novo seguidor',
                NEW.follower_id,
                jsonb_build_object(
                    'follower_id', NEW.follower_id,
                    'follower_name', sender_name
                ),
                'normal'
            );
            
        WHEN 'messages' THEN
            INSERT INTO notifications (
                user_id, sender_id, type, title, content,
                related_conversation_id, notification_data, priority
            ) VALUES (
                notification_user_id, NEW.sender_id, 'message',
                sender_name || ' enviou uma mensagem',
                LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
                NEW.conversation_id,
                jsonb_build_object(
                    'conversation_id', NEW.conversation_id,
                    'message_id', NEW.id,
                    'sender_id', NEW.sender_id,
                    'message_content', NEW.content
                ),
                'high'
            );
            
        WHEN 'saved_posts' THEN
            INSERT INTO notifications (
                user_id, sender_id, type, title, content,
                related_post_id, notification_data, priority
            ) VALUES (
                notification_user_id, NEW.user_id, 'save',
                sender_name || ' salvou seu post',
                'Seu post foi adicionado aos salvos',
                NEW.post_id,
                jsonb_build_object(
                    'post_id', NEW.post_id,
                    'user_id', NEW.user_id
                ),
                'normal'
            );
            
        WHEN 'event_participants' THEN
            SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
            INSERT INTO notifications (
                user_id, sender_id, type, title, content,
                related_event_id, notification_data, priority
            ) VALUES (
                notification_user_id, NEW.user_id, 'event_invite',
                sender_name || ' confirmou presença no evento',
                'Alguém confirmou presença no evento: ' || event_title,
                NEW.event_id,
                jsonb_build_object(
                    'event_id', NEW.event_id,
                    'event_title', event_title,
                    'user_id', NEW.user_id,
                    'status', NEW.status
                ),
                'normal'
            );
    END CASE;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNÇÃO PARA NOTIFICAÇÕES DE MENTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
    mentioned_users UUID[];
    mentioned_user UUID;
    sender_name TEXT;
BEGIN
    -- Extrair menções do conteúdo (@username)
    mentioned_users := ARRAY(
        SELECT DISTINCT u.id
        FROM regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g') AS matches(match)
        JOIN users u ON u.username = matches.match[1]
    );
    
    -- Obter nome do remetente
    SELECT name INTO sender_name FROM users WHERE id = NEW.user_id;
    
    -- Criar notificação para cada usuário mencionado
    FOREACH mentioned_user IN ARRAY mentioned_users
    LOOP
        INSERT INTO notifications (
            user_id, sender_id, type, title, content,
            related_post_id, related_comment_id, notification_data, priority
        ) VALUES (
            mentioned_user, NEW.user_id, 'mention',
            sender_name || ' mencionou você',
            'Você foi mencionado em um ' || 
            CASE WHEN TG_TABLE_NAME = 'comments' THEN 'comentário' ELSE 'post' END,
            CASE WHEN TG_TABLE_NAME = 'posts' THEN NEW.id ELSE NULL END,
            CASE WHEN TG_TABLE_NAME = 'comments' THEN NEW.id ELSE NULL END,
            jsonb_build_object(
                'post_id', CASE WHEN TG_TABLE_NAME = 'posts' THEN NEW.id ELSE NEW.post_id END,
                'comment_id', CASE WHEN TG_TABLE_NAME = 'comments' THEN NEW.id ELSE NULL END,
                'user_id', NEW.user_id,
                'content', NEW.content
            ),
            'high'
        );
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNÇÃO PARA NOTIFICAÇÕES DE SISTEMA
-- =====================================================

CREATE OR REPLACE FUNCTION create_system_notification(
    target_user_id UUID,
    notification_type VARCHAR(50),
    title TEXT,
    content TEXT,
    data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, type, title, content, notification_data, priority
    ) VALUES (
        target_user_id, notification_type, title, content, data, 'normal'
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS
-- =====================================================

-- Remover triggers antigos
DROP TRIGGER IF EXISTS create_like_notification ON likes;
DROP TRIGGER IF EXISTS create_comment_notification ON comments;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;

-- Criar novos triggers
CREATE TRIGGER create_smart_notification_likes
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

CREATE TRIGGER create_smart_notification_comments
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

CREATE TRIGGER create_smart_notification_follows
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

CREATE TRIGGER create_smart_notification_messages
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

CREATE TRIGGER create_smart_notification_saves
    AFTER INSERT ON saved_posts
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

CREATE TRIGGER create_smart_notification_event_participants
    AFTER INSERT ON event_participants
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

-- Triggers para mentions
CREATE TRIGGER create_mention_notifications_posts
    AFTER INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION create_mention_notifications();

CREATE TRIGGER create_mention_notifications_comments
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION create_mention_notifications();

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON notification_queue(processed);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- =====================================================
-- 9. POLÍTICAS RLS
-- =====================================================

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Políticas para notification_settings
CREATE POLICY "Users can view own notification settings" ON notification_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification settings" ON notification_settings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para notification_queue
CREATE POLICY "System can manage notification queue" ON notification_queue
    FOR ALL USING (true);

-- =====================================================
-- 10. FUNÇÃO PARA LIMPEZA AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Deletar notificações antigas (mais de 30 dias)
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND is_read = TRUE;
    
    -- Deletar notificações expiradas
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Limpar fila de notificações processadas
    DELETE FROM notification_queue 
    WHERE processed = TRUE 
    AND processed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. FUNÇÃO PARA ESTATÍSTICAS DE NOTIFICAÇÕES
-- =====================================================

CREATE OR REPLACE FUNCTION get_notification_stats(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_notifications', COUNT(*),
        'unread_notifications', COUNT(*) FILTER (WHERE is_read = FALSE),
        'notifications_by_type', (
            SELECT jsonb_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM notifications
                WHERE user_id = user_id_param
                GROUP BY type
            ) t
        ),
        'recent_notifications', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'type', type,
                    'title', title,
                    'created_at', created_at,
                    'is_read', is_read
                )
            )
            FROM notifications
            WHERE user_id = user_id_param
            ORDER BY created_at DESC
            LIMIT 5
        )
    ) INTO stats
    FROM notifications
    WHERE user_id = user_id_param;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TESTE DO SISTEMA
-- =====================================================

-- Inserir configurações padrão para usuários existentes
INSERT INTO notification_settings (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM notification_settings);

-- Criar algumas notificações de teste
DO $$
DECLARE
    test_user_id UUID;
    test_sender_id UUID;
BEGIN
    -- Pegar usuários de teste
    SELECT id INTO test_user_id FROM users LIMIT 1;
    SELECT id INTO test_sender_id FROM users WHERE id != test_user_id LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_sender_id IS NOT NULL THEN
        -- Criar notificação de sistema de boas-vindas
        PERFORM create_system_notification(
            test_user_id,
            'welcome',
            'Bem-vindo ao OpenLove!',
            'Sua conta foi criada com sucesso. Explore a comunidade e conecte-se com pessoas incríveis!',
            '{"welcome_message": true}'::jsonb
        );
        
        RAISE NOTICE 'Sistema de notificações configurado com sucesso!';
    END IF;
END $$;

-- =====================================================
-- 13. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar estrutura da tabela notifications
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Verificar triggers criados
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%notification%';

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('notifications', 'notification_settings', 'notification_queue');

RAISE NOTICE 'Sistema de notificações completo configurado com sucesso!'; 