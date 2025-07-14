# Sistema de Notificações - OpenLove

## 📋 Visão Geral

O sistema de notificações do OpenLove é um sistema completo estilo Twitter que inclui:

- **Badges visuais** com pontos rosas para notificações não lidas
- **Notificações em tempo real** via Supabase Realtime
- **Toasts automáticos** para novos posts
- **Centro de notificações** com interface moderna
- **Configurações personalizáveis** por usuário
- **Triggers automáticos** para likes, comentários, follows, etc.

## 🚀 Instalação

### 1. Executar Script SQL

Primeiro, execute o script SQL para configurar o banco de dados:

```sql
-- Execute o arquivo scripts/037_notification_system.sql no seu Supabase
```

### 2. Verificar Componentes

Os seguintes componentes foram criados:

- `app/hooks/useNotifications.ts` - Hook principal
- `app/components/notifications/NotificationBadge.tsx` - Badge de notificações
- `app/components/notifications/MessageBadge.tsx` - Badge de mensagens
- `app/components/notifications/NotificationCenter.tsx` - Centro de notificações
- `app/components/notifications/PostToast.tsx` - Toast para novos posts
- `app/components/notifications/NotificationSystem.tsx` - Sistema completo

### 3. Integrar no Layout

Adicione o sistema de notificações no seu header ou layout principal:

```tsx
import { NotificationSystem } from '@/app/components/notifications/NotificationSystem'

// No seu componente de header
<div className="flex items-center space-x-4">
  <NotificationSystem />
  {/* Outros elementos do header */}
</div>
```

## 🔧 Funcionalidades

### Badges Visuais

- **Ponto rosa animado** para notificações não lidas
- **Contador numérico** para múltiplas notificações
- **Tooltips informativos** ao passar o mouse

### Tipos de Notificação

- `new_message` - Novas mensagens
- `new_follower` - Novos seguidores
- `new_like` - Novos likes
- `new_comment` - Novos comentários
- `mention` - Menções
- `new_match` - Novos matches
- `new_event` - Novos eventos
- `system` - Notificações do sistema

### Triggers Automáticos

O sistema automaticamente cria notificações quando:

- Alguém curte um post
- Alguém comenta em um post
- Alguém segue um usuário
- Alguém envia uma mensagem
- Alguém menciona um usuário
- Há um novo match

## 📱 Interface

### Centro de Notificações

- **Modal responsivo** com backdrop
- **Tabs** para "Todas" e "Não lidas"
- **Ícones coloridos** por tipo de notificação
- **Timestamps** relativos (ex: "há 2 horas")
- **Botão "Marcar todas como lidas"**

### Toast de Posts

- **Notificação automática** para novos posts
- **Preview do conteúdo** do post
- **Botão "Ver"** que navega para o timeline
- **Duração de 5 segundos**

## 🎨 Personalização

### Cores dos Ícones

```tsx
const notificationColors = {
  new_message: 'bg-blue-100 text-blue-800',
  new_follower: 'bg-green-100 text-green-800',
  new_like: 'bg-pink-100 text-pink-800',
  // ... mais cores
}
```

### Configurações por Usuário

Cada usuário pode configurar:

- Notificações por email
- Notificações push
- Notificações no app
- Tipos específicos de notificação
- Horário silencioso

## 🔄 Real-time

O sistema usa Supabase Realtime para:

- **Atualização automática** de badges
- **Notificações instantâneas** via toast
- **Sincronização** entre abas do navegador
- **Contadores em tempo real**

## 📊 Estatísticas

O sistema fornece estatísticas em tempo real:

```tsx
{
  total: 25,
  unread: 3,
  by_type: {
    new_message: { total: 10, unread: 2 },
    new_like: { total: 15, unread: 1 }
  }
}
```

## 🛠️ API Endpoints

### GET /api/notifications
Lista notificações do usuário

**Parâmetros:**
- `page` - Página (padrão: 1)
- `limit` - Limite por página (padrão: 20)
- `unread` - Apenas não lidas (true/false)
- `type` - Filtrar por tipo

### POST /api/notifications/read-all
Marca todas as notificações como lidas

### POST /api/notifications/[id]/read
Marca uma notificação específica como lida

## 🧪 Teste

Para testar o sistema:

1. **Criar uma notificação de teste:**
```sql
SELECT test_notification_system('user-id-aqui');
```

2. **Verificar estatísticas:**
```sql
SELECT get_notification_stats('user-id-aqui');
```

3. **Limpar notificações antigas:**
```sql
SELECT cleanup_old_notifications();
```

## 🔒 Segurança

- **RLS (Row Level Security)** habilitado
- **Políticas de acesso** por usuário
- **Validação de tokens** em todas as APIs
- **Sanitização** de dados de entrada

## 📈 Performance

- **Índices otimizados** para consultas rápidas
- **Paginação** para grandes volumes
- **Limpeza automática** de notificações antigas
- **Cache local** de estatísticas

## 🐛 Troubleshooting

### Problemas Comuns

1. **Badges não aparecem:**
   - Verificar se o Supabase Realtime está habilitado
   - Verificar se as políticas RLS estão corretas

2. **Notificações não são criadas:**
   - Verificar se os triggers estão funcionando
   - Verificar se as funções SQL foram criadas

3. **Toast não aparece:**
   - Verificar se o componente PostToast está montado
   - Verificar se o sonner está configurado

### Logs Úteis

```sql
-- Verificar notificações de um usuário
SELECT * FROM notifications WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- Verificar configurações
SELECT * FROM notification_settings WHERE user_id = 'user-id';

-- Verificar triggers
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%notification%';
```

## 🚀 Próximos Passos

1. **Implementar notificações push** via service workers
2. **Adicionar notificações por email** via SendGrid
3. **Criar configurações avançadas** de notificação
4. **Implementar notificações em lote** para eventos
5. **Adicionar analytics** de engajamento

## 📝 Changelog

- **v1.0.0** - Sistema inicial com badges e centro de notificações
- **v1.1.0** - Adicionado toast para novos posts
- **v1.2.0** - Implementado real-time completo
- **v1.3.0** - Adicionado configurações por usuário

---

**Sistema criado com sucesso! 🎉**

Para começar a usar, execute o script SQL e integre o `NotificationSystem` no seu layout. 