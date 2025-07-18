## [0.3.0-alpha.7] - 2025-07-18

### ✨ Features

- feat: implementar sistema completo de seguimento e amizade 
- feat: adicionar tabs na timeline (Todos, Seguindo, Para Você)
- feat: criar endpoint /api/timeline/following para posts de usuários seguidos
- feat: implementar seguimento mútuo automático que cria relação de amizade
- feat: adicionar funcionalidade de seguir imediatamente sem pending
- feat: integrar sistema de follow com notificações
- feat: filtrar timeline "Seguindo" apenas para posts de usuários seguidos
- feat: melhorar UX com mensagens contextuais para timelines vazias

### 🔧 Chores

- chore: refatorar Timeline.tsx para suportar múltiplas tabs
- chore: atualizar API /api/follows para criar amizades automáticas
- chore: implementar refresh automático da timeline após follow/unfollow
- chore: adicionar logs detalhados para debugging do sistema de seguimento

### 📝 Outros

- refactor: melhorar estrutura de dados para relacionamentos follow/friends
- refactor: otimizar consultas de banco para timeline de seguidos
- refactor: padronizar interface do PostCard para seguimento consistente

## [0.3.0-alpha.6] - 2025-07-17

### ✨ Features

- feat: integrar AbacatePay como segundo método de pagamento via PIX
- feat: criar sistema híbrido Stripe + AbacatePay para pagamentos
- feat: adicionar APIs para pagamentos PIX (/api/payments/pix/*)
- feat: implementar componente PixPayment para interface PIX
- feat: criar PaymentMethodSelector para escolha entre PIX e Cartão
- feat: adicionar sistema de webhooks para AbacatePay
- feat: implementar verificação automática de status de pagamento PIX
- feat: adicionar simulação de pagamento PIX (desenvolvimento)
- feat: criar integração com método personalizado Stripe PIX
- feat: implementar QR Code e código copia-e-cola para PIX
- feat: adicionar countdown timer para expiração de PIX
- feat: criar sistema de logs para webhooks de pagamento

### 🔧 Chores

- chore: criar migration para tabelas payment_intents e webhook_logs
- chore: adicionar campos AbacatePay no perfil do usuário
- chore: implementar cliente TypeScript para AbacatePay API
- chore: criar funções de banco para verificação de assinatura
- chore: adicionar políticas RLS para payment_intents
- chore: configurar variáveis de ambiente para AbacatePay
- chore: criar documentação completa de integração

### 📝 Outros

- refactor: criar classe PixStripeIntegration para sincronização
- refactor: implementar sistema de status unificado
- refactor: adicionar tratamento de erros robusto
- refactor: otimizar fluxo de aprovação de pagamentos

## [0.3.0-alpha.5] - 2025-07-17

### ✨ Features

- feat: implementar sistema completo de verificação de comunidades e eventos
- feat: adicionar badges visuais por plano (Gratuito, Ouro, Diamante)
- feat: criar componente PlanBadge para exibição de status de plano
- feat: adicionar filtro de verificação para usuários gratuitos
- feat: implementar modal de solicitação de verificação
- feat: criar API para solicitações de verificação (/api/verification/request)
- feat: adicionar componente VerificationRequestModal
- feat: exibir badges de verificação em eventos e comunidades
- feat: implementar sistema de aprovação/rejeição de verificações
- feat: adicionar notificações sobre status de verificação no criar evento

### 🔧 Chores

- chore: criar migration para tabela verification_requests
- chore: adicionar funções de banco para aprovação/rejeição de verificações
- chore: implementar políticas RLS para verificações
- chore: adicionar índices para performance da tabela verification_requests
- chore: atualizar PostCard para usar novo sistema de badges

### 📝 Outros

- refactor: melhorar interface Event para incluir is_verified e profiles
- refactor: atualizar EventsContent para filtrar por verificação
- refactor: adicionar informações sobre verificação na criação de eventos

## [0.3.0-alpha.4] - 2025-07-17

### 🐛 Fixes

- fix: corrigir sistema de comentários que estava falhando devido a triggers problemáticos no banco
- fix: resolver erro "record 'new' has no field 'target_type'" em criação de comentários
- fix: corrigir erro de Next.js 15 em rotas dinâmicas (`params.id` deve ser aguardado)
- fix: resolver problema de estrutura de dados que causava erro de renderização React
- fix: corrigir campos `created_at` sendo retornados como objetos ao invés de strings
- fix: ajustar nome de campo de `followed_id` para `following_id` na API de sugestões
- fix: corrigir nome de campo de `max_attendees` para `max_participants` na API de eventos
- fix: adicionar coluna `is_edited` à tabela comments para suporte à edição

### 🔧 Chores

- chore: remover triggers problemáticos de notificações que causavam erros
- chore: limpar funções de banco de dados obsoletas (`create_notification`, `update_post_stats`)
- chore: recriar apenas triggers essenciais (`update_comments_updated_at`)
- chore: criar migration para limpeza de triggers e adição de campos necessários
- chore: adicionar validação de tipos para campos de data na API timeline

### 📝 Outros

- refactor: atualizar API de comentários para compatibilidade com Next.js 15
- refactor: melhorar tratamento de dados de data/hora em toda a aplicação
- refactor: padronizar retorno de campos `created_at` como strings ISO

## [0.3.0-alpha.3] - 2025-07-17

### ✨ Features

- feat: implementar sistema de assinaturas Stripe como alternativa ao Mercado Pago
- feat: criar API de integração com Stripe (`/api/stripe/subscribe`, `/api/stripe/webhook`)
- feat: desenvolver CheckoutFormStripe com Stripe Elements
- feat: implementar PaymentProvider para escolha entre processadores
- feat: adicionar suporte a 3 planos (Gold R$ 25, Diamante R$ 45,90, Diamante Anual R$ 459)
- feat: criar sistema de migração gradual entre MP e Stripe
- feat: implementar sistema completo de limitações por plano
- feat: criar hooks e utilities para verificação de planos (`usePlanLimits`, `useCanAccess`, `usePaywall`)
- feat: desenvolver componentes PaywallModal e PlanIndicator
- feat: adicionar validação server-side com PlanValidator
- feat: implementar limitações de upload (imagens, vídeos, áudio) por plano
- feat: criar sistema de contadores de uso mensal
- feat: integrar paywall com componente CreatePost

### 🔧 Chores

- chore: instalar dependências do Stripe (stripe, @stripe/stripe-js, @stripe/react-stripe-js)
- chore: criar script de migração de banco de dados para Stripe
- chore: atualizar tipos TypeScript para suportar Stripe
- chore: criar documentação de migração em `docs/STRIPE_MIGRATION_PLAN.md`
- chore: estruturar sistema modular de planos em `/lib/plans/`
- chore: criar configuração centralizada de limitações por plano
- chore: implementar sistema de feature flags para funcionalidades premium

### 📝 Outros

- refactor: atualizar página de checkout para usar PaymentProvider
- refactor: adicionar campos Stripe à tabela users no banco
- refactor: implementar webhook handler para eventos Stripe
- refactor: criar sistema de feature flags para migração
- refactor: modernizar API de posts com validação server-side de planos
- refactor: atualizar CreatePost para usar novo sistema de paywall
- refactor: implementar verificações de plano em tempo real na UI

## [0.3.0-alpha.2] - 2025-07-14

### 🐛 Fixes

- fix: corrigir formatação do badge no README [alpha] (ef1a65a)

### 🔧 Chores

- chore: atualizar versão para 0.3.0-alpha.1 e documentar mudanças no CHANGELOG (38660e2)

## [0.3.0-alpha.1] - 2025-07-14

### ✨ Features

- feat: implementar sistema de release automático com códigos de versão [alphaminor] (b5437e3)

### 🐛 Fixes

- fix: corrigir erro de build relacionado ao import de createServerComponentClient em auth-helpers (31ee4be)

### 🔧 Chores

- chore: update version to 0.2.0-alpha.2 in package.json (ad2bc9c)

### 📝 Outros

- refactor: atualizar caminho de importação do cliente Supabase para 'supabase-server' em auth-helpers (e4024f8)
- refactor: update Supabase client initialization in AdminPage (a30b5c4)
- refactor: update Supabase client initialization to include cookies in AdminPage (fe9da31)
- refactor: update import path for createServerComponentClient in AdminPage (cca7dc5)
- refactor: replace createServerSupabaseClient with createServerComponentClient in ProfilePage (89c2085)
- refactor: integrate Vercel Analytics into RootLayout component (3a71f85)
- refactor: replace createServerComponentClient with createRouteHandlerClient in AdminPage (0dadd9b)
- refactor: update Supabase client initialization to use async/await across API routes (2027290)
- refactor: update Supabase client import and initialization across API routes (affa5a5)
- refactor: clean up AdminPage component structure and improve readability (ec727b4)
- Refactor Supabase client initialization (bd04768)
- refactor: add logging for user profile update in PUT request handler (d777dbe)
- refactor: update image upload size limit to 10MB and improve error handling for uploads (3727164)

# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### ✨ Features
- feat: implementar sistema de tipos TypeScript robusto para posts
- feat: adicionar global state management com Zustand para posts
- feat: criar error boundaries especializados para componentes de posts
- feat: implementar hooks customizados para ações de posts
- feat: adicionar sistema de validação Zod para posts e comentários

### 🐛 Fixes
- fix: corrigir erro de registro de usuários no Supabase
- fix: atualizar estrutura da tabela users para suportar todos os campos necessários
- fix: melhorar tratamento de erros no sistema de autenticação
- fix: corrigir configuração de variáveis de ambiente

### 🔧 Chores
- chore: criar script SQL para corrigir estrutura da tabela users
- chore: adicionar documentação de configuração de variáveis de ambiente
- chore: criar script de teste para verificar estrutura do banco de dados
- chore: atualizar README com instruções de configuração corrigidas

---

## [0.2.0-alpha.1] - 2025-07-12

### ✨ Features
- feat: implement ads system with database schema, API endpoints, and media optimization (48f79d2)
- feat: adicionar funcionalidade de registro de usuário e melhorias na verificação de nome de usuário (16698ad)
- feat: aprimorar criação de post na timeline com tratamento de erros (10de380)
- feat: adicionar logs e melhorias na criação de posts e na busca da timeline (88b3f14)
- feat: adicionar verificação de autenticação e mensagens de alerta na criação de posts (a9f9ad8)
- feat: atualizar botão de postagem com verificação de usuário (38bce68)
- feat: melhorar a renderização de anúncios e otimizar a verificação de cliente (da18200)
- feat: atualizar lógica de criação de post para uso de cookies assíncronos (d5c558d)
- feat: remover configurações experimentais e otimizar a criação de posts (e5ffc32)
- feat: remover verificação de cliente para renderização de anúncios (6479087)
- feat: adicionar logs de depuração e mensagens de autenticação na timeline (dab0924)
- feat: atualizar lógica do botão de postagem para incluir verificação de carregamento de autenticação (c639a04)
- feat: refatorar autenticação e mover hook useAuth para AuthProvider (f0c85e8)
- feat: aprimorar lógica de autenticação e verificação de email (670dcc7)
- feat: implementar confirmação de email e melhorias na autenticação (a7709a3)
- feat: atualizar lógica de autenticação e refatorar acesso a dados de usuários (415ad68)
- feat: corrigir inserção de perfil no Supabase e ajustar tipo de perfil (caad12c)
- feat: ajustar criação de perfil no cadastro de usuário (1e5bb1a)
- feat: atualizar layout e lógica de navegação na timeline (435191c)
- feat: atualizar README e remover componentes obsoletos (973409e)

### 🐛 Fixes
- Correções de bugs críticos
- Ajustes de responsividade
- Correções de autenticação

### 🔧 Chores
- Configuração inicial do projeto
- Setup do banco de dados
- Configuração de CI/CD
- Documentação inicial

### 📝 Outros
- first commit (1aac4f8)
- Init (4eedb0c)
- delete (ce60d7b)

---

## [0.1.0] - 2025-07-09

### ✨ Features
- Versão inicial do projeto
- Estrutura básica do frontend
- Configuração do Next.js
- Setup do Supabase
- Componentes UI básicos

### 🔧 Chores
- Inicialização do repositório
- Configuração do ambiente de desenvolvimento
- Setup das dependências iniciais

---

## Tipos de Mudanças

- **✨ Features**: Novas funcionalidades
- **🐛 Fixes**: Correções de bugs
- **🔧 Chores**: Tarefas de manutenção
- **⚠️ Breaking Changes**: Mudanças incompatíveis
- **📝 Outros**: Outras mudanças

## Como Contribuir

Para adicionar uma entrada ao changelog:

1. Use o formato de commit convencional:
   - `feat: nova funcionalidade`
   - `fix: correção de bug`
   - `chore: tarefa de manutenção`

2. Execute o script de release:
   ```bash
   pnpm run release:alpha  # para releases alpha
   pnpm run release:beta   # para releases beta
   pnpm run release:patch  # para correções
   ```

3. O changelog será atualizado automaticamente com base nos commits.
