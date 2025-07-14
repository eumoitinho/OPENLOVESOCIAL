-- =====================================================
-- SCRIPT 037: SISTEMA COMPLETO DE NOTIFICAÇÕES
-- =====================================================
-- Data: 2025-01-27
-- Descrição: Sistema completo de notificações estilo Twitter
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'message', 'post', 'system')),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id UUID, -- ID do objeto relacionado (post, comentário, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);

-- =====================================================
-- 2. HABILITAR RLS
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DO $$
BEGIN
    -- Política para usuários verem apenas suas notificações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    -- Política para usuários atualizarem suas notificações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Política para sistema inserir notificações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can insert notifications') THEN
        CREATE POLICY "System can insert notifications" ON notifications
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- =====================================================
-- 3. FUNÇÕES PARA CRIAR NOTIFICAÇÕES
-- =====================================================

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_type VARCHAR(50),
    notification_title VARCHAR(200),
    notification_content TEXT,
    related_object_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        related_id
    ) VALUES (
        target_user_id,
        notification_type,
        notification_title,
        notification_content,
        related_object_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação de like
CREATE OR REPLACE FUNCTION notify_like(
    post_owner_id UUID,
    liker_id UUID,
    post_id UUID
)
RETURNS UUID AS $$
DECLARE
    liker_name TEXT;
    notification_id UUID;
BEGIN
    -- Buscar nome do usuário que curtiu
    SELECT full_name INTO liker_name
    FROM profiles
    WHERE id = liker_id;
    
    -- Não notificar se o usuário curtiu seu próprio post
    IF post_owner_id = liker_id THEN
        RETURN NULL;
    END IF;
    
    -- Criar notificação
    SELECT create_notification(
        post_owner_id,
        'like',
        COALESCE(liker_name, 'Alguém') || ' curtiu seu post',
        'Sua publicação recebeu uma curtida',
        post_id
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação de comentário
CREATE OR REPLACE FUNCTION notify_comment(
    post_owner_id UUID,
    commenter_id UUID,
    post_id UUID,
    comment_content TEXT
)
RETURNS UUID AS $$
DECLARE
    commenter_name TEXT;
    notification_id UUID;
BEGIN
    -- Buscar nome do usuário que comentou
    SELECT full_name INTO commenter_name
    FROM profiles
    WHERE id = commenter_id;
    
    -- Não notificar se o usuário comentou em seu próprio post
    IF post_owner_id = commenter_id THEN
        RETURN NULL;
    END IF;
    
    -- Criar notificação
    SELECT create_notification(
        post_owner_id,
        'comment',
        COALESCE(commenter_name, 'Alguém') || ' comentou em seu post',
        SUBSTRING(comment_content, 1, 100) || CASE WHEN LENGTH(comment_content) > 100 THEN '...' ELSE '' END,
        post_id
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação de follow
CREATE OR REPLACE FUNCTION notify_follow(
    followed_id UUID,
    follower_id UUID
)
RETURNS UUID AS $$
DECLARE
    follower_name TEXT;
    notification_id UUID;
BEGIN
    -- Buscar nome do usuário que seguiu
    SELECT full_name INTO follower_name
    FROM profiles
    WHERE id = follower_id;
    
    -- Criar notificação
    SELECT create_notification(
        followed_id,
        'follow',
        COALESCE(follower_name, 'Alguém') || ' começou a seguir você',
        'Você tem um novo seguidor!',
        follower_id
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação de menção
CREATE OR REPLACE FUNCTION notify_mention(
    mentioned_user_id UUID,
    mentioner_id UUID,
    post_id UUID,
    mention_content TEXT
)
RETURNS UUID AS $$
DECLARE
    mentioner_name TEXT;
    notification_id UUID;
BEGIN
    -- Buscar nome do usuário que mencionou
    SELECT full_name INTO mentioner_name
    FROM profiles
    WHERE id = mentioner_id;
    
    -- Não notificar se o usuário se mencionou
    IF mentioned_user_id = mentioner_id THEN
        RETURN NULL;
    END IF;
    
    -- Criar notificação
    SELECT create_notification(
        mentioned_user_id,
        'mention',
        COALESCE(mentioner_name, 'Alguém') || ' mencionou você',
        SUBSTRING(mention_content, 1, 100) || CASE WHEN LENGTH(mention_content) > 100 THEN '...' ELSE '' END,
        post_id
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação de mensagem
CREATE OR REPLACE FUNCTION notify_message(
    recipient_id UUID,
    sender_id UUID,
    conversation_id UUID
)
RETURNS UUID AS $$
DECLARE
    sender_name TEXT;
    notification_id UUID;
BEGIN
    -- Buscar nome do remetente
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE id = sender_id;
    
    -- Criar notificação
    SELECT create_notification(
        recipient_id,
        'message',
        COALESCE(sender_name, 'Alguém') || ' enviou uma mensagem',
        'Você tem uma nova mensagem',
        conversation_id
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGERS PARA AUTOMATIZAR NOTIFICAÇÕES
-- =====================================================

-- Trigger para notificar likes
CREATE OR REPLACE FUNCTION trigger_notify_like()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar o dono do post
    PERFORM notify_like(
        (SELECT user_id FROM posts WHERE id = NEW.post_id),
        NEW.user_id,
        NEW.post_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_like') THEN
        CREATE TRIGGER trigger_notify_like
            AFTER INSERT ON likes
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notify_like();
    END IF;
END $$;

-- Trigger para notificar comentários
CREATE OR REPLACE FUNCTION trigger_notify_comment()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar o dono do post
    PERFORM notify_comment(
        (SELECT user_id FROM posts WHERE id = NEW.post_id),
        NEW.user_id,
        NEW.post_id,
        NEW.content
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_comment') THEN
        CREATE TRIGGER trigger_notify_comment
            AFTER INSERT ON comments
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notify_comment();
    END IF;
END $$;

-- Trigger para notificar follows
CREATE OR REPLACE FUNCTION trigger_notify_follow()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM notify_follow(
        NEW.following_id,
        NEW.follower_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_follow') THEN
        CREATE TRIGGER trigger_notify_follow
            AFTER INSERT ON follows
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notify_follow();
    END IF;
END $$;

-- Trigger para notificar mensagens
CREATE OR REPLACE FUNCTION trigger_notify_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Buscar o destinatário da mensagem (participante da conversa que não é o remetente)
    SELECT cp.user_id INTO recipient_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
    LIMIT 1;
    
    IF recipient_id IS NOT NULL THEN
        PERFORM notify_message(
            recipient_id,
            NEW.sender_id,
            NEW.conversation_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_message') THEN
        CREATE TRIGGER trigger_notify_message
            AFTER INSERT ON messages
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notify_message();
    END IF;
END $$;

-- =====================================================
-- 5. FUNÇÕES PARA BUSCAR NOTIFICAÇÕES
-- =====================================================

-- Função para buscar notificações do usuário
CREATE OR REPLACE FUNCTION get_user_notifications(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    type VARCHAR(50),
    title VARCHAR(200),
    content TEXT,
    related_id UUID,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    user_username VARCHAR,
    user_full_name VARCHAR,
    user_avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.content,
        n.related_id,
        n.is_read,
        n.created_at,
        p.username,
        p.full_name,
        p.avatar_url
    FROM notifications n
    LEFT JOIN profiles p ON p.id = n.user_id
    WHERE n.user_id = user_uuid
    AND (NOT unread_only OR n.is_read = FALSE)
    ORDER BY n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar notificações não lidas
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = user_uuid AND is_read = FALSE;
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. FUNÇÕES PARA ATUALIZAR NOTIFICAÇÕES
-- =====================================================

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = notification_uuid AND user_id = user_uuid;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = user_uuid AND is_read = FALSE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNÇÃO PARA LIMPEZA AUTOMÁTICA
-- =====================================================

-- Função para limpar notificações antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_read = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. DADOS INICIAIS
-- =====================================================

-- Inserir notificação de boas-vindas para usuários existentes
INSERT INTO notifications (user_id, type, title, content)
SELECT 
    id,
    'system',
    'Bem-vindo ao OpenLove!',
    'Obrigado por se juntar à nossa comunidade. Explore os recursos e conecte-se com outras pessoas!'
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM notifications WHERE type = 'system' AND title = 'Bem-vindo ao OpenLove!'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Sistema de notificações criado com sucesso!' as status,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications
FROM notifications;

-- Mostrar estrutura da tabela
SELECT 
    'Estrutura da tabela notifications:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position; 