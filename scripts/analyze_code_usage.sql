-- Script para analisar especificamente o uso da tabela users
-- Execute este script no SQL Editor do Supabase

-- =============================================
-- ANÁLISE ESPECÍFICA DA TABELA USERS
-- =============================================

SELECT '=== ANÁLISE ESPECÍFICA DA TABELA USERS ===' as section;

-- 1. Verificar se a tabela users existe em ambos os schemas
SELECT 
    'SCHEMA CHECK' as analysis_type,
    'auth.users' as table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) as exists_check
UNION ALL
SELECT 
    'SCHEMA CHECK' as analysis_type,
    'public.users' as table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) as exists_check;

-- 2. Estrutura detalhada da tabela users (se existir)
SELECT 
    'USERS TABLE STRUCTURE' as analysis_type,
    table_schema,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name, ordinal_position;

-- 3. Constraints da tabela users
SELECT 
    'USERS CONSTRAINTS' as analysis_type,
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users' 
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- 4. Índices da tabela users
SELECT 
    'USERS INDEXES' as analysis_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
    AND schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, indexname;

-- 5. RLS da tabela users
SELECT 
    'USERS RLS STATUS' as analysis_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' 
    AND schemaname IN ('public', 'auth');

-- 6. Políticas RLS da tabela users
SELECT 
    'USERS RLS POLICIES' as analysis_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
    AND schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, policyname;

-- 7. Permissões da tabela users
SELECT 
    'USERS PERMISSIONS' as analysis_type,
    table_schema,
    table_name,
    privilege_type,
    grantee,
    grantor
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
    AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name, privilege_type;

-- 8. Triggers da tabela users
SELECT 
    'USERS TRIGGERS' as analysis_type,
    n.nspname as schema_name,
    t.relname as table_name,
    tg.tgname as trigger_name,
    p.proname as function_name,
    tg.tgtype,
    tg.tgenabled,
    tg.tgisinternal
FROM pg_trigger tg
JOIN pg_class t ON t.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
JOIN pg_proc p ON p.oid = tg.tgfoid
WHERE t.relname = 'users' 
    AND n.nspname IN ('public', 'auth')
ORDER BY n.nspname, t.relname, tg.tgname;

-- 9. Funções que referenciam a tabela users
SELECT 
    'FUNCTIONS REFERENCING USERS' as analysis_type,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%users%'
    AND n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- 10. Definições das funções que referenciam users
SELECT 
    'FUNCTION DEFINITIONS WITH USERS' as analysis_type,
    'FUNCTION: ' || n.nspname || '.' || p.proname as function_info,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%users%'
    AND n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- 11. Verificar se há dados na tabela users
SELECT 
    'USERS DATA COUNT' as analysis_type,
    schemaname,
    tablename,
    n_live_tup as record_count
FROM pg_stat_user_tables 
WHERE tablename = 'users' 
    AND schemaname IN ('public', 'auth');

-- 12. Verificar foreign keys que apontam para users
SELECT 
    'FOREIGN KEYS TO USERS' as analysis_type,
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema AS referenced_schema,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND ccu.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- 13. Verificar foreign keys que saem de users
SELECT 
    'FOREIGN KEYS FROM USERS' as analysis_type,
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema AS referenced_schema,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'users'
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- 14. Verificar se há views que usam a tabela users
SELECT 
    'VIEWS USING USERS' as analysis_type,
    table_schema,
    table_name,
    view_definition
FROM information_schema.views 
WHERE view_definition ILIKE '%users%'
    AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- 15. Resumo da análise
SELECT '=== RESUMO DA ANÁLISE USERS ===' as section;

SELECT 
    'TABLES' as object_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'users' 
    AND table_schema IN ('public', 'auth')
UNION ALL
SELECT 
    'COLUMNS' as object_type,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema IN ('public', 'auth')
UNION ALL
SELECT 
    'CONSTRAINTS' as object_type,
    COUNT(*) as count
FROM information_schema.table_constraints 
WHERE table_name = 'users' 
    AND table_schema IN ('public', 'auth')
UNION ALL
SELECT 
    'INDEXES' as object_type,
    COUNT(*) as count
FROM pg_indexes 
WHERE tablename = 'users' 
    AND schemaname IN ('public', 'auth')
UNION ALL
SELECT 
    'FUNCTIONS' as object_type,
    COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%users%'
    AND n.nspname IN ('public', 'auth');

-- =============================================
-- FIM DA ANÁLISE
-- =============================================

SELECT '=== ANÁLISE USERS FINALIZADA ===' as final_message; 