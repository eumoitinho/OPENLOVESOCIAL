-- ================================================================
-- FREEMIUM COUNTERS SYSTEM - REAL USAGE TRACKING
-- ================================================================
-- Purpose: Implement real usage counters for freemium limits
-- Date: 2025-01-27
-- ================================================================

-- Tabela para contadores de uso mensal por usuário
CREATE TABLE IF NOT EXISTS public.user_usage_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- formato: '2025-01'
    
    -- Contadores de upload
    images_uploaded INTEGER DEFAULT 0,
    videos_uploaded INTEGER DEFAULT 0,
    audio_files_uploaded INTEGER DEFAULT 0,
    total_storage_bytes BIGINT DEFAULT 0,
    
    -- Contadores de interação
    messages_sent INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    communities_joined INTEGER DEFAULT 0,
    communities_created INTEGER DEFAULT 0,
    polls_created INTEGER DEFAULT 0,
    
    -- Contadores de chamadas
    voice_calls_made INTEGER DEFAULT 0,
    video_calls_made INTEGER DEFAULT 0,
    total_call_minutes INTEGER DEFAULT 0,
    
    -- Contadores de visualização
    profile_views_received INTEGER DEFAULT 0,
    posts_created INTEGER DEFAULT 0,
    likes_given INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    
    -- Metadados
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, month_year)
);

-- Tabela para histórico de ações que afetam contadores
CREATE TABLE IF NOT EXISTS public.usage_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'upload_image', 'send_message', 'create_event', etc.
    action_data JSONB, -- dados específicos da ação
    points_consumed INTEGER DEFAULT 1, -- pontos consumidos pela ação
    month_year VARCHAR(7) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configuração de limites por plano
CREATE TABLE IF NOT EXISTS public.plan_limits_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_type VARCHAR(20) NOT NULL,
    
    -- Limites de upload
    max_images_per_month INTEGER DEFAULT 0,
    max_videos_per_month INTEGER DEFAULT 0,
    max_audio_files_per_month INTEGER DEFAULT 0,
    max_storage_bytes BIGINT DEFAULT 0,
    
    -- Limites de interação
    max_messages_per_month INTEGER DEFAULT 0,
    max_events_per_month INTEGER DEFAULT 0,
    max_communities_joined INTEGER DEFAULT 0,
    max_communities_created INTEGER DEFAULT 0,
    max_polls_per_month INTEGER DEFAULT 0,
    
    -- Limites de chamadas
    max_voice_calls_per_month INTEGER DEFAULT 0,
    max_video_calls_per_month INTEGER DEFAULT 0,
    max_call_minutes_per_month INTEGER DEFAULT 0,
    
    -- Funcionalidades habilitadas
    can_send_messages BOOLEAN DEFAULT false,
    can_upload_media BOOLEAN DEFAULT false,
    can_create_events BOOLEAN DEFAULT false,
    can_create_communities BOOLEAN DEFAULT false,
    can_create_polls BOOLEAN DEFAULT false,
    can_make_calls BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_get_verified_badge BOOLEAN DEFAULT false,
    
    -- Configurações visuais
    has_premium_highlight BOOLEAN DEFAULT false,
    badge_type VARCHAR(20) DEFAULT 'none',
    
    -- Metadados
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plan_type)
);

