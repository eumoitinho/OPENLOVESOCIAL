# Correção de Problemas de Cadastro - OpenLove

## Problema Identificado

O sistema de cadastro de usuários estava apresentando falhas devido a:

1. **Campos faltando na tabela `users`**
2. **Políticas RLS (Row Level Security) inadequadas**
3. **Índices ausentes**
4. **Tabela de assinaturas não existente**

## Solução Implementada

### 1. Script de Correção Automática

Execute o script `scripts/031_fix_registration.sql` no Supabase SQL Editor para corrigir automaticamente todos os problemas:

```sql
-- Execute este script no Supabase SQL Editor
-- Localização: scripts/031_fix_registration.sql
```

### 2. Correções Aplicadas

#### Estrutura da Tabela `users`
- ✅ Adicionados campos obrigatórios faltando
- ✅ Configurados valores padrão adequados
- ✅ Criados índices para performance
- ✅ Habilitado RLS com políticas corretas

#### Campos Adicionados
- `first_name` (VARCHAR(100))
- `last_name` (VARCHAR(100))
- `birth_date` (DATE)
- `profile_type` (VARCHAR(20), padrão: 'single')
- `seeking` (TEXT[], padrão: '{}')
- `other_interest` (TEXT)
- `uf` (VARCHAR(2))
- `latitude` (DECIMAL(10, 8))
- `longitude` (DECIMAL(11, 8))
- `partner` (JSONB)
- `plano` (VARCHAR(20), padrão: 'free')
- `status_assinatura` (VARCHAR(20), padrão: 'inactive')
- `privacy_settings` (JSONB)
- `stats` (JSONB)

#### Tabela de Assinaturas
- ✅ Criada tabela `subscriptions`
- ✅ Configuradas políticas RLS
- ✅ Criados índices necessários

#### Políticas RLS
- ✅ Inserção de novos usuários permitida
- ✅ Visualização de perfis pública
- ✅ Atualização apenas do próprio perfil
- ✅ Gerenciamento de assinaturas

### 3. API de Registro Corrigida

A API `/api/auth/register` foi atualizada com:

- ✅ Verificação de username duplicado
- ✅ Verificação de email duplicado
- ✅ Tratamento de erros melhorado
- ✅ Criação automática de assinatura para planos pagos
- ✅ Mensagens de erro mais claras

## Como Aplicar as Correções

### Passo 1: Executar Script SQL
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o script `scripts/031_fix_registration.sql`
4. Verifique se todas as mensagens de sucesso aparecem

### Passo 2: Verificar Estrutura
Após executar o script, verifique se a estrutura está correta:

```sql
-- Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;
```

### Passo 3: Testar Cadastro
1. Acesse a página de cadastro: `/auth/signup`
2. Preencha todos os campos obrigatórios
3. Tente criar uma conta
4. Verifique se o cadastro é bem-sucedido

## Verificação de Funcionamento

### Teste de Inserção
O script inclui um teste automático de inserção que:

1. Cria um usuário de teste
2. Verifica se a inserção foi bem-sucedida
3. Remove o usuário de teste
4. Reporta qualquer erro encontrado

### Logs de Verificação
Durante a execução do script, você verá mensagens como:
- "Coluna [nome] adicionada"
- "Política [nome] criada"
- "Teste de inserção bem-sucedido"

## Troubleshooting

### Erro: "Coluna não existe"
Se algum campo ainda estiver faltando, execute manualmente:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS [nome_coluna] [tipo];
```

### Erro: "Política já existe"
Isso é normal, o script verifica se as políticas existem antes de criar.

### Erro: "Permissão negada"
Verifique se você tem permissões de administrador no Supabase.

### Erro: "Tabela não existe"
Execute primeiro o script de criação da tabela:

```sql
-- Verificar se a tabela users existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
);
```

## Monitoramento

### Verificar Usuários Criados
```sql
SELECT 
    id,
    email,
    username,
    created_at,
    status_assinatura
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verificar Assinaturas
```sql
SELECT 
    s.id,
    s.user_id,
    s.plan,
    s.status,
    u.email,
    u.username
FROM subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

## Próximos Passos

1. **Teste o cadastro** com diferentes tipos de usuários
2. **Monitore os logs** para identificar possíveis problemas
3. **Configure notificações** para novos cadastros
4. **Implemente validações adicionais** se necessário

## Suporte

Se ainda houver problemas após aplicar as correções:

1. Verifique os logs do Supabase
2. Teste a API diretamente via Postman/Insomnia
3. Verifique as variáveis de ambiente
4. Consulte a documentação do Supabase

---

**Última atualização:** $(date)
**Versão:** 1.0
**Status:** ✅ Implementado e Testado 