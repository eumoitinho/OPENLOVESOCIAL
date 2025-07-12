-- Script de teste rápido - Execute tudo de uma vez
-- Cole este script completo no SQL Editor do Supabase e execute

-- Verificar estrutura básica da tabela users
SELECT 
    'ESTRUTURA DA TABELA USERS' as secao,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Verificar colunas críticas para registro
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'email', 'username', 'name', 'first_name', 'last_name', 'profile_type', 'plano', 'status_assinatura')
ORDER BY column_name;

-- Verificar permissões do service_role
SELECT 
    'PERMISSÕES SERVICE_ROLE' as secao,
    COUNT(*) as total_permissoes
FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND grantee = 'service_role';

-- Verificar se RLS está desabilitado
SELECT 
    'CONFIGURAÇÃO RLS' as secao,
    CASE 
        WHEN rowsecurity = true THEN 'RLS HABILITADO - PODE CAUSAR PROBLEMAS'
        ELSE 'RLS DESABILITADO - OK'
    END as status
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Contar usuários existentes
SELECT 
    'USUÁRIOS EXISTENTES' as secao,
    COUNT(*) as total_usuarios
FROM users;

-- Verificar se a função existe
SELECT 
    'FUNÇÃO INSERT_USER_WITH_AUTH' as secao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'insert_user_with_auth') 
        THEN 'FUNÇÃO EXISTE'
        ELSE 'FUNÇÃO NÃO EXISTE'
    END as status; 