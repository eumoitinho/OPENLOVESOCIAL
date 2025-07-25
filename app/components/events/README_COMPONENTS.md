# 🎉 Componentes de Eventos - Análise e Dependências

## 🚨 Status Atual: CRÍTICO

### **Situação:**
- ❌ **DIRETÓRIO COMPLETAMENTE VAZIO**
- ✅ **APIs IMPLEMENTADAS** no backend
- ❌ **NENHUM COMPONENTE** de UI para eventos

## 🔗 APIs Disponíveis vs Componentes

### **APIs Implementadas:**
- ✅ `/api/events` - CRUD de eventos
- ✅ `/api/events/nearby` - Eventos próximos por geolocalização
- ✅ **Backend completo** com todas as funcionalidades

### **Componentes Existentes:**
- ❌ **NENHUM** - Diretório vazio

### **Dependências de Banco Disponíveis:**
```sql
-- Tabelas já implementadas no backend:
events (
  id, creator_id, title, description, cover_image_url,
  type, category, start_date, end_date, timezone,
  is_online, online_link, location_name, location_address,
  latitude, longitude, max_participants, min_age, max_age,
  is_paid, price, currency, tags, hashtags,
  stats, status, created_at
)

event_participants (
  id, event_id, user_id, status, role,
  checked_in, payment_status, created_at
)

event_invitations (
  id, event_id, inviter_id, invitee_id,
  status, invitation_code, expires_at
)

user_monthly_events (
  id, user_id, month_year, events_created
)
```

## ❌ Componentes Ausentes - TODOS CRÍTICOS

### **1. EventsList.tsx** - **FUNDAMENTAL**
```typescript
interface EventsListProps {
  filters?: {
    category?: string;
    location?: { lat: number; lng: number; radius: number };
    dateRange?: { start: Date; end: Date };
    type?: 'public' | 'private' | 'paid';
  };
  userLocation?: { lat: number; lng: number };
  onEventClick: (eventId: string) => void;
}

// Funcionalidades necessárias:
// - Lista de eventos com filtros
// - Mapa de eventos próximos  
// - Categorização por tipo
// - Paginação infinita
// - Estados de participação
```

### **2. CreateEvent.tsx** - **CRÍTICO**
```typescript
interface CreateEventProps {
  onEventCreated: (event: Event) => void;
  onUpgradeNeeded: (reason: string) => void;
}

// Funcionalidades necessárias:
// - Formulário completo de criação
// - Validações por plano de usuário:
//   - Gratuito: Não pode criar
//   - Ouro: 3 eventos/mês
//   - Diamante: 10 eventos/mês
// - Upload de imagem de capa
// - Seletor de localização/mapa
// - Configurações de privacidade
// - Sistema de preços (apenas Diamante)
```

### **3. EventDetails.tsx** - **CRÍTICO**
```typescript
interface EventDetailsProps {
  eventId: string;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  onShare: (event: Event) => void;
}

// Funcionalidades necessárias:
// - Detalhes completos do evento
// - Botões de participação
// - Lista de participantes
// - Mapa de localização
// - Chat do evento (para participantes)
// - Sistema de check-in com QR code
// - Pagamento para eventos pagos
```

### **4. EventCard.tsx** - **IMPORTANTE**
```typescript
interface EventCardProps {
  event: Event;
  userParticipationStatus?: 'going' | 'interested' | 'not_going';
  showDistance?: boolean;
  onQuickAction: (action: 'join' | 'interested' | 'share') => void;
}

// Funcionalidades necessárias:
// - Card visual atrativo
// - Informações resumidas
// - Status de participação
// - Ações rápidas
// - Indicadores visuais (pago, online, etc)
```

### **5. EventsMap.tsx** - **IMPORTANTE**
```typescript
interface EventsMapProps {
  events: Event[];
  userLocation?: { lat: number; lng: number };
  onEventMarkerClick: (eventId: string) => void;
  filters?: EventFilters;
}

// Funcionalidades necessárias:
// - Mapa interativo com marcadores
// - Clustering de eventos próximos
// - Filtros por distância
// - Preview popup dos eventos
// - Navegação para local do evento
```

