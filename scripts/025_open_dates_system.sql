-- Sistema Open Dates - Tinder-like para OpenLove
-- Execute este script no Supabase SQL Editor

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de cards do Open Dates
CREATE TABLE IF NOT EXISTS open_dates_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'heart',
    colors JSONB DEFAULT '{
        "primary": "#1a1a1a",
        "secondary": "#333333", 
        "text": "#ffffff",
        "shadow": "rgba(0, 0, 0, 0.5)"
    }',
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interações do Open Dates
CREATE TABLE IF NOT EXISTS open_dates_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES open_dates_cards(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(viewer_id, card_id)
);

-- Tabela de matches do Open Dates
CREATE TABLE IF NOT EXISTS open_dates_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id)
);

-- Tabela de mensagens do Open Dates
CREATE TABLE IF NOT EXISTS open_dates_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES open_dates_matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do Open Dates
CREATE TABLE IF NOT EXISTS open_dates_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 80,
    distance_max INTEGER DEFAULT 50, -- em km
    gender_preference TEXT[] DEFAULT '{}',
    relationship_type_preference TEXT[] DEFAULT '{}',
    interests_preference TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_open_dates_cards_user_id ON open_dates_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_cards_active ON open_dates_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_open_dates_cards_created_at ON open_dates_cards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_open_dates_interactions_viewer ON open_dates_interactions(viewer_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_interactions_card ON open_dates_interactions(card_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_interactions_action ON open_dates_interactions(action);

CREATE INDEX IF NOT EXISTS idx_open_dates_matches_user1 ON open_dates_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_matches_user2 ON open_dates_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_matches_active ON open_dates_matches(is_active);

CREATE INDEX IF NOT EXISTS idx_open_dates_messages_match ON open_dates_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_messages_sender ON open_dates_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_open_dates_messages_created_at ON open_dates_messages(created_at DESC);

-- Função para calcular distância entre dois pontos (fórmula de Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Raio da Terra em km
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Função para obter cards recomendados para um usuário
CREATE OR REPLACE FUNCTION get_recommended_cards(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    card_id UUID,
    user_id UUID,
    title VARCHAR,
    subtitle VARCHAR,
    description TEXT,
    image_url TEXT,
    icon VARCHAR,
    colors JSONB,
    distance DECIMAL,
    age INTEGER,
    common_interests TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_prefs AS (
        SELECT 
            age_min, age_max, distance_max, gender_preference,
            relationship_type_preference, interests_preference
        FROM open_dates_preferences 
        WHERE user_id = p_user_id
    ),
    user_profile AS (
        SELECT 
            p.id, p.age, p.gender, p.interests, p.latitude, p.longitude,
            p.relationship_status, p.profile_type
        FROM profiles p 
        WHERE p.id = p_user_id
    ),
    candidate_cards AS (
        SELECT 
            c.id as card_id,
            c.user_id,
            c.title,
            c.subtitle,
            c.description,
            c.image_url,
            c.icon,
            c.colors,
            p.age,
            p.gender,
            p.interests,
            p.relationship_status,
            p.profile_type,
            p.latitude,
            p.longitude,
            up.latitude as user_lat,
            up.longitude as user_lon
        FROM open_dates_cards c
        JOIN profiles p ON c.user_id = p.id
        CROSS JOIN user_profile up
        WHERE c.is_active = TRUE 
        AND c.user_id != p_user_id
        AND NOT EXISTS (
            SELECT 1 FROM open_dates_interactions oi 
            WHERE oi.viewer_id = p_user_id AND oi.card_id = c.id
        )
    )
    SELECT 
        cc.card_id,
        cc.user_id,
        cc.title,
        cc.subtitle,
        cc.description,
        cc.image_url,
        cc.icon,
        cc.colors,
        CASE 
            WHEN cc.latitude IS NOT NULL AND cc.longitude IS NOT NULL 
            AND cc.user_lat IS NOT NULL AND cc.user_lon IS NOT NULL
            THEN calculate_distance(cc.user_lat, cc.user_lon, cc.latitude, cc.longitude)
            ELSE NULL
        END as distance,
        cc.age,
        CASE 
            WHEN cc.interests IS NOT NULL AND up.interests IS NOT NULL
            THEN array(
                SELECT unnest(cc.interests) 
                INTERSECT 
                SELECT unnest(up.interests)
            )
            ELSE '{}'::TEXT[]
        END as common_interests
    FROM candidate_cards cc
    CROSS JOIN user_prefs up
    CROSS JOIN user_profile up2
    WHERE 
        -- Filtros de idade
        (cc.age IS NULL OR (cc.age >= up.age_min AND cc.age <= up.age_max))
        -- Filtros de distância
        AND (up.distance_max IS NULL OR cc.distance IS NULL OR cc.distance <= up.distance_max)
        -- Filtros de gênero (se especificado)
        AND (up.gender_preference = '{}' OR cc.gender = ANY(up.gender_preference))
        -- Filtros de tipo de relacionamento (se especificado)
        AND (up.relationship_type_preference = '{}' OR cc.profile_type = ANY(up.relationship_type_preference))
    ORDER BY 
        -- Priorizar por interesses em comum
        array_length(
            CASE 
                WHEN cc.interests IS NOT NULL AND up2.interests IS NOT NULL
                THEN array(
                    SELECT unnest(cc.interests) 
                    INTERSECT 
                    SELECT unnest(up2.interests)
                )
                ELSE '{}'::TEXT[]
            END, 1
        ) DESC,
        -- Depois por proximidade
        cc.distance ASC NULLS LAST,
        -- Por fim, por data de criação
        cc.card_id DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar uma interação (like/pass/super_like)
CREATE OR REPLACE FUNCTION register_open_dates_interaction(
    p_viewer_id UUID,
    p_card_id UUID,
    p_action VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    card_user_id UUID;
    existing_match UUID;
BEGIN
    -- Verificar se a ação é válida
    IF p_action NOT IN ('like', 'pass', 'super_like') THEN
        RAISE EXCEPTION 'Invalid action: %', p_action;
    END IF;
    
    -- Obter o usuário do card
    SELECT user_id INTO card_user_id 
    FROM open_dates_cards 
    WHERE id = p_card_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se já existe interação
    IF EXISTS (
        SELECT 1 FROM open_dates_interactions 
        WHERE viewer_id = p_viewer_id AND card_id = p_card_id
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Registrar a interação
    INSERT INTO open_dates_interactions (viewer_id, card_id, action)
    VALUES (p_viewer_id, p_card_id, p_action);
    
    -- Se for like ou super_like, verificar se há match
    IF p_action IN ('like', 'super_like') THEN
        -- Verificar se o outro usuário também deu like
        IF EXISTS (
            SELECT 1 FROM open_dates_interactions oi
            JOIN open_dates_cards c ON oi.card_id = c.id
            WHERE oi.viewer_id = card_user_id 
            AND c.user_id = p_viewer_id
            AND oi.action IN ('like', 'super_like')
        ) THEN
            -- Criar match
            INSERT INTO open_dates_matches (user1_id, user2_id)
            VALUES (
                LEAST(p_viewer_id, card_user_id),
                GREATEST(p_viewer_id, card_user_id)
            )
            ON CONFLICT (user1_id, user2_id) DO NOTHING;
        END IF;
        
        -- Atualizar contador de likes do card
        UPDATE open_dates_cards 
        SET likes_count = likes_count + 1
        WHERE id = p_card_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter matches de um usuário
CREATE OR REPLACE FUNCTION get_user_matches(p_user_id UUID)
RETURNS TABLE (
    match_id UUID,
    other_user_id UUID,
    other_user_name VARCHAR,
    other_user_avatar TEXT,
    matched_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        CASE 
            WHEN m.user1_id = p_user_id THEN m.user2_id
            ELSE m.user1_id
        END as other_user_id,
        p.full_name as other_user_name,
        p.avatar_url as other_user_avatar,
        m.matched_at,
        last_msg.last_message_at,
        COALESCE(unread.unread_count, 0) as unread_count
    FROM open_dates_matches m
    JOIN profiles p ON p.id = CASE 
        WHEN m.user1_id = p_user_id THEN m.user2_id
        ELSE m.user1_id
    END
    LEFT JOIN (
        SELECT 
            match_id,
            MAX(created_at) as last_message_at
        FROM open_dates_messages
        GROUP BY match_id
    ) last_msg ON last_msg.match_id = m.id
    LEFT JOIN (
        SELECT 
            match_id,
            COUNT(*) as unread_count
        FROM open_dates_messages
        WHERE sender_id != p_user_id AND is_read = FALSE
        GROUP BY match_id
    ) unread ON unread.match_id = m.id
    WHERE m.is_active = TRUE 
    AND (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    ORDER BY last_msg.last_message_at DESC NULLS LAST, m.matched_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS
ALTER TABLE open_dates_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_dates_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_dates_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_dates_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_dates_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para open_dates_cards
CREATE POLICY "Usuários podem ver cards ativos" ON open_dates_cards
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Usuários podem criar seus próprios cards" ON open_dates_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios cards" ON open_dates_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios cards" ON open_dates_cards
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para open_dates_interactions
CREATE POLICY "Usuários podem ver suas próprias interações" ON open_dates_interactions
    FOR SELECT USING (auth.uid() = viewer_id);

CREATE POLICY "Usuários podem criar interações" ON open_dates_interactions
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Políticas RLS para open_dates_matches
CREATE POLICY "Usuários podem ver seus matches" ON open_dates_matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas RLS para open_dates_messages
CREATE POLICY "Usuários podem ver mensagens de seus matches" ON open_dates_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM open_dates_matches m
            WHERE m.id = match_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

CREATE POLICY "Usuários podem enviar mensagens em seus matches" ON open_dates_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Usuários podem marcar mensagens como lidas" ON open_dates_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM open_dates_matches m
            WHERE m.id = match_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

-- Políticas RLS para open_dates_preferences
CREATE POLICY "Usuários podem ver suas próprias preferências" ON open_dates_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas preferências" ON open_dates_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas preferências" ON open_dates_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_open_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_open_dates_cards_updated_at
    BEFORE UPDATE ON open_dates_cards
    FOR EACH ROW EXECUTE FUNCTION update_open_dates_updated_at();

CREATE TRIGGER update_open_dates_preferences_updated_at
    BEFORE UPDATE ON open_dates_preferences
    FOR EACH ROW EXECUTE FUNCTION update_open_dates_updated_at();

-- Inserir dados de exemplo
INSERT INTO open_dates_cards (user_id, title, subtitle, description, image_url, icon, colors) VALUES
(
    (SELECT id FROM auth.users LIMIT 1),
    'MAGNA COASTAL',
    'Invest in Future',
    'An undiscovered coastal jewel on the Gulf of Aqaba near the Red Sea, Magna will be a place like nothing on earth.',
    'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2762&q=80',
    'heart',
    '{"primary": "#1a1a1a", "secondary": "#333333", "text": "#ffffff", "shadow": "rgba(0, 0, 0, 0.5)"}'
),
(
    (SELECT id FROM auth.users LIMIT 1),
    'AZURE RETREAT',
    'Luxury Redefined',
    'Experience the pinnacle of coastal living with panoramic ocean views and world-class amenities.',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2760&q=80',
    'star',
    '{"primary": "#0f2b46", "secondary": "#1e4976", "text": "#ffffff", "shadow": "rgba(15, 43, 70, 0.6)"}'
)
ON CONFLICT DO NOTHING; 