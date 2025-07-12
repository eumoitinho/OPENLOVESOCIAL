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
