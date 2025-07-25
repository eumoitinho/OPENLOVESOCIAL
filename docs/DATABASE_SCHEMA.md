# OpenLove - Database Schema Documentation

## Overview
Esta documentação descreve o schema atual do banco de dados OpenLove, baseado na migration nuclear `20250120_004_nuclear_complete_rebuild.sql` que está em produção.

## Stack
- **Database**: PostgreSQL (Supabase)
- **Extensions**: uuid-ossp, pgcrypto
- **Security**: Row Level Security (RLS) habilitado
- **Nomenclature**: 100% English

## Core Tables

### 1. Users (`users`)
Tabela principal de usuários com informações completas de perfil.

**Campos principais:**
```sql
- id: UUID (PK)
- auth_id: UUID (FK to auth.users)
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(255) UNIQUE
- name: VARCHAR(100)
- first_name: VARCHAR(50)
- last_name: VARCHAR(50)
- full_name: VARCHAR(100)
- bio: TEXT
- avatar_url: TEXT
- cover_url: TEXT
```

**Localização:**
```sql
- location: VARCHAR(255)
- city: VARCHAR(100)
- uf: VARCHAR(2)
- state: VARCHAR(100)
- country: VARCHAR(100) DEFAULT 'Brazil'
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
```

**Demografia:**
```sql
- birth_date: DATE
- gender: VARCHAR(20)
- profile_type: VARCHAR(20) DEFAULT 'single'
```

**Interesses:**
```sql
- interests: TEXT[]
- seeking: TEXT[]
- other_interest: TEXT
- looking_for: TEXT[]
- relationship_goals: TEXT[]
- partner: JSONB
```

**Premium & Pagamentos:**
```sql
- is_verified: BOOLEAN DEFAULT false
- is_active: BOOLEAN DEFAULT true
- is_premium: BOOLEAN DEFAULT false
- premium_type: VARCHAR(20)
- premium_expires_at: TIMESTAMP WITH TIME ZONE
- premium_status: VARCHAR(20) DEFAULT 'active'
- stripe_customer_id: VARCHAR(255)
- stripe_subscription_id: VARCHAR(255)
- mercadopago_customer_id: VARCHAR(255)
- abacatepay_customer_id: VARCHAR(255)
- payment_provider: VARCHAR(20)
```

**Configurações:**
```sql
- privacy_settings: JSONB
- notification_settings: JSONB
- stats: JSONB
- social_links: JSONB
```

**Sistema:**
```sql
- status: VARCHAR(20) DEFAULT 'active'
- role: VARCHAR(20) DEFAULT 'user'
- last_active_at: TIMESTAMP WITH TIME ZONE
- username_changed: BOOLEAN DEFAULT false
- username_changed_at: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 2. Posts (`posts`)
Sistema de posts com suporte a mídia, localização e monetização.

```sql
- id: UUID (PK)
- user_id: UUID (FK to users)
- content: TEXT
- media_urls: TEXT[]
- media_types: TEXT[]
- media_thumbnails: TEXT[]
- visibility: VARCHAR(20) DEFAULT 'public'
- is_premium_content: BOOLEAN DEFAULT false
- price: DECIMAL(10, 2)
- poll_options: TEXT[]
- location: VARCHAR(255)
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- hashtags: TEXT[]
- mentions: TEXT[]
- is_event: BOOLEAN DEFAULT false
- event_details: JSONB
- stats: JSONB DEFAULT '{"likes_count": 0, "comments_count": 0, "shares_count": 0, "views_count": 0}'
- is_reported: BOOLEAN DEFAULT false
- is_hidden: BOOLEAN DEFAULT false
- moderation_reason: TEXT
- moderated_by: UUID (FK to users)
- moderated_at: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 3. Comments (`comments`)
Sistema de comentários com suporte a threads.

