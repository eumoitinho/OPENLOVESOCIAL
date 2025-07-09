-- Melhorias do Timeline e Sistema de Posts
-- Este script adiciona todas as funcionalidades necessárias para o novo sistema de timeline

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tipos enum para melhor consistência
DO $$ BEGIN
    CREATE TYPE interaction_type_enum AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'wow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_type_enum AS ENUM ('text', 'image', 'video', 'link', 'poll', 'event');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_visibility_enum AS ENUM ('public', 'friends', 'private', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ad_type_enum AS ENUM ('banner', 'sponsored_post', 'video_ad', 'carousel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar tabela de posts com novos campos
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS post_type post_type_enum DEFAULT 'text',
ADD COLUMN IF NOT EXISTS visibility post_visibility_enum DEFAULT 'public',
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id),
ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Tabela de interações com posts (likes, loves, etc.)
CREATE TABLE IF NOT EXISTS post_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type interaction_type_enum NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, interaction_type)
);

-- Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS post_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    share_type VARCHAR(50) DEFAULT 'direct',
    shared_to_user_id UUID REFERENCES profiles(id),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de visualizações de posts
CREATE TABLE IF NOT EXISTS post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    view_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, DATE(created_at))
);

-- Tabela de salvos/favoritos
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    collection_name VARCHAR(100) DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Tabela de denúncias
CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anúncios
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    link_url TEXT NOT NULL,
    ad_type ad_type_enum DEFAULT 'banner',
    target_audience JSONB DEFAULT '{}',
    budget_daily DECIMAL(10,2),
    budget_total DECIMAL(10,2),
    cost_per_click DECIMAL(10,4),
    cost_per_impression DECIMAL(10,4),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas de anúncios
CREATE TABLE IF NOT EXISTS ad_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(10,2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ad_id, date)
);

-- Tabela de interações com anúncios
CREATE TABLE IF NOT EXISTS ad_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências do timeline
CREATE TABLE IF NOT EXISTS timeline_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    show_reposts BOOLEAN DEFAULT TRUE,
    show_ads BOOLEAN DEFAULT TRUE,
    content_filter JSONB DEFAULT '{"nsfw": false, "violence": false}',
    preferred_languages TEXT[] DEFAULT '{"pt", "en"}',
    algorithm_preference VARCHAR(50) DEFAULT 'balanced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de hashtags populares
CREATE TABLE IF NOT EXISTS trending_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hashtag VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    trend_score DECIMAL(10,2) DEFAULT 0,
    category VARCHAR(50),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hashtag, date)
);

