-- Script de teste simples para verificar o sistema de registro
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela users existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ Tabela users existe'
        ELSE '❌ Tabela users NÃO existe'
    END as status;

-- 2. Verificar colunas críticas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'email', 'username', 'name', 'first_name', 'last_name', 'profile_type', 'plano', 'status_assinatura')
ORDER BY column_name;

-- 3. Verificar permissões do service_role
SELECT 
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND grantee = 'service_role';

-- 4. Verificar se RLS está desabilitado
SELECT 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '⚠️ RLS habilitado'
        ELSE '✅ RLS desabilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 5. Contar usuários existentes
SELECT 
    COUNT(*) as total_usuarios
FROM users;

-- 6. Verificar se a função existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'insert_user_with_auth') 
        THEN '✅ Função existe'
        ELSE '❌ Função NÃO existe'
    END as status; 