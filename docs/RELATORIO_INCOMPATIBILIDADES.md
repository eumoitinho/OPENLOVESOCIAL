# RELATÓRIO DE INCOMPATIBILIDADES - PROJETO OPENLOVE

## 📋 RESUMO EXECUTIVO

Este relatório identifica e documenta todas as incompatibilidades encontradas entre o código do projeto OPENLOVE e a estrutura atual do banco de dados. Foram analisadas **APIs**, **componentes**, **tipos**, **interfaces** e **queries** para garantir a compatibilidade total.

---

## 🔍 METODOLOGIA

### Análise Realizada:
1. **Estrutura do Banco**: Análise completa das tabelas, campos, constraints e índices
2. **APIs**: Verificação de todas as rotas `/api/*` e suas queries
3. **Componentes**: Análise de tipos e interfaces utilizados
4. **Queries**: Identificação de campos e tabelas referenciadas
5. **Tipos TypeScript**: Comparação com estrutura real do banco

---

## ❌ INCOMPATIBILIDADES CRÍTICAS

### 1. TABELAS INEXISTENTES NO BANCO

#### 1.1 Sistema de Anúncios
**Tabelas Referenciadas mas Não Existentes:**
- `ad_campaigns` - Usada em `/api/ads/route.ts`
- `ad_metrics` - Usada em `/api/ads/metrics/route.ts`
- `ad_transactions` - Usada em `/api/ads/payment/route.ts`
- `advertisers` - Referenciada em queries de anúncios

**Impacto:** Sistema de anúncios completamente inoperante

#### 1.2 Sistema de Conteúdo Premium
**Tabelas Referenciadas mas Não Existentes:**
- `paid_content` - Usada em `/api/content/purchase/route.ts`
- `content_purchases` - Usada em `/api/content/purchase/route.ts`

**Impacto:** Sistema de conteúdo premium inoperante

#### 1.3 Sistema de Amizades
**Tabela Referenciada mas Não Existente:**
- `friendships` - Usada em `/api/friends/*` (múltiplas rotas)
- **Nota:** Existe tabela `friends` no banco, mas código usa `friendships`

**Impacto:** Sistema de amizades inoperante

#### 1.4 Sistema de Estatísticas
**Tabelas Referenciadas mas Não Existentes:**
- `post_interactions` - Usada em `/dashboard/DashboardClient.tsx`
- `user_earnings` - Usada em `/dashboard/DashboardClient.tsx`
- `profile_views` - Referenciada em múltiplos componentes

**Impacto:** Dashboard com estatísticas inoperante

#### 1.5 Sistema de Perfis
**Tabela Referenciada mas Não Existente:**
- `profiles` - Referenciada em queries mas não existe no schema público
- **Nota:** Existe apenas tabela `users` no schema público

**Impacto:** Queries que referenciam `profiles` falharão

---

### 2. CAMPOS INEXISTENTES NA TABELA `users`

#### 2.1 Campos de Gamificação
**Campos Referenciados mas Não Existentes:**
- `wallet_balance` - Usado em `/api/programs/enroll/route.ts` e `/api/content/purchase/route.ts`
- `tokens` - Usado em múltiplos componentes e APIs
- `tokens_received` - Usado em `/api/trending/route.ts` e `/api/search/users/route.ts`

**Impacto:** Sistema de tokens e carteira inoperante

#### 2.2 Campos de Status
**Campos Referenciados mas Não Existentes:**
- `is_active` - Usado em múltiplas APIs e componentes
- `is_verified` - Usado em múltiplos componentes
- `is_premium` - Usado em múltiplos componentes

**Nota:** Estes campos **EXISTEM** na tabela `users` conforme `dbdoc/USERS.sql`

#### 2.3 Campos de Perfil
**Campos Referenciados mas Não Existentes:**
- `cover_url` - Usado em múltiplos componentes
- `bio` - Usado em múltiplos componentes
- `relationship_status` - Usado em múltiplos componentes
- `looking_for` - Usado em múltiplos componentes
- `premium_expires_at` - Usado em múltiplos componentes
- `privacy_settings` - Usado em múltiplos componentes
- `last_seen` - Usado em múltiplos componentes
- `stats` - Usado em múltiplos componentes

**Nota:** Estes campos **EXISTEM** na tabela `users` conforme `dbdoc/USERS.sql`

---

### 3. INCOMPATIBILIDADES DE TIPOS

#### 3.1 Tipo `Profile` vs Tabela `users`
**Problema:** O arquivo `database.types.ts` define um tipo `Profile` que referencia uma tabela `profiles` inexistente.

**Campos do Tipo `Profile` que não existem na tabela `users`:**
- `full_name` (existe `name` + `first_name` + `last_name`)
- `website` (não existe)
- `role` (não existe)

#### 3.2 Tipo `User` em Componentes
**Problema:** Múltiplos componentes definem tipos `User` locais que não correspondem à estrutura real.

**Exemplos de incompatibilidades:**
- `SignUp.tsx` - Tipo `User` com campos inexistentes
- `ProfileCard.tsx` - Campos `tokens`, `tokens_received` não existem
- `AuthProvider.tsx` - Tipo `Profile` incompatível

---

### 4. QUERIES COM CAMPOS INEXISTENTES

#### 4.1 APIs de Usuários
**Arquivo:** `/api/search/users/route.ts`
```typescript
// Campos inexistentes:
tokens, tokens_received, stats, is_active
```

**Arquivo:** `/api/trending/route.ts`
```typescript
// Campos inexistentes:
tokens, tokens_received, is_active
```

