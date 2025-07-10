# Sistema de Anúncios OpenLove

## Visão Geral

O sistema de anúncios do OpenLove permite que marcas e anunciantes criem campanhas publicitárias direcionadas ao público da plataforma. O sistema inclui dashboard completo, métricas em tempo real, sistema de pagamento integrado e segmentação avançada.

## Funcionalidades Principais

### 🎯 Para Anunciantes
- **Dashboard Completo**: Interface intuitiva para gerenciar campanhas
- **Criação de Campanhas**: Múltiplos tipos de anúncio (timeline, sidebar, banner, story)
- **Segmentação Avançada**: Público-alvo baseado em localização, interesses e comportamento
- **Métricas em Tempo Real**: Impressões, cliques, CTR, conversões
- **Sistema de Pagamento**: Integração com Stripe para adicionar saldo
- **Aprovação de Conteúdo**: Moderação para garantir qualidade

### 📊 Para a Plataforma
- **Monetização**: Receita através de CPM (custo por mil impressões) e CPC (custo por clique)
- **Qualidade**: Sistema de aprovação para manter padrões
- **Performance**: Otimização automática de entrega
- **Analytics**: Relatórios detalhados de performance

## Estrutura do Banco de Dados

### Tabelas Principais

#### `advertisers`
- Perfis de anunciantes
- Informações de contato e negócio
- Saldo e histórico de gastos
- Integração com Stripe

#### `ad_campaigns`
- Campanhas de anúncio
- Configurações de segmentação
- Orçamento e duração
- Status e aprovação

#### `ad_metrics`
- Eventos de impressão, clique e conversão
- Dados de performance em tempo real
- Metadados para análise

#### `ad_transactions`
- Histórico de pagamentos
- Integração com Stripe
- Rastreamento de transações

## Tipos de Anúncio

### 1. Timeline Ads
- Exibidos na timeline principal
- Aparecem a cada 3 posts
- Formato: Card com imagem, título, descrição e CTA

### 2. Sidebar Ads
- Exibidos na sidebar direita
- Formato compacto
- Ideal para marcas locais

### 3. Banner Ads
- Anúncios em destaque
- Formato grande e chamativo
- Posicionamento estratégico

### 4. Story Ads
- Anúncios em formato story
- Duração limitada
- Interação direta

## Sistema de Preços

### Modelo de Custo
- **CPM (Custo por Mil Impressões)**: R$ 5,00
- **CPC (Custo por Clique)**: R$ 0,50
- **Orçamento Mínimo**: R$ 50,00
- **Orçamento Máximo**: R$ 10.000,00

### Segmentação de Preços
- **Alta Prioridade**: +20% do preço base
- **Segmentação Avançada**: +15% do preço base
- **Horário de Pico**: +10% do preço base

## Segmentação de Público

### Critérios Disponíveis
- **Localização**: Cidade, estado, país
- **Idade**: 18-65 anos
- **Interesses**: Tags e categorias
- **Comportamento**: Histórico de interações
- **Status de Relacionamento**: Solteiro, casal, etc.
- **Tipo de Conta**: Premium, verificada

### Exemplos de Segmentação
```json
{
  "location": ["São Paulo", "Rio de Janeiro"],
  "age_range": [25, 45],
  "interests": ["eventos", "gastronomia", "viagens"],
  "relationship_type": ["casal", "solteiro"],
  "account_type": ["premium", "verified"]
}
```

## Dashboard do Anunciante

### Visão Geral
- Métricas principais (impressões, cliques, CTR)
- Saldo disponível
- Campanhas ativas
- Performance recente

### Gestão de Campanhas
- Criar nova campanha
- Editar campanhas existentes
- Pausar/reativar campanhas
- Visualizar métricas detalhadas

### Analytics
- Gráficos de performance
- Relatórios por período
- Análise de público-alvo
- ROI e conversões

## APIs Disponíveis

