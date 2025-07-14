-- =====================================================
-- SCRIPT 035: ADICIONAR TABELAS FALTANTES PARA SISTEMA DE NOTIFICAÇÕES
-- =====================================================
-- Data: 2025-01-27
-- Descrição: Adicionar apenas tabelas que estão faltando no banco de dados
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Verificar se a tabela posts existe e sua estrutura
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE EXCEPTION 'Tabela posts não existe! Execute primeiro os scripts de setup do banco.';
    END IF;
END $$;

-- Verificar estrutura da tabela posts
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. ADICIONAR COLUNAS FALTANTES NA TABELA POSTS
-- =====================================================

-- Adicionar colunas que podem estar faltando na tabela posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. CRIAR TABELA SAVED_POSTS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Índices para saved_posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at);

-- =====================================================
-- 4. VERIFICAR E ATUALIZAR TABELA LIKES
-- =====================================================

-- Verificar se a tabela likes existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes') THEN
        -- Criar tabela likes se não existir
        CREATE TABLE likes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_likes_user_id ON likes(user_id);
        CREATE INDEX idx_likes_post_id ON likes(post_id);
        CREATE INDEX idx_likes_created_at ON likes(created_at);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE likes 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 5. VERIFICAR E ATUALIZAR TABELA COMMENTS
-- =====================================================

-- Verificar se a tabela comments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
        -- Criar tabela comments se não existir
        CREATE TABLE comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Criar índices
        CREATE INDEX idx_comments_user_id ON comments(user_id);
        CREATE INDEX idx_comments_post_id ON comments(post_id);
        CREATE INDEX idx_comments_parent_id ON comments(parent_id);
        CREATE INDEX idx_comments_created_at ON comments(created_at);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE comments 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- 6. VERIFICAR E ATUALIZAR TABELA FOLLOWS
-- =====================================================

-- Verificar se a tabela follows existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'follows') THEN
        -- Criar tabela follows se não existir
        CREATE TABLE follows (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(follower_id, following_id),
            CHECK(follower_id != following_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_follows_follower_id ON follows(follower_id);
        CREATE INDEX idx_follows_following_id ON follows(following_id);
        CREATE INDEX idx_follows_created_at ON follows(created_at);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE follows 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICAR E ATUALIZAR TABELA CONVERSATIONS
-- =====================================================

-- Verificar se a tabela conversations existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        -- Criar tabela conversations se não existir
        CREATE TABLE conversations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_group BOOLEAN DEFAULT FALSE,
            group_name TEXT,
            group_avatar TEXT
        );
        
        -- Criar índices
        CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
        CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE conversations 
        ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS group_name TEXT,
        ADD COLUMN IF NOT EXISTS group_avatar TEXT;
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICAR E ATUALIZAR TABELA CONVERSATION_PARTICIPANTS
-- =====================================================

-- Verificar se a tabela conversation_participants existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        -- Criar tabela conversation_participants se não existir
        CREATE TABLE conversation_participants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            left_at TIMESTAMP WITH TIME ZONE,
            is_admin BOOLEAN DEFAULT FALSE,
            UNIQUE(conversation_id, user_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
        CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
    END IF;
END $$;

-- =====================================================
-- 9. VERIFICAR E ATUALIZAR TABELA MESSAGES
-- =====================================================

-- Verificar se a tabela messages existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- Criar tabela messages se não existir
        CREATE TABLE messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file')),
            media_url TEXT,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
        CREATE INDEX idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX idx_messages_created_at ON messages(created_at);
        CREATE INDEX idx_messages_is_deleted ON messages(is_deleted);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE messages 
        ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file')),
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- 10. CRIAR TABELA MESSAGE_REACTIONS (se não existir)
-- =====================================================

-- Verificar se a tabela message_reactions existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_reactions') THEN
        -- Criar tabela message_reactions se não existir
        CREATE TABLE message_reactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            reaction VARCHAR(50) NOT NULL CHECK (reaction IN ('heart', 'thumbsup', 'laugh', 'sad', 'angry')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(message_id, user_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
        CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);
        CREATE INDEX idx_message_reactions_reaction ON message_reactions(reaction);
        CREATE INDEX idx_message_reactions_created_at ON message_reactions(created_at);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE message_reactions 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 11. VERIFICAR E ATUALIZAR TABELA EVENTS
-- =====================================================

-- Verificar se a tabela events existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        -- Criar tabela events se não existir
        CREATE TABLE events (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE,
            max_participants INTEGER,
            is_public BOOLEAN DEFAULT TRUE,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_events_creator_id ON events(creator_id);
        CREATE INDEX idx_events_start_date ON events(start_date);
        CREATE INDEX idx_events_is_public ON events(is_public);
        CREATE INDEX idx_events_is_deleted ON events(is_deleted);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE events 
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- 12. VERIFICAR E ATUALIZAR TABELA EVENT_PARTICIPANTS
-- =====================================================

-- Verificar se a tabela event_participants existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_participants') THEN
        -- Criar tabela event_participants se não existir
        CREATE TABLE event_participants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(event_id, user_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
        CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
        CREATE INDEX idx_event_participants_status ON event_participants(status);
    ELSE
        -- Adicionar colunas faltantes se a tabela já existe
        ALTER TABLE event_participants 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 13. CRIAR TABELAS ADICIONAIS (se não existirem)
-- =====================================================

-- Tabela communities
CREATE TABLE IF NOT EXISTS communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para communities
CREATE INDEX IF NOT EXISTS idx_communities_creator_id ON communities(creator_id);
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);
CREATE INDEX IF NOT EXISTS idx_communities_is_deleted ON communities(is_deleted);

-- Tabela community_members
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(community_id, user_id)
);

-- Índices para community_members
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON community_members(role);

-- Tabela community_posts
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, post_id)
);

-- Índices para community_posts
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_id ON community_posts(post_id);

-- Tabela user_blocks
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CHECK(blocker_id != blocked_id)
);

