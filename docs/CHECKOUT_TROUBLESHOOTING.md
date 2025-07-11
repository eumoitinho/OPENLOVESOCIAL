# Troubleshooting - Checkout Não Abre

## Problema
O modal de checkout do Mercado Pago não está abrindo quando o usuário clica em "Assinar Agora".

## Passos para Diagnosticar

### 1. Verificar Console do Navegador
Abra o DevTools (F12) e verifique se há erros no console:

```javascript
// Logs esperados:
"PricingContent renderizado: { user: ..., showCheckout: false, selectedPlan: null }"
"handleSubscribe chamado com plano: { id: 'ouro', ... }"
"Abrindo checkout para plano: ouro"
"CheckoutForm renderizado com: { user: ..., plano: 'gold', PUBLIC_KEY: '...' }"
"Iniciando inicialização do Mercado Pago..."
"Mercado Pago SDK inicializado com sucesso"
```

### 2. Verificar Se o Usuário Está Logado
O checkout só abre se o usuário estiver logado. Verifique se:
- O usuário fez login
- O AuthProvider está funcionando
- O estado `user` não é `null`

### 3. Testar Página de Teste
Acesse `/test-checkout` para testar o checkout isoladamente:
- http://localhost:3000/test-checkout

### 4. Verificar Variáveis de Ambiente
Certifique-se de que a chave pública está configurada:

```env
# .env.local
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-7318588454249163-071012-10d6b8a29f54f5f0aaca0b884ab0ab63-2005560667
```

## Possíveis Causas e Soluções

### 1. Usuário Não Logado
**Sintoma**: Modal não abre, redireciona para login
**Solução**: Fazer login primeiro

### 2. Erro na Inicialização do SDK
**Sintoma**: "Erro ao carregar formulário de pagamento"
**Solução**: 
- Verificar se a chave pública está correta
- Verificar se o domínio está autorizado no Mercado Pago
- Verificar se há bloqueio de CORS

### 3. Problema com Modal
**Sintoma**: Modal não aparece visualmente
**Solução**:
- Verificar se há conflitos de CSS
- Verificar se o z-index está correto
- Verificar se há elementos sobrepondo

### 4. Problema com React State
**Sintoma**: Estado não atualiza
**Solução**:
- Verificar se o componente está re-renderizando
- Verificar se não há loops infinitos

## Debug Avançado

### 1. Adicionar Logs Temporários
```javascript
// No PricingContent.tsx
console.log("Estado atual:", { showCheckout, selectedPlan, user });

// No CheckoutForm.tsx
console.log("Props recebidas:", { user, plano, onSuccess, onError });
```

### 2. Verificar Network Tab
- Verificar se há requisições falhando
- Verificar se o SDK do Mercado Pago está carregando

### 3. Verificar Elements Tab
- Verificar se o modal está sendo renderizado no DOM
- Verificar se há elementos com `display: none` ou `visibility: hidden`

## Teste Manual

### 1. Teste Básico
```javascript
// No console do navegador
document.querySelector('[data-testid="checkout-modal"]') // Verificar se existe
```

### 2. Teste de Estado
```javascript
// No console do navegador (se estiver usando React DevTools)
// Verificar o estado do componente PricingContent
```

### 3. Teste de Evento
```javascript
// Simular clique no botão
document.querySelector('button[onclick*="handleSubscribe"]').click()
```

## Soluções Comuns

### 1. Limpar Cache
```bash
# Limpar cache do Next.js
rm -rf .next
pnpm dev
```

### 2. Reinstalar Dependências
```bash
rm -rf node_modules
pnpm install
```

### 3. Verificar Versões
```bash
# Verificar se as dependências estão atualizadas
pnpm outdated
```

### 4. Testar em Modo de Produção
```bash
pnpm build
pnpm start
```

## Logs de Debug Adicionados

Os seguintes logs foram adicionados para debug:

### PricingContent.tsx
- Log do estado do componente
- Log quando handleSubscribe é chamado
- Log quando o checkout é aberto/fechado

### CheckoutForm.tsx
- Log das props recebidas
- Log da inicialização do SDK
- Log de erros de inicialização
- Log do estado de carregamento

## Próximos Passos

1. **Verificar console** para identificar erros específicos
2. **Testar página de teste** em `/test-checkout`
3. **Verificar se usuário está logado**
4. **Verificar variáveis de ambiente**
5. **Testar em modo de produção**

Se o problema persistir, forneça os logs do console para análise adicional. 