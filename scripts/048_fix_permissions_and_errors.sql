-- Script para corrigir permissões e erros
-- Data: 2025-01-XX
-- Versão: 1.0

-- =====================================================
-- 1. CORRIGIR PERMISSÕES DA TABELA FRIENDS
-- =====================================================

-- Verificar se a tabela friends existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends' AND table_schema = 'public') THEN
        -- Criar tabela friends se não existir
        CREATE TABLE public.friends (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, friend_id),
            CHECK (user_id != friend_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_friends_user_id ON friends(user_id);
        CREATE INDEX idx_friends_friend_id ON friends(friend_id);
        CREATE INDEX idx_friends_status ON friends(status);
        
        RAISE NOTICE 'Tabela friends criada';
    ELSE
        RAISE NOTICE 'Tabela friends já existe';
    END IF;
END $$;

-- Configurar RLS para friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Política para visualizar amigos
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
CREATE POLICY "Users can view their friends" ON friends
    FOR SELECT USING (
        user_id = auth.uid() OR friend_id = auth.uid()
    );

-- Política para inserir solicitações de amizade
DROP POLICY IF EXISTS "Users can insert friend requests" ON friends;
CREATE POLICY "Users can insert friend requests" ON friends
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Política para atualizar status de amizade
DROP POLICY IF EXISTS "Users can update friend status" ON friends;
CREATE POLICY "Users can update friend status" ON friends
    FOR UPDATE USING (
        user_id = auth.uid() OR friend_id = auth.uid()
    );

-- Política para deletar amizades
DROP POLICY IF EXISTS "Users can delete their friends" ON friends;
CREATE POLICY "Users can delete their friends" ON friends
    FOR DELETE USING (
        user_id = auth.uid() OR friend_id = auth.uid()
    );

-- =====================================================
-- 2. CORRIGIR TABELA EVENTS
-- =====================================================

-- Verificar se a tabela events existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
        -- Criar tabela events se não existir
        CREATE TABLE public.events (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            location VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE,
            max_participants INTEGER,
            current_participants INTEGER DEFAULT 0,
            category VARCHAR(100),
            tags TEXT[],
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_events_user_id ON events(user_id);
        CREATE INDEX idx_events_start_date ON events(start_date);
        CREATE INDEX idx_events_location ON events(location);
        CREATE INDEX idx_events_category ON events(category);
        
        RAISE NOTICE 'Tabela events criada';
    ELSE
        -- Verificar se a coluna date existe, se não, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
            ALTER TABLE events ADD COLUMN date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Coluna date adicionada à tabela events';
        END IF;
        
        RAISE NOTICE 'Tabela events já existe';
    END IF;
END $$;

-- Configurar RLS para events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política para visualizar eventos
DROP POLICY IF EXISTS "Users can view public events" ON events;
CREATE POLICY "Users can view public events" ON events
    FOR SELECT USING (
        is_public = true OR user_id = auth.uid()
    );

-- Política para criar eventos
DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Política para atualizar eventos
DROP POLICY IF EXISTS "Users can update their events" ON events;
CREATE POLICY "Users can update their events" ON events
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- Política para deletar eventos
DROP POLICY IF EXISTS "Users can delete their events" ON events;
CREATE POLICY "Users can delete their events" ON events
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- =====================================================
-- 3. CORRIGIR PERMISSÕES DA TABELA POSTS
-- =====================================================

-- Verificar se a tabela posts existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
        -- Criar tabela posts se não existir
        CREATE TABLE public.posts (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            content TEXT NOT NULL,
            media_urls TEXT[] DEFAULT ARRAY[]::text[],
            media_types TEXT[] DEFAULT ARRAY[]::text[],
            hashtags TEXT[] DEFAULT ARRAY[]::text[],
            mentions TEXT[] DEFAULT ARRAY[]::text[],
            visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends_only')),
            location VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            is_event BOOLEAN DEFAULT false,
            event_details JSONB,
            is_premium_content BOOLEAN DEFAULT false,
            price DECIMAL(10, 2),
            stats JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_posts_user_id ON posts(user_id);
        CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
        CREATE INDEX idx_posts_visibility ON posts(visibility);
        CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
        CREATE INDEX idx_posts_mentions ON posts USING GIN(mentions);
        
        RAISE NOTICE 'Tabela posts criada';
    ELSE
        RAISE NOTICE 'Tabela posts já existe';
    END IF;
END $$;

-- Configurar RLS para posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política para visualizar posts
DROP POLICY IF EXISTS "Users can view posts" ON posts;
CREATE POLICY "Users can view posts" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends_only' 
            AND EXISTS (
                SELECT 1 FROM friends f
                WHERE (f.user_id = posts.user_id AND f.friend_id = auth.uid())
                OR (f.friend_id = posts.user_id AND f.user_id = auth.uid())
                AND f.status = 'accepted'
            )
        )
    );

-- Política para criar posts
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Política para atualizar posts
DROP POLICY IF EXISTS "Users can update their posts" ON posts;
CREATE POLICY "Users can update their posts" ON posts
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- Política para deletar posts
DROP POLICY IF EXISTS "Users can delete their posts" ON posts;
CREATE POLICY "Users can delete their posts" ON posts
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- =====================================================
-- 4. CORRIGIR PERMISSÕES DA TABELA LIKES
-- =====================================================

-- Verificar se a tabela likes existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        -- Criar tabela likes se não existir
        CREATE TABLE public.likes (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            target_id UUID NOT NULL,
            target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('post', 'comment', 'event')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, target_id, target_type)
        );
        
        -- Criar índices
        CREATE INDEX idx_likes_user_id ON likes(user_id);
        CREATE INDEX idx_likes_target_id ON likes(target_id);
        CREATE INDEX idx_likes_target_type ON likes(target_type);
        
        RAISE NOTICE 'Tabela likes criada';
    ELSE
        RAISE NOTICE 'Tabela likes já existe';
    END IF;
