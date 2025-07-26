# Guia Completo - Configuração Stripe para OpenLove

## 1. Instalação do Stripe CLI

### Windows (PowerShell)
```powershell
# Opção 1: Usando Chocolatey (recomendado)
choco install stripe-cli

# Opção 2: Usando Scoop
scoop install stripe

# Opção 3: Download manual
# Baixe de: https://github.com/stripe/stripe-cli/releases/latest
# Extraia o arquivo stripe.exe para uma pasta no PATH
```

### Verificar instalação
```powershell
stripe --version
```

## 2. Autenticação

### Login no Stripe
```powershell
stripe login
```

### Ou usar API Key diretamente
```powershell
stripe config --set key sk_test_your_secret_key_here
```

## 3. Comandos Corretos para Criar Produtos

### Produto Open Ouro
```powershell
stripe products create `
  --name "Open Ouro" `
  --description "Mais recursos para quem quer se destacar e interagir mais" `
  --metadata plan_type=gold `
  --metadata max_images=5 `
  --metadata max_video_size=25MB `
  --metadata max_videos_monthly=10 `
  --metadata max_communities=3 `
  --metadata max_events_monthly=2
```

### Produto Open Diamante
```powershell
stripe products create `
  --name "Open Diamante" `
  --description "Para quem quer o máximo de liberdade, alcance e recursos" `
  --metadata plan_type=diamante `
  --metadata max_images=unlimited `
  --metadata max_video_size=50MB `
  --metadata max_videos_monthly=unlimited `
  --metadata max_communities=5 `
  --metadata max_events_monthly=10
```

## 4. Criar Preços (após obter Product IDs)

### Open Ouro Mensal - R$ 25,00
```powershell
stripe prices create `
  --product prod_XXXXXXXXXX `
  --currency brl `
  --unit-amount 2500 `
  --recurring-interval month `
  --nickname "Open Ouro Mensal"
```

### Open Diamante Mensal - R$ 45,90
```powershell
stripe prices create `
  --product prod_XXXXXXXXXX `
  --currency brl `
  --unit-amount 4590 `
  --recurring-interval month `
  --nickname "Open Diamante Mensal"
```

### Open Diamante Anual - R$ 459,00
```powershell
stripe prices create `
  --product prod_XXXXXXXXXX `
  --currency brl `
  --unit-amount 45900 `
  --recurring-interval year `
  --nickname "Open Diamante Anual"
```

## 5. Comandos em Uma Linha (sem quebras)

### Produtos
```powershell
# Open Ouro
stripe products create --name "Open Ouro" --description "Mais recursos para quem quer se destacar e interagir mais" --metadata plan_type=gold --metadata max_images=5 --metadata max_video_size=25MB --metadata max_videos_monthly=10 --metadata max_communities=3 --metadata max_events_monthly=2

# Open Diamante
stripe products create --name "Open Diamante" --description "Para quem quer o máximo de liberdade, alcance e recursos" --metadata plan_type=diamante --metadata max_images=unlimited --metadata max_video_size=50MB --metadata max_videos_monthly=unlimited --metadata max_communities=5 --metadata max_events_monthly=10
```

### Preços (substitua PRODUCT_ID pelos IDs retornados)
```powershell
# Open Ouro Mensal
stripe prices create --product GOLD_PRODUCT_ID --currency brl --unit-amount 2500 --recurring-interval month --nickname "Open Ouro Mensal"

# Open Diamante Mensal
stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 4590 --recurring-interval month --nickname "Open Diamante Mensal"

# Open Diamante Anual
stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 45900 --recurring-interval year --nickname "Open Diamante Anual"
```

## 6. Configuração .env.local

Após criar os produtos e preços, adicione ao `.env.local`:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Products
STRIPE_PRODUCT_GOLD=prod_your_gold_product_id
STRIPE_PRODUCT_DIAMOND=prod_your_diamond_product_id

# Stripe Prices
STRIPE_PRICE_GOLD_MONTHLY=price_your_gold_monthly_price_id
STRIPE_PRICE_DIAMOND_MONTHLY=price_your_diamond_monthly_price_id
STRIPE_PRICE_DIAMOND_YEARLY=price_your_diamond_yearly_price_id
```

## 7. Webhooks (Importante!)

### Criar endpoint webhook
```powershell
stripe webhook_endpoints create `
  --url https://yourdomain.com/api/stripe/webhook `
  --enabled-events customer.subscription.created `
  --enabled-events customer.subscription.updated `
  --enabled-events customer.subscription.deleted `
  --enabled-events invoice.payment_succeeded `
  --enabled-events invoice.payment_failed
```

### Para desenvolvimento local
```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 8. Testando

### Listar produtos criados
```powershell
stripe products list
```

### Listar preços criados
```powershell
stripe prices list
```

### Criar sessão de checkout de teste
```powershell
stripe checkout sessions create `
  --success-url https://yourdomain.com/success `
  --cancel-url https://yourdomain.com/cancel `
  --mode subscription `
  --line-items[0][price]=price_your_price_id `
  --line-items[0][quantity]=1
```

## 9. Cartões de Teste

Para testar pagamentos, use estes cartões:

```
# Cartão aprovado
4242 4242 4242 4242

# Cartão recusado
4000 0000 0000 0002

# Cartão com autenticação 3D Secure
4000 0000 0000 3220
```

## 10. Solução de Problemas

### Erro "stripe command not found"
- Verifique se o Stripe CLI está instalado
- Adicione o diretório do stripe.exe ao PATH do Windows
- Reinicie o PowerShell após a instalação

### Erro de autenticação
- Execute `stripe login` novamente
- Verifique se está usando as chaves corretas (test/live)

### Erro ao criar produtos
- Verifique se tem permissões no dashboard Stripe
- Confirme que está no ambiente correto (test mode)

## 11. Próximos Passos

1. ✅ Instalar Stripe CLI
2. ✅ Fazer login no Stripe
3. ✅ Criar produtos Open Ouro e Open Diamante
4. ✅ Criar preços mensais e anuais
5. ✅ Configurar webhooks
6. ✅ Atualizar .env.local com os IDs
7. ✅ Testar checkout
8. ✅ Configurar em produção

## 12. Links Úteis

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test) 