```sql
- id: UUID (PK)
- post_id: UUID (FK to posts)
- user_id: UUID (FK to users)
- parent_id: UUID (FK to comments, nullable)
- content: TEXT NOT NULL
- media_urls: TEXT[]
- stats: JSONB DEFAULT '{"likes": 0, "replies": 0}'
- is_reported: BOOLEAN DEFAULT false
- is_hidden: BOOLEAN DEFAULT false
- is_edited: BOOLEAN DEFAULT false
- edited_at: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 4. Likes (`likes`)
Sistema unificado de reações para posts e comentários.

```sql
- id: UUID (PK)
- user_id: UUID (FK to users)
- target_id: UUID (ID do post ou comment)
- target_type: VARCHAR(20) CHECK ('post', 'comment')
- reaction_type: VARCHAR(20) DEFAULT 'like'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 5. Follows (`follows`)
Sistema de seguidores.

```sql
- id: UUID (PK)
- follower_id: UUID (FK to users)
- following_id: UUID (FK to users)
- status: VARCHAR(20) DEFAULT 'active'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 6. Friends (`friends`)
Sistema de amizades.

```sql
- id: UUID (PK)
- user_id: UUID (FK to users)
- friend_id: UUID (FK to users)
- status: VARCHAR(20) DEFAULT 'accepted'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- accepted_at: TIMESTAMP WITH TIME ZONE
```

## Messaging System

### 7. Conversations (`conversations`)
```sql
- id: UUID (PK)
- type: VARCHAR(20) DEFAULT 'direct'
- name: VARCHAR(255)
- description: TEXT
- avatar_url: TEXT
- is_group: BOOLEAN DEFAULT false
- created_by: UUID (FK to users)
- settings: JSONB
- last_message_at: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 8. Conversation Participants (`conversation_participants`)
```sql
- id: UUID (PK)
- conversation_id: UUID (FK to conversations)
- user_id: UUID (FK to users)
- role: VARCHAR(20) DEFAULT 'member'
- status: VARCHAR(20) DEFAULT 'active'
- joined_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- left_at: TIMESTAMP WITH TIME ZONE
- last_read_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- unread_count: INTEGER DEFAULT 0
- notifications_enabled: BOOLEAN DEFAULT true
- is_pinned: BOOLEAN DEFAULT false
- custom_nickname: VARCHAR(100)
```

