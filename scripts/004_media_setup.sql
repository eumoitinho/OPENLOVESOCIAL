-- Configuração de mídia para ConnectHub
-- Execute este script no Supabase SQL Editor

-- Criar tabela de mídia
CREATE TABLE public.media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image' ou 'video'
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- Para vídeos, em segundos
    alt_text TEXT,
    is_profile_picture BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_profile_picture ON media(user_id, is_profile_picture) WHERE is_profile_picture = true;

-- Habilitar RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para media
CREATE POLICY "Usuários podem ver mídia pública" ON public.media
  FOR SELECT USING (is_public = true);

CREATE POLICY "Usuários podem ver sua própria mídia" ON public.media
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir sua própria mídia" ON public.media
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar sua própria mídia" ON public.media
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar sua própria mídia" ON public.media
  FOR DELETE USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para obter mídia do usuário
CREATE OR REPLACE FUNCTION get_user_media(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  url TEXT,
  filename TEXT,
  original_name TEXT,
  file_type TEXT,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  alt_text TEXT,
  is_profile_picture BOOLEAN,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.user_id, m.url, m.filename, m.original_name, m.file_type, 
         m.mime_type, m.file_size, m.width, m.height, m.duration, m.alt_text,
         m.is_profile_picture, m.is_public, m.created_at, m.updated_at
  FROM media m
  WHERE m.user_id = COALESCE(target_user_id, auth.uid())
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar tabela profiles para incluir avatar_url como referência
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_media_id UUID REFERENCES media(id) ON DELETE SET NULL;

-- Função para definir foto de perfil
CREATE OR REPLACE FUNCTION set_profile_picture(media_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  media_exists BOOLEAN;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a mídia existe e pertence ao usuário
  SELECT EXISTS(
    SELECT 1 FROM media 
    WHERE id = media_id AND user_id = current_user_id AND file_type = 'image'
  ) INTO media_exists;
  
  IF NOT media_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Remover foto de perfil anterior
  UPDATE media 
  SET is_profile_picture = FALSE 
  WHERE user_id = current_user_id AND is_profile_picture = TRUE;
  
  -- Definir nova foto de perfil
  UPDATE media 
  SET is_profile_picture = TRUE 
  WHERE id = media_id;
  
  -- Atualizar referência no perfil
  UPDATE profiles 
  SET avatar_media_id = media_id,
      avatar_url = (SELECT url FROM media WHERE id = media_id)
  WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
