-- Script para verificar e corrigir a estrutura da tabela users
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não existe. Execute primeiro o script 016_complete_openlove_schema.sql';
    END IF;
END $$;

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Adicionar coluna birth_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'birth_date') THEN
        ALTER TABLE users ADD COLUMN birth_date DATE;
        COMMENT ON COLUMN users.birth_date IS 'Data de nascimento do usuário';
    END IF;

    -- Adicionar coluna first_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
    END IF;

    -- Adicionar coluna last_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    END IF;

    -- Adicionar coluna profile_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_type') THEN
        ALTER TABLE users ADD COLUMN profile_type VARCHAR(20) DEFAULT 'single';
    END IF;

    -- Adicionar coluna seeking se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'seeking') THEN
        ALTER TABLE users ADD COLUMN seeking TEXT[];
    END IF;

    -- Adicionar coluna other_interest se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'other_interest') THEN
        ALTER TABLE users ADD COLUMN other_interest TEXT;
    END IF;

    -- Adicionar coluna uf se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'uf') THEN
        ALTER TABLE users ADD COLUMN uf VARCHAR(2);
    END IF;

    -- Adicionar coluna latitude se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'latitude') THEN
        ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    -- Adicionar coluna longitude se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'longitude') THEN
        ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    -- Adicionar coluna partner se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'partner') THEN
        ALTER TABLE users ADD COLUMN partner JSONB;
    END IF;

    -- Adicionar coluna plano se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'plano') THEN
        ALTER TABLE users ADD COLUMN plano VARCHAR(20) DEFAULT 'free';
    END IF;

    -- Adicionar coluna status_assinatura se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status_assinatura') THEN
        ALTER TABLE users ADD COLUMN status_assinatura VARCHAR(20) DEFAULT 'inactive';
    END IF;
END $$;

-- Remover constraints antigas se existirem
DO $$
BEGIN
    -- Remover constraint de plano se existir
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'users' AND constraint_name = 'check_plano') THEN
        ALTER TABLE users DROP CONSTRAINT check_plano;
    END IF;

    -- Remover constraint de status_assinatura se existir
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'users' AND constraint_name = 'check_status_assinatura') THEN
        ALTER TABLE users DROP CONSTRAINT check_status_assinatura;
    END IF;
END $$;

-- Adicionar constraints corretas
ALTER TABLE users ADD CONSTRAINT check_plano 
    CHECK (plano IN ('free', 'gold', 'diamante', 'diamante_anual'));

ALTER TABLE users ADD CONSTRAINT check_status_assinatura
    CHECK (status_assinatura IN ('inactive', 'pending', 'authorized', 'cancelled', 'suspended', 'active'));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users(profile_type);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);

-- Verificar se a função insert_user_with_auth existe e recriar se necessário
DROP FUNCTION IF EXISTS insert_user_with_auth(JSONB);

CREATE OR REPLACE FUNCTION insert_user_with_auth(
    user_data JSONB
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    seeking_array TEXT[] := '{}';
    interests_array TEXT[] := '{}';
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
    
    -- Inserir na tabela users
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
        created_at,
        updated_at,
        partner
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
        NOW(),
        NOW(),
        user_data->'partner'
    ) RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissões adequadas
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION insert_user_with_auth(JSONB) TO service_role;

-- Desabilitar RLS temporariamente para permitir inserções do sistema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Mensagem de confirmação
SELECT 'Estrutura da tabela users corrigida com sucesso!' as status; 