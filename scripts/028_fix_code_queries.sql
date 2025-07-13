-- =====================================================
-- CORREÇÕES DE QUERIES PROBLEMÁTICAS - OPENLOVE
-- =====================================================
-- Data: $(date)
-- Descrição: Lista de correções necessárias no código TypeScript
-- =====================================================

/*
ESTE ARQUIVO CONTÉM AS CORREÇÕES NECESSÁRIAS NO CÓDIGO TYPESCRIPT
Execute as correções manualmente nos arquivos correspondentes
*/

-- =====================================================
-- 1. CORREÇÕES NO SISTEMA DE AMIZADES
-- =====================================================

/*
ARQUIVO: /api/friends/route.ts
LINHA: 25
PROBLEMA: Usa tabela 'friendships' que não existe
SOLUÇÃO: Trocar para 'friends'

ANTES:
const { data: friendships, error } = await supabase
  .from("friendships")

DEPOIS:
const { data: friendships, error } = await supabase
  .from("friends")
*/

/*
ARQUIVO: /api/friends/request/route.ts
LINHA: 27
PROBLEMA: Usa tabela 'friendships' que não existe
SOLUÇÃO: Trocar para 'friends'

ANTES:
const { data: existingRequest } = await supabase
  .from("friendships")

DEPOIS:
const { data: existingRequest } = await supabase
  .from("friends")
*/

/*
ARQUIVO: /api/friends/requests/route.ts
LINHA: 25
PROBLEMA: Usa tabela 'friendships' que não existe
SOLUÇÃO: Trocar para 'friends'

ANTES:
const { data: requests, error } = await supabase
  .from("friendships")

DEPOIS:
const { data: requests, error } = await supabase
  .from("friends")
*/

/*
ARQUIVO: /api/friends/respond/route.ts
LINHA: 29
PROBLEMA: Usa tabela 'friendships' que não existe
SOLUÇÃO: Trocar para 'friends'

ANTES:
const { data: request } = await supabase
  .from("friendships")

DEPOIS:
const { data: request } = await supabase
  .from("friends")
*/

-- =====================================================
-- 2. CORREÇÕES NO DASHBOARD
-- =====================================================

/*
ARQUIVO: /dashboard/DashboardClient.tsx
LINHA: 61
PROBLEMA: Usa tabela 'post_interactions' que não existe
SOLUÇÃO: Usar tabela 'likes' ou criar 'post_interactions'

ANTES:
supabase.from("post_interactions").select("id", { count: "exact" })

DEPOIS:
supabase.from("likes").select("id", { count: "exact" })
*/

/*
ARQUIVO: /dashboard/DashboardClient.tsx
LINHA: 63
PROBLEMA: Usa tabela 'user_earnings' que não existe
SOLUÇÃO: Criar tabela 'user_earnings' ou usar alternativa

ANTES:
supabase.from("user_earnings").select("total_earnings")

DEPOIS:
-- Usar após criar a tabela user_earnings
supabase.from("user_earnings").select("total_earnings")
*/

/*
ARQUIVO: /dashboard/DashboardClient.tsx
LINHA: 62
PROBLEMA: Usa campo 'viewed_user_id' que não existe
SOLUÇÃO: Usar 'viewed_profile_id'

ANTES:
.eq("viewed_user_id", user.id)

DEPOIS:
.eq("viewed_profile_id", user.id)
*/

-- =====================================================
-- 3. CORREÇÕES NO SISTEMA DE PERFIS
-- =====================================================

/*
ARQUIVO: /api/friends/route.ts
LINHA: 17
PROBLEMA: Usa campo 'user_id' que não existe na tabela users
SOLUÇÃO: Usar 'id' diretamente

ANTES:
const { data: profile } = await supabase.from("users").select("id").eq("user_id", user.id).single()

DEPOIS:
const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).single()
*/

/*
ARQUIVO: /api/friends/request/route.ts
LINHA: 19
PROBLEMA: Usa campo 'user_id' que não existe na tabela users
SOLUÇÃO: Usar 'id' diretamente

ANTES:
const { data: profile } = await supabase.from("users").select("id").eq("user_id", user.id).single()

DEPOIS:
const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).single()
*/

/*
ARQUIVO: /api/friends/requests/route.ts
LINHA: 17
PROBLEMA: Usa campo 'user_id' que não existe na tabela users
SOLUÇÃO: Usar 'id' diretamente

ANTES:
const { data: profile } = await supabase.from("users").select("id").eq("user_id", user.id).single()

DEPOIS:
const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).single()
*/

-- =====================================================
-- 4. CORREÇÕES NO SISTEMA DE CONTEÚDO PREMIUM
-- =====================================================

/*
ARQUIVO: /api/content/purchase/route.ts
LINHA: 48
PROBLEMA: Usa campo 'wallet_balance' que não existe
SOLUÇÃO: Adicionar campo 'wallet_balance' na tabela users

ANTES:
const { data: profile } = await supabase.from("users").select("wallet_balance").eq("id", user.id).single()

DEPOIS:
-- Após adicionar o campo wallet_balance
const { data: profile } = await supabase.from("users").select("wallet_balance").eq("id", user.id).single()
*/