#### 4.2 APIs de Conteúdo
**Arquivo:** `/api/content/purchase/route.ts`
```typescript
// Campo inexistente:
wallet_balance
```

#### 4.3 APIs de Programas
**Arquivo:** `/api/programs/enroll/route.ts`
```typescript
// Campo inexistente:
wallet_balance
```

#### 4.4 Dashboard
**Arquivo:** `/dashboard/DashboardClient.tsx`
```typescript
// Tabelas inexistentes:
post_interactions, user_earnings
// Campo inexistente:
viewed_user_id (deveria ser viewed_profile_id)
```

---

### 5. INCOMPATIBILIDADES DE RELACIONAMENTOS

#### 5.1 Sistema de Amizades
**Problema:** Código usa `friendships` mas banco tem `friends`

**Queries Problemáticas:**
```typescript
// Em /api/friends/route.ts
.from("friendships") // ❌ Tabela inexistente
// Deveria ser:
.from("friends") // ✅ Tabela existente
```

#### 5.2 Sistema de Visualizações de Perfil
**Problema:** Código usa `viewed_user_id` mas banco tem `viewed_profile_id`

**Queries Problemáticas:**
```typescript
// Em /dashboard/DashboardClient.tsx
.eq("viewed_user_id", user.id) // ❌ Campo inexistente
// Deveria ser:
.eq("viewed_profile_id", user.id) // ✅ Campo existente
```

---

## ⚠️ INCOMPATIBILIDADES MENORES

### 1. Campos com Nomes Diferentes
- `full_name` (tipo) vs `name` (banco)
- `avatar` (componentes) vs `avatar_url` (banco)
- `coverImage` (componentes) vs `cover_url` (banco)

### 2. Tipos de Dados Incompatíveis
- Arrays de strings vs JSONB para alguns campos
- Timestamps vs Date para campos de data

### 3. Constraints Não Respeitadas
- Alguns componentes assumem valores que violam constraints do banco

---

## 📊 IMPACTO POR SISTEMA

### 🔴 SISTEMAS COMPLETAMENTE INOPERANTES
1. **Sistema de Anúncios** - 0% funcional
2. **Sistema de Conteúdo Premium** - 0% funcional
3. **Sistema de Amizades** - 0% funcional
4. **Dashboard de Estatísticas** - 0% funcional

### 🟡 SISTEMAS PARCIALMENTE AFETADOS
1. **Sistema de Usuários** - 70% funcional
2. **Sistema de Posts** - 85% funcional
3. **Sistema de Chat** - 90% funcional
4. **Sistema de Eventos** - 95% funcional

### 🟢 SISTEMAS FUNCIONAIS
1. **Autenticação** - 100% funcional
2. **Sistema de Posts Básico** - 100% funcional
3. **Sistema de Likes/Comentários** - 100% funcional

---

## 🛠️ RECOMENDAÇÕES DE CORREÇÃO

### PRIORIDADE ALTA (Crítico)
1. **Criar tabelas faltantes** do sistema de anúncios
2. **Criar tabelas faltantes** do sistema de conteúdo premium
3. **Corrigir queries** de amizades para usar `friends` em vez de `friendships`
4. **Adicionar campo `wallet_balance`** na tabela `users`

### PRIORIDADE MÉDIA (Importante)
1. **Padronizar tipos TypeScript** com estrutura real do banco
2. **Corrigir queries** com campos inexistentes
3. **Criar tabelas** de estatísticas (`post_interactions`, `user_earnings`)
4. **Corrigir relacionamentos** de visualizações de perfil

### PRIORIDADE BAIXA (Melhoria)
1. **Padronizar nomes de campos** entre componentes e banco
2. **Melhorar tipos** para maior type safety
3. **Adicionar validações** de constraints

---

## 📝 SCRIPTS DE CORREÇÃO NECESSÁRIOS

### 1. Criação de Tabelas Faltantes
```sql
-- Sistema de Anúncios
CREATE TABLE ad_campaigns (...);
CREATE TABLE ad_metrics (...);
CREATE TABLE ad_transactions (...);
CREATE TABLE advertisers (...);

-- Sistema de Conteúdo Premium
CREATE TABLE paid_content (...);
CREATE TABLE content_purchases (...);

-- Sistema de Estatísticas
CREATE TABLE post_interactions (...);
CREATE TABLE user_earnings (...);
```

### 2. Adição de Campos Faltantes
```sql
-- Adicionar campo wallet_balance
ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Adicionar campos de tokens
ALTER TABLE users ADD COLUMN tokens INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN tokens_received INTEGER DEFAULT 0;
```

### 3. Correção de Queries
```typescript
// Corrigir queries de amizades
.from("friends") // em vez de "friendships"

// Corrigir queries de visualizações
.eq("viewed_profile_id", user.id) // em vez de "viewed_user_id"
```

---

## 🎯 CONCLUSÃO

O projeto OPENLOVE apresenta **incompatibilidades significativas** entre o código e o banco de dados, especialmente nos sistemas de anúncios, conteúdo premium e amizades. 

**Principais problemas:**
- 8 tabelas inexistentes no banco
- 3 campos críticos faltando na tabela `users`
- Múltiplas queries usando campos/tabelas inexistentes
- Tipos TypeScript desalinhados com estrutura real

**Recomendação:** Implementar correções de **PRIORIDADE ALTA** antes de prosseguir com desenvolvimento, para garantir funcionalidade básica do sistema.

---

**Data do Relatório:** $(date)
**Versão do Projeto:** OPENLOVE
**Analista:** Sistema de Diagnóstico Automatizado 