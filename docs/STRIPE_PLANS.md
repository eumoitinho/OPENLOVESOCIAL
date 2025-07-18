# Planos OpenLove - Configuração Stripe

## Resumo dos Planos

| Plano | Preço | Período | Stripe Price ID | Público-Alvo |
|-------|-------|---------|-----------------|--------------|
| **Gratuito** | R$ 0,00 | - | - | Usuários explorando a plataforma |
| **Open Ouro** | R$ 25,00 | Mensal | `price_gold_monthly` | Usuários ativos que querem mais recursos |
| **Open Diamante** | R$ 45,90 | Mensal | `price_diamond_monthly` | Usuários power que querem recursos completos |
| **Open Diamante Anual** | R$ 459,00 | Anual | `price_diamond_yearly` | Usuários fiéis com desconto anual |

---

## 🆓 **Plano Gratuito**

### Preço
- **Custo**: R$ 0,00
- **Período**: Permanente
- **Stripe Product ID**: Não aplicável

### Descrição
Ideal para começar e explorar recursos básicos. Perfeito para usuários que querem conhecer a plataforma antes de fazer upgrade.

### ✅ **Recursos Inclusos**
- Participar de comunidades e eventos verificados
- Visualizar perfis de outros usuários
- Receber notificações básicas
- Criar perfil básico
- Navegar pela timeline

### ❌ **Limitações**
- **Upload de Mídia**: 0 imagens, 0 vídeos
- **Mensagens**: Não pode enviar mensagens privadas
- **Eventos**: Não pode criar eventos
- **Comunidades**: Só pode participar de comunidades verificadas (0 comunidades próprias)
- **Funcionalidades Premium**: Sem áudio, enquetes, posts pagos
- **Participação**: Apenas em conteúdo verificado pela plataforma

### 🎯 **Call to Action**
"Comece gratuitamente e descubra uma nova forma de se relacionar!"

---

## 🥇 **Open Ouro - R$ 25,00/mês**

### Preço
- **Custo**: R$ 25,00
- **Período**: Mensal
- **Stripe Product ID**: `prod_gold`
- **Stripe Price ID**: `price_gold_monthly`

### Descrição
Mais recursos para quem quer se destacar e interagir mais. Ideal para usuários que querem participar ativamente da comunidade.

### ✅ **Recursos Inclusos**
- **Upload de Mídia**: 
  - Até 5 imagens por post
  - Vídeos até 25MB
  - Até 10 vídeos por mês
  - Upload de áudio para posts
- **Comunidades**:
  - Participar de até 3 comunidades
  - Acesso a comunidades não-verificadas
- **Eventos**:
  - Criar até 2 eventos por mês
  - Participar de eventos ilimitados
- **Mensagens**:
  - Mensagens privadas com fotos e vídeos
  - Sem áudio em mensagens
- **Funcionalidades Premium**:
  - Criar enquetes
  - Posts com áudio
  - Perfil com destaque visual
- **Suporte**:
  - Estatísticas básicas de participação
  - Suporte por email

### ❌ **Limitações**
- Sem chamadas de voz/vídeo
- Não pode criar comunidades
- Sem badge verificado
- Sem analytics avançados

### 🎯 **Call to Action**
"Destaque-se na comunidade com recursos premium!"

---

## 💎 **Open Diamante - R$ 45,90/mês**

### Preço
- **Custo**: R$ 45,90
- **Período**: Mensal
- **Stripe Product ID**: `prod_diamond`
- **Stripe Price ID**: `price_diamond_monthly`

### Descrição
Para quem quer o máximo de liberdade, alcance e recursos. A experiência completa do OpenLove.

### ✅ **Recursos Inclusos**
- **Upload de Mídia**: 
  - Upload ilimitado de fotos e vídeos
  - Vídeos sem limite de tamanho (até 50MB)
  - Áudio ilimitado
- **Comunidades**:
  - Participar de até 5 comunidades
  - Criar comunidades privadas
  - Moderação avançada
- **Eventos**:
  - Criar até 10 eventos por mês
  - Eventos ilimitados
  - Recursos avançados de evento
- **Mensagens**:
  - Mensagens privadas completas
  - Chamadas de voz e vídeo
  - Compartilhamento de arquivos
- **Funcionalidades Premium**:
  - Perfil super destacado
  - Badge verificado automático
  - Criar posts pagos
  - Monetizar conteúdo
- **Analytics**:
  - Estatísticas detalhadas
  - Insights de engajamento
  - Relatórios de crescimento
- **Suporte**:
  - Suporte prioritário VIP
  - Acesso a recursos beta

### 🎯 **Call to Action**
"Experiência completa e ilimitada para relacionamentos autênticos!"

---

## 💎 **Open Diamante Anual - R$ 459,00/ano**

### Preço
- **Custo**: R$ 459,00 (equivale a R$ 38,25/mês)
- **Período**: Anual
- **Stripe Product ID**: `prod_diamond`
- **Stripe Price ID**: `price_diamond_yearly`
- **Desconto**: 16% (2 meses grátis)

### Descrição
Todos os recursos do Diamante com desconto anual. Perfeito para usuários comprometidos com a plataforma.

