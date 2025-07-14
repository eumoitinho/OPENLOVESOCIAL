# Sistema de Curtidas com Notificações - OpenLove

## 📋 Visão Geral

O sistema de curtidas do OpenLove é um sistema completo que inclui:

- **Curtidas/Descurtidas** com toggle automático
- **Contadores em tempo real** via Supabase Realtime
- **Notificações automáticas** para o autor do post
- **Badges visuais** com pontos rosas para notificações não lidas
- **Triggers SQL** para automatização completa
- **Políticas de segurança** RLS habilitadas

## 🚀 Instalação

### 1. Executar Script SQL

Primeiro, execute o script SQL para configurar o banco de dados:

```sql
-- Execute o arquivo scripts/038_like_notification_system.sql no seu Supabase
```

### 2. Verificar Sistema de Notificações

Certifique-se de que o sistema de notificações está configurado:

```sql
-- Execute o arquivo scripts/037_notification_system.sql primeiro
```

### 3. Testar o Sistema

Acesse a página de teste: `http://localhost:3001/test-likes`

## 🔧 Funcionalidades

### Sistema de Curtidas

- **Toggle automático**: Clique para curtir, clique novamente para descurtir
- **Contadores em tempo real**: Atualização automática dos números
- **Prevenção de duplicatas**: Um usuário só pode curtir uma vez por post
- **Estatísticas automáticas**: Contadores atualizados via triggers SQL

### Notificações Automáticas

- **Notificação instantânea**: O autor recebe notificação imediatamente
- **Badge visual**: Ponto rosa animado para notificações não lidas
- **Centro de notificações**: Interface completa para gerenciar notificações
- **Real-time**: Atualizações em tempo real via Supabase Realtime

### API Endpoints

#### POST /api/interactions
Curtir/descurtir um post

```json
{
  "type": "like",
  "postId": "uuid-do-post"
}
```

**Resposta:**
```json
{
  "action": "liked", // ou "unliked"
  "likesCount": 15,
  "isLiked": true
}
```

#### GET /api/interactions?postId=uuid
Obter informações de curtidas de um post

**Resposta:**
```json
{
  "likesCount": 15,
  "isLiked": true,
  "likes": [
    {
      "user_id": "uuid",
      "username": "joaosilva",
      "name": "João Silva",
      "avatar_url": "https://...",
      "created_at": "2025-01-27T..."
    }
  ]
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `likes`
```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);
```

### Funções SQL Criadas

1. **`toggle_post_like(p_post_id, p_user_id)`** - Curtir/descurtir post
2. **`get_post_likes_count(p_post_id)`** - Obter contagem de curtidas
3. **`has_user_liked_post(p_post_id, p_user_id)`** - Verificar se usuário curtiu
4. **`get_post_likes(p_post_id, p_limit)`** - Obter lista de usuários que curtiram
5. **`update_post_stats()`** - Atualizar estatísticas automaticamente
6. **`test_like_system(p_post_id, p_user_id)`** - Testar o sistema

### Triggers Automáticos

1. **`update_post_likes_stats`** - Atualiza contadores quando curtida é adicionada/removida
2. **`trigger_notify_like`** - Cria notificação automática para o autor

## 🎨 Interface do Usuário

### Componentes Criados

1. **`LikeTestComponent`** - Componente de teste com posts simulados
2. **`NotificationSystem`** - Sistema completo de notificações
3. **`NotificationBadge`** - Badge com ponto rosa animado
4. **`NotificationCenter`** - Centro de notificações modal

### Características Visuais

- **Coração animado**: Preenche quando curtido
- **Contador dinâmico**: Atualiza em tempo real
- **Feedback visual**: Toast notifications para ações
- **Badge rosa**: Indica notificações não lidas
- **Interface responsiva**: Funciona em mobile e desktop

## 🔄 Fluxo de Funcionamento

### 1. Usuário curte um post
```
Usuário clica no coração → API /api/interactions → Função toggle_post_like()
```

### 2. Sistema processa a curtida
```
toggle_post_like() → Insere/remove da tabela likes → Trigger update_post_likes_stats()
```

### 3. Estatísticas são atualizadas
```
Trigger update_post_likes_stats() → Atualiza posts.likes_count → Atualiza posts.stats
```

### 4. Notificação é criada
```
Trigger trigger_notify_like() → Verifica se não é próprio post → Cria notificação
```

### 5. Interface é atualizada
```
Supabase Realtime → Atualiza contadores → Atualiza badges → Mostra toast
```

## 🧪 Teste do Sistema

### 1. Teste Manual
```sql
-- Testar sistema de curtidas
SELECT test_like_system('post-uuid', 'user-uuid');

