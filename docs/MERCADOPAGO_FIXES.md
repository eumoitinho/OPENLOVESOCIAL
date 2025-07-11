# Correções na Integração do Mercado Pago

## Problemas Identificados e Corrigidos

### 1. Tratamento de Erro no CheckoutForm
**Problema**: Erro ao tentar acessar propriedades de objetos de erro vazios ou nulos.

**Correção**: 
- Melhorado o tratamento de erro na função `handleFormError`
- Adicionada verificação segura antes de acessar propriedades do erro
- Implementado fallback para diferentes tipos de erro

### 2. Integração com API do Mercado Pago
**Problema**: Uso incorreto da API de assinaturas do Mercado Pago.

**Correções**:
- Corrigida a função `createSubscription` para usar a API correta (`/preapproval`)
- Implementado fluxo correto: criar cliente → salvar cartão → criar assinatura
- Adicionado tratamento de erro com fallback para checkout tradicional
- Corrigidos os parâmetros da API conforme documentação oficial

### 3. Webhook do Mercado Pago
**Problema**: Códigos de planos incorretos no webhook.

**Correções**:
- Atualizados os códigos dos planos para corresponder aos usados na API
- Melhorado o tratamento de diferentes tipos de notificação
- Adicionados logs para debug

### 4. Estrutura do Banco de Dados
**Problema**: Campos necessários para o Mercado Pago não existiam na tabela de usuários.

**Correções**:
- Criado script SQL para adicionar campos necessários
- Adicionados campos: `plano`, `mp_customer_id`, `mp_subscription_id`, `status_assinatura`, etc.
- Criadas funções auxiliares para gerenciar assinaturas
- Adicionados índices para performance

### 5. Erro de Sintaxe SQL ⚠️ **CORRIGIDO**
**Problema**: Erro `42601: syntax error at or near "NOT"` ao executar o script SQL.

**Correção**:
- Removido `IF NOT EXISTS` das políticas RLS (não suportado pelo PostgreSQL)
- Criado script alternativo mais seguro (`scripts/018_mercadopago_simple.sql`)
- Adicionada verificação condicional para evitar erros de colunas duplicadas

## Arquivos Modificados

### 1. `app/components/CheckoutForm.tsx`
- Corrigido tratamento de erro na função `handleFormError`
- Usado chave pública correta do arquivo constants
- Melhorado logging de erros

### 2. `app/api/mercadopago/subscribe/route.ts`
- Corrigida integração com API de assinaturas
- Implementado fluxo correto de criação de assinatura
- Melhorado tratamento de erros
- Adicionados logs detalhados

### 3. `app/api/mercadopago/webhook/route.ts`
- Corrigidos códigos dos planos
- Melhorado tratamento de notificações
- Adicionados logs para debug

### 4. `scripts/017_mercadopago_integration.sql` ⚠️ **COM ERRO**
- Script original com erro de sintaxe (não usar)

### 5. `scripts/018_mercadopago_simple.sql` ✅ **CORRIGIDO**
- Script corrigido e seguro para adicionar campos necessários
- Verificações condicionais para evitar erros
- Funções auxiliares para gerenciar assinaturas
- Índices para performance

## Próximos Passos

### 1. Executar Script SQL Corrigido ⚠️ **IMPORTANTE**
Execute o script **`scripts/018_mercadopago_simple.sql`** no Supabase SQL Editor (NÃO use o script 017).

### 2. Configurar Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas no `.env.local`:

```env
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Configurar Planos no Mercado Pago
Crie os planos de assinatura no painel do Mercado Pago com os códigos corretos:
- Gold: `2c93808497eec1c50197f5377401026e`
- Diamante: `2c93808497eec1c50197f53886f60270`
- Diamante Anual: `OPENDIMAYEAR`

### 4. Configurar Webhook
Configure o webhook no Mercado Pago:
- URL: `https://openlove.com.br/api/mercadopago/webhook`
- Eventos: `subscription_preapproval`, `payment`, `subscription_authorized_payment`

### 5. Testar Integração
Use os cartões de teste fornecidos na documentação para testar o fluxo completo.

## Fluxo Corrigido

1. **Frontend**: Usuário preenche formulário de pagamento
2. **SDK Mercado Pago**: Gera token do cartão
3. **API Subscribe**: 
   - Cria/busca cliente no Mercado Pago
   - Salva cartão do cliente
   - Cria assinatura usando API `/preapproval`
   - Atualiza usuário no Supabase
4. **Webhook**: Processa notificações e atualiza status
5. **Redirecionamento**: Usuário é redirecionado para dashboard

## Logs Importantes

Monitore os seguintes logs para debug:

```javascript
// Frontend
console.log("Dados do formulário:", formData)
console.log("Erro no formulário:", error)

// API Subscribe
console.log("Cliente criado/buscado:", customerId)
console.log("Cartão salvo:", cardId)
console.log("Assinatura criada:", subscription)

// Webhook
console.log("Webhook recebido:", body)
console.log("Processando atualização de assinatura:", data)
```

## Troubleshooting

### Erro: "Token de acesso do Mercado Pago não configurado"
- Verifique se `MP_ACCESS_TOKEN` está configurado
- Confirme se o token é válido

### Erro: "Plano inválido"
- Verifique se os códigos dos planos estão corretos
- Confirme se os planos existem no painel do Mercado Pago

### Erro: "Falha ao criar assinatura"
- Verifique os logs do servidor
- Confirme se o cartão foi salvo corretamente
- Verifique se o cliente foi criado no Mercado Pago

### Erro SQL: "syntax error at or near NOT"
- Use o script `scripts/018_mercadopago_simple.sql` (corrigido)
- Não use o script `scripts/017_mercadopago_integration.sql`

### Webhook não recebendo notificações
- Verifique se a URL do webhook está correta
- Confirme se os eventos estão configurados
- Teste a URL do webhook manualmente 