-- Script para testar o sistema de autenticação e timeout de sessão
-- Execute este script para verificar se o sistema está funcionando corretamente

-- 1. Verificar se as tabelas de autenticação existem
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name IN ('users', 'sessions', 'identities')
ORDER BY table_name, ordinal_position;

-- 2. Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'posts', 'profile_views', 'friends', 'follows')
ORDER BY tablename, policyname;

-- 3. Verificar se as funções de autenticação existem
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'register_profile_view',
    'can_send_message',
    'search_users',
    'get_user_stats'
)
ORDER BY routine_name;

-- 4. Testar a função de registro de visualização de perfil
-- (Execute apenas se houver usuários no sistema)
DO $$
DECLARE
    test_user_id UUID;
    test_profile_id UUID;
    result BOOLEAN;
BEGIN
    -- Pegar um usuário de teste
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Pegar um perfil de teste (diferente do usuário)
        SELECT id INTO test_profile_id FROM public.users 
        WHERE id != test_user_id LIMIT 1;
        
        IF test_profile_id IS NOT NULL THEN
            -- Testar a função
            SELECT register_profile_view(test_profile_id) INTO result;
            RAISE NOTICE 'Teste de registro de visualização: %', result;
        ELSE
            RAISE NOTICE 'Nenhum perfil de teste encontrado';
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário de teste encontrado';
    END IF;
END $$;

-- 5. Verificar configurações de sessão
SELECT 
    name,
    setting,
    unit,
    context
FROM pg_settings 
WHERE name IN (
    'session_timeout',
    'idle_in_transaction_session_timeout',
    'statement_timeout'
);

-- 6. Verificar se as triggers estão funcionando
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'posts', 'profile_views')
ORDER BY event_object_table, trigger_name;

-- 7. Verificar permissões de usuários
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN ('users', 'posts', 'profile_views', 'friends', 'follows')
AND grantee IN ('authenticated', 'anon')
ORDER BY grantee, table_name, privilege_type;

-- 8. Verificar se as views estão funcionando
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE '%view%'
ORDER BY table_name;

-- 9. Testar busca de usuários (se a função existir)
DO $$
DECLARE
    search_result RECORD;
BEGIN
    -- Testar busca simples
    BEGIN
        SELECT * INTO search_result FROM search_users('test', 10, 0);
        RAISE NOTICE 'Função search_users está funcionando';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Função search_users não encontrada ou com erro: %', SQLERRM;
    END;
END $$;

-- 10. Verificar integridade dos dados
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN email IS NULL THEN 1 END) as null_emails,
    COUNT(CASE WHEN username IS NULL THEN 1 END) as null_usernames
FROM public.users

UNION ALL

SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids,
    COUNT(CASE WHEN content IS NULL THEN 1 END) as null_content
FROM public.posts

UNION ALL

SELECT 
    'profile_views' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN profile_id IS NULL THEN 1 END) as null_profile_ids,
    COUNT(CASE WHEN viewer_id IS NULL THEN 1 END) as null_viewer_ids
FROM public.profile_views;

-- 11. Verificar configurações de autenticação do Supabase
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_emails,
    COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) as active_users
FROM auth.users;

-- 12. Verificar sessões ativas
SELECT 
    'auth.sessions' as table_name,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN expires_at > EXTRACT(EPOCH FROM NOW()) THEN 1 END) as active_sessions,
    COUNT(CASE WHEN expires_at <= EXTRACT(EPOCH FROM NOW()) THEN 1 END) as expired_sessions
FROM auth.sessions;

-- 13. Relatório final
SELECT 
    'RELATÓRIO DE AUTENTICAÇÃO' as status,
    NOW() as checked_at,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM auth.sessions WHERE expires_at > EXTRACT(EPOCH FROM NOW())) as active_sessions,
    (SELECT COUNT(*) FROM public.users) as total_profiles,
    (SELECT COUNT(*) FROM public.posts) as total_posts; 