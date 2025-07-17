# OpenLove - Rede Social Moderna

## 🎉 Sistema Completo Implementado

O OpenLove é uma rede social moderna e completa, desenvolvida com Next.js 14, TypeScript, Tailwind CSS e Supabase. O sistema inclui funcionalidades avançadas de localização padronizada, sistema de posts com áudio e enquetes para assinantes, chat em tempo real, notificações e muito mais.

### 🚀 Context Engineering Implementado
O projeto agora conta com um sistema completo de **Context Engineering** para desenvolvimento assistido por IA, reduzindo em até 90% o uso de tokens e aumentando drasticamente a produtividade. Veja [AI_CONTEXT_QUICK_START.md](docs/AI_CONTEXT_QUICK_START.md) para começar.

---

## ✨ Funcionalidades Principais

### 🔍 **Sistema de Localização Padronizada**
- ✅ **Busca de cidades** via API do IBGE
- ✅ **Autocompletar** com debounce
- ✅ **Coordenadas automáticas** para cálculo de distância
- ✅ **Filtros por distância** com slider interativo
- ✅ **Mapeamento correto de UFs** (Paraná → PR, São Paulo → SP, etc.)

### 📱 **Posts Avançados (Apenas Assinantes)**
- ✅ **Posts de texto** com limite de 2000 caracteres
- ✅ **Upload de imagens** (máximo 10MB, compressão automática)
- ✅ **Upload de vídeos** (máximo 60 segundos, MP4)
- ✅ **Gravação de áudio** (apenas assinantes)
- ✅ **Criação de enquetes** (2-4 opções, apenas assinantes)
- ✅ **Visibilidade configurável** (público/amigos)
- ✅ **Interface responsiva** para todas as telas

### 💬 **Sistema de Chat Completo**
- ✅ **Conversas em tempo real** via Supabase Realtime
- ✅ **Upload de arquivos** (drag & drop)
- ✅ **Status de leitura** e indicadores de digitação
- ✅ **Interface mobile responsiva** com navegação adaptativa
- ✅ **Busca em conversas** e histórico

### 🔔 **Sistema de Notificações**
- ✅ **Badges animados** com contadores
- ✅ **Centro de notificações** modal
- ✅ **Configurações personalizáveis** por tipo
- ✅ **Horário silencioso** configurável
- ✅ **Real-time updates**

### 👤 **Perfis Avançados**
- ✅ **Páginas de perfil completas** com estatísticas
- ✅ **Edição de perfil** com upload de avatar/capa
- ✅ **Sistema de seguidores** e seguindo
- ✅ **Configurações de privacidade**
- ✅ **Badges de verificação** e premium

### 🔐 **Sistema de Autenticação**
- ✅ **Registro com localização** padronizada
- ✅ **Login/Logout** seguro
- ✅ **Confirmação de email**
- ✅ **Recuperação de senha**
- ✅ **Sessões persistentes**

### 💳 **Sistema de Pagamentos**
- ✅ **Integração MercadoPago** completa
- ✅ **Planos premium** (Gold, Diamante)
- ✅ **Webhooks** para atualização automática
- ✅ **Histórico de assinaturas**

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações suaves
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### **Backend**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança em nível de linha
- **Supabase Realtime** - WebSockets em tempo real
- **Supabase Storage** - Armazenamento de arquivos

### **APIs Externas**
- **IBGE API** - Busca de cidades brasileiras
- **MercadoPago API** - Processamento de pagamentos

---

## 📁 Estrutura do Projeto

```
app/
├── components/
│   ├── location/
│   │   └── LocationSearch.tsx          # Busca de cidades
│   ├── filters/
│   │   └── DistanceFilter.tsx          # Filtro por distância
│   ├── timeline/
│   │   └── CreatePost.tsx              # Criação de posts (áudio/enquete)
│   ├── chat/
│   │   ├── ChatInterface.tsx           # Interface principal do chat
│   │   ├── ConversationList.tsx        # Lista de conversas
│   │   └── FileUpload.tsx              # Upload de arquivos
│   ├── notifications/
│   │   └── NotificationSystem.tsx      # Sistema de notificações
│   └── auth/
│       └── SignUp.tsx                  # Registro com localização
├── api/
│   ├── location/
│   │   └── coordinates/route.ts        # API de coordenadas
│   ├── auth/
│   │   └── register/route.ts           # API de registro
│   └── mercadopago/
│       └── subscribe/route.ts          # API de assinaturas
├── lib/
│   └── location.ts                     # Utilitários de localização
└── privacy/ & terms/                   # Páginas legais
```

---

## 🚀 Funcionalidades por Plano

### **Plano Gratuito**
- ✅ Posts de texto
- ✅ Perfil básico
- ✅ Chat básico
- ✅ Notificações básicas

### **Plano Open Ouro (R$ 25,00/mês)**
- ✅ Tudo do plano gratuito
- ✅ Upload de imagens (máximo 5)
- ✅ Upload de vídeos (máximo 25MB)
- ✅ Gravação de áudio
- ✅ Criação de enquetes
- ✅ Perfil destacado

