# OpenLove - Plataforma de Conexão e Relacionamentos

Uma plataforma moderna e inclusiva para pessoas que buscam conexões autênticas, inspirada no design do Twitter/X, com foco em casais livres, poliamor e relacionamentos não-tradicionais.

## 🚀 Funcionalidades Principais

### 📱 Interface Responsiva
- **Layout Mobile-First**: Otimizado para dispositivos móveis
- **Navegação Intuitiva**: Sidebar lateral com navegação rápida
- **Design Moderno**: Interface inspirada no Twitter/X com cores personalizadas

### 🔐 Sistema de Autenticação
- **Login/Registro**: Sistema completo de autenticação
- **Perfis de Usuário**: Perfis personalizáveis com fotos e informações
- **Verificação de Email**: Sistema de confirmação por email

### 📝 Sistema de Posts
- **Timeline Dinâmica**: Feed de posts em tempo real
- **Criação de Posts**: Interface para criar posts com texto e mídia
- **Interações**: Sistema de likes, comentários e compartilhamentos
- **Visibilidade**: Posts públicos ou apenas para amigos

### 💬 Sistema de Mensagens
- **Chat em Tempo Real**: Sistema de mensagens integrado
- **WebRTC**: Suporte para chamadas de voz e vídeo
- **Conversas**: Interface de conversas com histórico
- **Notificações**: Sistema de notificações em tempo real

### 🎯 Sistema Open Dates (Tinder-like)
- **Cards Interativos**: Interface de cards com drag & drop
- **Sistema de Likes**: Like, pass e super like
- **Algoritmo de Recomendação**: Baseado em interesses, localização e preferências
- **Matches**: Sistema de matches automático
- **Chat de Matches**: Chat exclusivo para matches
- **Preferências**: Configuração de idade, distância e interesses

### 👥 Sistema de Amizades
- **Seguir Usuários**: Sistema de follow/unfollow
- **Sugestões**: Recomendações de pessoas para seguir
- **Perfis Públicos**: Visualização de perfis de outros usuários

### 🎪 Sistema de Eventos
- **Criação de Eventos**: Interface para criar eventos
- **Participação**: Sistema de inscrição em eventos
- **Compartilhamento**: Compartilhar eventos na timeline

### 🏘️ Sistema de Comunidades
- **Criação de Comunidades**: Criar e gerenciar comunidades
- **Participação**: Sistema de membros e moderadores
- **Posts em Comunidades**: Posts específicos para comunidades

### 🔍 Sistema de Busca
- **Busca de Usuários**: Buscar por nome, localização, interesses
- **Filtros Avançados**: Filtros por idade, localização, tipo de perfil
- **Resultados em Tempo Real**: Busca instantânea

### 💰 Sistema de Pagamentos
- **Integração MercadoPago**: Sistema de pagamentos brasileiro
- **Planos Premium**: Diferentes níveis de assinatura
- **Webhooks**: Processamento automático de pagamentos

### 📊 Sistema de Anúncios
- **Anúncios Contextuais**: Anúncios baseados no conteúdo
- **Métricas**: Sistema de tracking de cliques e impressões
- **Diferentes Formatos**: Banners, cards e anúncios nativos

### 🎨 Personalização
- **Tema Escuro/Claro**: Alternância entre temas
- **Cores Personalizadas**: Paleta de cores OpenLove
- **Layout Responsivo**: Adaptação para diferentes tamanhos de tela

## 🚀 Características Principais

### Layout Responsivo e Moderno
- **Layout em Grid**: Sistema de 3 colunas similar ao Twitter/X
  - Sidebar esquerda (1fr): Navegação principal
  - Timeline central (2-3fr): Conteúdo principal
  - Sidebar direita (1fr): Informações complementares
- **Responsividade Mobile-First**: Otimizado para dispositivos móveis
- **Sidebars Otimizadas**: Sem overflow horizontal, scroll vertical oculto
- **Navegação Unificada**: Componentes integrados na página principal

### Interface de Usuário
- **Design System Consistente**: Cores, tipografia e componentes padronizados
- **Tema Escuro/Claro**: Alternância automática baseada na preferência do sistema
- **Animações Suaves**: Transições e efeitos visuais elegantes
- **Componentes Reutilizáveis**: UI modular e escalável

