# Integração Mercado Pago - OpenLove

Este documento descreve a integração completa do Mercado Pago para assinaturas no projeto OpenLove.

## 📋 Pré-requisitos

- Conta Mercado Pago (ambiente de desenvolvimento configurado)
- Projeto Next.js hospedado na Vercel
- Supabase configurado
- Variáveis de ambiente configuradas

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no seu arquivo `.env.local` e na Vercel:

```bash
# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# URLs de Redirecionamento
NEXT_PUBLIC_SITE_URL=https://openlove.com.br
```

### 2. Planos no Mercado Pago

Crie os seguintes planos no painel do Mercado Pago:

- **OPENGOLD**: R$ 25,00/mês
- **OPENDIMA**: R$ 45,90/mês
- **OPENDIMAYEAR**: R$ 459,00/ano (2 meses grátis)

### 3. Webhook

Configure o webhook no painel do Mercado Pago para apontar para:
```
https://seusite.com/api/mercadopago/webhook
```

## 🚀 Fluxos Implementados

### 1. Novo Usuário (Cadastro + Assinatura)

1. Usuário se cadastra no site
2. É redirecionado para `/checkout?plano=gold` ou `/checkout?plano=diamante`
3. Preenche dados do cartão usando CardPayment do Mercado Pago
4. Sistema cria cliente, salva cartão e cria assinatura
5. Usuário é redirecionado para página de sucesso
6. Webhook atualiza status da assinatura

### 2. Usuário Existente (Upgrade)

1. Usuário já logado clica em "Upgrade"
2. É redirecionado para `/checkout?plano=diamante`
3. Sistema busca cliente existente ou cria novo
4. Salva novo cartão se necessário
5. Cria nova assinatura
6. Atualiza plano no Supabase

## 📁 Arquivos Criados

### API Routes
- `app/api/mercadopago/subscribe/route.ts` - Criação de assinaturas
- `app/api/mercadopago/webhook/route.ts` - Webhook para notificações

### Componentes
- `app/components/CheckoutForm.tsx` - Formulário de pagamento
- `app/components/UpgradePlanButton.tsx` - Botão de upgrade
- `app/components/PlanStatus.tsx` - Status do plano atual

### Páginas
- `app/checkout/page.tsx` - Página de checkout
- `app/planoativado/gold/page.tsx` - Sucesso Gold
- `app/planoativado/diamante/page.tsx` - Sucesso Diamante

### Tipos
- `types/mercadopago.d.ts` - Declarações TypeScript

## 🔄 Fluxo de Dados

### 1. Criação de Assinatura
```
Frontend → /api/mercadopago/subscribe → Mercado Pago API → Supabase
```

### 2. Webhook
```
Mercado Pago → /api/mercadopago/webhook → Supabase
```

### 3. Redirecionamento
```
Sucesso → /planoativado/[plano] → Dashboard
```

## 📊 Estrutura do Banco (Supabase)

A tabela `users` deve ter os seguintes campos adicionais:

```sql
ALTER TABLE users ADD COLUMN plano VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN status_assinatura VARCHAR(50);
ALTER TABLE users ADD COLUMN mp_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN mp_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN ultimo_pagamento TIMESTAMP;
```

## 🧪 Testes

### Cartões de Teste
Use os cartões de teste do Mercado Pago:

- **Aprovado**: 4509 9535 6623 3704
- **Pendente**: 4000 0000 0000 0002
- **Rejeitado**: 4000 0000 0000 0004

### Testando o Fluxo
1. Use um email único para cada teste
2. Verifique se o cliente é criado no Mercado Pago
3. Confirme se a assinatura é criada
4. Verifique se o usuário é atualizado no Supabase
5. Teste o webhook com diferentes status

## 🛠️ Uso dos Componentes

### CheckoutForm
```tsx
<CheckoutForm
  user={user}
  plano="gold"
  onSuccess={(data) => console.log('Sucesso:', data)}
  onError={(error) => console.error('Erro:', error)}
/>
```

### UpgradePlanButton
```tsx
<UpgradePlanButton
  currentPlan="free"
  targetPlan="gold"
  className="custom-class"
/>
```

### PlanStatus
```tsx
<PlanStatus />
```

## 🔍 Monitoramento

### Logs Importantes
- Criação de clientes
- Criação de assinaturas
- Atualizações via webhook
- Erros de pagamento

### Métricas
- Taxa de conversão
- Taxa de aprovação
- Churn rate
- Revenue por plano

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de credenciais**
   - Verifique se as variáveis de ambiente estão corretas
   - Confirme se está usando as credenciais de teste em desenvolvimento

2. **Webhook não funciona**
   - Verifique se a URL está correta no painel do Mercado Pago
   - Confirme se o endpoint está acessível publicamente

3. **Assinatura não é criada**
   - Verifique os logs da API
   - Confirme se o plano existe no Mercado Pago
   - Valide se o token do cartão está sendo gerado corretamente

4. **Usuário não é atualizado**
   - Verifique se o SUPABASE_SERVICE_ROLE_KEY está correto
   - Confirme se a tabela users tem os campos necessários

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs da Vercel
2. Consulte a documentação do Mercado Pago
3. Teste com cartões de teste
4. Verifique as variáveis de ambiente

## 🔄 Próximos Passos

- [ ] Implementar cancelamento de assinatura
- [ ] Adicionar histórico de pagamentos
- [ ] Implementar retry automático para pagamentos falhados
- [ ] Adicionar notificações por email
- [ ] Implementar analytics avançados 