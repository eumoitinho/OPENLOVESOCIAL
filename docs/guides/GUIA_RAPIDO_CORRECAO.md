# 🚨 CORREÇÃO RÁPIDA - Posts e Timeline

## 📋 Problemas Identificados

1. **❌ Erro de permissão:** `permission denied for table friends`
2. **❌ Erro na tabela events:** `column events.date does not exist`
3. **❌ Posts não estão sendo criados**
4. **❌ Timeline não está funcionando**

## ✅ SOLUÇÃO RÁPIDA

### **Passo 1: Executar Correção no Supabase**

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute este script:**

```sql
-- CORREÇÃO RÁPIDA - Permissões e Erros

-- 1. Criar tabela friends se não existir
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- 2. Configurar RLS para friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas para friends
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
CREATE POLICY "Users can view their friends" ON friends
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert friend requests" ON friends;
CREATE POLICY "Users can insert friend requests" ON friends
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Corrigir tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE;

-- 5. Verificar tabela posts
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') as posts_exists;

-- 6. Criar post de teste
INSERT INTO posts (user_id, content, visibility)
SELECT 
    id,
    'Post de teste após correção - ' || NOW(),
    'public'
FROM users 
LIMIT 1;
```

### **Passo 2: Testar Criação de Post**

1. **Acesse a aplicação**
2. **Tente criar um post**
3. **Verifique se não há mais erros**

### **Passo 3: Testar Timeline**

1. **Acesse a timeline**
2. **Verifique se posts aparecem**
3. **Teste a API diretamente:**

```bash
curl -X GET "http://localhost:3000/api/timeline"
```

## 🔍 VERIFICAÇÃO RÁPIDA

### **Se ainda houver problemas:**

1. **Verifique logs do servidor** - deve mostrar:
   ```
   ✅ [Timeline] Posts encontrados: X
   ✅ [Timeline] Retornando X posts processados
   ```

2. **Teste a API diretamente:**
   ```bash
   curl -X GET "http://localhost:3000/api/timeline"
   ```

3. **Verifique o banco:**
   ```sql
   SELECT COUNT(*) FROM posts WHERE visibility = 'public';
   SELECT COUNT(*) FROM users;
   ```

## 🚨 PROBLEMAS COMUNS

### **"permission denied for table friends"**
- ✅ Execute o script de correção acima
- ✅ Verifique se a tabela friends foi criada

### **"column events.date does not exist"**
- ✅ Execute o script de correção acima
- ✅ A coluna date será adicionada automaticamente

### **"Posts não aparecem na timeline"**
- ✅ Verifique se há posts públicos no banco
- ✅ Teste a API diretamente
- ✅ Verifique logs do servidor

### **"Erro 500 na API"**
- ✅ Verifique conexão com Supabase
- ✅ Verifique variáveis de ambiente
- ✅ Execute o script de correção

## 📞 PRÓXIMOS PASSOS

1. **Execute o script de correção**
2. **Teste criar um post**
3. **Verifique a timeline**
4. **Reporte qualquer erro restante**

---

**💡 Dica:** Se ainda houver problemas, execute o script completo `scripts/048_fix_permissions_and_errors.sql` via Supabase Dashboard. 