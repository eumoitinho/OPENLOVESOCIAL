# Guia Rápido - Correção do Sistema de Registro

## 🚨 Problema Identificado
O sistema de registro está falhando porque a tabela `users` no Supabase não possui todas as colunas necessárias para o registro completo de usuários.

## ✅ Solução Completa

### Passo 1: Executar Script de Correção Completa

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `scripts/comprehensive_fix.sql` 
4. Clique em **"Run"** para executar tudo de uma vez

**Este script inclui TODAS as colunas necessárias baseadas na análise completa do código:**
- ✅ Campos básicos de registro (birth_date, first_name, last_name, etc.)
- ✅ Campos do Mercado Pago (plano, status_assinatura, mp_customer_id, etc.)
- ✅ Campos de wallet/saldo (wallet_balance)
- ✅ Campos de privacidade e estatísticas (privacy_settings, stats)
- ✅ Campos de status (is_premium, is_verified, is_active)
- ✅ Todos os índices necessários para performance
- ✅ Funções atualizadas com todos os campos
- ✅ Permissões corretas configuradas

### Passo 2: Testar o Registro

1. Acesse sua aplicação
2. Tente criar um novo usuário
3. Verifique se o registro funciona corretamente

### Passo 3: Verificar Funcionalidades

Teste as seguintes funcionalidades para garantir que tudo está funcionando:

- ✅ Registro de usuários
- ✅ Login/autenticação
- ✅ Perfil do usuário
- ✅ Sistema de pagamentos (Mercado Pago)
- ✅ Sistema de programas/cursos
- ✅ Sistema de conteúdo premium
- ✅ Busca de usuários
- ✅ Timeline e posts

## 🔧 Scripts Disponíveis

### Script Principal (Recomendado)
- **`scripts/comprehensive_fix.sql`** - Script completo com TODAS as correções

### Scripts Alternativos
- **`scripts/fix_all_at_once.sql`** - Versão anterior (menos completa)
- **`scripts/quick_test.sql`** - Teste rápido da estrutura
- **`scripts/diagnose_registration.sql`** - Diagnóstico detalhado

## 📋 Campos Incluídos no Script Completo

### Campos Básicos
- `birth_date` - Data de nascimento
- `first_name`, `last_name` - Nome completo
- `profile_type` - Tipo de perfil (single, couple, etc.)
- `seeking` - O que está procurando
- `interests` - Interesses
- `other_interest` - Outros interesses
- `bio` - Biografia
- `location`, `uf` - Localização
- `latitude`, `longitude` - Coordenadas
- `partner` - Informações do parceiro

### Campos do Mercado Pago
- `plano` - Plano atual (free, gold, diamante, diamante_anual)
- `status_assinatura` - Status da assinatura
- `mp_customer_id` - ID do cliente no Mercado Pago
- `mp_subscription_id` - ID da assinatura
- `ultimo_pagamento` - Data do último pagamento
- `proximo_pagamento` - Data do próximo pagamento

### Campos de Sistema
- `wallet_balance` - Saldo da carteira
- `is_premium` - Status premium
- `is_verified` - Status verificado
- `is_active` - Status ativo
- `last_seen` - Última atividade
- `privacy_settings` - Configurações de privacidade
- `stats` - Estatísticas do usuário

## 🚀 Como Executar

### Método 1: Script Completo (Recomendado)
```sql
-- Cole todo o conteúdo de scripts/comprehensive_fix.sql
-- Clique em "Run" uma única vez
```

### Método 2: Scripts Separados
```sql
-- 1. Primeiro execute o teste
-- Cole scripts/quick_test.sql e execute

-- 2. Depois execute a correção
-- Cole scripts/fix_all_at_once.sql e execute
```

## ⚠️ Problemas Comuns

### Erro: "Column does not exist"
- **Solução**: Execute o script completo novamente
- **Causa**: Algumas colunas podem não ter sido criadas

### Erro: "Permission denied"
- **Solução**: Verifique se está usando a service_role key
- **Causa**: Permissões insuficientes

### Erro: "Function does not exist"
- **Solução**: Execute o script completo que recria todas as funções
- **Causa**: Funções não foram criadas corretamente

## 🔍 Verificação Pós-Correção

Após executar o script, verifique se todas as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

## 📞 Suporte

Se ainda houver problemas após executar o script completo:

1. **Verifique os logs** no Supabase Dashboard
2. **Teste o registro** com dados simples
3. **Consulte a documentação** em `docs/`
4. **Verifique as variáveis de ambiente** do projeto

## 🎯 Resultado Esperado

Após executar o script completo:
- ✅ Registro de usuários funcionando
- ✅ Todas as funcionalidades operacionais
- ✅ Sistema de pagamentos integrado
- ✅ Performance otimizada com índices
- ✅ Segurança configurada adequadamente

---

**Nota**: O script `comprehensive_fix.sql` foi criado após uma análise completa de todo o código, incluindo todas as APIs, componentes e funcionalidades do sistema. Ele garante que nenhum campo necessário seja esquecido. 