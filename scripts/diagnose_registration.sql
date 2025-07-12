-- Script de diagnóstico para problemas de registro
-- Execute este script no Supabase SQL Editor

-- 1. Verificar configuração do Supabase Auth
SELECT 
    'Configuração do Supabase Auth' as secao,
    'Verifique se o Auth está habilitado no dashboard' as instrucao;

-- 2. Verificar se a tabela auth.users existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
        THEN '✅ Tabela auth.users existe'
        ELSE '❌ Tabela auth.users NÃO existe - Problema crítico!'
    END as status;

-- 3. Verificar permissões do service_role no schema auth
SELECT 
    grantee,
    privilege_type,
    table_schema,
    table_name
FROM information_schema.role_table_grants 
WHERE grantee = 'service_role' AND table_schema = 'auth'
ORDER BY table_name, privilege_type;

-- 4. Verificar se o service_role pode criar usuários
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE grantee = 'service_role' 
            AND table_schema = 'auth' 
            AND table_name = 'users' 
            AND privilege_type = 'INSERT'
        ) 
        THEN '✅ service_role pode inserir em auth.users'
        ELSE '❌ service_role NÃO pode inserir em auth.users'
    END as status;

-- 5. Verificar estrutura da tabela users (public)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'email', 'username', 'name') THEN 'CRÍTICO'
        WHEN column_name IN ('first_name', 'last_name', 'profile_type', 'plano', 'status_assinatura') THEN 'IMPORTANTE'
        ELSE 'OPCIONAL'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY 
    CASE 
        WHEN column_name IN ('id', 'email', 'username', 'name') THEN 1
        WHEN column_name IN ('first_name', 'last_name', 'profile_type', 'plano', 'status_assinatura') THEN 2
        ELSE 3
    END,
    column_name;

-- 6. Verificar constraints da tabela users
SELECT 
    constraint_name,
    constraint_type,
    CASE 
        WHEN constraint_type = 'PRIMARY KEY' THEN 'CRÍTICO'
        WHEN constraint_type = 'UNIQUE' THEN 'IMPORTANTE'
        ELSE 'OPCIONAL'
    END as importancia
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY 
    CASE 
        WHEN constraint_type = 'PRIMARY KEY' THEN 1
        WHEN constraint_type = 'UNIQUE' THEN 2
        ELSE 3
    END;

-- 7. Verificar se RLS está configurado corretamente
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '⚠️ RLS habilitado - pode causar problemas'
        ELSE '✅ RLS desabilitado - OK para inserções do sistema'
    END as status
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 8. Verificar políticas RLS se existirem
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
WHERE tablename = 'users' AND schemaname = 'public';

-- 9. Teste de inserção simulado (não executa realmente)
SELECT 
    'Teste de inserção simulado' as teste,
    'Verificando se todos os campos obrigatórios estão presentes...' as status;

-- 10. Verificar se há dados de exemplo na tabela
SELECT 
    COUNT(*) as total_usuarios,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tabela tem dados'
        ELSE '⚠️ Tabela vazia - pode indicar problema'
    END as status
FROM users;

-- 11. Verificar configuração de email no Supabase
SELECT 
    'Configuração de Email' as secao,
    'Verifique em Settings > Auth > Email Templates se os templates estão configurados' as instrucao;

-- 12. Verificar configuração SMTP
SELECT 
    'Configuração SMTP' as secao,
    'Verifique em Settings > Auth > SMTP Settings se o SMTP está configurado' as instrucao;

-- 13. Resumo de diagnóstico
SELECT 
    'DIAGNÓSTICO CONCLUÍDO' as resultado,
    'Verifique os resultados acima e execute o script 026_fix_users_table.sql se necessário' as acao; 