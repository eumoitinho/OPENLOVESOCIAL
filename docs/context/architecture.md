# Arquitetura do OpenLove

## Visão Geral
OpenLove é uma rede social moderna construída com arquitetura serverless e componentes modulares.

## Stack Tecnológico
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Cache**: Redis (via Upstash)
- **Real-time**: WebRTC para chamadas, Supabase Realtime para chat
- **Deploy**: Vercel/Docker

## Estrutura de Diretórios
```
/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (auth)/           # Rotas autenticadas
│   └── components/       # Componentes locais
├── components/           # Componentes globais
├── lib/                 # Utilidades e configurações
├── hooks/              # React hooks customizados
├── server/            # Server components e actions
└── types/            # TypeScript types globais
```

## Módulos Principais

### 1. Autenticação (`/auth`)
- Login/Registro com Supabase Auth
- Perfis de usuário com localização
- Gestão de sessões

### 2. Posts (`/content`, `/timeline`)
- Posts com texto, imagens, vídeos
- Sistema de enquetes (premium)
- Gravação de áudio (premium)
- Feed algorítmico

### 3. Chat (`/messages`)
- Mensagens em tempo real
- Upload de arquivos
- Indicadores de digitação/leitura
- Suporte WebRTC para chamadas

### 4. Notificações (`/notificacoes`)
- Sistema real-time
- Configurações por tipo
- Badge animado
- Horário silencioso

### 5. Busca e Descoberta (`/search`, `/quem-seguir`)
- Busca por localização (IBGE API)
- Filtros por distância
- Sugestões de amizade

## Padrões de Design

### 1. Server Components
- Máximo uso de RSC para performance
- Client components apenas quando necessário

### 2. Data Fetching
- Server actions para mutations
- SWR/React Query para client-side
- Streaming para listas grandes

### 3. Estado Global
- Zustand para estado do cliente
- Context API para temas/auth
- URL state para filtros

### 4. Otimizações
- Image optimization com Next.js
- Lazy loading de componentes
- Prefetching de rotas
- Cache agressivo

## Fluxos de Dados

### Post Creation Flow
```
User Input → Validation → Upload Media → Create Post → Update Feed → Notify Followers
```

### Message Flow
```
Send Message → Optimistic Update → Supabase Realtime → Recipient Update → Read Receipt
```

### Authentication Flow
```
Login Form → Supabase Auth → Session Cookie → Profile Load → Redirect
```

## Convenções de Código
- Componentes: PascalCase
- Hooks: camelCase com prefixo 'use'
- Utilities: camelCase
- Types: PascalCase com sufixo apropriado

## Performance Targets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Bundle size < 200KB (initial)