### Funcionalidades de Navegação
- **Timeline Principal**: Posts, perfis e conteúdo em tempo real
- **Exploração de Perfis**: Sistema de busca e descoberta de usuários
- **Notificações**: Sistema completo de notificações em tempo real
- **Mensagens**: Chat integrado com WebRTC
- **Eventos**: Criação e participação em eventos
- **Comunidades**: Grupos e fóruns temáticos
- **Conteúdo Salvo**: Sistema de favoritos e salvamento

### Sistema de Autenticação
- **Supabase Auth**: Autenticação segura e confiável
- **Múltiplos Provedores**: Login com Google, GitHub, etc.
- **Proteção de Rotas**: Middleware de autenticação
- **Sessões Persistentes**: Manutenção do estado de login

### Recursos Avançados
- **Upload de Mídia**: Imagens e vídeos com otimização automática
- **Sistema de Anúncios**: Plataforma de publicidade integrada
- **Pagamentos**: Integração com MercadoPago e Stripe
- **WebRTC**: Chamadas de vídeo e áudio em tempo real
- **Notificações Push**: Alertas em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/ui**: Componentes de UI modernos
- **Lucide React**: Ícones consistentes

### Backend & Banco de Dados
- **Supabase**: Backend-as-a-Service com PostgreSQL
- **PostgreSQL**: Banco de dados relacional robusto
- **Redis**: Cache e sessões em tempo real

### Integrações
- **MercadoPago**: Processamento de pagamentos
- **Stripe**: Pagamentos internacionais
- **WebRTC**: Comunicação peer-to-peer
- **Cloudinary**: Otimização de mídia

## 📱 Layout e Responsividade

### Estrutura de Grid
```css
/* Layout principal */
.grid-cols-1 lg:grid-cols-4 xl:grid-cols-5

/* Sidebar esquerda */
lg:col-span-1

/* Timeline central */
lg:col-span-2 xl:col-span-3

/* Sidebar direita */
lg:col-span-1
```

### Sidebars Otimizadas
- **Larguras Fixas**: 72px (mobile) / 275px (desktop) para esquerda, 350px para direita
- **Overflow Control**: `overflow-x-hidden` para evitar scroll horizontal
- **Scroll Oculto**: Classe `scrollbar-hide` para esconder barra de rolagem
- **Sticky Positioning**: Sidebars fixas durante scroll

### Navegação Mobile
- **MobileNav**: Barra de navegação lateral em dispositivos móveis
- **Touch-Friendly**: Botões otimizados para toque
- **Responsive Breakpoints**: Adaptação automática por tamanho de tela

## 🎨 Sistema de Design

