# Comandos Stripe CLI - OpenLove

## 1. Criar Produtos

### Produto Open Ouro
```bash
stripe products create \
  --name "Open Ouro" \
  --description "Mais recursos para quem quer se destacar e interagir mais" \
  --metadata plan_type=gold \
  --metadata max_images=5 \
  --metadata max_video_size=25MB \
  --metadata max_videos_monthly=10 \
  --metadata max_communities=3 \
  --metadata max_events_monthly=2 \
  --metadata features=unlimited_messages,audio_posts,polls,private_communities
```

### Produto Open Diamante
```bash
stripe products create \
  --name "Open Diamante" \
  --description "Para quem quer o máximo de liberdade, alcance e recursos" \
  --metadata plan_type=diamante \
  --metadata max_images=unlimited \
  --metadata max_video_size=50MB \
  --metadata max_videos_monthly=unlimited \
  --metadata max_communities=5 \
  --metadata max_events_monthly=10 \
  --metadata features=all_gold_features,voice_video_calls,advanced_analytics,unlimited_communities
```

## 2. Criar Preços

### Open Ouro Mensal - R$ 25,00
```bash
stripe prices create \
  --product {GOLD_PRODUCT_ID} \
  --currency brl \
  --unit-amount 2500 \
  --recurring-interval month \
  --nickname "Open Ouro Mensal"
```

### Open Diamante Mensal - R$ 45,90
```bash
stripe prices create \
  --product {DIAMOND_PRODUCT_ID} \
  --currency brl \
  --unit-amount 4590 \
  --recurring-interval month \
  --nickname "Open Diamante Mensal"
```

### Open Diamante Anual - R$ 459,00 (2 meses grátis)
```bash
stripe prices create \
  --product {DIAMOND_PRODUCT_ID} \
  --currency brl \
  --unit-amount 45900 \
  --recurring-interval year \
  --nickname "Open Diamante Anual"
```

## 3. Comandos PowerShell (Windows)

### Produto Open Ouro
```powershell
stripe products create --name "Open Ouro" --description "Mais recursos para quem quer se destacar e interagir mais" --metadata plan_type=gold --metadata max_images=5 --metadata max_video_size=25MB --metadata max_videos_monthly=10 --metadata max_communities=3 --metadata max_events_monthly=2 --metadata features=unlimited_messages,audio_posts,polls,private_communities
```

### Produto Open Diamante
```powershell
stripe products create --name "Open Diamante" --description "Para quem quer o máximo de liberdade, alcance e recursos" --metadata plan_type=diamante --metadata max_images=unlimited --metadata max_video_size=50MB --metadata max_videos_monthly=unlimited --metadata max_communities=5 --metadata max_events_monthly=10 --metadata features=all_gold_features,voice_video_calls,advanced_analytics,unlimited_communities
```

### Preços (substitua {PRODUCT_ID} pelos IDs retornados)
```powershell
# Open Ouro Mensal
stripe prices create --product {GOLD_PRODUCT_ID} --currency brl --unit-amount 2500 --recurring-interval month --nickname "Open Ouro Mensal"

# Open Diamante Mensal
stripe prices create --product {DIAMOND_PRODUCT_ID} --currency brl --unit-amount 4590 --recurring-interval month --nickname "Open Diamante Mensal"

# Open Diamante Anual
stripe prices create --product {DIAMOND_PRODUCT_ID} --currency brl --unit-amount 45900 --recurring-interval year --nickname "Open Diamante Anual"
```

## 4. Variáveis de Ambiente para .env.local

Após criar os produtos e preços, adicione ao seu `.env.local`:

```env
# Stripe Products
STRIPE_PRODUCT_GOLD=prod_xxxxxxxxxx
STRIPE_PRODUCT_DIAMOND=prod_xxxxxxxxxx

# Stripe Prices
STRIPE_PRICE_GOLD_MONTHLY=price_xxxxxxxxxx
STRIPE_PRICE_DIAMOND_MONTHLY=price_xxxxxxxxxx
STRIPE_PRICE_DIAMOND_YEARLY=price_xxxxxxxxxx

# Stripe Keys (já existentes)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

## 5. Notas Importantes

- Os valores estão em centavos (2500 = R$ 25,00)
- Certifique-se de estar no ambiente correto (test/live)
- Guarde os IDs retornados para configurar a aplicação
- Configure os webhooks para processar pagamentos automaticamente

## 6. Testando

Para testar se os produtos foram criados:
```bash
stripe products list
stripe prices list
``` 