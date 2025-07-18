-- SOLUÇÃO DEFINITIVA PARA O ERRO DE FOLLOWS
-- Este script deve ser executado no SQL Editor do Supabase para corrigir todos os problemas

-- ==============================================================================
-- PASSO 1: REMOVER TODOS OS TRIGGERS PROBLEMÁTICOS
-- ==============================================================================

-- Listar todos os triggers na tabela follows para debug
SELECT 
    'TRIGGER ENCONTRADO: ' || trigger_name || ' - ' || action_statement as debug_info
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- Remover TODOS os triggers da tabela follows
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;
DROP TRIGGER IF EXISTS create_smart_notification_follows ON follows;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;
DROP TRIGGER IF EXISTS trigger_new_follower ON follows;
DROP TRIGGER IF EXISTS create_notification_follows ON follows;

-- ==============================================================================
-- PASSO 2: CORRIGIR A FUNÇÃO create_smart_notification
-- ==============================================================================

-- Esta é a função que causa o erro principal
CREATE OR REPLACE FUNCTION create_smart_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_user_id UUID;
    sender_name TEXT;
    sender_id UUID;
    post_content TEXT;
    comment_content TEXT;
    event_title TEXT;
    should_create BOOLEAN := TRUE;
    user_settings RECORD;
BEGIN
    -- Determinar o remetente (sender) baseado na tabela
    CASE TG_TABLE_NAME
        WHEN 'follows' THEN
            sender_id := NEW.follower_id;  -- ✅ CORRIGIDO: usa follower_id em vez de user_id
            notification_user_id := NEW.following_id;
        WHEN 'likes' THEN
            sender_id := NEW.user_id;
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.target_id);
        WHEN 'comments' THEN
            sender_id := NEW.user_id;
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.post_id);
        WHEN 'messages' THEN
            sender_id := NEW.sender_id;
            notification_user_id := (SELECT user_id FROM conversation_participants 
                                   WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1);
        WHEN 'saved_posts' THEN
            sender_id := NEW.user_id;
            notification_user_id := (SELECT user_id FROM posts WHERE id = NEW.post_id);
        WHEN 'event_participants' THEN
            sender_id := NEW.user_id;
            notification_user_id := (SELECT user_id FROM events WHERE id = NEW.event_id);
        ELSE
            -- Para outras tabelas, tentar usar user_id se existir
            sender_id := NEW.user_id;
            RETURN COALESCE(NEW, OLD);
    END CASE;
    
    -- Verificar se deve criar notificação
    IF notification_user_id IS NULL OR notification_user_id = sender_id THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Verificar configurações do usuário (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        SELECT * INTO user_settings 
        FROM notification_settings 
        WHERE user_id = notification_user_id;
        
        -- Aplicar configurações específicas por tipo
        CASE TG_TABLE_NAME
            WHEN 'follows' THEN
                IF user_settings.follows_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            WHEN 'likes' THEN
                IF user_settings.likes_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            WHEN 'comments' THEN
                IF user_settings.comments_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            WHEN 'messages' THEN
                IF user_settings.messages_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
            WHEN 'saved_posts' THEN
                IF user_settings.saves_enabled = FALSE THEN
                    should_create := FALSE;
                END IF;
        END CASE;
    END IF;
    
    -- Se não deve criar, retornar sem fazer nada
    IF NOT should_create THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Obter nome do remetente
    SELECT COALESCE(name, username, 'Usuário') INTO sender_name 
    FROM users 
    WHERE id = sender_id;
    
    -- Criar notificação baseada no tipo (se a tabela notifications existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CASE TG_TABLE_NAME
            WHEN 'follows' THEN
                INSERT INTO notifications (
                    user_id, sender_id, type, title, content, 
                    created_at
                ) VALUES (
                    notification_user_id, sender_id, 'follow',
                    sender_name || ' começou a seguir você',
                    'Você tem um novo seguidor',
                    NOW()
                );
            WHEN 'likes' THEN
                IF NEW.target_type = 'post' THEN
                    INSERT INTO notifications (
                        user_id, sender_id, type, title, content, 
                        related_post_id, created_at
                    ) VALUES (
                        notification_user_id, sender_id, 'like',
                        sender_name || ' curtiu seu post',
                        'Seu post recebeu uma nova curtida',
                        NEW.target_id, NOW()
                    );
                END IF;
            WHEN 'comments' THEN
                INSERT INTO notifications (
                    user_id, sender_id, type, title, content,
                    related_post_id, created_at
                ) VALUES (
                    notification_user_id, sender_id, 'comment',
                    sender_name || ' comentou em seu post',
                    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
                    NEW.post_id, NOW()
                );
        END CASE;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PASSO 3: CRIAR FUNÇÃO ESPECÍFICA PARA STATS DE FOLLOWS
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_user_follows_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar followers para quem está sendo seguido
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('followers', 
            COALESCE((stats->>'followers')::int, 0) + 1)
        WHERE id = NEW.following_id;
        
        -- Incrementar following para quem está seguindo
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('following', 
            COALESCE((stats->>'following')::int, 0) + 1)
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar followers para quem deixou de ser seguido
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('followers', 
            GREATEST(COALESCE((stats->>'followers')::int, 0) - 1, 0))
        WHERE id = OLD.following_id;
        
        -- Decrementar following para quem deixou de seguir
        UPDATE users 
        SET stats = COALESCE(stats, '{}')::jsonb || jsonb_build_object('following', 
            GREATEST(COALESCE((stats->>'following')::int, 0) - 1, 0))
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PASSO 4: CRIAR OS TRIGGERS CORRETOS
-- ==============================================================================

-- Trigger para atualizar estatísticas
CREATE TRIGGER update_user_follows_stats
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follows_stats();

-- Trigger para notificações (usando a função corrigida)
CREATE TRIGGER create_smart_notification_follows
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_smart_notification();

-- ==============================================================================
-- PASSO 5: GARANTIR ESTRUTURA CORRETA
-- ==============================================================================

-- Garantir que users têm stats corretas
UPDATE users 
SET stats = COALESCE(stats, '{}')::jsonb || '{"posts": 0, "followers": 0, "following": 0}'::jsonb
WHERE stats IS NULL OR NOT (stats ? 'followers') OR NOT (stats ? 'following');

-- Garantir RLS policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes
DROP POLICY IF EXISTS "Users can view follows where they are involved" ON follows;
DROP POLICY IF EXISTS "Users can insert follows where they are the follower" ON follows;
DROP POLICY IF EXISTS "Users can delete follows where they are the follower" ON follows;

-- Criar policies corretas
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

-- ==============================================================================
-- PASSO 6: VERIFICAÇÃO
-- ==============================================================================

-- Verificar triggers criados
SELECT 
    'TRIGGER ATIVO: ' || trigger_name || ' - ' || action_timing || ' ' || event_manipulation as status
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
ORDER BY trigger_name;

-- Verificar se functions existem
SELECT 
    'FUNCTION ATIVA: ' || routine_name as status
FROM information_schema.routines 
WHERE routine_name IN ('update_user_follows_stats', 'create_smart_notification')
AND routine_type = 'FUNCTION';

SELECT '✅ FIX DEFINITIVO APLICADO COM SUCESSO!' as resultado;