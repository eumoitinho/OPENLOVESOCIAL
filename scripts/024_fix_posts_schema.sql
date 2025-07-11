-- Script para verificar e corrigir a estrutura da tabela posts
-- Verificar se a tabela posts existe e tem a estrutura correta

-- 1. Verificar se a tabela posts existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE EXCEPTION 'Tabela posts não existe!';
    END IF;
END $$;

-- 2. Verificar e adicionar colunas necessárias
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS event_details JSONB,
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_premium_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'::jsonb;

-- 3. Remover colunas antigas se existirem
ALTER TABLE posts DROP COLUMN IF EXISTS media_url;
ALTER TABLE posts DROP COLUMN IF EXISTS media_type;

-- 4. Verificar se a coluna user_id existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        -- Se não existe user_id, verificar se existe author_id
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
            -- Renomear author_id para user_id
            ALTER TABLE posts RENAME COLUMN author_id TO user_id;
        ELSE
            -- Adicionar user_id se não existir nenhuma das duas
            ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 5. Garantir que user_id é NOT NULL
ALTER TABLE posts ALTER COLUMN user_id SET NOT NULL;

-- 6. Verificar e criar índices necessários
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);

-- 7. Verificar e criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Desabilitar RLS e garantir permissões
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE posts TO service_role;
GRANT ALL ON TABLE posts TO authenticated;
GRANT ALL ON TABLE posts TO anon;

-- 9. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- 10. Verificar se há posts de teste
SELECT COUNT(*) as total_posts FROM posts;

-- 11. Inserir post de teste se não houver nenhum
INSERT INTO posts (user_id, content, visibility, created_at)
SELECT 
    u.id,
    'Este é um post de teste para verificar se a funcionalidade está funcionando!',
    'public',
    NOW()
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM posts LIMIT 1)
LIMIT 1;

SELECT 'Estrutura da tabela posts corrigida com sucesso!' as status; 