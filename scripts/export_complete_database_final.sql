-- Script para exportar COMPLETAMENTE a estrutura do banco de dados (VERSÃO FINAL)
-- Execute este script no SQL Editor do Supabase e cole o resultado completo

-- =============================================
-- 1. INFORMAÇÕES GERAIS DO BANCO
-- =============================================

SELECT '=== INFORMAÇÕES GERAIS ===' as section;

-- Versão do PostgreSQL
SELECT version() as postgresql_version;

-- Extensões habilitadas
SELECT extname, extversion 
FROM pg_extension 
ORDER BY extname;

-- Schemas existentes
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- =============================================
-- 2. ESTRUTURA COMPLETA DE TODAS AS TABELAS
-- =============================================

SELECT '=== ESTRUTURA COMPLETA DE TODAS AS TABELAS ===' as section;

-- Lista de todas as tabelas (usando information_schema)
SELECT 
    table_schema as schemaname,
    table_name as tablename,
    table_type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
    AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

-- Estrutura detalhada de cada tabela
SELECT 
    'TABLE STRUCTURE: ' || table_schema || '.' || table_name as table_info,
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name, ordinal_position;

-- =============================================
-- 3. CONSTRAINTS E CHAVES
-- =============================================

SELECT '=== CONSTRAINTS E CHAVES ===' as section;

-- Primary Keys
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    'PRIMARY KEY' as constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- Foreign Keys
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'FOREIGN KEY' as constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- Check Constraints
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause,
    'CHECK' as constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- Unique Constraints
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    'UNIQUE' as constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name;

-- =============================================
-- 4. ÍNDICES COMPLETOS
-- =============================================

SELECT '=== ÍNDICES COMPLETOS ===' as section;

-- Todos os índices (usando pg_indexes)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, indexname;

-- Índices do sistema (incluindo índices automáticos)
SELECT 
    n.nspname as schema_name,
    t.relname as table_name,
    i.relname as index_name,
    pg_get_indexdef(i.oid) as index_definition
FROM pg_index x
JOIN pg_class t ON t.oid = x.indrelid
JOIN pg_class i ON i.oid = x.indexrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname IN ('public', 'auth')
    AND t.relkind = 'r'
ORDER BY n.nspname, t.relname, i.relname;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

SELECT '=== ROW LEVEL SECURITY (RLS) ===' as section;

-- Status RLS por tabela (usando pg_class)
SELECT 
    n.nspname as schemaname,
    c.relname as tablename,
    c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'auth')
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
ORDER BY n.nspname, c.relname;

-- Políticas RLS
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
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, policyname;

-- =============================================
-- 6. FUNÇÕES E PROCEDIMENTOS
-- =============================================

SELECT '=== FUNÇÕES E PROCEDIMENTOS ===' as section;

-- Lista de todas as funções
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer,
    p.provolatile as volatility,
    p.proparallel as parallel_safety
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- Definição completa das funções
SELECT 
    'FUNCTION DEFINITION: ' || n.nspname || '.' || p.proname as function_info,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- =============================================
-- 7. TRIGGERS
-- =============================================

SELECT '=== TRIGGERS ===' as section;

-- Lista de triggers
SELECT 
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
WHERE n.nspname IN ('public', 'auth')
    AND NOT tg.tgisinternal
ORDER BY n.nspname, t.relname, tg.tgname;

-- Definição dos triggers
SELECT 
    'TRIGGER DEFINITION: ' || n.nspname || '.' || t.relname || '.' || tg.tgname as trigger_info,
    pg_get_triggerdef(tg.oid) as trigger_definition
FROM pg_trigger tg
JOIN pg_class t ON t.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname IN ('public', 'auth')
    AND NOT tg.tgisinternal
ORDER BY n.nspname, t.relname, tg.tgname;

-- =============================================
-- 8. VIEWS
-- =============================================

SELECT '=== VIEWS ===' as section;

-- Lista de views
SELECT 
    table_schema,
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- =============================================
-- 9. SEQUENCES
-- =============================================

SELECT '=== SEQUENCES ===' as section;

-- Lista de sequences
SELECT 
    sequence_schema,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment,
    cycle_option
FROM information_schema.sequences 
WHERE sequence_schema IN ('public', 'auth')
ORDER BY sequence_schema, sequence_name;

-- =============================================
-- 10. TYPES E ENUMS
-- =============================================

SELECT '=== TYPES E ENUMS ===' as section;

-- Tipos customizados
SELECT 
    n.nspname as schema_name,
    t.typname as type_name,
    t.typtype as type_type,
    t.typcategory as type_category
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'auth')
    AND t.typtype IN ('c', 'e') -- composite and enum
ORDER BY n.nspname, t.typname;

-- Valores de enums
SELECT 
    n.nspname as schema_name,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'auth')
ORDER BY n.nspname, t.typname, e.enumsortorder;

-- =============================================
-- 11. PERMISSÕES E ROLES
-- =============================================

SELECT '=== PERMISSÕES E ROLES ===' as section;

-- Permissões de tabelas
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee,
    grantor
FROM information_schema.table_privileges 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name, privilege_type;

-- Permissões de funções
SELECT 
    routine_schema,
    routine_name,
    privilege_type,
    grantee,
    grantor
FROM information_schema.routine_privileges 
WHERE routine_schema IN ('public', 'auth')
ORDER BY routine_schema, routine_name, privilege_type;

-- =============================================
-- 12. DADOS DE EXEMPLO (ESTRUTURA)
-- =============================================

SELECT '=== DADOS DE EXEMPLO (ESTRUTURA) ===' as section;

-- Contagem de registros por tabela (usando pg_stat_user_tables)
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- =============================================
-- 13. CONFIGURAÇÕES ESPECÍFICAS DO SUPABASE
-- =============================================

SELECT '=== CONFIGURAÇÕES SUPABASE ===' as section;

-- Verificar se auth.users existe e sua estrutura
SELECT 
    'AUTH.USERS EXISTS' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) as exists_check;

-- Verificar se public.users existe e sua estrutura
SELECT 
    'PUBLIC.USERS EXISTS' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) as exists_check;

-- Verificar se public.profiles existe e sua estrutura
SELECT 
    'PUBLIC.PROFILES EXISTS' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) as exists_check;

-- =============================================
-- 14. RESUMO FINAL
-- =============================================

SELECT '=== RESUMO FINAL ===' as section;

-- Contagem total de objetos
SELECT 
    'TABLES' as object_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
    AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'FUNCTIONS' as object_type,
    COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'auth')
UNION ALL
SELECT 
    'TRIGGERS' as object_type,
    COUNT(*) as count
FROM pg_trigger tg
JOIN pg_class t ON t.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname IN ('public', 'auth')
    AND NOT tg.tgisinternal
UNION ALL
SELECT 
    'VIEWS' as object_type,
    COUNT(*) as count
FROM information_schema.views 
WHERE table_schema IN ('public', 'auth')
UNION ALL
SELECT 
    'INDEXES' as object_type,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname IN ('public', 'auth')
UNION ALL
SELECT 
    'SEQUENCES' as object_type,
    COUNT(*) as count
FROM information_schema.sequences 
WHERE sequence_schema IN ('public', 'auth');

-- =============================================
-- FIM DO EXPORT
-- =============================================

SELECT '=== EXPORT COMPLETO FINALIZADO ===' as final_message; 