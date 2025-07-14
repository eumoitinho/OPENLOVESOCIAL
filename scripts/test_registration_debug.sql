-- Script para testar e debugar o processo de registro
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela users existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar se há triggers na tabela users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'users';

-- 3. Verificar permissões do service_role
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND grantee = 'service_role';

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 5. Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 6. Testar inserção manual (comentado para segurança)
/*
INSERT INTO users (
    id,
    email,
    username,
    name,
    first_name,
    last_name,
    profile_type,
    plano,
    status_assinatura,
    created_at,
    updated_at,
    is_premium,
    is_verified,
    is_active,
    privacy_settings,
    stats
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    'testuser',
    'Test User',
    'Test',
    'User',
    'single',
    'free',
    'authorized',
    NOW(),
    NOW(),
    false,
    false,
    true,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 0, "followers": 0, "following": 0, "likes_received": 0, "comments_received": 0, "profile_views": 0, "earnings": 0}'::jsonb
);
*/

-- 7. Verificar se há constraints que podem estar causando problemas
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'users';

-- 8. Verificar se há índices únicos que podem estar causando conflitos
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 9. Verificar se há funções que podem estar interferindo
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%';

-- 10. Verificar logs de erro recentes (se disponível)
-- Esta consulta pode não funcionar dependendo da configuração do Supabase
SELECT 
    log_time,
    user_name,
    database_name,
    process_id,
    session_id,
    command_tag,
    message
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%users%'; 