# Configuração do Webhook AbacatePay

## 🔗 Configuração no Dashboard AbacatePay

### **URL do Webhook**
```
https://seudominio.com/api/payments/pix/webhook
```

### **Evento**
- ✅ `billing.paid`

### **Método HTTP**
- **POST**

### **Formato**
- Content-Type: `application/json`

## 📋 Exemplo de Configuração

No dashboard do AbacatePay, configure:

```
┌─────────────────────────────────────────────────────┐
│ Webhook Settings                                    │
├─────────────────────────────────────────────────────┤
│ URL: https://openlove.com/api/payments/pix/webhook  │
│ Event: billing.paid                                 │
│ Method: POST                                        │
│ Status: Active ✅                                   │
└─────────────────────────────────────────────────────┘
```

## 🧪 Para Desenvolvimento Local

```bash
# Instalar ngrok
npm install -g ngrok

# Criar túnel
ngrok http 3000

# Usar URL gerada
https://abc123.ngrok.io/api/payments/pix/webhook
```

## 📊 Estrutura do Webhook

O AbacatePay enviará um POST com esta estrutura:

```json
{
  "id": "billing_id_123",
  "event": "billing.paid",
  "amount": 2500,
  "description": "Assinatura Open Ouro",
  "status": "paid",
  "paidAt": "2025-01-17T15:30:00Z",
  "metadata": {
    "stripe_payment_intent_id": "pi_xxx",
    "user_id": "user_123",
    "plan_type": "gold"
  }
}
```

## ✅ Teste do Webhook

Para testar se o webhook está funcionando:

1. **Fazer um pagamento PIX de teste**
2. **Verificar logs do webhook**:
   ```sql
   SELECT * FROM webhook_logs 
   WHERE provider = 'abacatepay' 
   ORDER BY processed_at DESC;
   ```

3. **Verificar se o plano foi atualizado**:
   ```sql
   SELECT plan_type, plan_status 
   FROM profiles 
   WHERE id = 'user_id';
   ```

## 🔐 Segurança

O webhook está configurado para:
- ✅ Validar estrutura dos dados
- ✅ Verificar se o payment_intent existe
- ✅ Logar todas as requisições
- ✅ Processar apenas eventos válidos

## 📝 Configuração Correta

Use exatamente:
- **URL**: `/api/payments/pix/webhook`
- **Evento**: `billing.paid`
- **Método**: `POST`

Não use eventos como `payment.paid` ou `payment.status_changed` - apenas `billing.paid` está disponível no AbacatePay! 🎯