-- Inserir configurações padrão dos planos
INSERT INTO public.plan_limits_config (plan_type, max_images_per_month, max_videos_per_month, max_audio_files_per_month, max_storage_bytes, max_messages_per_month, max_events_per_month, max_communities_joined, max_communities_created, max_polls_per_month, max_voice_calls_per_month, max_video_calls_per_month, max_call_minutes_per_month, can_send_messages, can_upload_media, can_create_events, can_create_communities, can_create_polls, can_make_calls, can_access_analytics, can_get_verified_badge, has_premium_highlight, badge_type) VALUES
-- Plano Free
('free', 1, 0, 0, 10 * 1024 * 1024, 0, 0, 0, 0, 0, 0, 0, 0, false, false, false, false, false, false, false, false, false, 'none'),
-- Plano Gold
('gold', 50, 10, 20, 100 * 1024 * 1024, 1000, 5, 3, 1, 10, 50, 0, 300, true, true, true, true, true, true, true, false, true, 'premium'),
-- Plano Diamond
('diamond', 200, 50, 100, 500 * 1024 * 1024, 5000, 20, 10, 5, 50, 200, 100, 1000, true, true, true, true, true, true, true, true, true, 'verified'),
-- Plano Diamond Annual
('diamond_annual', 200, 50, 100, 500 * 1024 * 1024, 5000, 20, 10, 5, 50, 200, 100, 1000, true, true, true, true, true, true, true, true, true, 'verified')
ON CONFLICT (plan_type) DO UPDATE SET
    max_images_per_month = EXCLUDED.max_images_per_month,
    max_videos_per_month = EXCLUDED.max_videos_per_month,
    max_audio_files_per_month = EXCLUDED.max_audio_files_per_month,
    max_storage_bytes = EXCLUDED.max_storage_bytes,
    max_messages_per_month = EXCLUDED.max_messages_per_month,
    max_events_per_month = EXCLUDED.max_events_per_month,
    max_communities_joined = EXCLUDED.max_communities_joined,
    max_communities_created = EXCLUDED.max_communities_created,
    max_polls_per_month = EXCLUDED.max_polls_per_month,
    max_voice_calls_per_month = EXCLUDED.max_voice_calls_per_month,
    max_video_calls_per_month = EXCLUDED.max_video_calls_per_month,
    max_call_minutes_per_month = EXCLUDED.max_call_minutes_per_month,
    can_send_messages = EXCLUDED.can_send_messages,
    can_upload_media = EXCLUDED.can_upload_media,
    can_create_events = EXCLUDED.can_create_events,
    can_create_communities = EXCLUDED.can_create_communities,
    can_create_polls = EXCLUDED.can_create_polls,
    can_make_calls = EXCLUDED.can_make_calls,
    can_access_analytics = EXCLUDED.can_access_analytics,
    can_get_verified_badge = EXCLUDED.can_get_verified_badge,
    has_premium_highlight = EXCLUDED.has_premium_highlight,
    badge_type = EXCLUDED.badge_type,
    updated_at = NOW();

-- Função para obter contadores do usuário
CREATE OR REPLACE FUNCTION get_user_usage_counters(
    p_user_id UUID,
    p_month_year VARCHAR(7) DEFAULT NULL
)
RETURNS TABLE (
    images_uploaded INTEGER,
    videos_uploaded INTEGER,
    audio_files_uploaded INTEGER,
    total_storage_bytes BIGINT,
    messages_sent INTEGER,
    events_created INTEGER,
    communities_joined INTEGER,
    communities_created INTEGER,
    polls_created INTEGER,
    voice_calls_made INTEGER,
    video_calls_made INTEGER,
    total_call_minutes INTEGER,
    profile_views_received INTEGER,
    posts_created INTEGER,
    likes_given INTEGER,
    likes_received INTEGER
) AS $$
BEGIN
    -- Se não especificado, usar mês atual
    IF p_month_year IS NULL THEN
        p_month_year := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(uuc.images_uploaded, 0),
        COALESCE(uuc.videos_uploaded, 0),
        COALESCE(uuc.audio_files_uploaded, 0),
        COALESCE(uuc.total_storage_bytes, 0),
        COALESCE(uuc.messages_sent, 0),
        COALESCE(uuc.events_created, 0),
        COALESCE(uuc.communities_joined, 0),
        COALESCE(uuc.communities_created, 0),
        COALESCE(uuc.polls_created, 0),
        COALESCE(uuc.voice_calls_made, 0),
        COALESCE(uuc.video_calls_made, 0),
        COALESCE(uuc.total_call_minutes, 0),
        COALESCE(uuc.profile_views_received, 0),
        COALESCE(uuc.posts_created, 0),
        COALESCE(uuc.likes_given, 0),
        COALESCE(uuc.likes_received, 0)
    FROM user_usage_counters uuc
    WHERE uuc.user_id = p_user_id 
    AND uuc.month_year = p_month_year;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador
CREATE OR REPLACE FUNCTION increment_usage_counter(
    p_user_id UUID,
    p_counter_name VARCHAR(50),
    p_increment INTEGER DEFAULT 1,
    p_month_year VARCHAR(7) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_month_year VARCHAR(7);
    v_current_value INTEGER;
BEGIN
    -- Se não especificado, usar mês atual
    IF p_month_year IS NULL THEN
        v_month_year := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    ELSE
        v_month_year := p_month_year;
    END IF;
    
    -- Inserir ou atualizar contador
    INSERT INTO user_usage_counters (user_id, month_year, updated_at)
    VALUES (p_user_id, v_month_year, NOW())
    ON CONFLICT (user_id, month_year) DO UPDATE SET
        updated_at = NOW();
    
    -- Incrementar o contador específico
    EXECUTE format('UPDATE user_usage_counters SET %I = COALESCE(%I, 0) + $1 WHERE user_id = $2 AND month_year = $3', 
                   p_counter_name, p_counter_name)
    USING p_increment, p_user_id, v_month_year;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao incrementar contador: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário pode realizar ação
CREATE OR REPLACE FUNCTION can_perform_action(
    p_user_id UUID,
    p_action_type VARCHAR(50),
    p_required_points INTEGER DEFAULT 1
)
RETURNS TABLE (
    can_perform BOOLEAN,
    reason TEXT,
    current_usage INTEGER,
    max_allowed INTEGER
) AS $$
DECLARE
    v_user_plan VARCHAR(20);
    v_plan_limits RECORD;
    v_current_usage INTEGER;
    v_max_allowed INTEGER;
    v_month_year VARCHAR(7);
BEGIN
    -- Obter mês atual
    v_month_year := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    
    -- Obter plano do usuário
    SELECT premium_type INTO v_user_plan
    FROM users
    WHERE id = p_user_id;
    
    IF v_user_plan IS NULL THEN
        v_user_plan := 'free';
    END IF;
    
    -- Obter limites do plano
    SELECT * INTO v_plan_limits
    FROM plan_limits_config
    WHERE plan_type = v_user_plan AND is_active = true;
    
    IF v_plan_limits IS NULL THEN
        -- Usar limites do plano free como fallback
        SELECT * INTO v_plan_limits
        FROM plan_limits_config
        WHERE plan_type = 'free' AND is_active = true;
    END IF;
    
    -- Obter uso atual baseado no tipo de ação
    CASE p_action_type
        WHEN 'upload_image' THEN
            SELECT images_uploaded INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_images_per_month;
        WHEN 'upload_video' THEN
            SELECT videos_uploaded INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_videos_per_month;
        WHEN 'send_message' THEN
            SELECT messages_sent INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_messages_per_month;
        WHEN 'create_event' THEN
            SELECT events_created INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_events_per_month;
        WHEN 'create_poll' THEN
            SELECT polls_created INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_polls_per_month;
        WHEN 'join_community' THEN
            SELECT communities_joined INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_communities_joined;
        WHEN 'create_community' THEN
            SELECT communities_created INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_communities_created;
        WHEN 'voice_call' THEN
            SELECT voice_calls_made INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_voice_calls_per_month;
        WHEN 'video_call' THEN
            SELECT video_calls_made INTO v_current_usage
            FROM get_user_usage_counters(p_user_id, v_month_year);
            v_max_allowed := v_plan_limits.max_video_calls_per_month;
        ELSE
            v_current_usage := 0;
            v_max_allowed := 0;
    END CASE;
    
    -- Verificar se pode realizar a ação
    IF v_max_allowed = 0 THEN
        RETURN QUERY SELECT 
            FALSE, 
            'Funcionalidade não disponível no seu plano'::TEXT,
            v_current_usage,
            v_max_allowed;
    ELSIF v_max_allowed = -1 THEN
        -- Ilimitado
        RETURN QUERY SELECT 
            TRUE, 
            'Ação permitida (ilimitado)'::TEXT,
            v_current_usage,
            v_max_allowed;
    ELSIF (v_current_usage + p_required_points) <= v_max_allowed THEN
        RETURN QUERY SELECT 
            TRUE, 
            'Ação permitida'::TEXT,
            v_current_usage,
            v_max_allowed;
    ELSE
        RETURN QUERY SELECT 
            FALSE, 
            format('Limite mensal excedido. Usado: %s/%s', v_current_usage, v_max_allowed)::TEXT,
            v_current_usage,
            v_max_allowed;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_usage_counters_user_month ON public.user_usage_counters(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_usage_actions_user_month ON public.usage_actions(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_usage_actions_type ON public.usage_actions(action_type);

-- RLS Policies
ALTER TABLE public.user_usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits_config ENABLE ROW LEVEL SECURITY;

-- Políticas para user_usage_counters
CREATE POLICY "Users can view their own usage counters" ON public.user_usage_counters
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage usage counters" ON public.user_usage_counters
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para usage_actions
CREATE POLICY "Users can view their own usage actions" ON public.usage_actions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage usage actions" ON public.usage_actions
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para plan_limits_config
CREATE POLICY "Anyone can view plan limits" ON public.plan_limits_config
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage plan limits" ON public.plan_limits_config
    FOR ALL USING (auth.role() = 'service_role'); 