END $$;

-- Configurar RLS para likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Política para visualizar likes
DROP POLICY IF EXISTS "Users can view likes" ON likes;
CREATE POLICY "Users can view likes" ON likes
    FOR SELECT USING (true);

-- Política para criar likes
DROP POLICY IF EXISTS "Users can create likes" ON likes;
CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Política para deletar likes
DROP POLICY IF EXISTS "Users can delete their likes" ON likes;
CREATE POLICY "Users can delete their likes" ON likes
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- =====================================================
-- 5. CORRIGIR PERMISSÕES DA TABELA COMMENTS
-- =====================================================

-- Verificar se a tabela comments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments' AND table_schema = 'public') THEN
        -- Criar tabela comments se não existir
        CREATE TABLE public.comments (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
            content TEXT NOT NULL,
            parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
            stats JSONB DEFAULT '{"likes": 0}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_comments_user_id ON comments(user_id);
        CREATE INDEX idx_comments_post_id ON comments(post_id);
        CREATE INDEX idx_comments_parent_id ON comments(parent_id);
        CREATE INDEX idx_comments_created_at ON comments(created_at);
        
        RAISE NOTICE 'Tabela comments criada';
    ELSE
        RAISE NOTICE 'Tabela comments já existe';
    END IF;
END $$;

-- Configurar RLS para comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Política para visualizar comentários
DROP POLICY IF EXISTS "Users can view comments" ON comments;
CREATE POLICY "Users can view comments" ON comments
    FOR SELECT USING (true);

-- Política para criar comentários
DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Política para atualizar comentários
DROP POLICY IF EXISTS "Users can update their comments" ON comments;
CREATE POLICY "Users can update their comments" ON comments
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- Política para deletar comentários
DROP POLICY IF EXISTS "Users can delete their comments" ON comments;
CREATE POLICY "Users can delete their comments" ON comments
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- =====================================================
-- 6. VERIFICAR E CORRIGIR FUNÇÕES
-- =====================================================

-- Função para atualizar stats de posts
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar contador de likes
        IF NEW.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{"likes": 0, "comments": 0, "shares": 0}'::jsonb),
                '{likes}',
                to_jsonb((COALESCE(stats->>'likes', '0')::int + 1))
            )
            WHERE id = NEW.target_id;
        END IF;
        
        -- Atualizar contador de comentários
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{"likes": 0, "comments": 0, "shares": 0}'::jsonb),
                '{comments}',
                to_jsonb((COALESCE(stats->>'comments', '0')::int + 1))
            )
            WHERE id = NEW.post_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador de likes
        IF OLD.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{"likes": 0, "comments": 0, "shares": 0}'::jsonb),
                '{likes}',
                to_jsonb(GREATEST((COALESCE(stats->>'likes', '0')::int - 1), 0))
            )
            WHERE id = OLD.target_id;
        END IF;
        
        -- Decrementar contador de comentários
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts 
            SET stats = jsonb_set(
                COALESCE(stats, '{"likes": 0, "comments": 0, "shares": 0}'::jsonb),
                '{comments}',
                to_jsonb(GREATEST((COALESCE(stats->>'comments', '0')::int - 1), 0))
            )
            WHERE id = OLD.post_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers se não existirem
DO $$
BEGIN
    -- Trigger para likes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_post_stats_on_likes') THEN
        CREATE TRIGGER update_post_stats_on_likes
        AFTER INSERT OR DELETE ON likes
        FOR EACH ROW EXECUTE FUNCTION update_post_stats();
    END IF;
    
    -- Trigger para comments
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_post_stats_on_comments') THEN
        CREATE TRIGGER update_post_stats_on_comments
        AFTER INSERT OR DELETE ON comments
        FOR EACH ROW EXECUTE FUNCTION update_post_stats();
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICAR RESULTADO
-- =====================================================

-- Verificar tabelas criadas
SELECT 
    table_name,
    CASE WHEN row_level_security = 'YES' THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'likes', 'comments', 'friends', 'events')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('posts', 'likes', 'comments', 'friends', 'events')
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('posts', 'likes', 'comments')
ORDER BY event_object_table, trigger_name;

Write-Host "✅ Permissões e erros corrigidos com sucesso!" -ForegroundColor Green 