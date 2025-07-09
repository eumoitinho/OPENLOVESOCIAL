-- Sistema de amizades e novas regras do ConnectHub
-- Execute este script no Supabase SQL Editor

-- Tabela de amizades
CREATE TABLE public.friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Adicionar campos necessários à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20) DEFAULT 'single' CHECK (profile_type IN ('single', 'couple', 'trans', 'other'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_changed BOOLEAN DEFAULT FALSE;

-- Adicionar campo de visibilidade à tabela media
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends_only'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_visibility ON media(visibility);

-- Habilitar RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para friends
CREATE POLICY "Usuários podem ver suas próprias amizades" ON public.friends
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Usuários podem criar solicitações de amizade" ON public.friends
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas amizades" ON public.friends
  FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas amizades" ON public.friends
  FOR DELETE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Atualizar política de mídia para considerar visibilidade
DROP POLICY IF EXISTS "Usuários podem ver mídia pública" ON public.media;
CREATE POLICY "Usuários podem ver mídia baseada na visibilidade" ON public.media
  FOR SELECT USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR
    (visibility = 'friends_only' AND EXISTS (
      SELECT 1 FROM friends 
      WHERE ((user_id = auth.uid() AND friend_id = media.user_id) OR 
             (friend_id = auth.uid() AND user_id = media.user_id))
      AND status = 'accepted'
    ))
  );

-- Trigger para updated_at
CREATE TRIGGER update_friends_updated_at 
  BEFORE UPDATE ON friends 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se dois usuários são amigos mútuos
CREATE OR REPLACE FUNCTION are_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friends 
    WHERE ((user_id = user1_id AND friend_id = user2_id) OR 
           (user_id = user2_id AND friend_id = user1_id))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode enviar mensagem
CREATE OR REPLACE FUNCTION can_send_message(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  current_user_premium BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o usuário atual é premium
  SELECT is_premium INTO current_user_premium
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Se for premium, pode enviar para qualquer um
  IF current_user_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Se não for premium, só pode enviar para amigos
  RETURN are_mutual_friends(current_user_id, target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para enviar solicitação de amizade
CREATE OR REPLACE FUNCTION send_friend_request(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR current_user_id = target_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se já existe uma solicitação
  IF EXISTS (
    SELECT 1 FROM friends 
    WHERE (user_id = current_user_id AND friend_id = target_user_id) OR
          (user_id = target_user_id AND friend_id = current_user_id)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Criar solicitação
  INSERT INTO friends (user_id, friend_id, status)
  VALUES (current_user_id, target_user_id, 'pending');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar/recusar solicitação de amizade
CREATE OR REPLACE FUNCTION respond_friend_request(requester_id UUID, response VARCHAR(20))
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR response NOT IN ('accepted', 'declined') THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE friends 
  SET status = response, updated_at = NOW()
  WHERE user_id = requester_id AND friend_id = current_user_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar usuários com filtros avançados
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
