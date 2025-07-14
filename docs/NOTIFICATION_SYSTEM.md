# Sistema Completo de Notificações - OpenLove

## Visão Geral

O sistema de notificações do OpenLove é uma solução completa e robusta que gerencia todas as interações da rede social, incluindo mensagens, comentários, curtidas, saves, follows, mentions e muito mais.

## 🏗️ Arquitetura

### Componentes Principais

1. **Banco de Dados (PostgreSQL/Supabase)**
   - Tabela `notifications` - Armazena todas as notificações
   - Tabela `notification_settings` - Configurações por usuário
   - Tabela `notification_queue` - Fila para processamento assíncrono

2. **Backend (Next.js API Routes)**
   - `/api/notifications` - CRUD principal de notificações
   - `/api/notifications/[id]/read` - Marcar como lida
   - `/api/notifications/read-all` - Marcar todas como lidas
   - `/api/notifications/settings` - Gerenciar configurações

3. **Frontend (React)**
   - `NotificationCenter.tsx` - Componente principal
   - `useNotifications.ts` - Hook personalizado
   - Integração com Supabase Realtime

## 📊 Estrutura do Banco de Dados

### Tabela `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    related_conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    notification_data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `notification_settings`
```sql
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Tipos de notificação
    likes_enabled BOOLEAN DEFAULT TRUE,
    comments_enabled BOOLEAN DEFAULT TRUE,
    follows_enabled BOOLEAN DEFAULT TRUE,
    messages_enabled BOOLEAN DEFAULT TRUE,
    mentions_enabled BOOLEAN DEFAULT TRUE,
    saves_enabled BOOLEAN DEFAULT TRUE,
    shares_enabled BOOLEAN DEFAULT TRUE,
    events_enabled BOOLEAN DEFAULT TRUE,
    communities_enabled BOOLEAN DEFAULT TRUE,
    system_enabled BOOLEAN DEFAULT TRUE,
    matches_enabled BOOLEAN DEFAULT TRUE,
    open_dates_enabled BOOLEAN DEFAULT TRUE,
    
    -- Canais
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    
    -- Horário silencioso
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔔 Tipos de Notificação

### Interações Básicas
- **`like`** - Curtidas em posts
- **`comment`** - Comentários em posts
- **`follow`** - Novos seguidores
- **`mention`** - Menções em posts/comentários

### Comunicação
- **`message`** - Mensagens diretas
- **`save`** - Posts salvos por outros usuários
- **`share`** - Posts compartilhados

### Eventos e Comunidades
- **`event_invite`** - Convites para eventos
- **`event_reminder`** - Lembretes de eventos
- **`event_update`** - Atualizações de eventos
- **`event_cancelled`** - Eventos cancelados
- **`community_invite`** - Convites para comunidades
- **`community_update`** - Atualizações de comunidades

### Sistema e Premium
- **`system`** - Notificações do sistema
- **`welcome`** - Boas-vindas
- **`achievement`** - Conquistas
- **`premium_offer`** - Ofertas premium
- **`security_alert`** - Alertas de segurança

### Open Dates
- **`match`** - Novos matches
- **`open_date_interaction`** - Interações no Open Dates
- **`open_date_match`** - Matches no Open Dates

## ⚡ Funcionalidades

### 1. Notificações em Tempo Real
- **Supabase Realtime** para atualizações instantâneas
- **WebSocket** para sincronização em tempo real
- **Cache local** para performance otimizada

### 2. Sistema Inteligente
- **Filtros por tipo** de notificação
- **Configurações personalizadas** por usuário
- **Horário silencioso** configurável
- **Prioridades** (baixa, normal, alta, urgente)

### 3. Interface Moderna
- **Design responsivo** para mobile e desktop
- **Animações suaves** e feedback visual
- **Badge de contador** de não lidas
- **Pull-to-refresh** para atualizar

### 4. Performance
- **Paginação** para grandes volumes
- **Índices otimizados** no banco
- **Lazy loading** de notificações
- **Cleanup automático** de notificações antigas

## 🚀 Como Usar

### 1. Instalar o Componente
```tsx
import NotificationCenter from '@/app/components/notifications/NotificationCenter'

// No seu layout ou header
<NotificationCenter />
```

### 2. Usar o Hook
```tsx
import { useNotifications } from '@/app/hooks/useNotifications'

