# Claude Code - OpenLove Project Context

## Projeto
OpenLove - Rede social com memórias afetivas e AI

## Context Engineering
Este projeto usa Context Engineering. Sempre consulte:
- `/docs/context/` para arquitetura e convenções
- Arquivos `.context` em cada módulo para contexto específico
- Templates em `/docs/ai-instructions/templates/`

## Comandos Essenciais
```bash
# Desenvolvimento
pnpm dev

# Lint e Type Check
pnpm lint
pnpm typecheck

# Build
pnpm build

# Setup URLs para desenvolvimento (AbacatePay)
pnpm setup:dev-urls

# Context Tools
node scripts/context-tools.js compress <module>
node scripts/context-tools.js analyze
```

## Workflow Padrão
1. Sempre leia o `.context` do módulo antes de modificar
2. Siga conventions.md para padrões de código
3. Use templates para novas features
4. Execute lint e typecheck após mudanças

## Módulos Principais
- `/app/messages` - Sistema de chat
- `/app/posts` - Timeline e posts
- `/app/memories` - Memórias afetivas
- `/app/auth` - Autenticação
- `/lib/supabase` - Database e storage

## Stack
- Next.js 15 (App Router)
- TypeScript strict mode
- Supabase (Auth + DB + Storage)
- Hero UI + Tailwind CSS
- Framer Motion

## Configurações
- Stripe configured
- AbacatePay (PIX) configurado - requer NEXT_PUBLIC_APP_URL público para webhooks

## Análise
- Memória: Adicionar camada de análise de memórias usando IA para enriquecer contexto afetivo

## Memórias de Desenvolvimento
- Nunca sugerir soluções simples, sempre usar consertos robustos, complexos e funcionais