### 9. Messages (`messages`)
```sql
- id: UUID (PK)
- conversation_id: UUID (FK to conversations)
- sender_id: UUID (FK to users)
- content: TEXT
- type: VARCHAR(20) DEFAULT 'text'
- media_urls: TEXT[]
- system_type: VARCHAR(50)
- reply_to_id: UUID (FK to messages)
- is_edited: BOOLEAN DEFAULT false
- edited_at: TIMESTAMP WITH TIME ZONE
- is_deleted: BOOLEAN DEFAULT false
- deleted_at: TIMESTAMP WITH TIME ZONE
- delivered_at: TIMESTAMP WITH TIME ZONE
- read_count: INTEGER DEFAULT 0
- is_read: BOOLEAN DEFAULT false  # Adicionado para compatibilidade
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## Events & Communities

### 10. Events (`events`)
```sql
- id: UUID (PK)
- creator_id: UUID (FK to users)
- title: VARCHAR(255) NOT NULL
- description: TEXT
- event_type: VARCHAR(50) DEFAULT 'social'
- category: VARCHAR(100)
- subcategory: VARCHAR(100)
- cover_image_url: TEXT
- start_datetime: TIMESTAMP WITH TIME ZONE NOT NULL
- end_datetime: TIMESTAMP WITH TIME ZONE
- timezone: VARCHAR(50) DEFAULT 'America/Sao_Paulo'
- location_name: VARCHAR(255)
- location_address: TEXT
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- is_online: BOOLEAN DEFAULT false
- online_link: TEXT
- max_participants: INTEGER
- min_age: INTEGER
- max_age: INTEGER
- is_private: BOOLEAN DEFAULT false
- requires_approval: BOOLEAN DEFAULT false
- allows_guests: BOOLEAN DEFAULT true
- allows_photos: BOOLEAN DEFAULT true
- price: DECIMAL(10, 2) DEFAULT 0
- currency: VARCHAR(3) DEFAULT 'BRL'
- tags: TEXT[]
- stats: JSONB
- status: VARCHAR(20) DEFAULT 'draft'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### 11. Communities (`communities`)
```sql
- id: UUID (PK)
- creator_id: UUID (FK to users)
- name: VARCHAR(255) NOT NULL
- description: TEXT
- avatar_url: TEXT
- cover_url: TEXT
- community_type: VARCHAR(50) DEFAULT 'public'
- category: VARCHAR(100)
- subcategory: VARCHAR(100)
- rules: TEXT
- is_private: BOOLEAN DEFAULT false
- requires_approval: BOOLEAN DEFAULT false
- allows_posts: BOOLEAN DEFAULT true
- allows_events: BOOLEAN DEFAULT true
- allows_polls: BOOLEAN DEFAULT false
- post_approval_required: BOOLEAN DEFAULT false
- tags: TEXT[]
- location: VARCHAR(255)
- member_count: INTEGER DEFAULT 0
- post_count: INTEGER DEFAULT 0
- event_count: INTEGER DEFAULT 0
- stats: JSONB
- status: VARCHAR(20) DEFAULT 'active'
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## Payment System

### 12. Subscriptions (`subscriptions`)
```sql
- id: UUID (PK)
- user_id: UUID (FK to users)
- plan_type: VARCHAR(50) NOT NULL
- status: VARCHAR(50) NOT NULL
- provider: VARCHAR(50) NOT NULL
- provider_subscription_id: VARCHAR(255)
- provider_customer_id: VARCHAR(255)
- current_period_start: TIMESTAMP WITH TIME ZONE
- current_period_end: TIMESTAMP WITH TIME ZONE
- cancel_at_period_end: BOOLEAN DEFAULT false
- canceled_at: TIMESTAMP WITH TIME ZONE
- ended_at: TIMESTAMP WITH TIME ZONE
- price: DECIMAL(10, 2)
- currency: VARCHAR(3) DEFAULT 'BRL'
- interval_type: VARCHAR(20)
- trial_start: TIMESTAMP WITH TIME ZONE
- trial_end: TIMESTAMP WITH TIME ZONE
- metadata: JSONB
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## Notification System

### 13. Notifications (`notifications`)
```sql
- id: UUID (PK)
- recipient_id: UUID (FK to users)
- sender_id: UUID (FK to users)
- type: VARCHAR(50) NOT NULL
- title: VARCHAR(255) NOT NULL
- message: TEXT NOT NULL
- related_data: JSONB
- action_text: VARCHAR(50)
- action_url: TEXT
- is_read: BOOLEAN DEFAULT false
- is_deleted: BOOLEAN DEFAULT false
- delivered_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- read_at: TIMESTAMP WITH TIME ZONE
- sent_via_email: BOOLEAN DEFAULT false
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## Security & Performance

### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado com políticas específicas para:
- **SELECT**: Baseado em visibilidade e relacionamentos
- **INSERT/UPDATE/DELETE**: Apenas proprietários dos dados
- **Relacionamentos**: Verificação de amizades e permissões

### Indexes Otimizados
```sql
-- Users
CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Posts
CREATE INDEX idx_posts_user ON posts(user_id, visibility, created_at DESC);
CREATE INDEX idx_posts_timeline ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(conversation_id, is_read, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
```

### Functions & Triggers
- **Stats Update**: Atualização automática de contadores
- **Timestamps**: Auto-update de `updated_at`
- **Cleanup**: Limpeza automática de dados órfãos
- **Message Sync**: Sincronização entre `is_read` e `read_count`

## Migration History
- `20250120_004_nuclear_complete_rebuild.sql` - Schema principal (PRODUÇÃO)
- `20250121_001_fix_database_inconsistencies.sql` - Correções de inconsistências

## Notes
- Todas as strings são em inglês para consistência
- UUIDs são usados como primary keys
- Timestamps incluem timezone
- JSONB é usado para dados flexíveis (configurações, stats, metadata)
- Arrays são usados para listas simples (hashtags, media_urls, etc.)