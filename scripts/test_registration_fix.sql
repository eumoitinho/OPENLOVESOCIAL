-- Script para diagnosticar e corrigir problemas no cadastro de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela users existe e sua estrutura
SELECT 
    'Verificando estrutura da tabela users' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar se há campos obrigatórios faltando
DO $$ 
BEGIN
    -- Adicionar campos que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
        RAISE NOTICE 'Coluna first_name adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
        RAISE NOTICE 'Coluna last_name adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'birth_date') THEN
        ALTER TABLE users ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Coluna birth_date adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_type') THEN
        ALTER TABLE users ADD COLUMN profile_type VARCHAR(20) DEFAULT 'single';
        RAISE NOTICE 'Coluna profile_type adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'seeking') THEN
        ALTER TABLE users ADD COLUMN seeking TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna seeking adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'other_interest') THEN
        ALTER TABLE users ADD COLUMN other_interest TEXT;
        RAISE NOTICE 'Coluna other_interest adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'uf') THEN
        ALTER TABLE users ADD COLUMN uf VARCHAR(2);
        RAISE NOTICE 'Coluna uf adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'latitude') THEN
        ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Coluna latitude adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'longitude') THEN
        ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Coluna longitude adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'partner') THEN
        ALTER TABLE users ADD COLUMN partner JSONB;
        RAISE NOTICE 'Coluna partner adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'plano') THEN
        ALTER TABLE users ADD COLUMN plano VARCHAR(20) DEFAULT 'free';
        RAISE NOTICE 'Coluna plano adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status_assinatura') THEN
        ALTER TABLE users ADD COLUMN status_assinatura VARCHAR(20) DEFAULT 'inactive';
        RAISE NOTICE 'Coluna status_assinatura adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'privacy_settings') THEN
        ALTER TABLE users ADD COLUMN privacy_settings JSONB DEFAULT '{
            "profile_visibility": "public",
            "show_age": true,
            "show_location": true,
            "allow_messages": "everyone",
            "show_online_status": true
        }'::jsonb;
        RAISE NOTICE 'Coluna privacy_settings adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'stats') THEN
        ALTER TABLE users ADD COLUMN stats JSONB DEFAULT '{
            "posts": 0,
            "followers": 0,
            "following": 0,
            "likes_received": 0,
            "comments_received": 0,
            "profile_views": 0,
            "earnings": 0
        }'::jsonb;
        RAISE NOTICE 'Coluna stats adicionada';
    END IF;

END $$;

-- 3. Verificar se há constraints que podem estar causando problemas
SELECT 
    'Verificando constraints da tabela users' as info;

SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND table_name = 'users';

-- 4. Verificar se há índices necessários
SELECT 
    'Verificando índices da tabela users' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
    AND schemaname = 'public';

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users(profile_type);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);

-- 6. Verificar se há RLS habilitado e políticas adequadas
SELECT 
    'Verificando RLS da tabela users' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' 
    AND schemaname = 'public';

-- 7. Habilitar RLS se não estiver habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS se não existirem
DO $$ 
BEGIN
    -- Política para permitir inserção de novos usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow user insertion') THEN
        CREATE POLICY "Allow user insertion" ON users
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política de inserção criada';
    END IF;

    -- Política para permitir que usuários vejam todos os perfis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow profile viewing') THEN
        CREATE POLICY "Allow profile viewing" ON users
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de visualização criada';
    END IF;

    -- Política para permitir que usuários atualizem seus próprios perfis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow profile updates') THEN
        CREATE POLICY "Allow profile updates" ON users
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Política de atualização criada';
    END IF;

END $$;

-- 9. Verificar se há funções necessárias
SELECT 
    'Verificando funções necessárias' as info;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%user%';

-- 10. Criar função para atualizar timestamp se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar trigger para atualizar updated_at se não existir
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Verificar se há problemas com tipos de dados
SELECT 
    'Verificando tipos de dados' as info;

-- Verificar se o tipo TEXT[] está funcionando corretamente
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND data_type = 'ARRAY';

-- 13. Teste de inserção simples
SELECT 
    'Testando inserção de usuário' as info;

-- Tentar inserir um usuário de teste (será revertido)
DO $$ 
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO users (
        id, email, username, name, first_name, last_name,
        birth_date, profile_type, seeking, interests,
        bio, location, uf, latitude, longitude,
        plano, status_assinatura, is_premium, is_verified,
        is_active, created_at, updated_at
    ) VALUES (
        test_user_id,
        'test@example.com',
        'testuser',
        'Test User',
        'Test',
        'User',
        '1990-01-01',
        'single',
        ARRAY['woman'],
        ARRAY['dating'],
        'Test bio',
        'São Paulo',
        'SP',
        23.5505,
        -46.6333,
        'free',
        'inactive',
        false,
        false,
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Teste de inserção bem-sucedido para usuário ID: %', test_user_id;
    
    -- Remover o usuário de teste
    DELETE FROM users WHERE id = test_user_id;
    RAISE NOTICE 'Usuário de teste removido';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro no teste de inserção: %', SQLERRM;
END $$;

-- 14. Verificar se há problemas com extensões
SELECT 
    'Verificando extensões necessárias' as info;

SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 15. Habilitar extensões se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 16. Resumo final
SELECT 
    'Diagnóstico concluído' as status,
    COUNT(*) as total_users
FROM users;

SELECT 
    'Estrutura da tabela users após correções:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position; 