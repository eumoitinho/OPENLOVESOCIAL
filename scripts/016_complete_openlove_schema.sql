-- OpenLove Complete Database Schema
-- Este script cria todas as tabelas e funcionalidades necessárias

-- Limpar schema existente
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    location VARCHAR(100),
    age INTEGER,
    gender VARCHAR(20),
    interests TEXT[], -- Array de interesses
    relationship_status VARCHAR(50),
    looking_for TEXT[], -- O que está procurando
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Configurações de privacidade
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "show_age": true,
        "show_location": true,
        "allow_messages": "everyone",
        "show_online_status": true
    }'::jsonb,
    
    -- Estatísticas do usuário
    stats JSONB DEFAULT '{
        "posts": 0,
        "followers": 0,
        "following": 0,
        "likes_received": 0,
        "comments_received": 0,
        "profile_views": 0,
        "earnings": 0
    }'::jsonb
);

-- Tabela de posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array de URLs de mídia
    media_types TEXT[], -- Array de tipos (image, video)
    hashtags TEXT[], -- Array de hashtags
    mentions TEXT[], -- Array de menções
    visibility VARCHAR(20) DEFAULT 'public', -- public, friends, private
    is_event BOOLEAN DEFAULT FALSE,
    event_details JSONB, -- Detalhes do evento se for um evento
    location VARCHAR(100),
    is_premium_content BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2), -- Preço se for conteúdo pago
    
    -- Estatísticas do post
    stats JSONB DEFAULT '{
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "views": 0
    }'::jsonb,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de comentários
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para respostas
    content TEXT NOT NULL,
    media_url TEXT, -- Comentário com mídia
    
    -- Estatísticas do comentário
    stats JSONB DEFAULT '{
        "likes": 0,
        "replies": 0
    }'::jsonb,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de curtidas
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- post, comment
    target_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, target_type, target_id)
);

-- Tabela de seguidores
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Tabela de conversas
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) DEFAULT 'direct', -- direct, group
    name VARCHAR(100), -- Nome do grupo (se aplicável)
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de participantes da conversa
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, member
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    
    UNIQUE(conversation_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(20), -- image, video, audio, file
    message_type VARCHAR(20) DEFAULT 'text', -- text, media, system
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    is_premium_only BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    tags TEXT[],
    
    -- Configurações do evento
    settings JSONB DEFAULT '{
        "allow_guests": true,
        "require_approval": false,
        "is_private": false,
        "allow_photos": true
    }'::jsonb,
    
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de participantes de eventos
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'going', -- going, maybe, not_going
    joined_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- Tabela de notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- like, comment, follow, message, event_invite
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB, -- Dados específicos da notificação
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de denúncias
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- user, post, comment, message
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de bloqueios
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id),
    CHECK(blocker_id != blocked_id)
);

-- Tabela de conteúdo premium
CREATE TABLE premium_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    media_urls TEXT[],
    preview_url TEXT,
    category VARCHAR(50),
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de compras de conteúdo premium
CREATE TABLE premium_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES premium_content(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    transaction_id VARCHAR(100),
    purchased_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(buyer_id, content_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_is_premium ON users(is_premium);
CREATE INDEX idx_users_last_seen ON users(last_seen);

-- Índices para posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_posts_is_event ON posts(is_event);

-- Índices para comments
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Índices para likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- Índices para follows
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Índices para events
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_category ON events(category);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- TRIGGERS E FUNÇÕES
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas de posts
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes}', ((stats->>'likes')::int + 1)::text::jsonb)
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE posts 
            SET stats = jsonb_set(stats, '{likes}', GREATEST(((stats->>'likes')::int - 1), 0)::text::jsonb)
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats de likes
CREATE TRIGGER update_post_likes_stats
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- Função para atualizar estatísticas de comentários
CREATE OR REPLACE FUNCTION update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET stats = jsonb_set(stats, '{comments}', ((stats->>'comments')::int + 1)::text::jsonb)
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET stats = jsonb_set(stats, '{comments}', GREATEST(((stats->>'comments')::int - 1), 0)::text::jsonb)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar stats de comentários
CREATE TRIGGER update_post_comments_stats
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_stats();

-- Função para atualizar estatísticas de usuários
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(stats, '{posts}', ((stats->>'posts')::int + 1)::text::jsonb)
            WHERE id = NEW.user_id;
        END IF;
        
        -- Atualizar followers count
        IF TG_TABLE_NAME = 'follows' THEN
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', ((stats->>'followers')::int + 1)::text::jsonb)
            WHERE id = NEW.following_id;
            
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', ((stats->>'following')::int + 1)::text::jsonb)
            WHERE id = NEW.follower_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Atualizar posts count
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE users 
            SET stats = jsonb_set(stats, '{posts}', GREATEST(((stats->>'posts')::int - 1), 0)::text::jsonb)
            WHERE id = OLD.user_id;
        END IF;
        
        -- Atualizar followers count
        IF TG_TABLE_NAME = 'follows' THEN
            UPDATE users 
            SET stats = jsonb_set(stats, '{followers}', GREATEST(((stats->>'followers')::int - 1), 0)::text::jsonb)
            WHERE id = OLD.following_id;
            
            UPDATE users 
            SET stats = jsonb_set(stats, '{following}', GREATEST(((stats->>'following')::int - 1), 0)::text::jsonb)
            WHERE id = OLD.follower_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar stats de usuários
CREATE TRIGGER update_user_posts_stats
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_follows_stats
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Função para criar notificações automáticas
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificação de like
    IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            INSERT INTO notifications (user_id, type, title, content, data)
            SELECT p.user_id, 'like', 
                   u.name || ' curtiu seu post',
                   'Seu post recebeu uma nova curtida',
                   jsonb_build_object('post_id', NEW.target_id, 'user_id', NEW.user_id)
            FROM posts p, users u
            WHERE p.id = NEW.target_id AND u.id = NEW.user_id AND p.user_id != NEW.user_id;
        END IF;
    END IF;
    
    -- Notificação de comentário
    IF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, content, data)
        SELECT p.user_id, 'comment',
               u.name || ' comentou em seu post',
               LEFT(NEW.content, 100),
               jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'user_id', NEW.user_id)
        FROM posts p, users u
        WHERE p.id = NEW.post_id AND u.id = NEW.user_id AND p.user_id != NEW.user_id;
    END IF;
    
    -- Notificação de follow
    IF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, content, data)
        SELECT NEW.following_id, 'follow',
               u.name || ' começou a seguir você',
               'Você tem um novo seguidor',
               jsonb_build_object('user_id', NEW.follower_id)
        FROM users u
        WHERE u.id = NEW.follower_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para notificações
