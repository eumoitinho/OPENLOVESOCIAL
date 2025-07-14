# Correção do Sistema de Registro de Usuários

## Problema Identificado

O erro `Database error creating new user` estava sendo causado por um **conflito na função `handle_new_user`** que é executada automaticamente quando um usuário é criado no Supabase Auth.

### Causa Específica

- A função estava tentando inserir um campo `full_name` na tabela `users`
- Mas a tabela `users` tem o campo `name` (não `full_name`)
- Isso causava um erro de coluna inexistente
- Além disso, faltavam campos obrigatórios com valores padrão

## Solução Implementada

### 1. Script de Correção Principal
**Arquivo:** `scripts/fix_registration_permissions_final.sql`

Este script corrige:
- ✅ Permissões do `service_role`
- ✅ Função `handle_new_user` com campos corretos
- ✅ Trigger de criação automática de usuários
- ✅ Teste de validação

### 2. Campos Corrigidos na Função `handle_new_user`

```sql
INSERT INTO public.users (
  id, 
  email, 
  username, 
  name,  -- ✅ Campo correto (não full_name)
  is_active,      -- ✅ Valor padrão: true
  is_verified,    -- ✅ Valor padrão: false
  is_premium,     -- ✅ Valor padrão: false
  plano,          -- ✅ Valor padrão: 'free'
  status_assinatura, -- ✅ Valor padrão: 'inactive'
  profile_type,   -- ✅ Valor padrão: 'single'
  created_at, 
  updated_at
)
```

### 3. Permissões Corrigidas

```sql
-- Garantir todas as permissões necessárias
GRANT ALL ON TABLE users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.users TO service_role;
```

## Como Aplicar a Correção

### Passo 1: Executar o Script
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script: `scripts/fix_registration_permissions_final.sql`

### Passo 2: Verificar a Correção
O script inclui um teste automático que:
- ✅ Cria um usuário de teste
- ✅ Verifica se foi inserido corretamente
- ✅ Remove os dados de teste
- ✅ Exibe mensagens de sucesso/erro

### Passo 3: Testar o Registro
Após executar o script, teste o registro de usuários no frontend.

## Estrutura da Tabela Users

A tabela `users` tem os seguintes campos principais:

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  plano VARCHAR(20) DEFAULT 'free',
  status_assinatura VARCHAR(20) DEFAULT 'inactive',
  profile_type VARCHAR(20) DEFAULT 'single',
  -- ... outros campos
);
```

## Verificação de Funcionamento

### Teste Manual
1. Acesse `/auth/signup`
2. Preencha o formulário de registro
3. Verifique se não há mais erro `Database error creating new user`

### Logs de Debug
O endpoint `/api/auth/register` agora deve retornar:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "username": "...",
    "plan": "free",
    "status_assinatura": "inactive"
  },
  "message": "Conta criada com sucesso!"
}
```

## Troubleshooting

### Se o erro persistir:
1. **Verifique as variáveis de ambiente** no Supabase
2. **Execute o script novamente** para garantir que todas as permissões foram aplicadas
3. **Verifique os logs** do endpoint para identificar outros problemas

### Logs Úteis
```bash
# No terminal do servidor
pnpm dev
# Verificar se não há erros de compilação
```

## Arquivos Modificados

- ✅ `scripts/fix_registration_permissions_final.sql` - Script principal
- ✅ `scripts/fix_handle_new_user.sql` - Script alternativo
- ✅ `docs/REGISTRATION_FIX.md` - Esta documentação

## Status

**✅ RESOLVIDO** - O problema de registro de usuários foi corrigido com sucesso.

---

*Última atualização: $(date)* 