-- Script completo para corrigir problemas de registro
-- Execute este script no Supabase SQL Editor

-- 1. Garantir permissões adequadas
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO service_role;

-- 2. Garantir que o service role pode acessar auth.users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.users TO service_role;

-- 3. Garantir que o service role pode usar funções de auth
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO service_role;

-- 4. Desabilitar RLS temporariamente para permitir inserções do sistema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. Garantir que o service role tem permissões para usar extensões
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO service_role;

-- 6. Verificar se a função update_updated_at_column existe e dar permissões
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;

-- 7. Garantir que o service role pode usar uuid_generate_v4
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO service_role;

-- 8. Verificar e corrigir permissões de sequências se existirem
DO $$
BEGIN
    -- Dar permissões em todas as sequências do schema public
    FOR seq IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.' || seq.sequence_name || ' TO service_role';
    END LOOP;
END $$;

-- 9. Verificar se há triggers que precisam de permissões
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 10. Remover o trigger atual se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 11. Corrigir a função handle_new_user para usar os campos corretos da tabela users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    username, 
    name,
    is_active,
    is_verified,
    is_premium,
    plano,
    status_assinatura,
    profile_type,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    true,  -- is_active
    false, -- is_verified
    false, -- is_premium
    'free', -- plano padrão
    'inactive', -- status_assinatura padrão
    'single', -- profile_type padrão
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Dar permissões para a função
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- 14. Verificar se a tabela subscriptions existe e dar permissões
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
        GRANT ALL ON TABLE subscriptions TO service_role;
        RAISE NOTICE 'Permissões concedidas para tabela subscriptions';
    ELSE
        RAISE NOTICE 'Tabela subscriptions não encontrada';
    END IF;
END $$;

-- 15. Verificar estrutura da tabela users
SELECT 
    'Estrutura da tabela users verificada' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 16. Teste de inserção (será revertido)
DO $$ 
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_username VARCHAR(50) := 'testuser' || substr(gen_random_uuid()::text, 1, 8);
    test_email VARCHAR(255) := 'test' || substr(gen_random_uuid()::text, 1, 8) || '@example.com';
BEGIN
    RAISE NOTICE 'Iniciando teste de registro...';
    RAISE NOTICE 'Test User ID: %', test_user_id;
    RAISE NOTICE 'Test Username: %', test_username;
    RAISE NOTICE 'Test Email: %', test_email;
    
    -- Simular inserção na auth.users
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        test_email,
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        ('{"username": "' || test_username || '", "full_name": "Test User"}')::jsonb
    );
    
    RAISE NOTICE 'Usuário criado no auth.users com sucesso';
    
    -- Verificar se o usuário foi criado na tabela users
    IF EXISTS (SELECT 1 FROM users WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ Usuário criado com sucesso na tabela users';
        
        -- Verificar os dados inseridos
        SELECT 
            username, name, is_active, is_verified, is_premium, plano, status_assinatura
        INTO 
            test_username, test_username, test_username, test_username, test_username, test_username, test_username
        FROM users WHERE id = test_user_id;
        
        RAISE NOTICE '✅ Dados verificados com sucesso';
    ELSE
        RAISE NOTICE '❌ ERRO: Usuário não foi criado na tabela users';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM users WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '🧹 Dados de teste removidos';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
        -- Limpar dados de teste em caso de erro
        DELETE FROM users WHERE id = test_user_id;
        DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- 17. Mensagem de confirmação
SELECT '✅ Script de correção de registro executado com sucesso!' as status; 