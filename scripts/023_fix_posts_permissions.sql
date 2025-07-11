-- Script para corrigir permissões das tabelas posts, likes, comments
-- Execute este script no Supabase SQL Editor

-- Desabilitar RLS nas tabelas principais
DO $$
BEGIN
    -- Desabilitar RLS na tabela posts
    ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
    
    -- Desabilitar RLS na tabela likes
    ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
    
    -- Desabilitar RLS na tabela comments
    ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
    
    -- Desabilitar RLS na tabela users (se ainda não foi feito)
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
END $$;

-- Garantir que o service role tem permissões adequadas
GRANT ALL ON TABLE posts TO service_role;
GRANT ALL ON TABLE likes TO service_role;
GRANT ALL ON TABLE comments TO service_role;
GRANT ALL ON TABLE users TO service_role;

-- Garantir que o service role pode usar o schema public
GRANT USAGE ON SCHEMA public TO service_role;

-- Criar políticas RLS básicas se preferir manter RLS habilitado
-- (Descomente se quiser usar RLS com políticas)

/*
-- Políticas para posts
DROP POLICY IF EXISTS "Posts são públicos" ON posts;
CREATE POLICY "Posts são públicos" ON posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem criar posts" ON posts;
CREATE POLICY "Usuários podem criar posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus posts" ON posts;
CREATE POLICY "Usuários podem atualizar seus posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Políticas para likes
DROP POLICY IF EXISTS "Likes são públicos" ON likes;
CREATE POLICY "Likes são públicos" ON likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem dar likes" ON likes;
CREATE POLICY "Usuários podem dar likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para comments
DROP POLICY IF EXISTS "Comments são públicos" ON comments;
CREATE POLICY "Comments são públicos" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem comentar" ON comments;
CREATE POLICY "Usuários podem comentar" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);
*/

-- Mensagem de confirmação
SELECT 'Permissões das tabelas posts, likes, comments corrigidas com sucesso!' as status; 