### Cores Principais
- **Primária**: Gradiente rosa-roxo (#ec4899 → #8b5cf6)
- **Secundária**: Tons de cinza neutros
- **Acentos**: Verde para sucesso, vermelho para erro, azul para info

### Tipografia
- **Hierarquia Clara**: Títulos, subtítulos e corpo de texto bem definidos
- **Responsiva**: Tamanhos adaptáveis por breakpoint
- **Legibilidade**: Contraste e espaçamento otimizados

### Componentes
- **Cards**: Elevação e sombras sutis
- **Botões**: Estados hover e focus bem definidos
- **Formulários**: Validação visual e feedback imediato
- **Modais**: Overlays com backdrop blur

## 📋 Versionamento

Este projeto segue o **Versionamento Semântico** (SemVer). Atualmente estamos na versão **0.2.0-alpha.1**.

### Versão Atual
- **0.2.0-alpha.1**: Sistema Open Dates implementado, correções críticas de bugs
- Veja o [CHANGELOG.md](CHANGELOG.md) para detalhes completos das mudanças

### Próximas Versões
- `0.2.0-alpha.2`: Melhorias no sistema Open Dates
- `0.2.0-beta.1`: Sistema Open Dates estável
- `0.2.0`: Versão estável com Open Dates
- `1.0.0`: Primeira versão major para produção

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- pnpm
- Supabase (banco de dados)
- Conta MercadoPago (para pagamentos)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/openlove.git
cd openlove
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Na raiz do projeto
touch .env.local
```

Adicione as seguintes variáveis obrigatórias:

```env
# Supabase Configuration (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth Configuration (RECOMENDADO)
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Como obter as chaves do Supabase:**
1. Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings > API**
4. Copie as informações necessárias

Para mais detalhes, consulte [docs/SETUP_ENVIRONMENT.md](docs/SETUP_ENVIRONMENT.md)

4. **Configure o banco de dados**

Execute os scripts SQL no Supabase SQL Editor na seguinte ordem:

```sql
-- 1. Schema inicial completo
\i scripts/016_complete_openlove_schema.sql

-- 2. Dados de exemplo
\i scripts/017_seed_sample_data.sql

-- 3. Correção da estrutura da tabela users (IMPORTANTE)
\i scripts/026_fix_users_table.sql

-- 4. Sistema Open Dates
\i scripts/025_open_dates_system.sql
```

**Importante:** O script `026_fix_users_table.sql` corrige a estrutura da tabela `users` e é essencial para o funcionamento do sistema de registro.

### 🔍 Diagnóstico de Problemas

Se você encontrar erros de registro, siga estes passos:

#### 1. Correção Completa (Recomendado)
Cole este script completo no SQL Editor do Supabase:

```sql
-- Cole o conteúdo do arquivo scripts/comprehensive_fix.sql
-- Execute tudo de uma vez
```

**Este script inclui TODAS as correções necessárias baseadas na análise completa do código.**

#### 2. Teste Rápido (Opcional)
Após a correção, execute este teste para verificar:

```sql
-- Cole o conteúdo do arquivo scripts/quick_test.sql
-- Execute tudo de uma vez
```

#### 3. Scripts Alternativos
Se preferir scripts separados:
- `scripts/fix_all_at_once.sql` - Versão anterior (menos completa)
- `scripts/diagnose_registration.sql` - Diagnóstico detalhado

**Nota:** No SQL Editor do Supabase, você pode colar todo o script e executar de uma vez, não precisa selecionar query por query.

5. **Execute o projeto**
```bash
pnpm run dev
```

### Configuração do Sistema Open Dates

O sistema Open Dates requer algumas configurações específicas:

1. **Tabelas do Banco**: Execute o script `025_open_dates_system.sql`
2. **Funções SQL**: O script cria funções para recomendação e matching
3. **Políticas RLS**: Segurança configurada automaticamente
4. **Dados de Exemplo**: Cards de exemplo incluídos no script

### Estrutura do Sistema Open Dates

```
app/
├── components/timeline/
│   ├── OpenDatesCard.tsx      # Card individual com drag & drop
│   └── OpenDatesStack.tsx     # Stack de cards principal
├── api/open-dates/
│   ├── recommendations/       # API de recomendações
│   ├── interactions/          # API de likes/pass/super_like
│   └── matches/              # API de matches
└── home/page.tsx             # Integração na sidebar
```

## 📊 Estrutura do Projeto

```
app/
├── components/          # Componentes reutilizáveis
│   ├── timeline/       # Componentes da timeline
│   ├── auth/          # Autenticação
│   ├── chat/          # Sistema de chat
│   ├── media/         # Upload e otimização de mídia
│   └── ui/            # Componentes base de UI
├── home/              # Página principal com layout em grid
├── api/               # Rotas da API
├── auth/              # Páginas de autenticação
├── profile/           # Perfis de usuário
├── events/            # Sistema de eventos
├── communities/       # Comunidades
├── messages/          # Sistema de mensagens
└── lib/               # Utilitários e configurações
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte seu repositório ao Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push
```

### Docker
```bash
# Build da imagem
docker build -t openlove .

# Execução
docker run -p 3000:3000 openlove
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/openlove/issues)
- **Discord**: [Comunidade OpenLove](https://discord.gg/openlove)

## 🔮 Roadmap

- [ ] Sistema de matchmaking avançado
- [ ] Integração com redes sociais
- [ ] Sistema de gamificação
- [ ] Analytics e métricas avançadas
- [ ] App mobile nativo
- [ ] Inteligência artificial para recomendações
- [ ] Sistema de verificação de perfis
- [ ] Marketplace de produtos e serviços

---

**OpenLove** - Conectando pessoas, respeitando diversidade. ❤️