function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateSettings
  } = useNotifications()

  return (
    <div>
      <p>Notificações não lidas: {unreadCount}</p>
      {/* Seu componente */}
    </div>
  )
}
```

### 3. API Endpoints

#### Listar Notificações
```bash
GET /api/notifications?page=1&limit=20&unread=true&type=like
```

#### Marcar como Lida
```bash
POST /api/notifications/{id}/read
```

#### Marcar Todas como Lidas
```bash
POST /api/notifications/read-all
```

#### Atualizar Configurações
```bash
POST /api/notifications
{
  "action": "update_settings",
  "settings": {
    "likes_enabled": true,
    "messages_enabled": false
  }
}
```

## 🔧 Configuração

### 1. Executar Script SQL
Execute o script `scripts/034_complete_notification_system.sql` no Supabase SQL Editor.

### 2. Configurar Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 3. Adicionar ao Layout
```tsx
// app/layout.tsx
import NotificationCenter from '@/app/components/notifications/NotificationCenter'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>
          <NotificationCenter />
        </header>
        {children}
      </body>
    </html>
  )
}
```

## 📈 Estatísticas e Métricas

### Função `get_notification_stats`
```sql
SELECT get_notification_stats('user_id') 
-- Retorna:
{
  "total_notifications": 150,
  "unread_notifications": 23,
  "notifications_by_type": {
    "like": 45,
    "comment": 30,
    "follow": 15,
    "message": 20
  },
  "recent_notifications": [...]
}
```

## 🛡️ Segurança

### Row Level Security (RLS)
```sql
-- Usuários só podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Sistema pode criar notificações
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);
```

### Validação de Token
- **Bearer token** obrigatório em todas as APIs
- **Verificação de sessão** via Supabase Auth
- **Rate limiting** para prevenir spam

## 🔄 Triggers Automáticos

### Função `create_smart_notification`
```sql
-- Dispara automaticamente para:
-- - Novos likes
-- - Novos comentários  
-- - Novos follows
-- - Novas mensagens
-- - Novos saves
-- - Participação em eventos
```

### Função `create_mention_notifications`
```sql
-- Detecta menções (@username) em:
-- - Posts
-- - Comentários
-- Cria notificação para usuário mencionado
```

## 🧹 Manutenção

### Cleanup Automático
```sql
-- Remove notificações antigas (30+ dias)
-- Remove notificações expiradas
-- Limpa fila processada (7+ dias)
SELECT cleanup_old_notifications();
```

### Monitoramento
- **Logs detalhados** de todas as operações
- **Métricas de performance** 
- **Alertas de erro** em tempo real

## 🎯 Próximos Passos

### Funcionalidades Futuras
1. **Push Notifications** via Service Workers
2. **Email Notifications** via SendGrid
3. **Notificações por SMS** via Twilio
4. **Agrupamento inteligente** de notificações similares
5. **Machine Learning** para relevância personalizada
6. **Notificações programadas** para eventos futuros

### Otimizações
1. **Redis Cache** para notificações frequentes
2. **CDN** para assets de notificação
3. **WebSocket clusters** para alta escalabilidade
4. **Analytics** detalhados de engajamento

## 📝 Exemplos de Uso

### Criar Notificação Manual
```sql
SELECT create_system_notification(
  'user_id',
  'welcome',
  'Bem-vindo ao OpenLove!',
  'Sua conta foi criada com sucesso.',
  '{"welcome": true}'::jsonb
);
```

### Verificar Configurações
```sql
SELECT * FROM notification_settings 
WHERE user_id = 'user_id';
```

### Estatísticas por Tipo
```sql
SELECT type, COUNT(*) 
FROM notifications 
WHERE user_id = 'user_id' 
GROUP BY type;
```

## ✅ Checklist de Implementação

- [x] Estrutura do banco de dados
- [x] Triggers automáticos
- [x] APIs RESTful
- [x] Componente React
- [x] Hook personalizado
- [x] Tempo real (Supabase Realtime)
- [x] Configurações por usuário
- [x] Interface responsiva
- [x] Documentação completa
- [x] Testes de integração
- [x] Políticas de segurança
- [x] Cleanup automático

O sistema de notificações está **100% funcional** e pronto para produção! 🚀 