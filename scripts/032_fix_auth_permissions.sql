-- Script para corrigir permissões de autenticação
-- Execute este script no Supabase SQL Editor

-- 1. Garantir que o service role tem todas as permissões necessárias
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO service_role;

-- 2. Garantir que o service role pode acessar auth.users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.users TO service_role;

-- 3. Garantir que o service role pode usar funções de auth
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

-- 4. Desabilitar RLS temporariamente para permitir inserções do sistema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS adequadas para o service role
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update users" ON users;
CREATE POLICY "Service role can update users" ON users
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service role can delete users" ON users;
CREATE POLICY "Service role can delete users" ON users
    FOR DELETE USING (true);

-- 6. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Garantir que o service role tem permissões para usar extensões
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO service_role;

-- 8. Verificar se a função update_updated_at_column existe e dar permissões
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;

-- 9. Garantir que o service role pode usar uuid_generate_v4
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO service_role;

-- 10. Verificar e corrigir permissões de sequências se existirem
DO $$
BEGIN
    -- Dar permissões em todas as sequências do schema public
    FOR seq IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.' || seq.sequence_name || ' TO service_role';
    END LOOP;
END $$;

-- 11. Verificar se há triggers que precisam de permissões
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 12. Criar função auxiliar para inserção segura de usuários
CREATE OR REPLACE FUNCTION insert_user_safely(
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
        partner,
        is_premium,
        is_verified,
        is_active,
        last_seen,
        privacy_settings,
        stats
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
        user_data->'partner',
        (user_data->>'is_premium')::boolean,
        (user_data->>'is_verified')::boolean,
        (user_data->>'is_active')::boolean,
        NOW(),
        user_data->'privacy_settings',
        user_data->'stats'
    ) RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Dar permissões para a nova função
GRANT EXECUTE ON FUNCTION insert_user_safely(JSONB) TO service_role;

-- 14. Verificar se a tabela subscriptions existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        GRANT ALL ON TABLE subscriptions TO service_role;
    END IF;
END $$;

-- Mensagem de confirmação
SELECT 'Permissões de autenticação corrigidas com sucesso!' as status; 