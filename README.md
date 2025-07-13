# OpenLove - Plataforma de Conexões

Uma plataforma moderna de networking social focada em conectar pessoas através de interesses compartilhados, eventos e comunidades.

## 🚀 Funcionalidades Principais

### Sistema de Autenticação e Sessão
- **Login/Registro**: Sistema completo de autenticação com email e senha
- **Verificação de Email**: 2FA com código de verificação enviado por email
- **Timeout de Sessão**: Sessões expiram automaticamente após 5 horas por segurança
- **Redirecionamento Inteligente**: 
  - Usuários não logados são redirecionados para a página inicial (/)
  - Usuários logados são redirecionados para a home (/home)
  - Proteção automática de rotas sensíveis
- **Verificação Periódica**: Sistema verifica timeout de sessão a cada 5 minutos
- **Logout Automático**: Sessões expiradas fazem logout automático e redirecionam

### Perfil de Usuário
- **Perfil Completo**: Galeria, posts, amigos, reputação, tokens
- **Foto de Perfil e Capa**: Upload e gerenciamento de mídia
- **Informações Detalhadas**: Data de entrada, cidade, distância
- **Sistema de Seguir**: Seguir usuários ou solicitar acesso para perfis privados
- **Visualização de Perfil**: Sistema completo de visualização de perfis por username
- **Perfil Integrado**: Visualização do perfil diretamente na página home (no lugar da timeline)

### Timeline e Navegação
- **Sistema de Navegação Interna (SPA)**: Todas as páginas abrem na view principal
- **Controle de Estado**: Views e histórico de navegação
- **Views Disponíveis**: Home, perfil, eventos, comunidades, mensagens, notificações, amigos, busca, salvos, configurações
- **Sidebar Responsiva**: Navegação lateral com todas as funcionalidades
- **Navegação Móvel**: Menu mobile otimizado

### Sistema de Posts
- **Criação de Posts**: Texto, mídia, visibilidade (público/amigos)
- **Interações**: Likes, comentários, compartilhamento
- **Timeline Dinâmica**: Feed personalizado com posts de usuários seguidos
- **Mídia Otimizada**: Upload e otimização automática de imagens e vídeos

### Comunidades e Eventos
- **Criação de Comunidades**: Grupos temáticos com moderadores
- **Eventos**: Criação e participação em eventos
- **Sistema de Membros**: Gerenciamento de membros e permissões

### Sistema de Amizades
- **Solicitações de Amizade**: Enviar e responder solicitações
- **Sugestões**: Algoritmo de recomendação de amigos
- **Gerenciamento**: Lista de amigos e solicitações pendentes

### Chat e Comunicação
- **Chat em Tempo Real**: Sistema de mensagens instantâneas
- **Chamadas de Vídeo**: WebRTC para chamadas de vídeo
- **Notificações**: Sistema de notificações em tempo real

### Sistema de Pagamentos
- **Integração MercadoPago**: Pagamentos e assinaturas
- **Planos Premium**: 
  - **Free**: Acesso básico
  - **Open Ouro (R$ 25/mês)**: 5 imagens, 1 vídeo (25MB), mensagens
  - **Open Diamante (R$ 45,90/mês)**: 10 imagens, 1 vídeo (50MB), recursos avançados
- **Webhooks**: Processamento seguro de pagamentos

### Sistema de Anúncios
- **Dashboard de Anúncios**: Criação e gerenciamento de campanhas
- **Métricas**: Analytics e relatórios de performance
- **Segmentação**: Direcionamento por público-alvo

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS, shadcn/ui
- **Estado**: React Context, Zustand
- **Mídia**: Supabase Storage
- **Pagamentos**: MercadoPago
- **Chat**: WebRTC, Socket.io
- **Deploy**: Vercel, Docker

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (gerenciador de pacotes)
- Conta no Supabase
- Conta no MercadoPago (para pagamentos)

## 🚀 Instalação

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
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
MERCADOPAGO_ACCESS_TOKEN=seu_token_do_mercadopago
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret
```

4. **Configure o banco de dados**
```bash
# Execute os scripts SQL na ordem correta no Supabase SQL Editor
# 1. Script inicial
scripts/001_initial_schema.sql

# 2. Dados iniciais
scripts/002_seed_data.sql

# 3. Configuração de autenticação
scripts/003_auth_setup.sql

# 4. Correção de problemas de cadastro (IMPORTANTE!)
scripts/031_fix_registration.sql

