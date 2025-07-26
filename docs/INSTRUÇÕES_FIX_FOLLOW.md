# 🔧 Fix COMPLETO para Erro de Follow - Instruções

## ❌ Problema
```
Erro ao seguir usuário: {
  code: '42703',
  message: 'record "new" has no field "user_id"'
}
```

## 🔍 Causa REAL
**MÚLTIPLOS TRIGGERS** estavam tentando acessar um campo `user_id` que não existe na tabela `follows`:

1. **`update_user_follows_stats`** - Tentava acessar `NEW.user_id` 
2. **`create_smart_notification_follows`** - Também tentava acessar `NEW.user_id`
3. Outros triggers de notificação problemáticos

A tabela `follows` tem os campos `follower_id` e `following_id`, não `user_id`.

## 🛠️ Solução COMPLETA

### ⚠️ IMPORTANTE: Use o Fix Completo

**NÃO use o arquivo `fix-follows-trigger.sql`**

**✅ Use o arquivo `fix-follows-complete.sql`**

### Opção 1: Executar SQL Direto no Supabase (RECOMENDADO)

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute o conteúdo do arquivo `fix-follows-complete.sql`**

### Opção 2: Usar Migration

Se preferir usar o sistema de migrações:

```bash
# Execute a migração
supabase db push
```

## ✅ O que o Fix COMPLETO Faz

1. **Remove TODOS os triggers problemáticos**:
   - `update_user_follows_stats`
   - `create_smart_notification_follows`
   - `create_follow_notification`
   - `trigger_new_follower`

2. **Cria funções específicas corretas**:
   - `update_user_follows_stats()` - usa `follower_id` e `following_id`
   - `create_follow_notification()` - usa `follower_id` e `following_id`

3. **Cria triggers corretos**
4. **Garante que os usuários tenham estatísticas corretas**
5. **Configura as políticas RLS adequadas**
6. **Cria configurações de notificação padrão**

## 🧪 Como Testar

Após aplicar o fix:

1. **Recarregue a página**
2. **Tente seguir um usuário**
3. **Verifique se não há erros no console**
4. **Confirme que a ação de seguir funciona imediatamente**

## 📊 Verificação

No banco de dados, você pode verificar:

```sql
-- Verificar se o trigger foi criado
SELECT * FROM information_schema.triggers WHERE trigger_name = 'update_user_follows_stats';

-- Verificar se os usuários têm stats corretas
SELECT id, stats FROM users LIMIT 5;

-- Teste manual de insert
INSERT INTO follows (follower_id, following_id) VALUES ('user1-uuid', 'user2-uuid');
```

## 🎯 Resultado Esperado

- ✅ Follow funciona imediatamente
- ✅ Estatísticas de followers/following são atualizadas
- ✅ Sem erros no console
- ✅ Timeline "Seguindo" mostra posts corretos