### **6. EventParticipants.tsx** - **IMPORTANTE**  
```typescript
interface EventParticipantsProps {
  eventId: string;
  isCreator: boolean;
  onInviteMore: () => void;
  onManageParticipant: (userId: string, action: string) => void;
}

// Funcionalidades necessárias:
// - Lista de participantes confirmados
// - Lista de interessados
// - Sistema de convites
// - Gerenciamento (apenas criador)
// - Check-in dos participantes
```

### **7. EventInvitation.tsx** - **IMPORTANTE**
```typescript
interface EventInvitationProps {
  eventId: string;
  onInviteSent: (inviteeIds: string[]) => void;
  maxInvitations?: number; // Baseado no plano
}

// Funcionalidades necessárias:
// - Busca e seleção de amigos
// - Convite por link
// - Convite por email
// - Limitações por plano
// - Preview da mensagem de convite
```

### **8. EventCheckIn.tsx** - **CRÍTICO**
```typescript
interface EventCheckInProps {
  eventId: string;
  isCreator: boolean;
  userLocation?: { lat: number; lng: number };
  onCheckInSuccess: () => void;
}

// Funcionalidades necessárias:
// - QR code scanner (para participantes)
// - QR code generator (para criadores)
// - Verificação de localização
// - Lista de check-ins (criadores)
// - Validação de proximidade ao evento
```

### **9. EventsCalendar.tsx** - **IMPORTANTE**
```typescript
interface EventsCalendarProps {
  events: Event[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onEventSelect: (eventId: string) => void;
}

// Funcionalidades necessárias:
// - Calendário mensal/semanal
// - Eventos do usuário
// - Eventos próximos
// - Sincronização com calendário nativo
// - Lembretes automáticos
```

### **10. EventFilters.tsx** - **IMPORTANTE**
```typescript
interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  userLocation?: { lat: number; lng: number };
  availableCategories: string[];
}

// Funcionalidades necessárias:
// - Filtro por categoria
// - Filtro por distância
// - Filtro por data
// - Filtro por preço (gratuito/pago)
// - Filtro por tipo (online/presencial)
// - Salvamento de filtros preferidos
```

## 🔧 Limitações por Plano a Implementar

### **Validações Necessárias:**
```typescript
const EVENT_LIMITATIONS = {
  free: {
    canCreate: false,
    canJoin: true, // Ilimitado
    canJoinPaid: false,
    maxInvitations: 0,
    canAccessAnalytics: false
  },
  gold: {
    canCreate: true,
    maxEventsPerMonth: 3,
    canJoin: true,
    canJoinPaid: true,
    maxInvitations: 50,
    canAccessAnalytics: false,
    canCreatePaid: false
  },
  diamond: {
    canCreate: true,
    maxEventsPerMonth: 10,
    canJoin: true,
    canJoinPaid: true,
    maxInvitations: 200,
    canAccessAnalytics: true,
    canCreatePaid: true,
    canCreateRecurring: true
  }
};

// Validação na criação de eventos
const validateEventCreation = async (user: User) => {
  if (user.plan_type === 'free') {
    throw new Error('Upgrade para criar eventos');
  }
  
  const monthlyCount = await getMonthlyEventCount(user.id);
  const limit = EVENT_LIMITATIONS[user.plan_type].maxEventsPerMonth;
  
  if (monthlyCount >= limit) {
    throw new Error(`Limite mensal atingido (${limit} eventos)`);
  }
};
```

## 🚀 Arquitetura de Implementação

### **Estrutura de Diretórios Recomendada:**
```
/app/components/events/
├── EventsList.tsx           # Lista principal
├── CreateEvent.tsx          # Criação (form completo)
├── EventDetails.tsx         # Detalhes e participação
├── EventCard.tsx           # Card individual
├── EventsMap.tsx           # Mapa interativo
├── EventParticipants.tsx   # Gestão de participantes
├── EventInvitation.tsx     # Sistema de convites
├── EventCheckIn.tsx        # Check-in com QR
├── EventsCalendar.tsx      # Calendário
├── EventFilters.tsx        # Filtros avançados
├── components/             # Subcomponentes
│   ├── EventStatusBadge.tsx
│   ├── ParticipantAvatar.tsx
│   ├── EventLocationMap.tsx
│   ├── EventPriceDisplay.tsx
│   └── EventShareButton.tsx
└── hooks/                  # Hooks específicos
    ├── useEvents.ts
    ├── useEventParticipation.ts
    ├── useNearbyEvents.ts
    └── useEventValidation.ts
```

