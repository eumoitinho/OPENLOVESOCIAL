-- Script para corrigir tipos de dados existentes
-- Execute este script no Supabase SQL Editor

-- Corrigir tipos de dados existentes
DO $$ 
BEGIN
    -- Se uf existir mas não for VARCHAR(2), alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'uf' 
               AND (data_type != 'character varying' OR character_maximum_length != 2)) THEN
        ALTER TABLE users ALTER COLUMN uf TYPE VARCHAR(2);
    END IF;

    -- Se latitude existir mas não for DECIMAL, alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'latitude' 
               AND data_type != 'numeric') THEN
        ALTER TABLE users ALTER COLUMN latitude TYPE DECIMAL(10, 8);
    END IF;

    -- Se longitude existir mas não for DECIMAL, alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'longitude' 
               AND data_type != 'numeric') THEN
        ALTER TABLE users ALTER COLUMN longitude TYPE DECIMAL(11, 8);
    END IF;

    -- Se birth_date existir mas não for DATE, alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'birth_date' 
               AND data_type != 'date') THEN
        ALTER TABLE users ALTER COLUMN birth_date TYPE DATE;
    END IF;
END $$;

-- Mensagem de confirmação
SELECT 'Tipos de dados corrigidos com sucesso!' as status; 