-- Verificar contagem
SELECT get_post_likes_count('post-uuid');

-- Verificar se usuário curtiu
SELECT has_user_liked_post('post-uuid', 'user-uuid');
```

### 2. Teste via Interface
1. Acesse `http://localhost:3001/test-likes`
2. Clique nos corações para curtir/descurtir
3. Observe os contadores atualizando
4. Verifique as notificações no badge rosa
5. Abra o centro de notificações

### 3. Teste com Múltiplos Usuários
1. Abra múltiplas abas do navegador
2. Faça login com diferentes usuários
3. Curtam o mesmo post simultaneamente
4. Observe as notificações em tempo real

## 🔒 Segurança

### Políticas RLS
- **SELECT**: Qualquer usuário pode ver curtidas
- **INSERT**: Apenas o próprio usuário pode curtir
- **DELETE**: Apenas o próprio usuário pode descurtir

### Validações
- **Post existe**: Verifica se o post existe antes de curtir
- **Usuário autenticado**: Requer autenticação para todas as ações
- **Prevenção de duplicatas**: UNIQUE constraint na tabela likes
- **Sanitização**: Dados são validados antes de inserção

## 📊 Performance

### Índices Otimizados
```sql
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);
```

### Otimizações
- **Contadores em cache**: Estatísticas são mantidas na tabela posts
- **Triggers eficientes**: Atualizações em lote
- **Real-time otimizado**: Apenas mudanças são transmitidas
- **Paginação**: Suporte para grandes volumes de dados

## 🐛 Troubleshooting

### Problemas Comuns

1. **Curtidas não funcionam:**
   ```sql
   -- Verificar se a tabela likes existe
   SELECT * FROM information_schema.tables WHERE table_name = 'likes';
   
   -- Verificar se as funções foram criadas
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name LIKE '%like%';
   ```

2. **Notificações não aparecem:**
   ```sql
   -- Verificar se o sistema de notificações está configurado
   SELECT * FROM information_schema.tables WHERE table_name = 'notifications';
   
   -- Verificar triggers
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name LIKE '%notify%';
   ```

3. **Contadores não atualizam:**
   ```sql
   -- Verificar se os triggers estão funcionando
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name LIKE '%stats%';
   
   -- Atualizar estatísticas manualmente
   UPDATE posts SET likes_count = (
     SELECT COUNT(*) FROM likes 
     WHERE target_type = 'post' AND target_id = posts.id
   );
   ```

### Logs Úteis

```sql
-- Verificar curtidas de um post
SELECT * FROM likes WHERE target_type = 'post' AND target_id = 'post-uuid';

-- Verificar notificações de um usuário
SELECT * FROM notifications WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

-- Verificar estatísticas de posts
SELECT id, content, likes_count, stats FROM posts WHERE id = 'post-uuid';
```

## 🚀 Próximos Passos

1. **Implementar curtidas em comentários**
2. **Adicionar diferentes tipos de reação** (like, love, laugh, etc.)
3. **Criar sistema de curtidas em lote**
4. **Implementar analytics de engajamento**
5. **Adicionar notificações push** para curtidas
6. **Criar sistema de curtidas anônimas**

## 📝 Changelog

- **v1.0.0** - Sistema inicial de curtidas
- **v1.1.0** - Adicionado sistema de notificações
- **v1.2.0** - Implementado real-time completo
- **v1.3.0** - Adicionado badges visuais
- **v1.4.0** - Criado sistema de teste completo

---

**Sistema de curtidas implementado com sucesso! 🎉**

Para testar, execute os scripts SQL e acesse `/test-likes` no seu projeto. 