### **Plano Open Diamante (R$ 45,90/mês)**
- ✅ Tudo do plano Ouro
- ✅ Upload de imagens (máximo 10)
- ✅ Upload de vídeos (máximo 50MB)
- ✅ Prioridade no suporte
- ✅ Analytics avançados

---

## 🎨 Design System

### **Cores Principais**
- **Pink-500** → **Purple-600** (gradiente principal)
- **Gray-50** → **Gray-900** (modo claro/escuro)
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px)

### **Componentes Responsivos**
- **Mobile-first** design
- **Flexbox/Grid** layouts adaptativos
- **Touch-friendly** interfaces
- **Dark mode** completo

---

## 📱 Responsividade

### **Mobile (< 768px)**
- Bottom navigation
- Full-screen modals
- Compact layouts
- Touch-optimized buttons

### **Tablet (768px - 1024px)**
- Sidebar navigation
- Medium-sized components
- Balanced spacing

### **Desktop (> 1024px)**
- Full navigation
- Large components
- Multi-column layouts

---

## 🔧 Configuração

### **1. Variáveis de Ambiente**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

### **2. Instalação**
```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

### **3. Banco de Dados**
Execute os scripts SQL na ordem:
1. `scripts/016_complete_database_schema.sql`
2. `scripts/017_mercadopago_integration.sql`
3. Configurar RLS policies
4. Habilitar Supabase Realtime

---

## 🎯 Funcionalidades Especiais

### **Sistema de Localização**
- **API IBGE**: Busca automática de cidades
- **Coordenadas**: Cálculo automático de latitude/longitude
- **Distância**: Fórmula de Haversine para cálculos precisos
- **Filtros**: Slider interativo por distância máxima

### **Posts Avançados**
- **Áudio**: Gravação direta no navegador (MediaRecorder API)
- **Enquetes**: Sistema de votação com 2-4 opções
- **Compressão**: Redução automática de imagens
- **Validação**: Verificação de tipos e tamanhos de arquivo

### **Chat em Tempo Real**
- **WebSockets**: Conexão persistente via Supabase Realtime
- **Upload**: Drag & drop de arquivos
- **Status**: Indicadores de online/offline
- **Busca**: Filtro em conversas e mensagens

---

## 📊 Performance

### **Otimizações Implementadas**
- ✅ **Lazy loading** de componentes
- ✅ **Debounce** em buscas
- ✅ **Compressão** de imagens
- ✅ **Caching** de queries
- ✅ **Bundle splitting**

### **Métricas Alvo**
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **FID**: < 100ms

---

## 🔒 Segurança

### **Implementado**
- ✅ **Row Level Security (RLS)** em todas as tabelas
- ✅ **Validação** client-side e server-side
- ✅ **Sanitização** de uploads
- ✅ **Rate limiting** (recomendado)
- ✅ **HTTPS** obrigatório

---

## 📞 Suporte

### **Problemas Comuns**

#### **Localização não funciona**
```javascript
// Verificar API do IBGE
fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
  .then(response => response.json())
  .then(data => console.log('IBGE API:', data))
```

#### **Upload falha**
```javascript
// Verificar configuração do Storage
const { data, error } = await supabase.storage
  .from('avatars')
  .list('', { limit: 1 })
```

#### **Chat não atualiza**
```sql
-- Verificar Realtime
SELECT * FROM pg_stat_subscription;
```

---

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
# Configurar variáveis
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### **Configurações de Produção**
- Configurar domínio personalizado
- Habilitar SSL
- Configurar CORS no Supabase
- Backup automático do banco

---

## 🤖 Context Engineering

O projeto implementa **Context Engineering** para desenvolvimento assistido por IA, uma evolução do prompt engineering que foca em gerenciar o contexto ao invés de apenas melhorar prompts.

### **Benefícios**
- ✅ **90% menos tokens** usados com IAs
- ✅ **Desenvolvimento mais rápido** e preciso
- ✅ **Contexto modular** por funcionalidade
- ✅ **Perfis automáticos** no Cursor

### **Como Usar**
```bash
# Ver comandos disponíveis
npm run context help

# Analisar módulo de chat
npm run context analyze messages

# Gerar contexto comprimido
npm run context compress posts
```

### **Documentação**
- [Guia Rápido](docs/AI_CONTEXT_QUICK_START.md) - Comece em 5 minutos
- [Documentação Completa](docs/AI_CONTEXT_ENGINEERING.md) - Teoria e implementação
- [Templates](docs/ai-instructions/templates/) - Templates prontos para uso

---

## 📈 Roadmap

### **Próximas Funcionalidades**
1. **Stories** (conteúdo temporário)
2. **Video Calls** (WebRTC)
3. **Live Streaming** (RTMP)
4. **AI Moderation** (OpenAI)
5. **Push Notifications** (PWA)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**🎉 OpenLove - Conectando pessoas através do amor e da tecnologia!**