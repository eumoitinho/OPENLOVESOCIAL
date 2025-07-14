# Guia de Configuração - Sistema de Curtidas

## 🚨 IMPORTANTE: Ordem de Execução

Para evitar erros de sintaxe, execute os scripts na seguinte ordem:

### 1. Primeiro: Sistema de Notificações
```sql
-- Execute este script PRIMEIRO no Supabase SQL Editor
-- scripts/037_notification_system.sql
```

### 2. Segundo: Sistema de Curtidas
```sql
-- Execute este script DEPOIS no Supabase SQL Editor
-- scripts/038_like_notification_system.sql
```

### 3. Terceiro: Teste do Sistema
```sql
-- Execute este script para verificar se tudo está funcionando
-- scripts/039_test_like_system.sql
```

## 🔧 Como Executar

### No Supabase Dashboard:

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute os scripts na ordem correta:**

#### Passo 1: Sistema de Notificações
```sql
-- Copie e cole o conteúdo de scripts/037_notification_system.sql
-- Clique em "Run" para executar
```

#### Passo 2: Sistema de Curtidas
```sql
-- Copie e cole o conteúdo de scripts/038_like_notification_system.sql
-- Clique em "Run" para executar
```

#### Passo 3: Teste
```sql
-- Copie e cole o conteúdo de scripts/039_test_like_system.sql
-- Clique em "Run" para verificar se tudo está funcionando
```

## ✅ Verificação de Sucesso

Após executar os scripts, você deve ver:

### No script de teste (039_test_like_system.sql):
```
✅ Sistema de notificações encontrado
✅ Função create_notification encontrada
✅ Trigger de notificação criado
✅ SISTEMA FUNCIONANDO
```

### Tabelas criadas:
- ✅ `likes` - Tabela de curtidas
- ✅ `notifications` - Tabela de notificações
- ✅ `posts` - Tabela de posts (deve existir)

### Funções criadas:
- ✅ `toggle_post_like()` - Curtir/descurtir
- ✅ `get_post_likes_count()` - Contar likes
- ✅ `has_user_liked_post()` - Verificar se curtiu
- ✅ `create_notification()` - Criar notificação
- ✅ `trigger_notify_like()` - Trigger de notificação

### Triggers criados:
- ✅ `update_post_likes_stats` - Atualizar contadores
- ✅ `trigger_notify_like` - Notificar curtidas

## 🐛 Solução de Problemas

### Erro: "syntax error at or near DECLARE"
**Causa:** Função criada dentro de bloco DO
**Solução:** Execute os scripts na ordem correta (notificações primeiro)

### Erro: "function create_notification does not exist"
**Causa:** Sistema de notificações não foi configurado
**Solução:** Execute `scripts/037_notification_system.sql` primeiro

### Erro: "table likes does not exist"
**Causa:** Script de curtidas não foi executado
**Solução:** Execute `scripts/038_like_notification_system.sql`

### Erro: "permission denied"
**Causa:** Políticas RLS não configuradas
**Solução:** Verifique se as políticas foram criadas corretamente

## 🧪 Teste Manual

### 1. Teste via SQL:
```sql
-- Testar sistema de curtidas
SELECT test_like_system('post-uuid', 'user-uuid');

-- Verificar contagem
SELECT get_post_likes_count('post-uuid');

-- Verificar se usuário curtiu
SELECT has_user_liked_post('post-uuid', 'user-uuid');
```

### 2. Teste via Interface:
1. Acesse: `http://localhost:3001/test-likes`
2. Clique nos corações para curtir/descurtir
3. Observe os contadores atualizando
4. Verifique as notificações no badge rosa

## 📊 Verificação de Dados

### Verificar curtidas:
```sql
SELECT * FROM likes WHERE target_type = 'post';
```

### Verificar notificações:
```sql
SELECT * FROM notifications WHERE type = 'new_like';
```

### Verificar estatísticas de posts:
```sql
SELECT id, content, likes_count, stats FROM posts;
```

## 🔄 Reset do Sistema (se necessário)

Se precisar recomeçar:

```sql
-- Remover triggers
DROP TRIGGER IF EXISTS trigger_notify_like ON likes;
DROP TRIGGER IF EXISTS update_post_likes_stats ON likes;

-- Remover funções
DROP FUNCTION IF EXISTS trigger_notify_like();
DROP FUNCTION IF EXISTS update_post_stats();
DROP FUNCTION IF EXISTS toggle_post_like(UUID, UUID);
DROP FUNCTION IF EXISTS get_post_likes_count(UUID);
DROP FUNCTION IF EXISTS has_user_liked_post(UUID, UUID);
DROP FUNCTION IF EXISTS get_post_likes(UUID, INTEGER);
DROP FUNCTION IF EXISTS test_like_system(UUID, UUID);

-- Remover tabela (CUIDADO: remove todos os dados)
DROP TABLE IF EXISTS likes CASCADE;

-- Remover políticas
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can like posts" ON likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes;
```

## 🎯 Resultado Esperado

Após a configuração correta, você terá:

1. **Sistema de curtidas funcional** com toggle automático
2. **Notificações em tempo real** quando alguém curtir um post
3. **Badges visuais** com pontos rosas para notificações não lidas
4. **Contadores automáticos** que atualizam em tempo real
5. **API endpoints** funcionais para integração com frontend
6. **Segurança RLS** configurada corretamente

## 📞 Suporte

Se encontrar problemas:

1. **Verifique a ordem de execução** dos scripts
2. **Execute o script de teste** para diagnóstico
3. **Verifique os logs** no Supabase Dashboard
4. **Teste manualmente** via SQL Editor

---

**Sistema configurado com sucesso! 🎉**

Agora você pode curtir posts e ver as notificações aparecerem automaticamente! 