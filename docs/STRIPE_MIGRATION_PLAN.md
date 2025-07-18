# Plano de Migração: Mercado Pago → Stripe

## Resumo Executivo

Este documento detalha o plano de migração do sistema de assinaturas do OpenLove de Mercado Pago para Stripe.

### Estado Atual
- **Processador**: Mercado Pago
- **Planos**: Free, Gold (R$ 25), Diamante (R$ 45,90), Diamante Anual (R$ 459)
- **Campos no BD**: plano, mp_customer_id, mp_subscription_id, status_assinatura, ultimo_pagamento, proximo_pagamento

### Arquivos Afetados

#### APIs
- `/app/api/mercadopago/subscribe/route.ts` → `/app/api/stripe/subscribe/route.ts`
- `/app/api/mercadopago/webhook/route.ts` → `/app/api/stripe/webhook/route.ts`

#### Componentes UI
- `/app/components/CheckoutForm.tsx`
- `/app/checkout/page.tsx`
- `/app/pricing/PricingContent.tsx`
- `/app/components/UpgradePlanButton.tsx`

#### Banco de Dados
- Tabela `users` precisa adicionar campos: `stripe_customer_id`, `stripe_subscription_id`
- Manter campos MP durante transição
- Migração em `/scripts/020_stripe_migration.sql`

#### Tipos e Constantes
- `/types/mercadopago.d.ts` → `/types/stripe.d.ts`
- `/app/lib/constants.ts`

## Fases da Migração

### Fase 1: Preparação (Dual Mode)
1. **Adicionar campos Stripe ao BD**
   - stripe_customer_id
   - stripe_subscription_id
   - Manter campos MP para rollback

2. **Criar tipos TypeScript para Stripe**
   - Interfaces para produtos/preços
   - Tipos de eventos webhook
   - Mapeamento planos MP → Stripe

3. **Implementar API Stripe paralela**
   - `/api/stripe/subscribe/route.ts`
   - `/api/stripe/webhook/route.ts`
   - Feature flag para alternar

### Fase 2: Implementação

4. **Atualizar CheckoutForm**
   - Integrar Stripe Elements
   - Manter lógica MP com flag
   - Validações e error handling

5. **Configurar produtos no Stripe**
   - Criar produtos e preços
   - Webhooks endpoint
   - Configurar moedas BRL

6. **Testes em ambiente dev**
   - Fluxo completo de assinatura
   - Webhooks e atualizações
   - Cancelamentos e upgrades

### Fase 3: Migração de Dados

7. **Script de migração**
   - Mapear customers MP → Stripe
   - Sincronizar assinaturas ativas
   - Preservar histórico

8. **Validação de dados**
   - Comparar totais
   - Verificar status
   - Logs detalhados

### Fase 4: Ativação

9. **Deploy gradual**
   - 10% tráfego inicial
   - Monitorar métricas
   - Rollback preparado

10. **Cutover completo**
    - 100% para Stripe
    - Desativar MP APIs
    - Arquivar código legado

## Mapeamento de Dados

### Planos
```
Mercado Pago → Stripe
free → price_free
gold → price_gold_monthly
diamante → price_diamond_monthly
diamante_anual → price_diamond_yearly
```

### Status
```
MP Status → Stripe Status
authorized → active
pending → incomplete
cancelled → canceled
suspended → past_due
inactive → canceled
```

## Riscos e Mitigações

1. **Perda de dados**
   - Backup completo antes
   - Logs de auditoria
   - Rollback automatizado

2. **Falha de pagamento**
   - Retry logic
   - Notificações ao usuário
   - Suporte manual

3. **Downtime**
   - Deploy Blue-Green
   - Feature flags
   - Monitoramento 24/7

## Cronograma Estimado

- **Semana 1**: Preparação e tipos
- **Semana 2**: APIs e webhooks
- **Semana 3**: UI e testes
- **Semana 4**: Migração de dados
- **Semana 5**: Deploy gradual
- **Semana 6**: Monitoramento e ajustes

## Checklist de Validação

- [ ] Todos os testes passando
- [ ] Webhooks funcionando
- [ ] Dados migrados corretamente
- [ ] Performance adequada
- [ ] Logs e monitoramento
- [ ] Documentação atualizada
- [ ] Equipe treinada
- [ ] Rollback testado

## Comandos Úteis

```bash
# Testar webhook local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Verificar produtos
stripe products list

# Logs de eventos
stripe events list --limit 10
```

## Referências

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)