-- Script para corrigir permissões de registro de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o service role existe e tem permissões básicas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        RAISE EXCEPTION 'Service role não encontrado. Verifique se o Supabase está configurado corretamente.';
    END IF;
END $$;

-- 2. Garantir permissões completas no schema public
GRANT USAGE ON SCHEMA public TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;

-- 3. Garantir permissões completas na tabela users
GRANT ALL PRIVILEGES ON TABLE users TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Desabilitar RLS temporariamente para permitir inserções do sistema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS específicas para o service role
DROP POLICY IF EXISTS "Service role full access" ON users;
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Garantir permissões em extensões necessárias
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 8. Verificar e corrigir permissões de funções específicas
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;

-- 9. Garantir permissões em todas as sequências
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.' || seq_record.sequence_name || ' TO service_role';
    END LOOP;
END $$;

-- 10. Verificar se a tabela subscriptions existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        GRANT ALL PRIVILEGES ON TABLE subscriptions TO service_role;
        ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Service role subscriptions access" ON subscriptions;
        CREATE POLICY "Service role subscriptions access" ON subscriptions
            FOR ALL USING (true) WITH CHECK (true);
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 11. Verificar se a tabela posts existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
        GRANT ALL PRIVILEGES ON TABLE posts TO service_role;
    END IF;
END $$;

-- 12. Verificar se a tabela likes existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'likes') THEN
        GRANT ALL PRIVILEGES ON TABLE likes TO service_role;
    END IF;
END $$;

-- 13. Verificar se a tabela comments existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        GRANT ALL PRIVILEGES ON TABLE comments TO service_role;
    END IF;
END $$;

-- 14. Criar função de inserção segura de usuários (atualizada)
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
    
    -- Inserir na tabela users com tratamento de erro
    BEGIN
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
            COALESCE(user_data->>'profile_type', 'single'),
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
            COALESCE(user_data->>'plano', 'free'),
            COALESCE(user_data->>'status_assinatura', 'inactive'),
            NOW(),
            NOW(),
            user_data->'partner',
            COALESCE((user_data->>'is_premium')::boolean, false),
            COALESCE((user_data->>'is_verified')::boolean, false),
            COALESCE((user_data->>'is_active')::boolean, true),
            NOW(),
            COALESCE(user_data->'privacy_settings', '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb),
            COALESCE(user_data->'stats', '{"posts": 0, "followers": 0, "following": 0, "likes_received": 0, "comments_received": 0, "profile_views": 0, "earnings": 0}'::jsonb)
        ) RETURNING id INTO user_id;
        
        RETURN user_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Erro ao inserir usuário: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Dar permissões para a função
GRANT EXECUTE ON FUNCTION insert_user_safely(JSONB) TO service_role;

-- 16. Verificar se há constraints que podem estar causando problemas
DO $$
BEGIN
    -- Verificar se há constraints de username único
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_key' 
        AND table_name = 'users'
    ) THEN
        RAISE NOTICE 'Constraint de username único encontrada';
    END IF;
    
    -- Verificar se há constraints de email único
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_email_key' 
        AND table_name = 'users'
    ) THEN
        RAISE NOTICE 'Constraint de email único encontrada';
    END IF;
END $$;

-- 17. Verificar estrutura da tabela users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem de confirmação
SELECT 'Permissões de registro corrigidas com sucesso!' as status; 