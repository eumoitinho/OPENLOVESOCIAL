-- Script para corrigir problemas de upload de mídia
-- Data: 2025-01-XX
-- Versão: 1.0

-- =====================================================
-- 1. CRIAR BUCKET DE STORAGE PARA MÍDIA
-- =====================================================

-- Inserir bucket 'media' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CRIAR TABELA MEDIA (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
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

-- =====================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_profile_picture ON media(user_id, is_profile_picture) WHERE is_profile_picture = true;

-- =====================================================
-- 4. HABILITAR RLS E CRIAR POLÍTICAS
-- =====================================================

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para media
DROP POLICY IF EXISTS "Usuários podem ver mídia pública" ON public.media;
CREATE POLICY "Usuários podem ver mídia pública" ON public.media
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Usuários podem ver sua própria mídia" ON public.media;
CREATE POLICY "Usuários podem ver sua própria mídia" ON public.media
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem inserir sua própria mídia" ON public.media;
CREATE POLICY "Usuários podem inserir sua própria mídia" ON public.media
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem atualizar sua própria mídia" ON public.media;
CREATE POLICY "Usuários podem atualizar sua própria mídia" ON public.media
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem deletar sua própria mídia" ON public.media;
CREATE POLICY "Usuários podem deletar sua própria mídia" ON public.media
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- 5. CRIAR TRIGGER PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. CRIAR FUNÇÕES ÚTEIS
-- =====================================================

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
    WHERE id = media_id 
    AND user_id = current_user_id
  ) INTO media_exists;
  
  IF NOT media_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Remover flag de foto de perfil de outras mídias do usuário
  UPDATE media 
  SET is_profile_picture = FALSE 
  WHERE user_id = current_user_id;
  
  -- Definir a nova foto de perfil
  UPDATE media 
  SET is_profile_picture = TRUE 
  WHERE id = media_id;
  
  -- Atualizar avatar_url na tabela users
  UPDATE users 
  SET avatar_url = (SELECT url FROM media WHERE id = media_id)
  WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ATUALIZAR TABELA USERS PARA INCLUIR CAMPOS DE MÍDIA
-- =====================================================

-- Adicionar colunas de mídia se não existirem
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_media_id UUID REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL;

-- =====================================================
-- 8. CRIAR POLÍTICAS PARA STORAGE
-- =====================================================

-- Políticas para o bucket 'media'
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  ('Public Access', 'media', 'SELECT', 'true'),
  ('Authenticated users can upload', 'media', 'INSERT', 'auth.role() = ''authenticated'''),
  ('Users can update own files', 'media', 'UPDATE', 'auth.uid()::text = (storage.foldername(name))[1]'),
  ('Users can delete own files', 'media', 'DELETE', 'auth.uid()::text = (storage.foldername(name))[1]')
ON CONFLICT (name, bucket_id) DO NOTHING;

-- =====================================================
-- 9. VERIFICAR E CRIAR FUNÇÃO DE LIMPEZA
-- =====================================================

-- Função para limpar mídia órfã
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM media 
  WHERE user_id NOT IN (SELECT id FROM users);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Configuração de mídia concluída!';
  RAISE NOTICE '📦 Bucket "media" configurado';
  RAISE NOTICE '🗄️ Tabela "media" criada/atualizada';
  RAISE NOTICE '🔒 Políticas RLS configuradas';
  RAISE NOTICE '⚡ Índices de performance criados';
  RAISE NOTICE '🔄 Triggers configurados';
  RAISE NOTICE '🎯 Funções auxiliares criadas';
END $$; 