CREATE TRIGGER create_like_notification
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER create_comment_notification
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER create_follow_notification
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_notification();

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para timeline de posts
CREATE VIEW timeline_posts AS
SELECT 
    p.*,
    u.name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar,
    u.is_premium as author_is_premium,
    u.location as author_location,
    (SELECT COUNT(*) FROM likes l WHERE l.target_type = 'post' AND l.target_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.visibility = 'public' AND u.is_active = true
ORDER BY p.created_at DESC;

-- View para estatísticas de usuários
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.name,
    (u.stats->>'posts')::int as posts_count,
    (u.stats->>'followers')::int as followers_count,
    (u.stats->>'following')::int as following_count,
    (u.stats->>'likes_received')::int as likes_received,
    (u.stats->>'profile_views')::int as profile_views,
    (u.stats->>'earnings')::numeric as earnings
FROM users u
WHERE u.is_active = true;

-- =============================================
-- FUNÇÕES DE BUSCA
-- =============================================

-- Função para buscar usuários
CREATE OR REPLACE FUNCTION search_users(
    search_query TEXT DEFAULT '',
    location_filter TEXT DEFAULT '',
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 100,
    interests_filter TEXT[] DEFAULT '{}',
    premium_only BOOLEAN DEFAULT FALSE,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    username VARCHAR,
    name VARCHAR,
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR,
    age INTEGER,
    interests TEXT[],
    is_premium BOOLEAN,
    stats JSONB,
    last_seen TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.username, u.name, u.bio, u.avatar_url, u.location, u.age, 
        u.interests, u.is_premium, u.stats, u.last_seen
    FROM users u
    WHERE 
        u.is_active = true
        AND (search_query = '' OR 
             u.name ILIKE '%' || search_query || '%' OR 
             u.username ILIKE '%' || search_query || '%' OR
             u.bio ILIKE '%' || search_query || '%')
        AND (location_filter = '' OR u.location ILIKE '%' || location_filter || '%')
        AND (u.age BETWEEN age_min AND age_max)
        AND (array_length(interests_filter, 1) IS NULL OR u.interests && interests_filter)
        AND (NOT premium_only OR u.is_premium = true)
    ORDER BY 
        CASE WHEN u.is_premium THEN 0 ELSE 1 END,
        u.last_seen DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar posts
CREATE OR REPLACE FUNCTION search_posts(
    search_query TEXT DEFAULT '',
    hashtags_filter TEXT[] DEFAULT '{}',
    user_id_filter UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    media_urls TEXT[],
    hashtags TEXT[],
    stats JSONB,
    created_at TIMESTAMP,
    author_name VARCHAR,
    author_username VARCHAR,
    author_avatar TEXT,
    author_is_premium BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.user_id, p.content, p.media_urls, p.hashtags, p.stats, p.created_at,
        u.name, u.username, u.avatar_url, u.is_premium
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 
        p.visibility = 'public'
        AND u.is_active = true
        AND (search_query = '' OR p.content ILIKE '%' || search_query || '%')
        AND (array_length(hashtags_filter, 1) IS NULL OR p.hashtags && hashtags_filter)
        AND (user_id_filter IS NULL OR p.user_id = user_id_filter)
    ORDER BY p.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (
        privacy_settings->>'profile_visibility' = 'public' OR
        auth.uid() = id
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para posts
CREATE POLICY "Users can view public posts" ON posts
    FOR SELECT USING (
        visibility = 'public' OR
        user_id = auth.uid() OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM follows f 
            WHERE f.follower_id = auth.uid() AND f.following_id = user_id
        ))
    );

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para comments
CREATE POLICY "Users can view comments on visible posts" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts p 
            WHERE p.id = post_id AND (
                p.visibility = 'public' OR
                p.user_id = auth.uid() OR
                (p.visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM follows f 
                    WHERE f.follower_id = auth.uid() AND f.following_id = p.user_id
                ))
            )
        )
    );

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para likes
CREATE POLICY "Users can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (user_id = auth.uid());

-- Políticas para follows
CREATE POLICY "Users can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (follower_id = auth.uid());

-- Políticas para messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
        )
    );

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir usuário administrador
INSERT INTO users (
    email, username, name, bio, location, age, gender, 
    interests, is_premium, is_verified, is_active,
    privacy_settings, stats
) VALUES (
    'admin@openlove.com', 'admin', 'Administrador OpenLove',
    'Conta oficial do OpenLove - Conectando corações!',
    'São Paulo, SP', 30, 'Não informado',
    ARRAY['Administração', 'Comunidade', 'Suporte'],
    true, true, true,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 0, "followers": 0, "following": 0, "likes_received": 0, "comments_received": 0, "profile_views": 0, "earnings": 0}'::jsonb
);

COMMIT;