### `/api/ads`
- `GET`: Listar campanhas
- `POST`: Criar nova campanha
- `PUT`: Atualizar campanha
- `DELETE`: Deletar campanha

### `/api/ads/metrics`
- `POST`: Registrar evento (impressão/clique)
- `GET`: Buscar métricas

### `/api/ads/payment`
- `POST`: Criar pagamento
- `PUT`: Atualizar status
- `GET`: Histórico de transações

## Integração com Stripe

### Fluxo de Pagamento
1. Anunciante adiciona saldo
2. Criação de PaymentIntent no Stripe
3. Processamento do pagamento
4. Atualização do saldo na conta
5. Registro da transação

### Webhooks
- `payment_intent.succeeded`: Confirma pagamento
- `payment_intent.payment_failed`: Falha no pagamento
- `customer.subscription.updated`: Atualização de assinatura

## Moderação de Conteúdo

### Critérios de Aprovação
- ✅ Conteúdo apropriado para a plataforma
- ✅ Imagens de qualidade
- ✅ Links funcionais
- ✅ Informações verdadeiras
- ❌ Conteúdo ofensivo ou inadequado
- ❌ Spam ou conteúdo duplicado

### Processo de Aprovação
1. Anunciante cria campanha
2. Sistema verifica automaticamente
3. Moderação manual (se necessário)
4. Aprovação/rejeição
5. Ativação da campanha

## Métricas e Analytics

### KPIs Principais
- **Impressões**: Número de visualizações
- **Cliques**: Interações com o anúncio
- **CTR**: Taxa de clique (cliques/impressões)
- **Conversões**: Ações desejadas
- **CPM**: Custo por mil impressões
- **CPC**: Custo por clique

### Relatórios Disponíveis
- Performance diária/semanal/mensal
- Análise por dispositivo
- Segmentação geográfica
- Comportamento do usuário
- ROI e eficiência

## Configurações do Sistema

### Variáveis de Ambiente
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Configurações de Anúncios
```json
{
  "pricing": {
    "cpm": 5.00,
    "cpc": 0.50,
    "min_budget": 50.00,
    "max_budget": 10000.00
  },
  "targeting": {
    "age_range": [18, 65],
    "locations": ["São Paulo", "Rio de Janeiro", "Brasília"],
    "interests": ["casais", "eventos", "lifestyle"]
  },
  "approval": {
    "auto_approve": false,
    "review_time": 24,
    "moderation_enabled": true
  },
  "display": {
    "max_ads_per_page": 3,
    "ad_spacing": 3,
    "sidebar_ads_enabled": true
  }
}
```

## Como Usar

### Para Anunciantes
1. Acesse `/ads` para o dashboard
2. Crie uma conta de anunciante
3. Adicione saldo via Stripe
4. Crie sua primeira campanha
5. Configure segmentação
6. Aguarde aprovação
7. Monitore performance

### Para Desenvolvedores
1. Execute o script SQL: `scripts/003_ads_system.sql`
2. Configure as variáveis de ambiente
3. Integre os componentes de anúncio
4. Implemente tracking de métricas
5. Configure webhooks do Stripe

## Roadmap

### Próximas Funcionalidades
- [ ] Anúncios em vídeo
- [ ] Remarketing
- [ ] A/B testing
- [ ] Otimização automática
- [ ] Integração com Google Analytics
- [ ] Anúncios programáticos
- [ ] Marketplace de anúncios

### Melhorias Técnicas
- [ ] Cache de métricas
- [ ] Otimização de queries
- [ ] CDN para imagens
- [ ] Machine learning para segmentação
- [ ] API GraphQL

## Suporte

Para dúvidas sobre o sistema de anúncios:
- Email: ads@openlove.com
- Documentação: `/docs/ads`
- Dashboard: `/ads`
- Status: `/status/ads`

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Desenvolvido por**: Equipe OpenLove 