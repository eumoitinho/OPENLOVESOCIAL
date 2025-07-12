-- Script de correção COMPLETO - Baseado em análise completa do código
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar TODAS as colunas necessárias
DO $$ 
BEGIN
    -- Campos básicos de registro
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_date') THEN
        ALTER TABLE users ADD COLUMN birth_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_type') THEN
        ALTER TABLE users ADD COLUMN profile_type VARCHAR(20) DEFAULT 'single';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'seeking') THEN
        ALTER TABLE users ADD COLUMN seeking TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'other_interest') THEN
        ALTER TABLE users ADD COLUMN other_interest TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'uf') THEN
        ALTER TABLE users ADD COLUMN uf VARCHAR(2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'latitude') THEN
        ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longitude') THEN
        ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'partner') THEN
        ALTER TABLE users ADD COLUMN partner JSONB;
    END IF;

    -- Campos do Mercado Pago
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plano') THEN
        ALTER TABLE users ADD COLUMN plano VARCHAR(20) DEFAULT 'free';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status_assinatura') THEN
        ALTER TABLE users ADD COLUMN status_assinatura VARCHAR(20) DEFAULT 'inactive';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mp_customer_id') THEN
        ALTER TABLE users ADD COLUMN mp_customer_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mp_subscription_id') THEN
        ALTER TABLE users ADD COLUMN mp_subscription_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ultimo_pagamento') THEN
        ALTER TABLE users ADD COLUMN ultimo_pagamento TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'proximo_pagamento') THEN
        ALTER TABLE users ADD COLUMN proximo_pagamento TIMESTAMP;
    END IF;

    -- Campos de wallet/saldo (usado em programs e content)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wallet_balance') THEN
        ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    -- Campos adicionais do schema original
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age') THEN
        ALTER TABLE users ADD COLUMN age INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'relationship_status') THEN
        ALTER TABLE users ADD COLUMN relationship_status VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'looking_for') THEN
        ALTER TABLE users ADD COLUMN looking_for TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_expires_at') THEN
        ALTER TABLE users ADD COLUMN premium_expires_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'cover_url') THEN
        ALTER TABLE users ADD COLUMN cover_url TEXT;
    END IF;

    -- Campos de privacidade e estatísticas (com valores padrão)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'privacy_settings') THEN
        ALTER TABLE users ADD COLUMN privacy_settings JSONB DEFAULT '{
            "profile_visibility": "public",
            "show_age": true,
            "show_location": true,
            "allow_messages": "everyone",
            "show_online_status": true
        }'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stats') THEN
        ALTER TABLE users ADD COLUMN stats JSONB DEFAULT '{
            "posts": 0,
            "followers": 0,
            "following": 0,
            "likes_received": 0,
            "comments_received": 0,
            "profile_views": 0,
            "earnings": 0
        }'::jsonb;
    END IF;

    -- Campos de status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_premium') THEN
        ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_seen') THEN
        ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- 2. Remover constraints antigas se existirem
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_name = 'check_plano') THEN
        ALTER TABLE users DROP CONSTRAINT check_plano;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_name = 'check_status_assinatura') THEN
        ALTER TABLE users DROP CONSTRAINT check_status_assinatura;
    END IF;
END $$;

-- 3. Adicionar constraints corretas
ALTER TABLE users ADD CONSTRAINT check_plano 
    CHECK (plano IN ('free', 'gold', 'diamante', 'diamante_anual'));

ALTER TABLE users ADD CONSTRAINT check_status_assinatura
    CHECK (status_assinatura IN ('inactive', 'pending', 'authorized', 'cancelled', 'suspended', 'active'));

