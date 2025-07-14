-- Script para corrigir a função handle_new_user
-- Execute este script no Supabase SQL Editor

-- 1. Remover o trigger atual
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Corrigir a função handle_new_user para usar os campos corretos da tabela users
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

-- 3. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se a função foi criada corretamente
SELECT 
    'Função handle_new_user corrigida com sucesso!' as status,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 5. Teste de inserção (será revertido)
DO $$ 
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
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
        'test@example.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"username": "testuser", "full_name": "Test User"}'::jsonb
    );
    
    RAISE NOTICE 'Teste de trigger bem-sucedido para usuário ID: %', test_user_id;
    
    -- Verificar se o usuário foi criado na tabela users
    IF EXISTS (SELECT 1 FROM users WHERE id = test_user_id) THEN
        RAISE NOTICE 'Usuário criado com sucesso na tabela users';
        
        -- Verificar os dados inseridos
        SELECT 
            username, name, is_active, is_verified, is_premium, plano, status_assinatura
        INTO 
            test_user_id, test_user_id, test_user_id, test_user_id, test_user_id, test_user_id, test_user_id
        FROM users WHERE id = test_user_id;
        
        RAISE NOTICE 'Dados verificados com sucesso';
    ELSE
        RAISE NOTICE 'ERRO: Usuário não foi criado na tabela users';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM users WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE 'Dados de teste removidos';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste: %', SQLERRM;
        -- Limpar dados de teste em caso de erro
        DELETE FROM users WHERE id = test_user_id;
        DELETE FROM auth.users WHERE id = test_user_id;
END $$; 