-- Índices para user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- Tabela user_reports
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reporter_id, reported_id)
);

-- Índices para user_reports
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_id ON user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- Tabela content_reports
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'event', 'community')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para content_reports
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_type ON content_reports(content_type);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_id ON content_reports(content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);

-- Tabela user_activity_logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_activity_logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Tabela system_settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);

-- Tabela api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- =====================================================
-- 14. TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'posts', 'saved_posts', 'likes', 'comments', 'follows',
            'conversations', 'conversation_participants', 'messages',
            'message_reactions', 'events', 'event_participants',
            'communities', 'community_members', 'community_posts',
            'user_blocks', 'user_reports', 'content_reports',
            'user_activity_logs', 'system_settings', 'api_keys'
        )
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_updated_at_trigger ON %I;
            CREATE TRIGGER update_updated_at_trigger
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- 15. RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'posts', 'saved_posts', 'likes', 'comments', 'follows',
            'conversations', 'conversation_participants', 'messages',
            'message_reactions', 'events', 'event_participants',
            'communities', 'community_members', 'community_posts',
            'user_blocks', 'user_reports', 'content_reports',
            'user_activity_logs', 'system_settings', 'api_keys'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name);
    END LOOP;
END $$;

-- =====================================================
-- 16. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can view public posts') THEN
        CREATE POLICY "Users can view public posts" ON posts
            FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can insert their own posts') THEN
        CREATE POLICY "Users can insert their own posts" ON posts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can update their own posts') THEN
        CREATE POLICY "Users can update their own posts" ON posts
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can delete their own posts') THEN
        CREATE POLICY "Users can delete their own posts" ON posts
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para saved_posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can view their own saved posts') THEN
        CREATE POLICY "Users can view their own saved posts" ON saved_posts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can insert their own saved posts') THEN
        CREATE POLICY "Users can insert their own saved posts" ON saved_posts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can delete their own saved posts') THEN
        CREATE POLICY "Users can delete their own saved posts" ON saved_posts
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para likes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can view all likes') THEN
        CREATE POLICY "Users can view all likes" ON likes
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can insert their own likes') THEN
        CREATE POLICY "Users can insert their own likes" ON likes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can delete their own likes') THEN
        CREATE POLICY "Users can delete their own likes" ON likes
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para comments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can view all comments') THEN
        CREATE POLICY "Users can view all comments" ON comments
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert their own comments') THEN
        CREATE POLICY "Users can insert their own comments" ON comments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can update their own comments') THEN
        CREATE POLICY "Users can update their own comments" ON comments
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments') THEN
        CREATE POLICY "Users can delete their own comments" ON comments
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para follows
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can view all follows') THEN
        CREATE POLICY "Users can view all follows" ON follows
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can insert their own follows') THEN
        CREATE POLICY "Users can insert their own follows" ON follows
            FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can delete their own follows') THEN
        CREATE POLICY "Users can delete their own follows" ON follows
            FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END $$;

-- =====================================================
-- 17. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para contar likes de um post
CREATE OR REPLACE FUNCTION get_post_likes_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM likes 
        WHERE post_id = post_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar comentários de um post
CREATE OR REPLACE FUNCTION get_post_comments_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM comments 
        WHERE post_id = post_uuid AND is_deleted = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário curtiu um post
CREATE OR REPLACE FUNCTION user_liked_post(post_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM likes 
            WHERE post_id = post_uuid AND user_id = user_uuid
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário salvou um post
CREATE OR REPLACE FUNCTION user_saved_post(post_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM saved_posts 
            WHERE post_id = post_uuid AND user_id = user_uuid
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário segue outro usuário
CREATE OR REPLACE FUNCTION user_follows_user(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM follows 
            WHERE follower_id = follower_uuid AND following_id = following_uuid
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. DADOS INICIAIS
-- =====================================================

-- Inserir configurações do sistema
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('max_file_size', '{"value": 10485760}', 'Tamanho máximo de arquivo em bytes (10MB)', true),
('allowed_file_types', '{"value": ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"]}', 'Tipos de arquivo permitidos', true),
('max_post_length', '{"value": 1000}', 'Comprimento máximo de post em caracteres', true),
('max_comment_length', '{"value": 500}', 'Comprimento máximo de comentário em caracteres', true),
('notification_retention_days', '{"value": 30}', 'Dias para manter notificações', true),
('user_activity_log_retention_days', '{"value": 90}', 'Dias para manter logs de atividade', true)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 19. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'Tabelas verificadas com sucesso:' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'posts', 'saved_posts', 'likes', 'comments', 'follows',
    'conversations', 'conversation_participants', 'messages',
    'message_reactions', 'events', 'event_participants',
    'communities', 'community_members', 'community_posts',
    'user_blocks', 'user_reports', 'content_reports',
    'user_activity_logs', 'system_settings', 'api_keys'
);

-- Mostrar estrutura final da tabela posts
SELECT 
    'Estrutura da tabela posts:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position; 