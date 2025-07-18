# 🔧 Fix para Erro de Follow - Instruções

## ❌ Problema
```
Erro ao seguir usuário: {
  code: '42703',
  message: 'record "new" has no field "user_id"'
}
```

## 🔍 Causa
O trigger `update_user_follows_stats` estava tentando acessar um campo `user_id` que não existe na tabela `follows`. A tabela `follows` tem os campos `follower_id` e `following_id`, não `user_id`.

## 🛠️ Solução

### Opção 1: Executar SQL Direto no Supabase (RECOMENDADO)

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute o conteúdo do arquivo `fix-follows-trigger.sql`**

### Opção 2: Usar Migration

Se preferir usar o sistema de migrações:

```bash
# Execute a migração
supabase db push
```

## ✅ O que o Fix Faz

1. **Remove o trigger problemático**
2. **Cria uma função específica para a tabela follows**
3. **Cria um novo trigger correto**
4. **Garante que os usuários tenham estatísticas corretas**
5. **Configura as políticas RLS adequadas**

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