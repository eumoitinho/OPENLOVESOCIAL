-- Script para adicionar coluna birth_date à tabela users
-- Execute este script no Supabase SQL Editor

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
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_profile_type ON users(profile_type);

-- Mensagem de confirmação
SELECT 'Coluna birth_date e outras colunas adicionadas com sucesso!' as status; 