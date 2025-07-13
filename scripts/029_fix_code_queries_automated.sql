-- =====================================================
-- SCRIPT DE CORREÇÃO AUTOMÁTICA DE QUERIES - OPENLOVE
-- =====================================================
-- Data: $(date)
-- Descrição: Gera comandos para corrigir queries problemáticas
-- =====================================================

-- Este script gera comandos que devem ser executados no terminal
-- para corrigir automaticamente as queries problemáticas

-- =====================================================
-- 1. CORREÇÕES NO SISTEMA DE AMIZADES
-- =====================================================

-- Corrigir /api/friends/route.ts
SELECT 'sed -i "s/from(\"friendships\")/from(\"friends\")/g" app/api/friends/route.ts' as command;

-- Corrigir /api/friends/request/route.ts
SELECT 'sed -i "s/from(\"friendships\")/from(\"friends\")/g" app/api/friends/request/route.ts' as command;

-- Corrigir /api/friends/requests/route.ts
SELECT 'sed -i "s/from(\"friendships\")/from(\"friends\")/g" app/api/friends/requests/route.ts' as command;

-- Corrigir /api/friends/respond/route.ts
SELECT 'sed -i "s/from(\"friendships\")/from(\"friends\")/g" app/api/friends/respond/route.ts' as command;

-- =====================================================
-- 2. CORREÇÕES NO DASHBOARD
-- =====================================================

-- Corrigir /dashboard/DashboardClient.tsx - post_interactions -> likes
SELECT 'sed -i "s/from(\"post_interactions\")/from(\"likes\")/g" app/dashboard/DashboardClient.tsx' as command;

-- Corrigir /dashboard/DashboardClient.tsx - viewed_user_id -> viewed_profile_id
SELECT 'sed -i "s/viewed_user_id/viewed_profile_id/g" app/dashboard/DashboardClient.tsx' as command;

-- =====================================================
-- 3. CORREÇÕES NO SISTEMA DE PERFIS
-- =====================================================

-- Corrigir queries que usam user_id em vez de id
SELECT 'sed -i "s/\.eq(\"user_id\", user\.id)/\.eq(\"id\", user\.id)/g" app/api/friends/route.ts' as command;
SELECT 'sed -i "s/\.eq(\"user_id\", user\.id)/\.eq(\"id\", user\.id)/g" app/api/friends/request/route.ts' as command;
SELECT 'sed -i "s/\.eq(\"user_id\", user\.id)/\.eq(\"id\", user\.id)/g" app/api/friends/requests/route.ts' as command;

-- =====================================================
-- 4. CORREÇÕES NO SISTEMA DE PERFIS
-- =====================================================

-- Corrigir /api/open-dates/interactions/route.ts
SELECT 'sed -i "s/from(\"profiles\")/from(\"users\")/g" app/api/open-dates/interactions/route.ts' as command;

-- =====================================================
-- 5. COMANDOS PARA WINDOWS (PowerShell)
-- =====================================================

-- Comandos equivalentes para Windows PowerShell
SELECT '(Get-Content app/api/friends/route.ts) -replace ''from\("friendships"\)'', ''from("friends")'' | Set-Content app/api/friends/route.ts' as windows_command;
SELECT '(Get-Content app/api/friends/request/route.ts) -replace ''from\("friendships"\)'', ''from("friends")'' | Set-Content app/api/friends/request/route.ts' as windows_command;
SELECT '(Get-Content app/api/friends/requests/route.ts) -replace ''from\("friendships"\)'', ''from("friends")'' | Set-Content app/api/friends/requests/route.ts' as windows_command;
SELECT '(Get-Content app/api/friends/respond/route.ts) -replace ''from\("friendships"\)'', ''from("friends")'' | Set-Content app/api/friends/respond/route.ts' as windows_command;

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 