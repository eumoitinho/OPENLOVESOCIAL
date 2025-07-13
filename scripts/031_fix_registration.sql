-- Script para corrigir problemas de cadastro de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de assinaturas se não existir
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    stripe_subscription_id TEXT,
    mercadopago_subscription_id TEXT,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar e corrigir estrutura da tabela users
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

-- 3. Criar índices necessários
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users(profile_type);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para users
DO $$ 
BEGIN
    -- Política para permitir inserção de novos usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow user insertion') THEN
        CREATE POLICY "Allow user insertion" ON users
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política de inserção criada para users';
    END IF;

    -- Política para permitir que usuários vejam todos os perfis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow profile viewing') THEN
        CREATE POLICY "Allow profile viewing" ON users
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de visualização criada para users';
    END IF;

    -- Política para permitir que usuários atualizem seus próprios perfis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow profile updates') THEN
        CREATE POLICY "Allow profile updates" ON users
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Política de atualização criada para users';
    END IF;

END $$;

-- 6. Criar políticas RLS para subscriptions
DO $$ 
BEGIN
    -- Política para permitir inserção de assinaturas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Allow subscription insertion') THEN
        CREATE POLICY "Allow subscription insertion" ON subscriptions
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política de inserção criada para subscriptions';
    END IF;

    -- Política para permitir que usuários vejam suas próprias assinaturas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Allow subscription viewing') THEN
        CREATE POLICY "Allow subscription viewing" ON subscriptions
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Política de visualização criada para subscriptions';
    END IF;

    -- Política para permitir que usuários atualizem suas próprias assinaturas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Allow subscription updates') THEN
        CREATE POLICY "Allow subscription updates" ON subscriptions
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política de atualização criada para subscriptions';
    END IF;

END $$;

-- 7. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 10. Função para verificar se username está disponível
CREATE OR REPLACE FUNCTION is_username_available(username_to_check VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users WHERE LOWER(username) = LOWER(username_to_check)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função para verificar se email está disponível
CREATE OR REPLACE FUNCTION is_email_available(email_to_check VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM users WHERE LOWER(email) = LOWER(email_to_check)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Teste de inserção
SELECT 
    'Testando inserção de usuário' as info;

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

-- 13. Verificar estrutura final
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

-- 14. Resumo final
SELECT 
    'Correções aplicadas com sucesso!' as status,
    COUNT(*) as total_users_existentes
FROM users; 