### **Hooks Necessários:**
```typescript
// Hook principal para eventos
export const useEvents = () => {
  const { data: events, mutate } = useSWR('/api/events', fetcher);
  
  const createEvent = async (eventData: CreateEventData) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    await mutate();
    return response.json();
  };

  return { events, createEvent, mutate };
};

// Hook para eventos próximos
export const useNearbyEvents = (location: Location, radius: number) => {
  const { data } = useSWR(
    location ? `/api/events/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radius}` : null,
    fetcher
  );
  
  return { nearbyEvents: data };
};

// Hook para participação em eventos
export const useEventParticipation = (eventId: string) => {
  const joinEvent = async () => {
    await fetch(`/api/events/${eventId}/join`, { method: 'POST' });
  };
  
  const leaveEvent = async () => {
    await fetch(`/api/events/${eventId}/leave`, { method: 'POST' });
  };
  
  return { joinEvent, leaveEvent };
};
```

## 📊 Integração com Sistema Existente

### **Integrações Necessárias:**
```typescript
// 1. Timeline Integration
// Eventos devem aparecer na timeline como posts especiais
const EventTimelineCard = ({ event }: { event: Event }) => {
  return (
    <PostCard
      type="event"
      content={`📅 ${event.title}`}
      media={[event.cover_image_url]}
      actions={['join', 'interested', 'share']}
    />
  );
};

// 2. Chat Integration  
// Eventos com chat para participantes
const EventChat = ({ eventId }: { eventId: string }) => {
  return (
    <ChatInterface
      conversationId={`event_${eventId}`}
      type="event"
      restrictions={{ onlyParticipants: true }}
    />
  );
};

// 3. Notifications Integration
// Notificações para convites, lembretes, etc
const sendEventNotification = async (type: string, data: any) => {
  await fetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({
      type: `event_${type}`,
      ...data
    })
  });
};
```

## 🚨 Impacto da Ausência

### **Problemas Atuais:**
1. **Funcionalidade documentada** mas **inacessível** aos usuários
2. **APIs implementadas** mas **sem interface**
3. **Perda de engajamento** por não ter sistema social de eventos
4. **Diferencial competitivo perdido** (eventos são feature principal)

### **Receita Impactada:**
- Usuários Ouro podem criar até 3 eventos/mês (R$ 25)
- Usuários Diamante podem criar até 10 eventos/mês (R$ 45,90)
- **SEM INTERFACE = SEM RECEITA** desta feature

## ✅ Plano de Implementação Urgente

### **Sprint 1 - MVP (1 semana):**
1. **EventsList.tsx** - Lista básica
2. **CreateEvent.tsx** - Formulário simples
3. **EventCard.tsx** - Card básico
4. **EventDetails.tsx** - Página de detalhes

### **Sprint 2 - Core Features (1 semana):**
1. **EventsMap.tsx** - Mapa com marcadores
2. **EventParticipants.tsx** - Sistema de participação
3. **EventFilters.tsx** - Filtros básicos

### **Sprint 3 - Advanced (1 semana):**
1. **EventInvitation.tsx** - Sistema de convites
2. **EventCheckIn.tsx** - QR code check-in
3. **EventsCalendar.tsx** - Calendário

## 🎯 Conclusão

A ausência completa de componentes de eventos é um **PROBLEMA CRÍTICO** que impacta diretamente:

- ❌ **Experiência do usuário** comprometida
- ❌ **Receita potencial** perdida
- ❌ **Diferencial competitivo** não explorado
- ❌ **APIs desenvolvidas** mas inutilizadas

**RECOMENDAÇÃO:** Implementação **URGENTE** dos componentes básicos de eventos para ativar esta funcionalidade crucial.