# 5. Outros scripts conforme necessário
scripts/016_complete_openlove_schema.sql
scripts/030_message_reactions.sql
```

5. **Execute o projeto**
```bash
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`

## ⚠️ Correção de Problemas de Cadastro

Se você encontrar problemas ao cadastrar novos usuários, execute o script de correção:

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o script: `scripts/031_fix_registration.sql`
4. Verifique se todas as mensagens de sucesso aparecem

**Documentação completa:** [docs/REGISTRATION_FIX.md](docs/REGISTRATION_FIX.md)

## 🔧 Correção de Problemas Críticos (ÚLTIMA ATUALIZAÇÃO)

### Problemas Identificados e Soluções

#### 1. Sistema de Notificações com Mock
**Status**: ✅ **CORRIGIDO**
- Removido sistema de notificações mockado
- Implementado sistema real com banco de dados
- APIs criadas para buscar e marcar notificações
- Componente `NotificationsContent` atualizado

**Solução:**
1. **Execute os scripts de correção:**
   ```sql
   -- Execute no Supabase SQL Editor
   scripts/031_fix_notifications_schema.sql
   scripts/032_create_test_notifications.sql
   ```

2. **Teste as funcionalidades:**
   - Acesse `/home` e clique no ícone de notificações
   - Verifique se as notificações carregam
   - Teste marcar como lida

#### 2. Erro de Cookies no API de Timeline
**Status**: ✅ **CORRIGIDO**
- Corrigido uso do `cookies()` para Next.js 15
- API de timeline agora funciona corretamente em desktop

#### 3. Timeline não carrega em Desktop
**Status**: ✅ **CORRIGIDO**
- Corrigido problema de autenticação na API
- Posts agora carregam corretamente
- Seções recuperadas adequadamente

#### 4. Erro de Registro: "Database error creating new user"
**Status**: ⚠️ **REQUER AÇÃO**

**Solução:**
1. **Execute o script de correção de permissões:**
   ```sql
   -- Execute no Supabase SQL Editor
   scripts/033_fix_registration_permissions.sql
   ```

2. **Verifique as variáveis de ambiente:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
   ```

3. **Reinicie o servidor:**
   ```bash
   pnpm dev
   ```

### O que foi corrigido:
- ✅ Sistema de notificações real implementado
- ✅ APIs de notificações funcionando
- ✅ Timeline corrigida para desktop
- ✅ Permissões do service role para criar usuários
- ✅ Políticas RLS adequadas para inserção de usuários
- ✅ Melhor tratamento de sessão no AuthProvider
- ✅ Redirecionamento corrigido após login
- ✅ Logs detalhados para debug
- ✅ Compatibilidade com Next.js 15

### Funcionalidades de Notificações:
- ✅ Busca notificações do banco de dados
- ✅ Exibe notificações não lidas com destaque
- ✅ Marca notificações como lidas
- ✅ Marca todas como lidas
- ✅ Filtros por tipo (todas, não lidas, menções, eventos)
- ✅ Interface responsiva e moderna

### Se o problema persistir:
1. Verifique os logs do console do navegador
2. Verifique os logs do servidor
3. Confirme se os scripts SQL foram executados com sucesso
4. Teste com um novo usuário

**Documentação completa das correções:** [docs/NOTIFICATIONS_FIX.md](docs/NOTIFICATIONS_FIX.md)

**Documentação completa:** [docs/CRITICAL_FIXES.md](docs/CRITICAL_FIXES.md)

## 🔧 Configuração do Sistema de Autenticação

### 1. Configuração do Supabase
- Configure os templates de email em **Settings > Auth > Email Templates**
- Configure SMTP personalizado em **Settings > Auth > SMTP Settings** (opcional)
- Configure as políticas RLS nas tabelas do banco

### 2. Timeout de Sessão
O sistema implementa timeout automático de sessão:
- **Duração**: 5 horas
- **Verificação**: A cada 5 minutos no cliente
- **Middleware**: Verificação em todas as requisições
- **Logout Automático**: Redirecionamento para página inicial

### 3. Proteção de Rotas
- **Middleware**: Proteção automática de rotas sensíveis
- **Redirecionamento**: Inteligente baseado no status de autenticação
- **APIs**: Todas as APIs verificam autenticação e timeout

## 📱 Funcionalidades Mobile-First

- **Design Responsivo**: Otimizado para dispositivos móveis
- **Navegação Touch**: Interface adaptada para toque
- **Navegação Mobile**: Sidebar com ícones e botão de logout
- **Performance**: Otimizações para conexões lentas
- **PWA**: Suporte a Progressive Web App

## 🔒 Segurança

- **Autenticação**: JWT tokens gerenciados pelo Supabase
- **RLS**: Row Level Security no banco de dados
- **Validação**: Sanitização de inputs e validação de dados
- **HTTPS**: Forçado em produção
- **CORS**: Configurado adequadamente
- **Rate Limiting**: Proteção contra ataques de força bruta

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Executar testes com coverage
pnpm test:coverage

# Executar testes em modo watch
pnpm test:watch
```

## 📦 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Docker
```bash
# Build da imagem
docker build -t openlove .

# Executar container
docker run -p 3000:3000 openlove
```

## 📊 Monitoramento

- **Logs**: Centralizados no Vercel e Supabase
- **Métricas**: Analytics de uso e performance
- **Alertas**: Notificações para falhas críticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/seu-usuario/openlove/issues)
- Consulte a [documentação](docs/)
- Entre em contato: suporte@openlove.com

## 🗺️ Roadmap

- [ ] Sistema de notificações push
- [ ] Integração com redes sociais
- [ ] Sistema de gamificação
- [ ] Analytics avançados
- [ ] API pública
- [ ] App mobile nativo

---

**OpenLove** - Conectando pessoas, criando relacionamentos.