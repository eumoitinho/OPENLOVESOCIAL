-- =====================================================
-- SISTEMA DE CURTIDAS COM NOTIFICAÇÕES AUTOMÁTICAS
-- =====================================================

-- 1. VERIFICAR E CRIAR TABELA DE CURTIDAS
DO $$ 
BEGIN
    -- Verificar se a tabela likes existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes') THEN
        CREATE TABLE likes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
            target_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, target_type, target_id)
        );
        
        -- Criar índices para performance
        CREATE INDEX idx_likes_user_id ON likes(user_id);
        CREATE INDEX idx_likes_target ON likes(target_type, target_id);
        CREATE INDEX idx_likes_created_at ON likes(created_at);
        
        RAISE NOTICE 'Tabela likes criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela likes já existe';
    END IF;
END $$;

-- 2. VERIFICAR SE A TABELA POSTS TEM A ESTRUTURA CORRETA
DO $$
BEGIN
    -- Adicionar coluna stats se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'stats') THEN
        ALTER TABLE posts ADD COLUMN stats JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'::jsonb;
    END IF;
    
    -- Adicionar coluna likes_count se não existir (para compatibilidade)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. FUNÇÃO PARA ATUALIZAR ESTATÍSTICAS DE POSTS
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            -- Atualizar contador de likes
            UPDATE posts 
            SET likes_count = likes_count + 1,
                stats = jsonb_set(stats, '{likes}', ((stats->>'likes')::int + 1)::text::jsonb)
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            -- Atualizar contador de likes
            UPDATE posts 
            SET likes_count = GREATEST(likes_count - 1, 0),
                stats = jsonb_set(stats, '{likes}', GREATEST(((stats->>'likes')::int - 1), 0)::text::jsonb)
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER PARA ATUALIZAR ESTATÍSTICAS
DROP TRIGGER IF EXISTS update_post_likes_stats ON likes;
CREATE TRIGGER update_post_likes_stats
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- 5. FUNÇÃO PARA CURTIR/DESCURTIR POST
CREATE OR REPLACE FUNCTION toggle_post_like(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_like UUID;
    is_liked BOOLEAN := FALSE;
    post_owner_id UUID;
BEGIN
    -- Verificar se o post existe
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = p_post_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post não encontrado';
    END IF;
    
    -- Verificar se já existe curtida
    SELECT id INTO existing_like
    FROM likes
    WHERE target_type = 'post' 
    AND target_id = p_post_id 
    AND user_id = p_user_id;
    
    IF existing_like IS NOT NULL THEN
        -- Descurtir
        DELETE FROM likes WHERE id = existing_like;
        is_liked := FALSE;
    ELSE
        -- Curtir
        INSERT INTO likes (user_id, target_type, target_id)
        VALUES (p_user_id, 'post', p_post_id);
        is_liked := TRUE;
    END IF;
    
    RETURN is_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA OBTER CONTAGEM DE CURTIDAS
CREATE OR REPLACE FUNCTION get_post_likes_count(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    likes_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO likes_count
    FROM likes
    WHERE target_type = 'post' AND target_id = p_post_id;
    
    RETURN likes_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA VERIFICAR SE USUÁRIO CURTIU
CREATE OR REPLACE FUNCTION has_user_liked_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_liked BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM likes 
        WHERE target_type = 'post' 
        AND target_id = p_post_id 
        AND user_id = p_user_id
    ) INTO has_liked;
    
    RETURN has_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNÇÃO PARA OBTER USUÁRIOS QUE CURTIRAM
CREATE OR REPLACE FUNCTION get_post_likes(p_post_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    name VARCHAR,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.name,
        u.avatar_url,
        l.created_at
    FROM likes l
    JOIN users u ON l.user_id = u.id
    WHERE l.target_type = 'post' AND l.target_id = p_post_id
    ORDER BY l.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. HABILITAR RLS PARA LIKES
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS RLS PARA LIKES
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON likes;
CREATE POLICY "Users can like posts" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON likes;
CREATE POLICY "Users can unlike posts" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- 11. VERIFICAR SE O SISTEMA DE NOTIFICAÇÕES ESTÁ CONFIGURADO
DO $$
BEGIN
    -- Verificar se a tabela notifications existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE 'Tabela notifications não encontrada. Execute o script 037_notification_system.sql primeiro.';
    ELSE
        RAISE NOTICE 'Sistema de notificações encontrado. Configurando triggers...';
    END IF;
END $$;

-- 12. FUNÇÃO PARA NOTIFICAR CURTIDAS (se o sistema de notificações existir)
CREATE OR REPLACE FUNCTION trigger_notify_like()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    liker_name TEXT;
    post_title TEXT;
BEGIN
    -- Obter o dono do post
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = NEW.target_id;
    
    -- Não notificar se o próprio usuário curtiu
    IF post_owner_id != NEW.user_id THEN
        -- Obter nome de quem curtiu
        SELECT name INTO liker_name 
        FROM users 
        WHERE id = NEW.user_id;
        
        -- Obter título do post (primeiros 50 caracteres)
        SELECT LEFT(content, 50) INTO post_title 
        FROM posts 
        WHERE id = NEW.target_id;
        
        -- Criar notificação (se a função create_notification existir)
        IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_notification') THEN
            PERFORM create_notification(
                post_owner_id,
                'new_like',
                'Novo like',
                liker_name || ' curtiu seu post',
                jsonb_build_object(
                    'liker_id', NEW.user_id,
                    'liker_name', liker_name,
                    'post_id', NEW.target_id,
                    'post_title', post_title
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR TRIGGER PARA NOTIFICAR CURTIDAS (se o sistema de notificações existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Criar trigger
        DROP TRIGGER IF EXISTS trigger_notify_like ON likes;
        CREATE TRIGGER trigger_notify_like
            AFTER INSERT ON likes
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notify_like();
            
        RAISE NOTICE 'Trigger de notificação de curtidas criado com sucesso';
    ELSE
        RAISE NOTICE 'Sistema de notificações não encontrado. Trigger de notificação não será criado.';
    END IF;
END $$;

-- 14. FUNÇÃO PARA TESTE DO SISTEMA
CREATE OR REPLACE FUNCTION test_like_system(p_post_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    like_result BOOLEAN;
    likes_count INTEGER;
    has_liked BOOLEAN;
BEGIN
    -- Testar curtir
    SELECT toggle_post_like(p_post_id, p_user_id) INTO like_result;
    
    -- Verificar contagem
    SELECT get_post_likes_count(p_post_id) INTO likes_count;
    
    -- Verificar se curtiu
    SELECT has_user_liked_post(p_post_id, p_user_id) INTO has_liked;
    
    RETURN 'Sistema de curtidas funcionando! ' ||
           'Curtido: ' || like_result || ', ' ||
           'Contagem: ' || likes_count || ', ' ||
           'Usuário curtiu: ' || has_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. ATUALIZAR ESTATÍSTICAS EXISTENTES
DO $$
BEGIN
    -- Atualizar contadores de likes para posts existentes
    UPDATE posts 
    SET likes_count = (
        SELECT COUNT(*) 
        FROM likes 
        WHERE target_type = 'post' AND target_id = posts.id
    );
    
    RAISE NOTICE 'Estatísticas de likes atualizadas';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabelas criadas:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('likes')

UNION ALL

SELECT 
    'Funções criadas:' as info,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name IN (
    'toggle_post_like',
    'get_post_likes_count',
    'has_user_liked_post',
    'get_post_likes',
    'update_post_stats',
    'test_like_system',
    'trigger_notify_like'
)

UNION ALL

SELECT 
    'Triggers criados:' as info,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_name IN (
    'update_post_likes_stats',
    'trigger_notify_like'
);

-- Mostrar estatísticas atuais
SELECT 
    'Posts com likes:' as info,
    COUNT(*) as count
FROM posts 
WHERE likes_count > 0

UNION ALL

SELECT 
    'Total de likes:' as info,
    COUNT(*) as count
FROM likes 
WHERE target_type = 'post'; 