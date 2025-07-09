-- Sistema de visualizações de perfil e recomendações (CORRIGIDO)
-- Execute este script no Supabase SQL Editor após o script 006

-- Tabela de visualizações de perfil
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint única após criar a tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profile_views_unique_daily'
    ) THEN
        ALTER TABLE public.profile_views 
        ADD CONSTRAINT profile_views_unique_daily 
        UNIQUE(viewer_id, viewed_profile_id, DATE(viewed_at));
    END IF;
END $$;

-- Adicionar constraint de check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profile_views_no_self_view'
    ) THEN
        ALTER TABLE public.profile_views 
        ADD CONSTRAINT profile_views_no_self_view 
        CHECK (viewer_id != viewed_profile_id);
    END IF;
END $$;

-- Tabela de recomendações
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recommender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recommended_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraints para recommendations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recommendations_unique'
    ) THEN
        ALTER TABLE public.recommendations 
        ADD CONSTRAINT recommendations_unique 
        UNIQUE(recommender_id, recommended_profile_id, target_profile_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recommendations_no_self_recommend'
    ) THEN
        ALTER TABLE public.recommendations 
        ADD CONSTRAINT recommendations_no_self_recommend 
        CHECK (recommender_id != recommended_profile_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recommendations_no_self_target'
    ) THEN
        ALTER TABLE public.recommendations 
        ADD CONSTRAINT recommendations_no_self_target 
        CHECK (recommender_id != target_profile_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'recommendations_different_profiles'
    ) THEN
        ALTER TABLE public.recommendations 
        ADD CONSTRAINT recommendations_different_profiles 
        CHECK (recommended_profile_id != target_profile_id);
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_date ON profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_recommender ON recommendations(recommender_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_target ON recommendations(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_recommended ON recommendations(recommended_profile_id);

-- Habilitar RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Usuários podem ver suas próprias visualizações" ON public.profile_views;
DROP POLICY IF EXISTS "Donos de perfil premium podem ver quem os visualizou" ON public.profile_views;
DROP POLICY IF EXISTS "Usuários podem registrar visualizações" ON public.profile_views;
DROP POLICY IF EXISTS "Usuários podem ver recomendações que receberam" ON public.recommendations;
DROP POLICY IF EXISTS "Usuários podem ver recomendações que fizeram" ON public.recommendations;
DROP POLICY IF EXISTS "Usuários podem criar recomendações" ON public.recommendations;

-- Políticas RLS para profile_views
CREATE POLICY "Usuários podem ver suas próprias visualizações" ON public.profile_views
  FOR SELECT USING (viewer_id = auth.uid());

CREATE POLICY "Donos de perfil premium podem ver quem os visualizou" ON public.profile_views
  FOR SELECT USING (
    viewed_profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_premium = TRUE)
  );

CREATE POLICY "Usuários podem registrar visualizações" ON public.profile_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Políticas RLS para recommendations
CREATE POLICY "Usuários podem ver recomendações que receberam" ON public.recommendations
  FOR SELECT USING (target_profile_id = auth.uid());

CREATE POLICY "Usuários podem ver recomendações que fizeram" ON public.recommendations
  FOR SELECT USING (recommender_id = auth.uid());

CREATE POLICY "Usuários podem criar recomendações" ON public.recommendations
  FOR INSERT WITH CHECK (recommender_id = auth.uid());

-- Remover funções existentes se existirem
DROP FUNCTION IF EXISTS register_profile_view(UUID);
DROP FUNCTION IF EXISTS get_profile_view_stats(UUID);
DROP FUNCTION IF EXISTS get_received_recommendations(INTEGER);
DROP FUNCTION IF EXISTS create_recommendation(UUID, UUID, TEXT);

-- Função para registrar visualização de perfil
CREATE FUNCTION register_profile_view(target_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR current_user_id = target_profile_id THEN
    RETURN FALSE;
  END IF;
  
  -- Inserir visualização (constraint UNIQUE previne duplicatas no mesmo dia)
  INSERT INTO profile_views (viewer_id, viewed_profile_id)
  VALUES (current_user_id, target_profile_id)
  ON CONFLICT (viewer_id, viewed_profile_id, DATE(viewed_at)) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Função para obter estatísticas de visualizações
CREATE FUNCTION get_profile_view_stats(target_profile_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_views BIGINT,
  unique_viewers BIGINT,
  views_today BIGINT,
  views_this_week BIGINT,
  views_this_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  profile_id := COALESCE(target_profile_id, auth.uid());
  
  IF profile_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT viewer_id)::BIGINT as unique_viewers,
    COUNT(CASE WHEN DATE(viewed_at) = CURRENT_DATE THEN 1 END)::BIGINT as views_today,
    COUNT(CASE WHEN viewed_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END)::BIGINT as views_this_week,
    COUNT(CASE WHEN viewed_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::BIGINT as views_this_month
  FROM profile_views 
  WHERE viewed_profile_id = profile_id;
END;
$$;

-- Função para obter recomendações recebidas
CREATE FUNCTION get_received_recommendations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  recommender_username VARCHAR(50),
  recommender_full_name TEXT,
  recommender_avatar_url TEXT,
  recommended_username VARCHAR(50),
  recommended_full_name TEXT,
  recommended_avatar_url TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    p1.username as recommender_username,
    p1.full_name as recommender_full_name,
    p1.avatar_url as recommender_avatar_url,
    p2.username as recommended_username,
    p2.full_name as recommended_full_name,
    p2.avatar_url as recommended_avatar_url,
    r.message,
    r.created_at
  FROM recommendations r
  JOIN profiles p1 ON r.recommender_id = p1.id
  JOIN profiles p2 ON r.recommended_profile_id = p2.id
  WHERE r.target_profile_id = auth.uid()
  ORDER BY r.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Função para criar recomendação
CREATE FUNCTION create_recommendation(
  recommended_profile_id UUID,
  target_profile_id UUID,
  message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se todos os perfis são diferentes
  IF current_user_id = recommended_profile_id OR 
     current_user_id = target_profile_id OR 
     recommended_profile_id = target_profile_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se os perfis existem
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = recommended_profile_id) OR
     NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_profile_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Inserir recomendação
  INSERT INTO recommendations (recommender_id, recommended_profile_id, target_profile_id, message)
  VALUES (current_user_id, recommended_profile_id, target_profile_id, message)
  ON CONFLICT (recommender_id, recommended_profile_id, target_profile_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Inserir dados de exemplo para categorias de perfil (se não existirem)
INSERT INTO interest_categories (name, description, icon, color) VALUES
('Relacionamentos', 'Encontros, namoro e relacionamentos', 'heart', '#E91E63'),
('LGBTQ+', 'Comunidade LGBTQ+ e diversidade', 'rainbow', '#9C27B0')
ON CONFLICT (name) DO NOTHING;