### ✅ **Recursos Inclusos**
- **Todos os recursos do Open Diamante**
- **Vantagens Exclusivas**:
  - 2 meses grátis (16% de desconto)
  - Pagamento único anual
  - Sem preocupação com renovação mensal
  - Acesso garantido por 12 meses

### 🎯 **Call to Action**
"Economize 16% e tenha acesso completo o ano todo!"

---

## 🛠️ **Configuração no Stripe Dashboard**

### 1. Produtos a Criar

```javascript
// Produto Ouro
{
  name: "Open Ouro",
  description: "Mais recursos para quem quer se destacar e interagir mais",
  images: ["https://openlove.com/assets/gold-plan.jpg"],
  metadata: {
    plan_type: "gold",
    max_images: "5",
    max_video_size: "25MB",
    max_videos_monthly: "10",
    max_communities: "3",
    max_events_monthly: "2"
  }
}

// Produto Diamante
{
  name: "Open Diamante",
  description: "Para quem quer o máximo de liberdade, alcance e recursos",
  images: ["https://openlove.com/assets/diamond-plan.jpg"],
  metadata: {
    plan_type: "diamante",
    max_images: "unlimited",
    max_video_size: "50MB",
    max_videos_monthly: "unlimited",
    max_communities: "5",
    max_events_monthly: "10"
  }
}
```

### 2. Preços a Criar

```javascript
// Preço Ouro Mensal
{
  product: "prod_gold",
  currency: "brl",
  unit_amount: 2500, // R$ 25,00 em centavos
  recurring: {
    interval: "month",
    interval_count: 1
  },
  nickname: "Open Ouro Mensal"
}

// Preço Diamante Mensal
{
  product: "prod_diamond",
  currency: "brl",
  unit_amount: 4590, // R$ 45,90 em centavos
  recurring: {
    interval: "month",
    interval_count: 1
  },
  nickname: "Open Diamante Mensal"
}

// Preço Diamante Anual
{
  product: "prod_diamond",
  currency: "brl",
  unit_amount: 45900, // R$ 459,00 em centavos
  recurring: {
    interval: "year",
    interval_count: 1
  },
  nickname: "Open Diamante Anual"
}
```

### 3. Webhooks Necessários

Configure os seguintes eventos de webhook:

```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
customer.subscription.trial_will_end
```

**Webhook URL**: `https://seudominio.com/api/stripe/webhook`

---

## 📊 **Análise de Preços**

### Estratégia de Preços
- **Free**: Aquisição de usuários e demonstração de valor
- **Ouro (R$ 25)**: Ponto de entrada acessível para recursos premium
- **Diamante (R$ 45,90)**: Experiência completa com margem saudável
- **Diamante Anual**: Incentivo à fidelidade com desconto atrativo

### Comparação de Mercado
- **Tinder Plus**: R$ 24,99/mês
- **Bumble Premium**: R$ 29,99/mês
- **Happn Premium**: R$ 19,99/mês
- **OpenLove** posiciona-se competitivamente com valor agregado único

### Projeção de Receita
- **Ouro**: 60% dos assinantes pagos
- **Diamante**: 35% dos assinantes pagos
- **Diamante Anual**: 5% dos assinantes pagos

---

## 🎨 **Elementos Visuais**

### Cores dos Planos
- **Gratuito**: `#6B7280` (Gray)
- **Ouro**: `#F59E0B` (Amber)
- **Diamante**: `#8B5CF6` (Purple)

### Ícones
- **Gratuito**: ⚡ (Zap)
- **Ouro**: ⭐ (Star)
- **Diamante**: 👑 (Crown)

### Badges
- **Gratuito**: Sem badge
- **Ouro**: Badge "Premium" dourado
- **Diamante**: Badge "Verificado" roxo com crown

---

## 🔄 **Migração de Planos**

### Upgrades Permitidos
- Free → Ouro
- Free → Diamante
- Ouro → Diamante
- Diamante Mensal → Diamante Anual

### Downgrades
- Diamante → Ouro (no final do período)
- Ouro → Free (no final do período)
- Diamante Anual → Mensal (no final do período)

### Proration
- Upgrades: Crédito proporcional imediato
- Downgrades: Aplicado no próximo ciclo

---

## 📋 **Checklist de Implementação**

- [ ] Criar produtos no Stripe Dashboard
- [ ] Configurar preços com IDs corretos
- [ ] Testar webhooks em desenvolvimento
- [ ] Atualizar variáveis de ambiente
- [ ] Configurar domínio personalizado
- [ ] Implementar análise de conversão
- [ ] Configurar emails de cobrança
- [ ] Testar fluxo completo de pagamento
- [ ] Implementar retry lógico para falhas
- [ ] Configurar monitoramento de métricas

---

## 🚀 **Comandos Úteis**

```bash
# Listar produtos
stripe products list

# Criar produto
stripe products create \
  --name "Open Ouro" \
  --description "Mais recursos premium"

# Criar preço
stripe prices create \
  --product prod_xxx \
  --unit-amount 2500 \
  --currency brl \
  --recurring interval=month

# Testar webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Verificar logs
stripe logs tail
```

Este documento serve como guia completo para configuração dos planos no Stripe e deve ser usado durante a implementação no dashboard da Stripe.