# OpenLove - Rede Social Moderna

## 📋 Sobre o Projeto

OpenLove é uma rede social moderna e completa, desenvolvida com Next.js 15, TypeScript, Tailwind CSS e Supabase. O projeto oferece uma experiência de usuário rica com funcionalidades avançadas de interação social.

## ✨ Funcionalidades Principais

### 🔐 **Autenticação e Perfil**
- Sistema de autenticação completo com Supabase Auth
- Perfis de usuário personalizáveis com avatars e badges
- Sistema de badges dinâmicos (verificado, premium, online, novo)
- Edição de perfil em tempo real

### 📱 **Interface Responsiva**
- Design mobile-first com navegação bottom
- Sidebar adaptativa para desktop
- Componentes otimizados para diferentes telas
- **Tipografia responsiva** - fontes menores em mobile para melhor legibilidade
- Animações suaves com Framer Motion

### 💬 **Sistema de Comunicação**
- Chat em tempo real com WebRTC
- Notificações com badges do HeroUI
- Sistema de mensagens com reações
- Upload de arquivos no chat

### 🎨 **Design Moderno**
- Cards com design moderno e animações
- Gradientes e sombras sutis
- Micro-interações em botões e elementos
- **Layout responsivo otimizado** para mobile e desktop
- Cores dinâmicas baseadas no tema

### 📊 **Funcionalidades Avançadas**
- Sistema de likes com atualização otimista
- Busca avançada com filtros múltiplos
- Trending topics em tempo real
- Sugestões de usuários inteligentes
- Eventos próximos com geolocalização
- Sistema de follows com estados visuais

### 🔔 **Notificações Inteligentes**
- Badges do HeroUI para notificações
- Centro de notificações modal
- Configurações personalizáveis
- Horário silencioso
- Diferentes tipos de notificação

## 🚀 **Versão**: v0.3.0-alpha.9
**Última atualização**: Janeiro 2025  
**Status**: Em desenvolvimento ativo

### 📱 **Melhorias Mobile Recentes**
- **Tipografia responsiva** implementada em todos os cards
- Fontes menores em mobile (`text-xs sm:text-sm`) para melhor legibilidade
- Botões e elementos otimizados para telas pequenas
- Layout adaptativo para diferentes tamanhos de tela
- Melhor experiência de usuário em dispositivos móveis

### 🎯 **Funcionalidades Implementadas**
- ✅ Sistema completo de autenticação
- ✅ Perfis de usuário com badges dinâmicos
- ✅ Chat em tempo real com WebRTC
- ✅ Notificações com badges do HeroUI
- ✅ Timeline com posts interativos
- ✅ Sistema de likes e comentários
- ✅ Busca avançada com filtros
- ✅ Navegação mobile responsiva
- ✅ Design moderno com animações
- ✅ **Tipografia responsiva otimizada**

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilização**: Tailwind CSS, Framer Motion
- **UI Components**: HeroUI, Shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Pagamentos**: MercadoPago, Stripe
- **Deploy**: Vercel

## 📱 Responsividade

### **Breakpoints Otimizados**
- Mobile: < 768px (fontes menores)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### **Tipografia Responsiva**
- **Mobile**: `text-xs` (12px) para melhor legibilidade
- **Desktop**: `text-sm` (14px) para conforto visual
- **Títulos**: `text-lg sm:text-xl` para hierarquia clara
- **Botões**: `text-xs sm:text-sm` para proporção adequada

### **Componentes Adaptativos**
- **PostCard**: Fontes responsivas em todos os elementos
- **UserProfile**: Layout compacto em mobile
- **Navigation**: Bottom nav em mobile, sidebar em desktop
- **Chat**: Interface otimizada para telas pequenas
- **Filters**: Accordion em mobile, grid em desktop

## ⚡ Performance

### **Otimizações Implementadas**
- Lazy loading de componentes
- Debounce em buscas
- Paginação em listas
- Caching de queries
- Compressão de imagens
- Bundle splitting
- **Tipografia responsiva** para melhor performance visual

### **Métricas Recomendadas**
- FCP < 1.5s
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms

## 🎨 Design System

### **Cores Principais**
- **Primária**: Rosa/roxo gradiente (`from-pink-500 to-purple-500`)
- **Secundária**: Azul (`blue-600`)
- **Neutra**: Cinza (`gray-900`, `gray-100`)

### **Tipografia Responsiva**
```css
/* Mobile First */
.text-xs sm:text-sm    /* 12px → 14px */
.text-sm sm:text-base  /* 14px → 16px */
.text-lg sm:text-xl    /* 18px → 20px */
.text-xl sm:text-2xl   /* 20px → 24px */
```

### **Componentes Modernos**
- Cards com backdrop blur
- Gradientes sutis
- Sombras dinâmicas
- Micro-animações
- Estados visuais claros

## 🔧 Configuração

### **Pré-requisitos**
```bash
Node.js 18+
pnpm 8+
Supabase account
```

### **Instalação**
```bash
git clone [repository]
cd openlove
pnpm install
cp .env.example .env.local
# Configure as variáveis de ambiente
pnpm dev
```

### **Variáveis de Ambiente**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Estrutura do Projeto

```
app/
├── components/
│   ├── timeline/
│   │   ├── PostCard.tsx          # Cards responsivos
│   │   └── RecommendedPostCard.tsx
│   ├── profile/
│   │   └── UserProfile.tsx       # Perfil responsivo
│   ├── navigation/
│   │   └── MobileNavigation.tsx  # Nav mobile
│   └── notifications/
│       └── NotificationBadge.tsx # Badges HeroUI
├── api/                          # APIs REST
├── hooks/                        # Hooks customizados
└── lib/                          # Utilitários
```

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
vercel --prod
```

### **Configurações de Produção**
- Configurar domínio personalizado
- Habilitar SSL
- Configurar CORS
- Backup automático
- Monitoramento

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] Push notifications
- [ ] Video calls
- [ ] Stories
- [ ] Live streaming
- [ ] AI moderation
- [ ] Marketplace
- [ ] Events calendar
- [ ] Groups

### **Melhorias Técnicas**
- [ ] Micro-frontends
- [ ] GraphQL
- [ ] Redis cache
- [ ] Kubernetes
- [ ] CDN
- [ ] Elasticsearch

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no GitHub ou entre em contato através do email: support@openlove.com

---

**🎉 OpenLove - Conectando pessoas através da tecnologia moderna!**