/*
ARQUIVO: /api/programs/enroll/route.ts
LINHA: 48
PROBLEMA: Usa campo 'wallet_balance' que não existe
SOLUÇÃO: Adicionar campo 'wallet_balance' na tabela users

ANTES:
const { data: profile } = await supabase.from("users").select("wallet_balance").eq("id", user.id).single()

DEPOIS:
-- Após adicionar o campo wallet_balance
const { data: profile } = await supabase.from("users").select("wallet_balance").eq("id", user.id).single()
*/

-- =====================================================
-- 5. CORREÇÕES NO SISTEMA DE BUSCA
-- =====================================================

/*
ARQUIVO: /api/search/users/route.ts
LINHA: 39-40
PROBLEMA: Usa campos 'tokens', 'tokens_received' que não existem
SOLUÇÃO: Adicionar campos na tabela users

ANTES:
tokens,
tokens_received

DEPOIS:
-- Após adicionar os campos
tokens,
tokens_received
*/

/*
ARQUIVO: /api/trending/route.ts
LINHA: 15, 25
PROBLEMA: Usa campos 'tokens', 'tokens_received' que não existem
SOLUÇÃO: Adicionar campos na tabela users

ANTES:
tokens, tokens_received

DEPOIS:
-- Após adicionar os campos
tokens, tokens_received
*/

-- =====================================================
-- 6. CORREÇÕES NO SISTEMA DE ANÚNCIOS
-- =====================================================

/*
ARQUIVO: /api/ads/route.ts
LINHA: 22
PROBLEMA: Usa tabela 'ad_campaigns' que não existe
SOLUÇÃO: Criar tabela 'ad_campaigns'

ANTES:
.from("ad_campaigns")

DEPOIS:
-- Após criar a tabela ad_campaigns
.from("ad_campaigns")
*/

/*
ARQUIVO: /api/ads/metrics/route.ts
LINHA: 18
PROBLEMA: Usa tabela 'ad_metrics' que não existe
SOLUÇÃO: Criar tabela 'ad_metrics'

ANTES:
.from("ad_metrics")

DEPOIS:
-- Após criar a tabela ad_metrics
.from("ad_metrics")
*/

/*
ARQUIVO: /api/ads/payment/route.ts
LINHA: 79
PROBLEMA: Usa tabela 'ad_transactions' que não existe
SOLUÇÃO: Criar tabela 'ad_transactions'

ANTES:
.from("ad_transactions")

DEPOIS:
-- Após criar a tabela ad_transactions
.from("ad_transactions")
*/

-- =====================================================
-- 7. CORREÇÕES NO SISTEMA DE CONTEÚDO
-- =====================================================

/*
ARQUIVO: /api/content/purchase/route.ts
LINHA: 26
PROBLEMA: Usa tabela 'paid_content' que não existe
SOLUÇÃO: Criar tabela 'paid_content'

ANTES:
.from("paid_content")

DEPOIS:
-- Após criar a tabela paid_content
.from("paid_content")
*/

/*
ARQUIVO: /api/content/purchase/route.ts
LINHA: 37
PROBLEMA: Usa tabela 'content_purchases' que não existe
SOLUÇÃO: Criar tabela 'content_purchases'

ANTES:
.from("content_purchases")

DEPOIS:
-- Após criar a tabela content_purchases
.from("content_purchases")
*/

-- =====================================================
-- 8. CORREÇÕES NO SISTEMA DE PERFIS
-- =====================================================

/*
ARQUIVO: /api/open-dates/interactions/route.ts
LINHA: 81
PROBLEMA: Usa tabela 'profiles' que não existe no schema público
SOLUÇÃO: Usar tabela 'users'

ANTES:
.from('profiles')

DEPOIS:
.from('users')
*/

-- =====================================================
-- 9. CORREÇÕES DE TIPOS TYPESCRIPT
-- =====================================================

/*
ARQUIVO: /app/lib/database.types.ts
PROBLEMA: Tipo Profile referencia tabela 'profiles' inexistente
SOLUÇÃO: Atualizar para refletir estrutura real da tabela 'users'

ANTES:
profiles: {
  Row: {
    full_name: string,
    website: string | null,
    role: 'user' | 'moderator' | 'admin'
  }
}

DEPOIS:
users: {
  Row: {
    name: string,
    first_name: string | null,
    last_name: string | null,
    // remover website e role que não existem
  }
}
*/

-- =====================================================
-- 10. RESUMO DAS AÇÕES NECESSÁRIAS
-- =====================================================

/*
PRIORIDADE ALTA:
1. Executar script 027_fix_database_incompatibilities.sql
2. Corrigir queries de amizades (friendships -> friends)
3. Corrigir queries de dashboard (viewed_user_id -> viewed_profile_id)
4. Corrigir queries de perfis (user_id -> id)

PRIORIDADE MÉDIA:
1. Atualizar tipos TypeScript
2. Corrigir queries de busca
3. Corrigir queries de trending

PRIORIDADE BAIXA:
1. Padronizar nomes de campos
2. Melhorar validações
*/

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 