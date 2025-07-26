# 🔧 Guia de Correção do Banco de Dados - OpenLove

## 📋 Resumo do Problema

O erro `ERROR: 42P01: relation "profiles" does not exist` indica que o código está tentando usar a tabela `profiles`, mas no seu banco de dados a tabela principal é `users`. Além disso, há referências à tabela `friendships` que deveria ser `friends`.

## ✅ Solução Completa

### **Opção 1: Executar Script Automático (Recomendado)**

1. **Edite o arquivo `scripts/043_execute_final_fix.ps1`** e substitua as configurações:

```powershell
# Substitua pelos seus dados do Supabase
$DB_HOST = "db.SEU_PROJETO.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "SUA_SENHA_AQUI"
```

2. **Execute o script PowerShell:**

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/043_execute_final_fix.ps1"
```

### **Opção 2: Executar Manualmente no Supabase**

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute o conteúdo do arquivo `scripts/042_fix_final_database.sql`**

## 🔍 O que o Script Corrige

### **1. Cria a Tabela `friends`**
```sql
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
```

### **2. Adiciona Campos Faltantes na Tabela `users`**
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tokens_received INTEGER DEFAULT 0;
```

### **3. Cria Tabelas do Sistema de Anúncios**
- `advertisers`
- `ad_campaigns`
- `ad_metrics`
- `ad_transactions`

### **4. Cria Tabelas do Sistema de Conteúdo Premium**
- `paid_content`
- `content_purchases`

### **5. Cria Tabelas de Estatísticas**
- `post_interactions`
- `user_earnings`

### **6. Corrige Políticas RLS**
- Atualiza políticas para usar `friends` em vez de `friendships`
- Configura políticas de segurança adequadas

### **7. Cria Funções SQL Úteis**
- `are_mutual_friends()`
- `send_friend_request()`
- `respond_friend_request()`

## 🧪 Como Testar se Funcionou

### **1. Teste de Registro**
```bash
# Tente registrar um novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Teste",
    "lastName": "Usuário",
    "username": "teste123",
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'
```

### **2. Teste de Amizades**
```bash
# Tente enviar uma solicitação de amizade
curl -X POST http://localhost:3000/api/friends/request \
  -H "Content-Type: application/json" \
  -d '{"user_id": "ID_DO_USUARIO"}'
```

### **3. Teste de Posts**
```bash
# Tente criar um post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Teste de post",
    "visibility": "public"
  }'
```

## 🔧 Verificação Manual

### **1. Verificar se a Tabela `friends` Existe**
```sql
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'friends' 
    AND table_schema = 'public'
);
```

### **2. Verificar Campos na Tabela `users`**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('wallet_balance', 'tokens', 'tokens_received');
```

### **3. Verificar Políticas RLS**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'friends';
```

## 🚨 Possíveis Erros e Soluções

### **Erro: "relation does not exist"**
- **Causa:** Tabela não foi criada
- **Solução:** Execute o script SQL novamente

### **Erro: "permission denied"**
- **Causa:** Políticas RLS muito restritivas
- **Solução:** Verifique as políticas no script

### **Erro: "foreign key constraint"**
- **Causa:** Referência a tabela inexistente
- **Solução:** Execute o script na ordem correta

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique os logs do Supabase**
2. **Confirme se todas as tabelas foram criadas**
3. **Teste as funcionalidades uma por uma**
4. **Consulte a documentação do Supabase**

## ✅ Checklist Final

- [ ] Script executado com sucesso
- [ ] Tabela `friends` criada
- [ ] Campos adicionados na tabela `users`
- [ ] Tabelas de anúncios criadas
- [ ] Tabelas de conteúdo premium criadas
- [ ] Políticas RLS configuradas
- [ ] Funções SQL criadas
- [ ] Registro de usuários funcionando
- [ ] Sistema de amizades funcionando
- [ ] Upload de posts funcionando

## 🎉 Conclusão

Após executar este script, todos os problemas de compatibilidade entre o código e o banco de dados serão resolvidos. O sistema OpenLove estará completamente funcional!

**Boa sorte com seu projeto! 🚀** 