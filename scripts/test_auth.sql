-- Script de teste para o sistema de autenticação
-- Execute este script para verificar se as tabelas e permissões estão corretas

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'posts', 'follows', 'notifications') THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'posts', 'follows', 'notifications');

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'posts', 'follows', 'notifications');

-- 3. Verificar políticas de segurança
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
  AND tablename IN ('users', 'posts', 'follows', 'notifications')
ORDER BY tablename, policyname;

-- 4. Verificar funções
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN ('handle_new_user', 'is_email_confirmed', 'get_authenticated_user') THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_new_user', 'is_email_confirmed', 'get_authenticated_user');

-- 5. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  CASE 
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'on_auth_user_created';

-- 6. Verificar índices
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'posts', 'follows', 'notifications')
ORDER BY tablename, indexname;

-- 7. Contar registros nas tabelas
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
  'posts' as table_name,
  COUNT(*) as record_count
FROM posts
UNION ALL
SELECT 
  'follows' as table_name,
  COUNT(*) as record_count
FROM follows
UNION ALL
SELECT 
  'notifications' as table_name,
  COUNT(*) as record_count
FROM notifications;

-- 8. Verificar estrutura da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position; 