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
- Funcionalidades em desenvolvimento

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
