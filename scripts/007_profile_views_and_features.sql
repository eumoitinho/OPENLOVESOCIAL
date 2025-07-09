-- Sistema de visualizações de perfil e recomendações
-- Execute este script no Supabase SQL Editor após o script 006

-- Tabela de visualizações de perfil
CREATE TABLE public.profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(viewer_id, viewed_profile_id, DATE(viewed_at)),
    CHECK (viewer_id != viewed_profile_id)
);

-- Tabela de recomendações
CREATE TABLE public.recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recommender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recommended_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recommender_id, recommended_profile_id, target_profile_id),
    CHECK (recommender_id != recommended_profile_id),
    CHECK (recommender_id != target_profile_id),
    CHECK (recommended_profile_id != target_profile_id)
);

-- Índices para performance
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_profile_id);
CREATE INDEX idx_profile_views_date ON profile_views(viewed_at);
CREATE INDEX idx_recommendations_recommender ON recommendations(recommender_id);
CREATE INDEX idx_recommendations_target ON recommendations(target_profile_id);
CREATE INDEX idx_recommendations_recommended ON recommendations(recommended_profile_id);

-- Habilitar RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

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

-- Função para registrar visualização de perfil
CREATE OR REPLACE FUNCTION register_profile_view(target_profile_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de visualizações
CREATE OR REPLACE FUNCTION get_profile_view_stats(target_profile_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_views BIGINT,
  unique_viewers BIGINT,
  views_today BIGINT,
  views_this_week BIGINT,
  views_this_month BIGINT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter recomendações recebidas
CREATE OR REPLACE FUNCTION get_received_recommendations(limit_count INTEGER DEFAULT 10)
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar recomendação
CREATE OR REPLACE FUNCTION create_recommendation(
  recommended_profile_id UUID,
  target_profile_id UUID,
  message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função de busca para incluir novos filtros
DROP FUNCTION IF EXISTS search_users(TEXT, TEXT[], TEXT, DECIMAL, DECIMAL, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION search_users(
  search_query TEXT DEFAULT '',
  interest_filter TEXT[] DEFAULT '{}',
  profile_type_filter TEXT DEFAULT '',
  user_lat DECIMAL DEFAULT NULL,
  user_lng DECIMAL DEFAULT NULL,
  max_distance_km INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[],
  location TEXT,
  profile_type VARCHAR(20),
  is_verified BOOLEAN,
  is_premium BOOLEAN,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.username, 
    p.full_name, 
    p.bio, 
    p.avatar_url, 
    p.interests,
    p.location, 
    p.profile_type,
    p.is_verified, 
    p.is_premium,
    CASE 
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
        ROUND(
          6371 * acos(
            cos(radians(user_lat)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians(user_lng)) + 
            sin(radians(user_lat)) * sin(radians(p.latitude))
          )::DECIMAL, 
          1
        )
      ELSE NULL
    END as distance_km,
    p.created_at
  FROM profiles p
  WHERE 
    p.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      search_query = '' OR 
      p.full_name ILIKE '%' || search_query || '%' OR 
      p.username ILIKE '%' || search_query || '%' OR
      p.bio ILIKE '%' || search_query || '%'
    )
    AND (
      array_length(interest_filter, 1) IS NULL OR 
      p.interests && interest_filter
    )
    AND (
      profile_type_filter = '' OR 
      p.profile_type = profile_type_filter
    )
    AND (
      max_distance_km IS NULL OR 
      user_lat IS NULL OR 
      user_lng IS NULL OR 
      p.latitude IS NULL OR 
      p.longitude IS NULL OR
      (
        6371 * acos(
          cos(radians(user_lat)) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians(user_lng)) + 
          sin(radians(user_lat)) * sin(radians(p.latitude))
        )
      ) <= max_distance_km
    )
  ORDER BY 
    CASE WHEN p.is_premium THEN 0 ELSE 1 END,
    CASE WHEN p.is_verified THEN 0 ELSE 1 END,
    distance_km NULLS LAST,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir dados de exemplo para categorias de perfil (se não existirem)
INSERT INTO interest_categories (name, description, icon, color) VALUES
('Relacionamentos', 'Encontros, namoro e relacionamentos', 'heart', '#E91E63'),
('LGBTQ+', 'Comunidade LGBTQ+ e diversidade', 'rainbow', '#9C27B0')
ON CONFLICT (name) DO NOTHING;
