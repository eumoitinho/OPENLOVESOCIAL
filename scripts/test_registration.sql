-- Script de teste para verificar a estrutura da tabela users
-- Execute este script no Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar se a tabela users existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ Tabela users existe'
        ELSE '❌ Tabela users NÃO existe'
    END as status;

-- 2. Verificar colunas obrigatórias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Verificar se as colunas necessárias para registro existem
SELECT 
    'id' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'email' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'username' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'name' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'first_name' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'last_name' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'birth_date' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_date') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'profile_type' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_type') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'seeking' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'seeking') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'interests' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'other_interest' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'other_interest') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'bio' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'location' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'uf' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'uf') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'latitude' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'latitude') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'longitude' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longitude') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'plano' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plano') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'status_assinatura' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status_assinatura') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'partner' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'partner') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'created_at' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'updated_at' as coluna,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN '✅' ELSE '❌' END as status;

-- 4. Verificar constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'users';

-- 5. Verificar se a função insert_user_with_auth existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'insert_user_with_auth') 
        THEN '✅ Função insert_user_with_auth existe'
        ELSE '❌ Função insert_user_with_auth NÃO existe'
    END as status;

-- 6. Verificar permissões do service_role
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND grantee = 'service_role';

-- 7. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 8. Teste de inserção simulado (não executa realmente)
SELECT 'Teste de estrutura concluído. Verifique os resultados acima.' as resultado; 