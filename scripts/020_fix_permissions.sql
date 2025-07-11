-- Script para corrigir permissões da tabela users
-- Execute este script no Supabase SQL Editor

-- Verificar se RLS está habilitado
DO $$
BEGIN
    -- Desabilitar RLS temporariamente para permitir inserções do sistema
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    
    -- Ou, se preferir manter RLS, criar políticas adequadas
    -- DROP POLICY IF EXISTS "Sistema pode inserir usuários" ON users;
    -- CREATE POLICY "Sistema pode inserir usuários" ON users
    --     FOR INSERT WITH CHECK (true);
    
    -- DROP POLICY IF EXISTS "Sistema pode atualizar usuários" ON users;
    -- CREATE POLICY "Sistema pode atualizar usuários" ON users
    --     FOR UPDATE USING (true);
    
    -- DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
    -- CREATE POLICY "Usuários podem ver seus próprios dados" ON users
    --     FOR SELECT USING (auth.uid() = id);
    
    -- DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON users;
    -- CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
    --     FOR UPDATE USING (auth.uid() = id);
END $$;

-- Garantir que o service role tem permissões adequadas
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Verificar se a tabela auth.users existe e tem as permissões corretas
DO $$
BEGIN
    -- Garantir que o service role pode acessar auth.users
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.users TO service_role;
    
    -- Garantir que o service role pode usar funções de auth
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;
END $$;

-- Criar função para inserir usuário com permissões adequadas
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

-- Mensagem de confirmação
SELECT 'Permissões corrigidas com sucesso!' as status; 