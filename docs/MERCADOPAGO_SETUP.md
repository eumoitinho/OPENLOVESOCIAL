# Configuração do Mercado Pago

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Mercado Pago
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Configuração no Mercado Pago

### 1. Criar Planos de Assinatura

No painel do Mercado Pago, crie os seguintes planos de assinatura:

#### Plano Gold
- **Nome**: OpenLove Gold
- **Preço**: R$ 25,00
- **Frequência**: Mensal
- **Código**: `2c93808497eec1c50197f5377401026e`

#### Plano Diamante
- **Nome**: OpenLove Diamante
- **Preço**: R$ 45,90
- **Frequência**: Mensal
- **Código**: `2c93808497eec1c50197f53886f60270`

#### Plano Diamante Anual
- **Nome**: OpenLove Diamante Anual
- **Preço**: R$ 459,00
- **Frequência**: Anual
- **Código**: `OPENDIMAYEAR`

### 2. Configurar Webhook

Configure o webhook no painel do Mercado Pago:

- **URL**: `https://openlove.com.br/api/mercadopago/webhook`
- **Eventos**:
  - `subscription_preapproval`
  - `payment`
  - `subscription_authorized_payment`

### 3. Configurar URLs de Retorno

Configure as URLs de retorno para cada plano:

- **Sucesso**: `https://openlove.com.br/dashboard`
- **Falha**: `https://openlove.com.br/auth/signup`
- **Pendente**: `https://openlove.com.br/dashboard`

## Teste da Integração

### Cartões de Teste

Use os seguintes cartões para testar:

#### Cartão Aprovado
- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Data**: 12/25

#### Cartão Rejeitado
- **Número**: 4000 0000 0000 0002
- **CVV**: 123
- **Data**: 12/25

### Fluxo de Teste

1. Acesse a página de checkout
2. Preencha os dados do cartão de teste
3. Submeta o formulário
4. Verifique se a assinatura foi criada no painel do Mercado Pago
5. Verifique se o usuário foi atualizado no Supabase

## Troubleshooting

### Erro: "Token de acesso do Mercado Pago não configurado"
- Verifique se a variável `MP_ACCESS_TOKEN` está configurada
- Certifique-se de que o token é válido

### Erro: "Plano inválido"
- Verifique se os códigos dos planos estão corretos
- Confirme se os planos existem no painel do Mercado Pago

### Erro: "Falha ao criar assinatura"
- Verifique os logs do servidor para mais detalhes
- Confirme se o cartão foi salvo corretamente
- Verifique se o cliente foi criado no Mercado Pago

### Webhook não recebendo notificações
- Verifique se a URL do webhook está correta
- Confirme se os eventos estão configurados
- Teste a URL do webhook manualmente

## Logs Importantes

Monitore os seguintes logs para debug:

```javascript
// Criação de cliente
console.log("Cliente criado/buscado:", customerId)

// Salvamento de cartão
console.log("Cartão salvo:", cardId)

// Criação de assinatura
console.log("Assinatura criada:", subscription)

// Webhook
console.log("Webhook recebido:", body)
``` 