-- Função para calcular engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    likes_count INTEGER := 0;
    comments_count INTEGER := 0;
    shares_count INTEGER := 0;
    views_count INTEGER := 0;
    engagement_score INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO likes_count
    FROM post_interactions 
    WHERE post_interactions.post_id = calculate_engagement_score.post_id;
    
    SELECT COUNT(*) INTO comments_count
    FROM comments 
    WHERE comments.post_id = calculate_engagement_score.post_id;
    
    SELECT COUNT(*) INTO shares_count
    FROM post_shares 
    WHERE post_shares.post_id = calculate_engagement_score.post_id;
    
    SELECT COUNT(*) INTO views_count
    FROM post_views 
    WHERE post_views.post_id = calculate_engagement_score.post_id;
    
    engagement_score := (likes_count * 1) + (comments_count * 3) + (shares_count * 5) + (views_count * 0.1);
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Função para obter posts do timeline
CREATE OR REPLACE FUNCTION get_timeline_posts(
    user_id UUID,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0,
    include_ads BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    author_id UUID,
    author_username VARCHAR,
    author_full_name VARCHAR,
    author_avatar_url TEXT,
    author_is_verified BOOLEAN,
    post_type post_type_enum,
    media_urls TEXT[],
    hashtags TEXT[],
    mentions TEXT[],
    location TEXT,
    is_sponsored BOOLEAN,
    like_count BIGINT,
    comment_count BIGINT,
    share_count BIGINT,
    view_count INTEGER,
    user_has_liked BOOLEAN,
    user_has_saved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    engagement_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.content,
        p.author_id,
        pr.username,
        pr.full_name,
        pr.avatar_url,
        pr.is_verified,
        p.post_type,
        p.media_urls,
        p.hashtags,
        p.mentions,
        p.location,
        p.is_sponsored,
        COALESCE(pi.like_count, 0) as like_count,
        COALESCE(p.comment_count, 0)::BIGINT as comment_count,
        COALESCE(ps.share_count, 0) as share_count,
        p.view_count,
        CASE WHEN upi.user_id IS NOT NULL THEN TRUE ELSE FALSE END as user_has_liked,
        CASE WHEN sp.user_id IS NOT NULL THEN TRUE ELSE FALSE END as user_has_saved,
        p.created_at,
        p.engagement_score
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
        FROM post_interactions
        WHERE interaction_type = 'like'
        GROUP BY post_id
    ) pi ON p.id = pi.post_id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as share_count
        FROM post_shares
        GROUP BY post_id
    ) ps ON p.id = ps.post_id
    LEFT JOIN post_interactions upi ON p.id = upi.post_id AND upi.user_id = get_timeline_posts.user_id AND upi.interaction_type = 'like'
    LEFT JOIN saved_posts sp ON p.id = sp.post_id AND sp.user_id = get_timeline_posts.user_id
    WHERE 
        (p.visibility = 'public' OR 
         (p.visibility = 'friends' AND EXISTS(
             SELECT 1 FROM friends f 
             WHERE (f.user_id = get_timeline_posts.user_id AND f.friend_id = p.author_id AND f.status = 'accepted')
                OR (f.friend_id = get_timeline_posts.user_id AND f.user_id = p.author_id AND f.status = 'accepted')
         )) OR
         p.author_id = get_timeline_posts.user_id)
        AND (p.scheduled_at IS NULL OR p.scheduled_at <= NOW())
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
    ORDER BY p.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para curtir/descurtir post
