# 🌹 ConnectHub (OpenLove) - Plataforma Social para Conexões Autênticas

<div align="center">

![OpenLove Logo](https://img.shields.io/badge/OpenLove-Connect%20Hub-pink?style=for-the-badge&logo=heart&logoColor=white)

**Uma plataforma social moderna para casais e pessoas que buscam conexões autênticas, eventos locais e uma comunidade segura com abordagem liberal e familiar.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Components-000?style=flat-square)](https://ui.shadcn.com/)

[📖 Docs](https://docs.openlove.com) • [🐛 Issues](https://github.com/openlove/issues) • [💬 Discord](https://discord.gg/openlove)

</div>

---

## 🎯 **Visão Geral**

ConnectHub é uma plataforma social inovadora que conecta casais e pessoas em busca de relacionamentos autênticos, amizades e eventos locais. Com foco em segurança, respeito e liberdade de expressão, oferecemos um ambiente moderado onde usuários podem:

- 💕 **Conectar-se** com casais e pessoas afins
- 🎉 **Participar** de eventos locais e workshops
- 💬 **Conversar** em tempo real com sistema de chat avançado
- 🔒 **Navegar** com segurança em ambiente moderado
- ⭐ **Acessar** recursos premium para experiência completa

---

## ✨ **Funcionalidades Principais**

### 🌟 **Core Features**
- [x] **Sistema de Autenticação** - Login/Registro com Supabase Auth
- [x] **Timeline Social** - Posts, likes, comentários e compartilhamentos
- [x] **Sistema de Amizades** - Solicitações, conexões e seguidores
- [x] **Chat em Tempo Real** - Mensagens instantâneas e conversas
- [x] **Busca Inteligente** - Filtros por localização, interesses e idade
- [x] **Perfis Detalhados** - Fotos, bio, interesses e preferências
- [x] **Sistema de Eventos** - Criação e participação em eventos locais

### 🎨 **Interface & UX**
- [x] **Design Responsivo** - Mobile-first com Tailwind CSS (xs: 360px)
- [x] **Tema Claro/Escuro** - Alternância dinâmica de temas
- [x] **Animações Suaves** - Transições e micro-interações
- [x] **Componentes Modernos** - shadcn/ui + componentes customizados
- [x] **Acessibilidade** - ARIA labels, contraste e navegação por teclado
- [x] **Responsividade Avançada** - Otimização para telas de 360px até 4K

### 🔐 **Segurança & Moderação**
- [x] **Moderação Ativa** - Sistema de denúncias e revisão
- [x] **Verificação de Perfis** - Badges de verificação
- [x] **Controle de Privacidade** - Configurações granulares
- [x] **Proteção de Dados** - LGPD/GDPR compliance
- [x] **Rate Limiting** - Proteção contra spam e abuso

### 💎 **Sistema Premium**
- [x] **Plano Básico** - Recursos essenciais gratuitos
- [x] **Plano Premium** - Chat ilimitado, busca avançada, eventos exclusivos
- [x] **Integração Stripe** - Pagamentos seguros e recorrentes
- [x] **Analytics Avançado** - Métricas de engajamento e alcance

### 📱 **Recursos Avançados**
- [x] **Geolocalização** - Eventos e pessoas próximas
- [x] **Upload de Mídia** - Fotos e vídeos com compressão automática
- [x] **Notificações Push** - Alertas em tempo real
- [x] **Sistema de Hashtags** - Organização e descoberta de conteúdo
- [x] **Galeria de Mídia** - Visualização otimizada de fotos/vídeos
- [x] **Chamadas WebRTC** - Chamadas de voz e vídeo em tempo real
- [x] **Páginas Dedicadas** - Quem seguir, trending topics e notificações
- [x] **Sistema de Follows** - Seguir/deixar de seguir usuários
- [x] **APIs Reais** - Todas as funcionalidades conectadas ao banco de dados
- [x] **Layout Grid Responsivo** - Estrutura similar ao Twitter/X com grid-template-columns
- [x] **Sistema de Tabs na Timeline** - Organização inteligente do conteúdo principal
- [x] **Componentes de Conteúdo** - Notificações, Mensagens, Eventos, Comunidades, Perfil e Configurações como páginas independentes

### 🎯 **Sistema de Tabs da Timeline**
- [x] **Tab "Seguindo"** - Exibe apenas posts de amigos e pessoas seguidas
- [x] **Tab "Para Você"** - Mostra perfis recomendados da região com boa popularidade
- [x] **Tab "Explorar"** - Sistema de busca com filtros por tipo, distância e interesses
- [x] **Filtros Avançados** - Busca por nome, tags, localização, tipo de perfil e distância
- [x] **Cards de Perfil** - Exibição visual atrativa com informações completas dos usuários
- [x] **Botão Postar na Sidebar** - Botão com gradiente love na sidebar esquerda (ícone no mobile, texto no desktop)

### 🎨 **Botão Postar Inteligente**
- [x] **Desktop** - Botão "Postar" com gradiente love na sidebar esquerda
- [x] **Mobile** - Ícone de notas (Plus) no menu flutuante inferior
- [x] **Estilo Consistente** - Mesmo gradiente e estilo do botão de login
- [x] **Responsivo** - Adaptação automática entre desktop e mobile
- [x] **Acessibilidade** - Labels e estados de hover bem definidos

### 📱 **Melhorias de Responsividade (v2.1)**
- [x] **Breakpoint XS** - Configurado para 360px (antes era 475px)
- [x] **Sidebars Adaptativas** - Larguras responsivas (w-64 xl:w-72, w-80 xl:w-96)
- [x] **Grid de Cards** - 1 coluna (mobile) → 2 colunas (xs) → 3 colunas (lg) → 4 colunas (xl)
- [x] **Componentes Otimizados** - Ícones e textos escalam proporcionalmente
- [x] **Navegação Mobile** - Botões e espaçamentos ajustados para telas pequenas
- [x] **Cards de Perfil** - Altura, padding e tipografia responsivos
- [x] **Botões da Sidebar** - Altura e espaçamento adaptativos (h-11 xs:h-12)
- [x] **Floating Action Button** - Tamanho e posição otimizados para mobile

### 🎨 **Layout Grid (Twitter/X Style)**
- [x] **Sidebar Esquerda (1fr)** - Navegação principal com ícones e texto
- [x] **Timeline Central (2fr)** - Área principal com tabs "Seguindo", "Para Você" e "Explorar"
- [x] **Sidebar Direita (1fr)** - Widgets, trending topics e sugestões
- [x] **Responsividade Avançada** - Adaptação para mobile (360px+) com navegação inferior
- [x] **Sticky Navigation** - Sidebars fixas durante a rolagem
- [x] **Sistema de Tabs** - Seguindo (posts de amigos), Para Você (perfis recomendados), Explorar (busca com filtros)
- [x] **Grid Responsivo** - Cards de perfil adaptam-se de 1 coluna (mobile) até 4 colunas (desktop)

### 🎯 **Componentes de Conteúdo (v2.2)**
- [x] **NotificationsContent** - Página completa de notificações com tabs e filtros
- [x] **MessagesContent** - Interface de chat completa com conversas e mensagens
- [x] **EventsContent** - Sistema de eventos com criação, busca e categorias
- [x] **CommunitiesContent** - Gerenciamento de comunidades com busca e tabs
- [x] **ProfileContent** - Perfil completo com edição e configurações
- [x] **SettingsContent** - Configurações avançadas com navegação por tabs
- [x] **Migração de Dialogs** - Conversão de todos os antigos dialogs em componentes de página
- [x] **Navegação Integrada** - Todos os componentes funcionam com o sistema de navegação da timeline

---

## 🏗️ **Estrutura do Projeto**

\`\`\`
INTIMIFY-main/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 admin/                    # Painel administrativo
│   │   ├── AdminContent.tsx         # Interface de moderação
│   │   └── page.tsx                 # Página principal admin
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 auth/                 # Autenticação
│   │   ├── 📁 chat/                 # Sistema de chat
│   │   ├── 📁 check-username/       # Verificação de username
│   │   ├── 📁 content/              # Gerenciamento de conteúdo
│   │   ├── 📁 follows/              # Sistema de follows
│   │   ├── 📁 friends/              # Sistema de amizades
│   │   ├── 📁 interactions/         # Likes, comentários, shares
│   │   ├── 📁 notifications/        # Sistema de notificações
│   │   ├── 📁 posts/                # CRUD de posts
│   │   ├── 📁 programs/             # Eventos e workshops
│   │   ├── 📁 search/               # Busca inteligente
│   │   ├── 📁 stripe/               # Pagamentos
│   │   ├── 📁 timeline/             # Feed principal
│   │   ├── 📁 trending/             # Trending topics
│   │   └── 📁 upload/               # Upload de mídia
│   ├── 📁 auth/                     # Páginas de autenticação
│   │   ├── 📁 signin/               # Login
│   │   ├── 📁 signup/               # Registro
│   │   └── callback/                # Callback OAuth
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 ads/                  # Sistema de anúncios
│   │   ├── 📁 auth/                 # Componentes de auth
│   │   ├── 📁 chat/                 # Interface de chat e WebRTC
│   │   ├── 📁 events/               # Componentes de eventos
│   │   ├── 📁 media/                # Upload e galeria
│   │   ├── 📁 moderation/           # Ferramentas de moderação
│   │   ├── 📁 timeline/             # Timeline e posts
│   │   └── 📁 ui/                   # Componentes base
│   ├── 📁 content/                  # Páginas de conteúdo
│   ├── 📁 dashboard/                # Dashboard do usuário
│   ├── 📁 events/                   # Páginas de eventos
│   ├── 📁 friends/                  # Sistema de amizades
│   ├── 📁 lib/                      # Utilitários e configurações
│   │   ├── auth.ts                  # Configuração Supabase Auth
│   │   ├── database.types.ts        # Tipos TypeScript do DB
│   │   ├── supabase.ts              # Cliente Supabase
│   │   └── media-utils.ts           # Utilitários de mídia
│   ├── 📁 messages/                 # Sistema de mensagens
│   ├── 📁 notificacoes/             # Página de notificações
│   ├── 📁 pricing/                  # Páginas de preços
│   ├── 📁 profile/                  # Perfil do usuário
│   ├── 📁 profiles/                 # Página de perfis de usuários
│   ├── 📁 programs/                 # Eventos e workshops
│   ├── 📁 quem-seguir/              # Sugestões de usuários
│   ├── 📁 search/                   # Busca avançada
│   ├── 📁 settings/                 # Página de configurações
│   ├── 📁 timeline/                 # Timeline antiga (mantida para compatibilidade)
│   ├── 📁 trending/                 # Trending topics
│   ├── globals.css                  # Estilos globais
│   ├── layout.tsx                   # Layout principal
│   ├── loading.tsx                  # Componente de loading
│   ├── middleware.ts                # Middleware de autenticação
│   └── page.tsx                     # Landing page
├── 📁 components/                   # shadcn/ui components
│   ├── 📁 ui/                       # Componentes base
│   │   ├── accordion.tsx            # Acordeão
│   │   ├── alert.tsx                # Alertas
│   │   ├── avatar.tsx               # Avatar de usuário
│   │   ├── button.tsx               # Botões
│   │   ├── card.tsx                # Cards
│   │   ├── dialog.tsx               # Modais
│   │   ├── form.tsx                 # Formulários
│   │   ├── input.tsx                # Campos de entrada
│   │   ├── tabs.tsx                 # Abas
│   │   └── ... (50+ componentes)
│   └── theme-provider.tsx           # Provider de tema
├── 📁 hooks/                        # Custom React Hooks
│   ├── use-mobile.tsx               # Hook para mobile
│   └── use-toast.ts                 # Sistema de notificações
├── 📁 lib/                          # Utilitários
│   └── utils.ts                     # Funções auxiliares
├── 📁 public/                       # Arquivos estáticos
│   ├── cozy-corner-cafe.png         # Imagens de exemplo
│   ├── programming-course.png       # Assets de eventos
│   └── vibrant-music-festival.png   # Mídia promocional
├── 📁 scripts/                      # Scripts SQL
│   ├── 000_inspect_schema.sql       # Inspeção do schema
│   ├── 001_initial_schema.sql       # Schema inicial
│   ├── 002_seed_data.sql            # Dados de exemplo
│   ├── 003_auth_setup.sql           # Configuração de auth
│   ├── 004_media_setup.sql          # Sistema de mídia
│   ├── 005_advanced_features.sql    # Recursos avançados
│   ├── 006_friends_and_restrictions.sql # Sistema de amizades
│   ├── 007_profile_views_and_features.sql # Visualizações de perfil
│   ├── 008_timeline_setup.sql       # Configuração do timeline
│   ├── 009_timeline_seed_data.sql   # Dados do timeline
│   ├── 010_profile_enhancements.sql # Melhorias de perfil
│   ├── 011_enhanced_user_profiles.sql # Perfis avançados
│   ├── 012_inspect_current_schema.sql # Inspeção atual
│   ├── 013_timeline_enhancements.sql # Melhorias do timeline
│   ├── 014_timeline_seed_data.sql   # Novos dados
│   └── 015_database_maintenance.sql # Manutenção |
├── 📁 styles/                       # Estilos adicionais
│   └── globals.css                  # CSS global
├── 📁 tests/                        # Testes automatizados
│   ├── 📁 api/                      # Testes de API
│   ├── 📁 components/               # Testes de componentes
│   └── setupTests.ts                # Configuração de testes
├── 📄 Dockerfile                    # Container Docker
├── 📄 docker-compose.yml            # Orquestração Docker
├── 📄 nginx.conf                    # Configuração Nginx
├── 📄 next.config.js                # Configuração Next.js
├── 📄 tailwind.config.ts            # Configuração Tailwind
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 package.json                  # Dependências
└── 📄 README.md                     # Este arquivo
\`\`\`

### 📁 app/

Este diretório contém a estrutura principal da aplicação Next.js, utilizando o App Router.

#### 📁 app/admin/

Painel administrativo para moderação e gestão da plataforma.

*   **AdminContent.tsx:** Interface principal do painel administrativo, permitindo a moderação de usuários, posts e eventos.
*   **page.tsx:** Rota principal do painel administrativo, renderizando o `AdminContent`.

#### 📁 app/api/

Rotas da API para comunicação com o backend e o banco de dados.

*   **📁 auth/:** Rotas relacionadas à autenticação de usuários.
    *   `route.ts`: Lógica para registro, login e logout.
*   **📁 chat/:** Rotas para o sistema de chat em tempo real.
    *   `conversations/route.ts`: Lógica para gerenciar conversas.
*   **📁 content/:** Rotas para gerenciamento de conteúdo da plataforma.
    *   `purchase/route.ts`: Lógica para compra de conteúdo premium.
*   **📁 friends/:** Rotas para o sistema de amizades.
    *   `request/route.ts`: Lógica para enviar solicitações de amizade.
    *   `requests/route.ts`: Lógica para listar solicitações de amizade.
    *   `respond/route.ts`: Lógica para responder a solicitações de amizade.
    *   `route.ts`: Lógica para gerenciar amigos.
*   **📁 interactions/:** Rotas para likes, comentários e compartilhamentos.
    *   `route.ts`: Lógica para gerenciar interações.
*   **📁 posts/:** Rotas para criação, leitura, atualização e exclusão (CRUD) de posts.
    *   `route.ts`: Lógica para gerenciar posts.
*   **📁 programs/:** Rotas para eventos e workshops.
    *   `enroll/route.ts`: Lógica para inscrição em eventos.
*   **📁 search/:** Rotas para a busca inteligente na plataforma.
    *   `route.ts`: Lógica para a busca geral.
    *   `users/route.ts`: Lógica para a busca de usuários.
*   **📁 stripe/:** Rotas para integração com o Stripe para pagamentos.
    *   `route.ts`: Lógica para gerenciar pagamentos.
    *   `webhook/route.ts`: Lógica para receber webhooks do Stripe.
*   **📁 timeline/:** Rotas para o feed principal da timeline.
    *   `route.ts`: Lógica para buscar posts da timeline.
*   **📁 upload/:** Rotas para upload de mídia (imagens e vídeos).
    *   `route.ts`: Lógica para upload de mídia.

#### 📁 app/auth/

Páginas de autenticação da aplicação.

*   **📁 signin/:** Página de login.
    *   `page.tsx`: Formulário de login e lógica de autenticação.
*   **📁 signup/:** Página de registro.
    *   `page.tsx`: Formulário de registro e lógica de criação de conta.
*   **📁 callback/:** Rota de callback para autenticação OAuth.
    *   `route.ts`: Lógica para lidar com o callback do provedor OAuth.

#### 📁 app/components/

Componentes React reutilizáveis em toda a aplicação.

*   **📁 ads/:** Componentes relacionados ao sistema de anúncios.
    *   `Advertisement.tsx`: Componente para exibir um anúncio.
*   **📁 auth/:** Componentes relacionados à autenticação.
    *   `AuthProvider.tsx`: Provider para gerenciar o estado de autenticação.
    *   `SignIn.tsx`: Componente para o formulário de login.
    *   `SignUp.tsx`: Componente para o formulário de registro.
    *   `SignOut.tsx`: Componente para o botão de logout.
*   **📁 chat/:** Componentes relacionados ao sistema de chat.
    *   `ConversationList.tsx`: Componente para listar as conversas.
    *   `Chat.tsx`: Componente para exibir a interface de chat.
*   **📁 events/:** Componentes relacionados a eventos.
    *   `EventCalendar.tsx`: Componente para exibir um calendário de eventos.
    *   `EventCard.tsx`: Componente para exibir um card de evento.
*   **📁 media/:** Componentes relacionados ao upload e exibição de mídia.
    *   `MediaUpload.tsx`: Componente para upload de mídia.
    *   `MediaGallery.tsx`: Componente para exibir uma galeria de mídia.
*   **📁 moderation/:** Componentes relacionados à moderação.
    *   `ReportForm.tsx`: Componente para o formulário de denúncia.
*   **📁 timeline/:** Componentes relacionados à timeline.
    *   `CreatePost.tsx`: Componente para criar um novo post.
    *   `Timeline.tsx`: Componente principal da timeline.
    *   `TimelineFeed.tsx`: Componente para exibir o feed de posts.
*   **📁 ui/:** Componentes base da interface do usuário (shadcn/ui).
    *   `accordion.tsx`: Componente para acordeão.
    *   `alert.tsx`: Componente para alertas.
    *   `avatar.tsx`: Componente para avatares.
    *   `button.tsx`: Componente para botões.
    *   `card.tsx`: Componente para cards.
    *   `dialog.tsx`: Componente para modais.
    *   `form.tsx`: Componente para formulários.
    *   `input.tsx`: Componente para campos de entrada.
    *   `tabs.tsx`: Componente para abas.
    *   `... (50+ componentes)`: Vários outros componentes da biblioteca shadcn/ui.
*   **Features.tsx:** Componente para exibir as funcionalidades da plataforma.
*   **Header.tsx:** Componente para o cabeçalho da aplicação.
*   **Hero.tsx:** Componente para a seção de destaque (hero) da landing page.

#### 📁 app/content/

Páginas de conteúdo estático da aplicação.

*   **ContentPage.tsx:** Componente para exibir uma página de conteúdo.
*   **page.tsx:** Rota principal para exibir páginas de conteúdo.

#### 📁 app/dashboard/

Páginas do dashboard do usuário.

*   **DashboardClient.tsx:** Componente cliente para o dashboard.
*   **page.tsx:** Rota principal para exibir o dashboard.

#### 📁 app/events/

Páginas relacionadas a eventos.

*   **EventsContent.tsx:** Componente para exibir o conteúdo da página de eventos.
*   **page.tsx:** Rota principal para exibir a página de eventos.

#### 📁 app/friends/

Páginas relacionadas ao sistema de amizades.

*   **loading.tsx:** Componente para exibir um indicador de carregamento.
*   **page.tsx:** Rota principal para exibir a página de amigos.

#### 📁 app/lib/

Utilitários e configurações da aplicação.

*   **auth.ts:** Configuração do Supabase Auth para autenticação.
*   **database.types.ts:** Tipos TypeScript gerados a partir do schema do banco de dados.
*   **supabase.ts:** Cliente Supabase para interagir com o banco de dados.
*   **media-utils.ts:** Utilitários para manipulação de mídia.

#### 📁 app/messages/

Páginas relacionadas ao sistema de mensagens.

*   **page.tsx:** Rota principal para exibir a página de mensagens.

#### 📁 app/pricing/

Páginas relacionadas a preços e planos.

*   **PricingContent.tsx:** Componente para exibir o conteúdo da página de preços.
*   **page.tsx:** Rota principal para exibir a página de preços.

#### 📁 app/profile/

Páginas relacionadas ao perfil do usuário.

*   **ProfileContent.tsx:** Componente para exibir o conteúdo do perfil.
*   **edit/page.tsx:** Rota para editar o perfil do usuário.
*   **page.tsx:** Rota principal para exibir o perfil do usuário.

#### 📁 app/profiles/

Página dedicada para visualizar e interagir com perfis de outros usuários.

*   **page.tsx:** Página principal que exibe uma grade de perfis de usuários com funcionalidades de busca, filtros por localização, idade e interesses, e opções para seguir e salvar perfis.

#### 📁 app/home/

Página principal da aplicação com layout de grid similar ao Twitter/X.

*   **page.tsx:** Página principal que implementa o layout de grid com sidebar esquerda (1fr), timeline central (2fr) e sidebar direita (1fr), seguindo o padrão do Twitter/X.

#### 📁 app/settings/

Página de configurações do usuário com seções organizadas.

*   **page.tsx:** Página principal de configurações com seções para notificações, perfil, mensagens & mídia, privacidade e configurações avançadas, incluindo controle de tema claro/escuro.

#### 📁 app/programs/

Páginas relacionadas a eventos e workshops.

*   **ProgramsPage.tsx:** Componente para exibir a página de programas.
*   **page.tsx:** Rota principal para exibir a página de programas.

#### 📁 app/search/

Páginas relacionadas à busca.

*   **SearchContent.tsx:** Componente para exibir o conteúdo da página de busca.
*   **loading.tsx:** Componente para exibir um indicador de carregamento.
*   **page.tsx:** Rota principal para exibir a página de busca.

#### Arquivos de Layout e Configuração

*   **globals.css:** Estilos globais da aplicação.
*   **layout.tsx:** Layout principal da aplicação.
*   **loading.tsx:** Componente para exibir um indicador de carregamento.
*   **middleware.ts:** Middleware para lidar com autenticação e autorização.
*   **page.tsx:** Landing page da aplicação.

### 📁 components/

Este diretório contém componentes React reutilizáveis, incluindo componentes da biblioteca shadcn/ui.

#### 📁 ui/

Componentes da biblioteca shadcn/ui.

*   **accordion.tsx:** Componente para criar um acordeão.
*   **alert.tsx:** Componente para exibir alertas.
*   **avatar.tsx:** Componente para exibir avatares de usuários.
*   **button.tsx:** Componente para criar botões.
*   **card.tsx:** Componente para criar cards.
*   **dialog.tsx:** Componente para criar modais.
*   **form.tsx:** Componente para criar formulários.
*   **input.tsx:** Componente para criar campos de entrada.
*   **tabs.tsx:** Componente para criar abas.
*   `... (50+ componentes)`: Vários outros componentes da biblioteca shadcn/ui.

#### theme-provider.tsx

Componente para fornecer o tema da aplicação.

### 📁 hooks/

Este diretório contém hooks React personalizados.

*   **use-mobile.tsx:** Hook para detectar se o dispositivo é mobile.
*   **use-toast.ts:** Hook para exibir notificações toast.

### 📁 lib/

Este diretório contém utilitários e funções auxiliares.

*   **utils.ts:** Funções auxiliares para a aplicação.

### 📁 public/

Este diretório contém arquivos estáticos, como imagens e fontes.

*   **cozy-corner-cafe.png:** Imagem de exemplo.
*   **programming-course.png:** Imagem de exemplo.
*   **vibrant-music-festival.png:** Imagem de exemplo.

### 📁 scripts/

Este diretório contém scripts SQL para criar e popular o banco de dados.

*   **000_inspect_schema.sql:** Script para inspecionar o schema do banco de dados.
*   **001_initial_schema.sql:** Script para criar o schema inicial do banco de dados.
*   **002_seed_data.sql:** Script para popular o banco de dados com dados de exemplo.
*   **003_auth_setup.sql:** Script para configurar a autenticação no Supabase.
*   **004_media_setup.sql:** Script para configurar o sistema de mídia.
*   **005_advanced_features.sql:** Script para configurar recursos avançados.
*   **006_friends_and_restrictions.sql:** Script para configurar o sistema de amizades.
*   **007_profile_views_and_features.sql:** Script para configurar visualizações de perfil e recursos relacionados.
*   **008_timeline_setup.sql:** Script para configurar a timeline.
*   **009_timeline_seed_data.sql:** Script para popular a timeline com dados de exemplo.
*   **010_profile_enhancements.sql:** Script para adicionar melhorias ao perfil.
*   **011_enhanced_user_profiles.sql:** Script para adicionar campos extras aos perfis.
*   **012_inspect_current_schema.sql:** Script para inspecionar o schema atual do banco de dados.
*   **013_timeline_enhancements.sql:** Script para adicionar melhorias à timeline.
*   **014_timeline_seed_data.sql:** Script para adicionar novos dados à timeline.
*   **015_database_maintenance.sql:** Script para realizar manutenção no banco de dados.

### 📁 styles/

Este diretório contém estilos adicionais para a aplicação.

*   **globals.css:** Estilos globais da aplicação.

### 📁 tests/

Este diretório contém testes automatizados para a aplicação.

*   **📁 api/:** Testes para as rotas da API.
    *   `timeline.test.ts`: Testes para a API da timeline.
    *   `upload.test.ts`: Testes para a API de upload.
*   **📁 components/:** Testes para os componentes React.
    *   `auth/:` Testes para os componentes de autenticação.
    *   `media/:` Testes para os componentes de mídia.
    *   `timeline/:` Testes para os componentes da timeline.
*   **setupTests.ts:** Configuração global para os testes.

### Arquivos de Configuração

*   **Dockerfile:** Arquivo para construir a imagem Docker da aplicação.
*   **docker-compose.yml:** Arquivo para orquestrar os serviços Docker.
*   **nginx.conf:** Arquivo de configuração do Nginx.
*   **next.config.js:** Arquivo de configuração do Next.js.
*   **tailwind.config.ts:** Arquivo de configuração do Tailwind CSS.
*   **tsconfig.json:** Arquivo de configuração do TypeScript.
*   **package.json:** Arquivo com as dependências do projeto.

---

## 🎨 **Design System & Paleta de Cores**

### 🌈 **Paleta Principal (OpenLove)**

\`\`\`css
/* Cores Primárias */
--openlove-50: #fdf2f8;    /* Rosa muito claro */
--openlove-100: #fce7f3;   /* Rosa claro */
--openlove-200: #fbcfe8;   /* Rosa suave */
--openlove-300: #f9a8d4;   /* Rosa médio */
--openlove-400: #f472b6;   /* Rosa vibrante */
--openlove-500: #ec4899;   /* Rosa principal */
--openlove-600: #db2777;   /* Rosa escuro */
--openlove-700: #be185d;   /* Rosa profundo */
--openlove-800: #9d174d;   /* Rosa muito escuro */
--openlove-900: #831843;   /* Rosa quase preto */
--openlove-950: #500724;   /* Rosa escuríssimo */

/* Cores Secundárias */
--rose-500: #f43f5e;       /* Vermelho rosado */
--purple-500: #a855f7;     /* Roxo vibrante */
--violet-500: #8b5cf6;     /* Violeta */
--red-500: #ef4444;        /* Vermelho */

/* Gradientes Principais */
.gradient-primary {
  background: linear-gradient(135deg, #db2777 0%, #e11d48 50%, #9333ea 100%);
}

.gradient-light {
  background: linear-gradient(135deg, #fce7f3 0%, #ffe4e6 50%, #f3e8ff 100%);
}

/* Cores Semânticas */
--success: #10b981;        /* Verde sucesso */
--warning: #f59e0b;        /* Amarelo aviso */
--error: #ef4444;          /* Vermelho erro */
--info: #3b82f6;           /* Azul informação */
\`\`\`

### 🎭 **Temas**

#### 🌞 **Modo Claro**
\`\`\`css
--background: #ffffff;
--foreground: #1f2937;
--card: rgba(255, 255, 255, 0.8);
--border: #e5e7eb;
--muted: #f9fafb;
\`\`\`

#### 🌙 **Modo Escuro**
\`\`\`css
--background: #0f172a;
--foreground: #f8fafc;
--card: rgba(255, 255, 255, 0.05);
--border: rgba(255, 255, 255, 0.1);
--muted: #1e293b;
\`\`\`

---

## 🛠️ **Tecnologias Utilizadas**

### 🎯 **Frontend**
- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes React modernos
- **[Framer Motion](https://www.framer.com/motion/)** - Animações fluidas
- **[Lucide React](https://lucide.dev/)** - Ícones SVG otimizados
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas

### 🔧 **Backend & Database**
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Supabase Auth](https://supabase.com/auth)** - Autenticação e autorização
- **[Supabase Storage](https://supabase.com/storage)** - Armazenamento de arquivos
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Segurança granular

### 💳 **Pagamentos & Integrações**
- **[Stripe](https://stripe.com/)** - Processamento de pagamentos
- **[Stripe Webhooks](https://stripe.com/docs/webhooks)** - Eventos de pagamento
- **[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)** - Localização

### 🚀 **Deploy & DevOps**
- **[Vercel](https://vercel.com/)** - Hospedagem e deploy
- **[Docker](https://www.docker.com/)** - Containerização
- **[Nginx](https://nginx.org/)** - Proxy reverso
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD

### 🧪 **Testes & Qualidade**
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** - Testes de componentes
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código

---

## 🚀 **Instalação e Configuração**

### 📋 **Pré-requisitos**
- **Node.js** 18.0 ou superior
- **npm** ou **yarn**
- **Git**
- Conta no **[Supabase](https://supabase.com/)**
- Conta no **[Stripe](https://stripe.com/)** (para pagamentos)

### 🔧 **Configuração Local**

1. **Clone o repositório:**
\`\`\`bash
git clone https://github.com/seu-usuario/openlove-connecthub.git
cd openlove-connecthub
\`\`\`

2. **Instale as dependências:**
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. **Configure as variáveis de ambiente:**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edite o arquivo `.env.local`:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Database
POSTGRES_URL=sua_url_postgres
POSTGRES_PRISMA_URL=sua_url_prisma
POSTGRES_URL_NON_POOLING=sua_url_non_POOLING

# Stripe
STRIPE_SECRET_KEY=sua_chave_secreta_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe

# Outros
NEXTAUTH_SECRET=seu_secret_nextauth
NEXTAUTH_URL=http://localhost:3000
\`\`\`

4. **Configure o banco de dados:**
\`\`\`bash
# Execute os scripts SQL em ordem
npm run db:setup
\`\`\`

5. **Inicie o servidor de desenvolvimento:**
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

6. **Acesse a aplicação:**
\`\`\`
http://localhost:3000
\`\`\`

---

## 📊 **Scripts SQL e Banco de Dados**

### 🗄️ **Estrutura do Banco**

O projeto utiliza **15 scripts SQL** organizados para configurar e manter o banco:

| Script | Descrição | Funcionalidade |
|--------|-----------|----------------|
| `000_inspect_schema.sql` | Inspeção inicial | Verifica estrutura existente |
| `001_initial_schema.sql` | Schema base | Tabelas principais (users, posts, etc.) |
| `002_seed_data.sql` | Dados iniciais | Usuários e conteúdo de exemplo |
| `003_auth_setup.sql` | Autenticação | Configuração Supabase Auth |
| `004_media_setup.sql` | Sistema de mídia | Upload e armazenamento |
| `005_advanced_features.sql` | Recursos avançados | Premium, analytics, etc. |
| `006_friends_and_restrictions.sql` | Amizades | Sistema de conexões |
| `007_profile_views_and_features.sql` | Perfis | Visualizações e recursos |
| `008_timeline_setup.sql` | Timeline | Feed principal |
| `009_timeline_seed_data.sql` | Dados timeline | Posts e interações |
| `010_profile_enhancements.sql` | Melhorias perfil | Recursos adicionais |
| `011_enhanced_user_profiles.sql` | Perfis avançados | Campos extras |
| `012_inspect_current_schema.sql` | Inspeção atual | Verificação de estado |
| `013_timeline_enhancements.sql` | Timeline avançado | Novos recursos |
| `014_timeline_seed_data.sql` | Novos dados | Conteúdo atualizado |
| `015_database_maintenance.sql` | Manutenção | Limpeza e otimização |

### 🔧 **Comandos Úteis**

\`\`\`bash
# Executar todos os scripts
npm run db:setup

# Executar script específico
npm run db:run scripts/001_initial_schema.sql

# Backup do banco
npm run db:backup

# Restaurar backup
npm run db:restore backup.sql

# Verificar integridade
npm run db:check
\`\`\`

---

## 🐳 **Deploy com Docker**

### 📦 **Build da Imagem**

\`\`\`bash
# Build da imagem
docker build -t openlove-app .

# Executar container
docker run -p 3000:3000 openlove-app
\`\`\`

### 🚀 **Docker Compose**

\`\`\`bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
\`\`\`

### ⚙️ **Configuração Nginx**

O arquivo `nginx.conf` está configurado para:
- ✅ Proxy reverso para Next.js
- ✅ Compressão gzip
- ✅ Cache de assets estáticos
- ✅ Rate limiting
- ✅ SSL/TLS (produção)

---

## 🧪 **Testes**

### 🔬 **Estrutura de Testes**

\`\`\`
tests/
├── api/                    # Testes de API
│   ├── timeline.test.ts    # Testes do timeline
│   └── upload.test.ts      # Testes de upload
├── components/             # Testes de componentes
│   ├── auth/              # Testes de autenticação
│   ├── media/             # Testes de mídia
│   └── timeline/          # Testes do timeline
└── setupTests.ts          # Configuração global
\`\`\`

### 🏃‍♂️ **Executar Testes**

\`\`\`bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage

# Testes específicos
npm test -- --testPathPattern=timeline
\`\`\`

### 📊 **Métricas de Qualidade**

- ✅ **Cobertura de código:** >80%
- ✅ **Testes unitários:** Componentes críticos
- ✅ **Testes de integração:** APIs principais
- ✅ **Testes E2E:** Fluxos principais

---

## 📈 **Monitoramento e Analytics**

### 📊 **Métricas Implementadas**

- **Engajamento:** Likes, comentários, shares
- **Usuários:** Registros, logins, atividade
- **Conteúdo:** Posts criados, visualizações
- **Eventos:** Participações, criações
- **Performance:** Tempo de carregamento, erros
- **Conversão:** Free → Premium

### 🔍 **Ferramentas de Monitoramento**

- **Supabase Analytics** - Métricas de banco
- **Vercel Analytics** - Performance web
- **Stripe Dashboard** - Métricas de pagamento
- **Custom Dashboard** - KPIs específicos

---

## 🔒 **Segurança**

### 🛡️ **Medidas Implementadas**

- ✅ **Row Level Security (RLS)** - Controle granular de acesso
- ✅ **Rate Limiting** - Proteção contra spam
- ✅ **Input Validation** - Sanitização de dados
- ✅ **CSRF Protection** - Proteção contra ataques
- ✅ **SQL Injection Prevention** - Queries parametrizadas
- ✅ **XSS Protection** - Sanitização de HTML
- ✅ **Content Security Policy** - Headers de segurança
- ✅ **HTTPS Enforcement** - Comunicação criptografada

### 🔐 **Autenticação e Autorização**

- **Multi-factor Authentication (MFA)**
- **OAuth Providers** (Google, Facebook, Apple)
- **Email Verification**
- **Password Reset**
- **Session Management**
- **Role-based Access Control**

---

## 🤝 **Contribuição**

### 📝 **Como Contribuir**

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'Add: nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### 📋 **Padrões de Código**

- **TypeScript** obrigatório
- **ESLint + Prettier** para formatação
- **Conventional Commits** para mensagens
- **Testes** para novas funcionalidades
- **Documentação** atualizada

### 🐛 **Reportar Bugs**

Use o template de issue para reportar bugs:
- **Descrição** clara do problema
- **Passos** para reproduzir
- **Comportamento** esperado vs atual
- **Screenshots** se aplicável
- **Ambiente** (OS, browser, versão)

---

## 📄 **Licença**

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 **Equipe**

### 🏗️ **Core Team**
- **[Seu Nome]** - *Lead Developer* - [@seu-github](https://github.com/seu-github)
- **[Nome 2]** - *UI/UX Designer* - [@designer](https://github.com/designer)
- **[Nome 3]** - *Backend Developer* - [@backend](https://github.com/backend)

### 🙏 **Contribuidores**

Agradecemos a todos os [contribuidores](https://github.com/openlove/graphs/contributors) que ajudaram a tornar este projeto possível!

---

## 📞 **Suporte**

### 💬 **Canais de Comunicação**

- **📧 Email:** suporte@openlove.com
- **💬 Discord:** [OpenLove Community](https://discord.gg/openlove)
- **🐦 Twitter:** [@OpenLoveApp](https://twitter.com/OpenLoveApp)
- **📱 Telegram:** [OpenLove Support](https://t.me/openlove_support)

### 📚 **Recursos Úteis**

- **[Documentação Completa](https://docs.openlove.com)**
- **[API Reference](https://api.openlove.com/docs)**
- **[Guia de Contribuição](CONTRIBUTING.md)**
- **[Changelog](CHANGELOG.md)**
- **[Roadmap](https://github.com/openlove/projects)**

---

## 📞 **WebRTC - Chamadas de Voz e Vídeo**

### 🎥 **Funcionalidades Implementadas**

- ✅ **Chamadas de Voz** - Comunicação de áudio em tempo real
- ✅ **Chamadas de Vídeo** - Comunicação de vídeo com qualidade HD
- ✅ **Servidor de Sinalização** - WebSocket para coordenação de chamadas
- ✅ **Controles de Mídia** - Mute, desativar vídeo, finalizar chamada
- ✅ **Interface Responsiva** - Modal otimizado para mobile e desktop
- ✅ **Integração com Chat** - Botões de chamada no header das conversas

### 🏗️ **Arquitetura WebRTC**

#### **Componentes Principais**

```
app/components/chat/
├── WebRTCContext.tsx    # Contexto React para gerenciar WebRTC
├── CallModal.tsx        # Modal de interface das chamadas
└── Chat.tsx            # Componente de chat integrado
```

#### **Servidor de Sinalização**

- **URL:** Defina via variável de ambiente: `NEXT_PUBLIC_SIGNALING_URL=wss://webrtc.openlove.com.br`
- **Tecnologia:** Node.js + WebSocket
- **Deploy:** VPS com Coolify
- **Funcionalidades:**
  - Registro de usuários online
  - Troca de ofertas/respostas WebRTC
  - Coordenação de ICE candidates
  - Gerenciamento de chamadas

### 🔧 **Como Usar em Produção**

1. Configure as variáveis de ambiente no frontend:

```
NEXT_PUBLIC_SIGNALING_URL=wss://webrtc.openlove.com.br
NEXT_PUBLIC_TURN_URL=turn:seu-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=usuario
NEXT_PUBLIC_TURN_CREDENTIAL=senha
```

2. O frontend irá se conectar automaticamente ao servidor de sinalização e TURN.

3. Certifique-se de que todos os dados exibidos no chat, perfil e galeria venham do backend/Supabase.

### 🌐 **Configuração de Produção**

#### **Servidor de Sinalização**

```bash
# Deploy no VPS
cd server/
npm install
npm start
```

#### **TURN Servers**

- Use um serviço comercial (Twilio, Xirsys, etc) ou configure seu próprio coturn.
- Exemplo de configuração no .env:

```
NEXT_PUBLIC_TURN_URL=turn:seu-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=usuario
NEXT_PUBLIC_TURN_CREDENTIAL=senha
```

### 📱 **Compatibilidade**

- ✅ **Chrome/Edge** - Suporte completo
- ✅ **Firefox** - Suporte completo
- ✅ **Safari** - Suporte completo
- ✅ **Mobile Chrome** - Suporte completo
- ✅ **Mobile Safari** - Suporte completo

### 🔒 **Segurança**

- ✅ **HTTPS/WSS** - Comunicação criptografada
- ✅ **Permissões de Mídia** - Acesso controlado a câmera/microfone
- ✅ **Validação de Usuários** - Apenas usuários autenticados
- ✅ **Rate Limiting** - Proteção contra spam de chamadas

### 🚀 **Performance**

- **Latência:** <100ms para conexões locais
- **Qualidade:** 720p para vídeo, 48kHz para áudio
- **Bandwidth:** Adaptativo baseado na conexão
- **Fallback:** Automático para áudio em caso de problemas de vídeo

---

## 🚀 **Roadmap**

### 🎯 **Próximas Features**

- [x] **Video Calls** (WebRTC) - ✅ Implementado
- [ ] **App Mobile** (React Native)
- [ ] **Stories** (24h content)
- [ ] **Live Streaming**
- [ ] **AI Matching** (ML recommendations)
- [ ] **Marketplace** (Events & Services)
- [ ] **Multi-language** (i18n)
- [ ] **API Pública** (Third-party integrations)

### 📅 **Timeline**

- **Q1 2025:** App Mobile Beta
- **Q2 2025:** Video Calls & Stories
- **Q3 2025:** AI Matching
- **Q4 2025:** Marketplace & API

---

<div align="center">

**Feito com 💕 pela equipe OpenLove**

[⬆️ Voltar ao topo](#-connecthub-openlove---plataforma-social-para-conexões-autênticas)

</div>


Build Error


Error:   × await isn't allowed in non-async function

./app/auth/signin/page.tsx

Error:   × await isn't allowed in non-async function
    ╭─[D:\MSYNC PESSOAL\OPENLOVE\app\auth\signin\page.tsx:44:1]
 41 │         setStep("verification")
 42 │         toast.info("Por favor, confirme seu email para continuar")
 43 │         // Tentar obter o email da sessão atual
 44 │         const { data: { session } } = await supabase.auth.getSession()
    ·                                             ────────
 45 │         if (session?.user?.email) {
 46 │           setEmail(session.user.email)
 46 │         }
    ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./app/auth/signin/page.tsx