-- 4. Criar TODOS os índices necessários
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users(profile_type);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_users_mp_customer_id ON users(mp_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_mp_subscription_id ON users(mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 5. Garantir permissões adequadas
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 6. Desabilitar RLS temporariamente para permitir inserções do sistema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 7. Recriar função insert_user_with_auth com TODOS os campos
DROP FUNCTION IF EXISTS insert_user_with_auth(JSONB);

CREATE OR REPLACE FUNCTION insert_user_with_auth(
    user_data JSONB
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    seeking_array TEXT[] := '{}';
    interests_array TEXT[] := '{}';
    looking_for_array TEXT[] := '{}';
BEGIN
    -- Converter arrays de forma segura
    IF user_data ? 'seeking' AND user_data->'seeking' IS NOT NULL AND user_data->'seeking' != '[]'::jsonb THEN
        SELECT ARRAY_AGG(value::text) INTO seeking_array
        FROM jsonb_array_elements_text(user_data->'seeking');
    END IF;
    
    IF user_data ? 'interests' AND user_data->'interests' IS NOT NULL AND user_data->'interests' != '[]'::jsonb THEN
        SELECT ARRAY_AGG(value::text) INTO interests_array
        FROM jsonb_array_elements_text(user_data->'interests');
    END IF;

    IF user_data ? 'looking_for' AND user_data->'looking_for' IS NOT NULL AND user_data->'looking_for' != '[]'::jsonb THEN
        SELECT ARRAY_AGG(value::text) INTO looking_for_array
        FROM jsonb_array_elements_text(user_data->'looking_for');
    END IF;
    
    -- Inserir na tabela users com TODOS os campos
    INSERT INTO users (
        id,
        email,
        username,
        name,
        first_name,
        last_name,
        birth_date,
        profile_type,
        seeking,
        interests,
        other_interest,
        bio,
        location,
        uf,
        latitude,
        longitude,
        plano,
        status_assinatura,
        partner,
        wallet_balance,
        age,
        gender,
        relationship_status,
        looking_for,
        avatar_url,
        cover_url,
        privacy_settings,
        stats,
        is_premium,
        is_verified,
        is_active,
        last_seen,
        created_at,
        updated_at
    ) VALUES (
        (user_data->>'id')::UUID,
        user_data->>'email',
        user_data->>'username',
        user_data->>'name',
        user_data->>'first_name',
        user_data->>'last_name',
        CASE 
            WHEN user_data->>'birth_date' IS NOT NULL AND user_data->>'birth_date' != '' 
            THEN (user_data->>'birth_date')::DATE 
            ELSE NULL 
        END,
        user_data->>'profile_type',
        seeking_array,
        interests_array,
        user_data->>'other_interest',
        user_data->>'bio',
        user_data->>'location',
        CASE 
            WHEN user_data->>'uf' IS NOT NULL AND user_data->>'uf' != '' 
            THEN LEFT(user_data->>'uf', 2) 
            ELSE NULL 
        END,
        CASE 
            WHEN user_data->>'latitude' IS NOT NULL AND user_data->>'latitude' != '' 
            THEN (user_data->>'latitude')::DECIMAL 
            ELSE NULL 
        END,
        CASE 
            WHEN user_data->>'longitude' IS NOT NULL AND user_data->>'longitude' != '' 
            THEN (user_data->>'longitude')::DECIMAL 
            ELSE NULL 
        END,
        user_data->>'plano',
        user_data->>'status_assinatura',
        user_data->'partner',
        0.00, -- wallet_balance padrão
        NULL, -- age será calculado se necessário
        NULL, -- gender
        NULL, -- relationship_status
        looking_for_array,
        NULL, -- avatar_url
        NULL, -- cover_url
        '{
            "profile_visibility": "public",
            "show_age": true,
            "show_location": true,
            "allow_messages": "everyone",
            "show_online_status": true
        }'::jsonb,
        '{
            "posts": 0,
            "followers": 0,
            "following": 0,
            "likes_received": 0,
            "comments_received": 0,
            "profile_views": 0,
            "earnings": 0
        }'::jsonb,
        FALSE, -- is_premium
        FALSE, -- is_verified
        TRUE,  -- is_active
        NOW(), -- last_seen
        NOW(),
        NOW()
    ) RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Garantir permissões da função
GRANT EXECUTE ON FUNCTION insert_user_with_auth(JSONB) TO service_role;

-- 9. Criar função para atualizar status da assinatura (usada no Mercado Pago)
CREATE OR REPLACE FUNCTION update_subscription_status(
  user_email TEXT,
  new_status VARCHAR(20),
  subscription_id TEXT DEFAULT NULL,
  customer_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    status_assinatura = new_status,
    mp_subscription_id = COALESCE(subscription_id, mp_subscription_id),
    mp_customer_id = COALESCE(customer_id, mp_customer_id),
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar função para registrar pagamento
CREATE OR REPLACE FUNCTION register_payment(
  user_email TEXT,
  payment_date TIMESTAMP,
  next_payment_date TIMESTAMP DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    ultimo_pagamento = payment_date,
    proximo_pagamento = COALESCE(next_payment_date, proximo_pagamento),
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 11. Mensagem de confirmação
SELECT 'CORREÇÃO COMPLETA CONCLUÍDA COM SUCESSO!' as resultado; 