CREATE OR REPLACE FUNCTION toggle_post_like(
    post_id UUID,
    user_id UUID,
    interaction_type interaction_type_enum DEFAULT 'like'
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_interaction UUID;
    is_liked BOOLEAN := FALSE;
BEGIN
    SELECT id INTO existing_interaction
    FROM post_interactions
    WHERE post_interactions.post_id = toggle_post_like.post_id 
    AND post_interactions.user_id = toggle_post_like.user_id
    AND post_interactions.interaction_type = toggle_post_like.interaction_type;
    
    IF existing_interaction IS NOT NULL THEN
        DELETE FROM post_interactions WHERE id = existing_interaction;
        is_liked := FALSE;
    ELSE
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (toggle_post_like.post_id, toggle_post_like.user_id, toggle_post_like.interaction_type);
        is_liked := TRUE;
    END IF;
    
    UPDATE posts 
    SET engagement_score = calculate_engagement_score(toggle_post_like.post_id)
    WHERE id = toggle_post_like.post_id;
    
    RETURN is_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para compartilhar post
CREATE OR REPLACE FUNCTION share_post(
    post_id UUID,
    user_id UUID,
    share_type VARCHAR DEFAULT 'direct',
    message TEXT DEFAULT NULL,
    shared_to_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    share_id UUID;
BEGIN
    INSERT INTO post_shares (post_id, user_id, share_type, message, shared_to_user_id)
    VALUES (share_post.post_id, share_post.user_id, share_post.share_type, share_post.message, share_post.shared_to_user_id)
    RETURNING id INTO share_id;
    
    UPDATE posts 
    SET share_count = share_count + 1,
        engagement_score = calculate_engagement_score(share_post.post_id)
    WHERE id = share_post.post_id;
    
    RETURN share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar visualização de post
CREATE OR REPLACE FUNCTION register_post_view(
    post_id UUID,
    user_id UUID DEFAULT NULL,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    view_duration INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO post_views (post_id, user_id, ip_address, user_agent, view_duration)
    VALUES (register_post_view.post_id, register_post_view.user_id, register_post_view.ip_address, register_post_view.user_agent, register_post_view.view_duration)
    ON CONFLICT (post_id, user_id, DATE(created_at)) DO UPDATE SET
        view_duration = GREATEST(post_views.view_duration, register_post_view.view_duration);
    
    UPDATE posts 
    SET view_count = view_count + 1
    WHERE id = register_post_view.post_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar/dessalvar post
CREATE OR REPLACE FUNCTION toggle_save_post(
    post_id UUID,
    user_id UUID,
    collection_name VARCHAR DEFAULT 'default'
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_save UUID;
    is_saved BOOLEAN := FALSE;
BEGIN
    SELECT id INTO existing_save
    FROM saved_posts
    WHERE saved_posts.post_id = toggle_save_post.post_id 
    AND saved_posts.user_id = toggle_save_post.user_id;
    
    IF existing_save IS NOT NULL THEN
        DELETE FROM saved_posts WHERE id = existing_save;
        is_saved := FALSE;
    ELSE
        INSERT INTO saved_posts (post_id, user_id, collection_name)
        VALUES (toggle_save_post.post_id, toggle_save_post.user_id, toggle_save_post.collection_name);
        is_saved := TRUE;
    END IF;
    
    RETURN is_saved;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter anúncios relevantes
CREATE OR REPLACE FUNCTION get_relevant_ads(
    user_id UUID,
    limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    link_url TEXT,
    ad_type ad_type_enum,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.video_url,
        a.link_url,
        a.ad_type,
        a.created_at
    FROM advertisements a
    WHERE a.is_active = TRUE
    AND (a.start_date IS NULL OR a.start_date <= NOW())
    AND (a.end_date IS NULL OR a.end_date >= NOW())
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_post_interactions_updated_at ON post_interactions;
CREATE TRIGGER update_post_interactions_updated_at
    BEFORE UPDATE ON post_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_preferences_updated_at ON timeline_preferences;
CREATE TRIGGER update_timeline_preferences_updated_at
    BEFORE UPDATE ON timeline_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_interactions_ad_id ON ad_interactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_trending_hashtags_date ON trending_hashtags(date);
CREATE INDEX IF NOT EXISTS idx_trending_hashtags_score ON trending_hashtags(trend_score DESC);

-- Row Level Security (RLS)
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para post_interactions
CREATE POLICY "Users can manage their own interactions" ON post_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view interactions on public posts" ON post_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts p 
            WHERE p.id = post_interactions.post_id 
            AND (p.visibility = 'public' OR p.author_id = auth.uid())
        )
    );

-- Políticas RLS para post_shares
CREATE POLICY "Users can manage their own shares" ON post_shares
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para saved_posts
CREATE POLICY "Users can manage their own saved posts" ON saved_posts
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para timeline_preferences
CREATE POLICY "Users can manage their own preferences" ON timeline_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para post_reports
CREATE POLICY "Users can create reports" ON post_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON post_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Conceder permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE post_interactions IS 'Interações dos usuários com posts (likes, loves, etc.)';
COMMENT ON TABLE post_shares IS 'Compartilhamentos de posts';
COMMENT ON TABLE post_views IS 'Visualizações de posts para métricas';
COMMENT ON TABLE saved_posts IS 'Posts salvos pelos usuários';
COMMENT ON TABLE post_reports IS 'Denúncias de posts';
COMMENT ON TABLE advertisements IS 'Sistema de anúncios';
COMMENT ON TABLE ad_metrics IS 'Métricas de performance dos anúncios';
COMMENT ON TABLE ad_interactions IS 'Interações dos usuários com anúncios';
COMMENT ON TABLE timeline_preferences IS 'Preferências do timeline do usuário';
COMMENT ON TABLE trending_hashtags IS 'Hashtags em tendência';
