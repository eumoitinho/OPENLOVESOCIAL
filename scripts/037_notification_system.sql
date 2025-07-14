-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES COMPLETO - OPENLOVE
-- =====================================================

-- 1. VERIFICAR E CRIAR TABELA DE NOTIFICAÇÕES
DO $$ 
BEGIN
    -- Verificar se a tabela notifications existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE TABLE notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            data JSONB DEFAULT '{}',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices para performance
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX idx_notifications_type ON notifications(type);
        CREATE INDEX idx_notifications_created_at ON notifications(created_at);
        CREATE INDEX idx_notifications_is_read ON notifications(is_read);
        
        RAISE NOTICE 'Tabela notifications criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela notifications já existe';
    END IF;
END $$;

-- 2. CRIAR TABELA DE CONFIGURAÇÕES DE NOTIFICAÇÃO
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        CREATE TABLE notification_settings (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email_notifications BOOLEAN DEFAULT TRUE,
            push_notifications BOOLEAN DEFAULT TRUE,
            in_app_notifications BOOLEAN DEFAULT TRUE,
            
            -- Configurações específicas
            new_messages BOOLEAN DEFAULT TRUE,
            new_followers BOOLEAN DEFAULT TRUE,
            new_likes BOOLEAN DEFAULT TRUE,
            new_comments BOOLEAN DEFAULT TRUE,
            new_mentions BOOLEAN DEFAULT TRUE,
            new_matches BOOLEAN DEFAULT TRUE,
            new_events BOOLEAN DEFAULT TRUE,
            new_posts BOOLEAN DEFAULT TRUE,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela notification_settings criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela notification_settings já existe';
    END IF;
END $$;

-- 3. CRIAR TABELA DE FILA DE NOTIFICAÇÕES (para processamento assíncrono)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_queue') THEN
        CREATE TABLE notification_queue (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            data JSONB DEFAULT '{}',
            priority INTEGER DEFAULT 0,
            scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
        CREATE INDEX idx_notification_queue_processed ON notification_queue(processed);
        CREATE INDEX idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);
        
        RAISE NOTICE 'Tabela notification_queue criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela notification_queue já existe';
    END IF;
END $$;

-- 4. FUNÇÃO PARA CRIAR NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
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
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (p_user_id, p_type, p_title, p_message, p_data)
        RETURNING id INTO notification_id;
        
        RETURN notification_id;
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE MENSAGEM
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
    
    -- Criar notificação
    PERFORM create_notification(
        p_receiver_id,
        'new_message',
        'Nova mensagem de ' || sender_name,
        message_preview,
        jsonb_build_object(
            'sender_id', p_sender_id,
            'sender_name', sender_name,
            'message_preview', message_preview
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE SEGUIDOR
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
    
    -- Criar notificação
    PERFORM create_notification(
        p_followed_id,
        'new_follower',
        'Novo seguidor',
        follower_name || ' começou a seguir você',
        jsonb_build_object(
            'follower_id', p_follower_id,
            'follower_name', follower_name
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE LIKE
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
    
    -- Criar notificação
    PERFORM create_notification(
        p_post_owner_id,
        'new_like',
        'Novo like',
        liker_name || ' curtiu seu post',
        jsonb_build_object(
            'liker_id', p_liker_id,
            'liker_name', liker_name,
            'post_id', p_post_id,
            'post_title', post_title
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE COMENTÁRIO
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
    
    -- Criar notificação
    PERFORM create_notification(
        p_post_owner_id,
        'new_comment',
        'Novo comentário',
        commenter_name || ' comentou: ' || comment_preview,
        jsonb_build_object(
            'commenter_id', p_commenter_id,
            'commenter_name', commenter_name,
            'post_id', p_post_id,
            'comment_preview', comment_preview
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE MENTION
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
    
    -- Criar notificação
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
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE MATCH
CREATE OR REPLACE FUNCTION notify_new_match(
    p_user1_id UUID,
    p_user2_id UUID
) RETURNS VOID AS $$
DECLARE
    user1_name TEXT;
    user2_name TEXT;
BEGIN
    -- Obter nomes dos usuários
    SELECT name INTO user1_name FROM users WHERE id = p_user1_id;
    SELECT name INTO user2_name FROM users WHERE id = p_user2_id;
    
    -- Notificar ambos os usuários
    PERFORM create_notification(
        p_user1_id,
        'new_match',
        'Novo match!',
        'Você e ' || user2_name || ' deram match!',
        jsonb_build_object(
            'matched_user_id', p_user2_id,
            'matched_user_name', user2_name
        )
    );
    
    PERFORM create_notification(
        p_user2_id,
        'new_match',
        'Novo match!',
        'Você e ' || user1_name || ' deram match!',
        jsonb_build_object(
            'matched_user_id', p_user1_id,
            'matched_user_name', user1_name
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. TRIGGERS PARA AUTOMATIZAR NOTIFICAÇÕES

-- Trigger para novos seguidores
CREATE OR REPLACE FUNCTION trigger_new_follower() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        PERFORM notify_new_follower(NEW.follower_id, NEW.followed_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_follower ON follows;
CREATE TRIGGER trigger_new_follower
    AFTER UPDATE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION trigger_new_follower();

-- Trigger para novos likes
CREATE OR REPLACE FUNCTION trigger_new_like() RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Obter o dono do post
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = NEW.post_id;
    
    -- Não notificar se o próprio usuário deu like
    IF post_owner_id != NEW.user_id THEN
        PERFORM notify_new_like(NEW.user_id, post_owner_id, NEW.post_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_like ON post_likes;
CREATE TRIGGER trigger_new_like
    AFTER INSERT ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_new_like();

-- Trigger para novos comentários
CREATE OR REPLACE FUNCTION trigger_new_comment() RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Obter o dono do post
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = NEW.post_id;
    
    -- Não notificar se o próprio usuário comentou
    IF post_owner_id != NEW.user_id THEN
        PERFORM notify_new_comment(NEW.user_id, post_owner_id, NEW.post_id, NEW.content);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_comment ON comments;
CREATE TRIGGER trigger_new_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_new_comment();

-- 12. POLÍTICAS RLS PARA NOTIFICAÇÕES
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Políticas para notification_settings
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notification_settings;
CREATE POLICY "Users can view their own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;
CREATE POLICY "Users can update their own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notification settings" ON notification_settings;
CREATE POLICY "Users can insert their own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para notification_queue
DROP POLICY IF EXISTS "System can manage notification queue" ON notification_queue;
CREATE POLICY "System can manage notification queue" ON notification_queue
    FOR ALL USING (true);

-- 13. FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE NOTIFICAÇÕES ANTIGAS
CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS VOID AS $$
BEGIN
    -- Deletar notificações lidas com mais de 30 dias
    DELETE FROM notifications 
    WHERE is_read = TRUE 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Deletar notificações não lidas com mais de 90 dias
    DELETE FROM notifications 
    WHERE is_read = FALSE 
    AND created_at < NOW() - INTERVAL '90 days';
    
    -- Limpar fila de notificações processadas com mais de 7 dias
    DELETE FROM notification_queue 
    WHERE processed = TRUE 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 14. FUNÇÃO PARA OBTER ESTATÍSTICAS DE NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE is_read = FALSE),
        'by_type', jsonb_object_agg(
            type, 
            jsonb_build_object(
                'total', COUNT(*),
                'unread', COUNT(*) FILTER (WHERE is_read = FALSE)
            )
        )
    ) INTO stats
    FROM notifications
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(stats, '{"total": 0, "unread": 0, "by_type": {}}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. DADOS INICIAIS PARA TESTE
DO $$
BEGIN
    -- Inserir configurações padrão para usuários existentes
    INSERT INTO notification_settings (user_id)
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM notification_settings)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Configurações de notificação criadas para usuários existentes';
END $$;

-- 16. FUNÇÃO PARA TESTE DO SISTEMA
CREATE OR REPLACE FUNCTION test_notification_system(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    test_notification_id UUID;
BEGIN
    -- Criar uma notificação de teste
    SELECT create_notification(
        p_user_id,
        'test',
        'Teste do Sistema',
        'Esta é uma notificação de teste do sistema',
        '{"test": true, "timestamp": "' || NOW() || '"}'
    ) INTO test_notification_id;
    
    IF test_notification_id IS NOT NULL THEN
        RETURN 'Sistema de notificações funcionando! ID da notificação: ' || test_notification_id;
    ELSE
        RETURN 'Erro ao criar notificação de teste';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabelas criadas:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('notifications', 'notification_settings', 'notification_queue')

UNION ALL

SELECT 
    'Funções criadas:' as info,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name IN (
    'create_notification',
    'notify_new_message',
    'notify_new_follower',
    'notify_new_like',
    'notify_new_comment',
    'notify_mention',
    'notify_new_match',
    'get_notification_stats',
    'test_notification_system'
)

UNION ALL

SELECT 
    'Triggers criados:' as info,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_name IN (
    'trigger_new_follower',
    'trigger_new_like',
    'trigger_new_comment'
); 