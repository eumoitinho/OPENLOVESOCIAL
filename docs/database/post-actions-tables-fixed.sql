-- Script SQL corrigido para as novas funcionalidades de posts
-- Execute este script no seu banco de dados Supabase

-- 1. Tabela para bloquear usuários
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- 2. Tabela para denúncias de posts
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  UNIQUE(reporter_id, post_id)
);

-- 3. Tabela para posts ocultos pelos usuários
CREATE TABLE IF NOT EXISTS hidden_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 4. Adicionar coluna de contador de denúncias na tabela posts (se não existir)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_post ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_user ON hidden_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_post ON hidden_posts(post_id);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_posts ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para user_blocks
CREATE POLICY "user_blocks_own_access" ON user_blocks
FOR ALL USING (
  blocker_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR
  blocked_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 8. Políticas RLS para post_reports
CREATE POLICY "post_reports_own_access" ON post_reports
FOR ALL USING (
  reporter_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 9. Políticas RLS para hidden_posts
CREATE POLICY "hidden_posts_own_access" ON hidden_posts
FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- 10. Comentários nas tabelas
COMMENT ON TABLE user_blocks IS 'Tabela para armazenar bloqueios entre usuários';
COMMENT ON TABLE post_reports IS 'Tabela para armazenar denúncias de posts';
COMMENT ON TABLE hidden_posts IS 'Tabela para armazenar posts ocultos pelos usuários';

-- 11. Comentários nas colunas
COMMENT ON COLUMN post_reports.reason IS 'Motivo da denúncia (ex: spam, inappropriate_content, harassment)';
COMMENT ON COLUMN post_reports.status IS 'Status da denúncia: pending, reviewed, resolved, dismissed';
COMMENT ON COLUMN posts.report_count IS 'Contador de denúncias do post';

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'user_blocks' THEN 'Bloqueios de usuários'
    WHEN table_name = 'post_reports' THEN 'Denúncias de posts'
    WHEN table_name = 'hidden_posts' THEN 'Posts ocultos'
  END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_blocks', 'post_reports', 'hidden_posts')
ORDER BY table_name;