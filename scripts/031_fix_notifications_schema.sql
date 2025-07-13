-- Script para corrigir o schema da tabela de notificações
-- Adiciona coluna sender_id se não existir

-- Verificar se a coluna sender_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'sender_id'
    ) THEN
        -- Adicionar coluna sender_id
        ALTER TABLE notifications ADD COLUMN sender_id UUID REFERENCES users(id) ON DELETE CASCADE;
        
        -- Criar índice para sender_id
        CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
        
        -- Atualizar notificações existentes com sender_id baseado no data JSONB
        UPDATE notifications 
        SET sender_id = (data->>'user_id')::UUID 
        WHERE data IS NOT NULL AND data ? 'user_id';
        
        RAISE NOTICE 'Coluna sender_id adicionada à tabela notifications';
    ELSE
        RAISE NOTICE 'Coluna sender_id já existe na tabela notifications';
    END IF;
END $$;

-- Verificar se a foreign key existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_sender_id_fkey'
    ) THEN
        -- Adicionar foreign key se não existir
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key notifications_sender_id_fkey adicionada';
    ELSE
        RAISE NOTICE 'Foreign key notifications_sender_id_fkey já existe';
    END IF;
END $$;

-- Atualizar a função create_notification para incluir sender_id
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificação de like
    IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            INSERT INTO notifications (user_id, sender_id, type, title, content, data)
            SELECT p.user_id, NEW.user_id, 'like', 
                   u.name || ' curtiu seu post',
                   'Seu post recebeu uma nova curtida',
                   jsonb_build_object('post_id', NEW.target_id, 'user_id', NEW.user_id)
            FROM posts p, users u
            WHERE p.id = NEW.target_id AND u.id = NEW.user_id AND p.user_id != NEW.user_id;
        END IF;
    END IF;
    
    -- Notificação de comentário
    IF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, sender_id, type, title, content, data)
        SELECT p.user_id, NEW.user_id, 'comment',
               u.name || ' comentou em seu post',
               LEFT(NEW.content, 100),
               jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'user_id', NEW.user_id)
        FROM posts p, users u
        WHERE p.id = NEW.post_id AND u.id = NEW.user_id AND p.user_id != NEW.user_id;
    END IF;
    
    -- Notificação de follow
    IF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, sender_id, type, title, content, data)
        SELECT NEW.following_id, NEW.follower_id, 'follow',
               u.name || ' começou a seguir você',
               'Você tem um novo seguidor',
               jsonb_build_object('user_id', NEW.follower_id)
        FROM users u
        WHERE u.id = NEW.follower_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers
DROP TRIGGER IF EXISTS create_like_notification ON likes;
DROP TRIGGER IF EXISTS create_comment_notification ON comments;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;

CREATE TRIGGER create_like_notification
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER create_comment_notification
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER create_follow_notification
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_notification();

-- Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position; 