# Teste do Sistema de Autenticação e Timeout de Sessão

Este documento contém instruções para testar o sistema de autenticação implementado no OpenLove, incluindo o timeout de sessão de 5 horas.

## 🧪 Testes Automatizados

### 1. Teste do Banco de Dados

Execute o script SQL para verificar a integridade do sistema:

```bash
# Conecte ao banco de dados Supabase
psql -h db.seu-projeto.supabase.co -U postgres -d postgres -f scripts/test_auth_system.sql
```

### 2. Teste das APIs

Use o seguinte script para testar as APIs de autenticação:

```bash
# Teste da API de timeline (requer autenticação)
curl -X GET "http://localhost:3000/api/timeline" \
  -H "Cookie: sb-access-token=SEU_TOKEN_AQUI" \
  -H "Cookie: sb-refresh-token=SEU_REFRESH_TOKEN_AQUI"

# Teste da API de posts (requer autenticação)
curl -X POST "http://localhost:3000/api/posts" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=SEU_TOKEN_AQUI" \
  -d '{"content": "Teste de post", "visibility": "public"}'
```

## 🔍 Testes Manuais

### 1. Teste de Redirecionamento

#### Cenário 1: Usuário Não Logado
1. Acesse `http://localhost:3000/home`
2. **Resultado Esperado**: Redirecionamento para `/auth/signin`

#### Cenário 2: Usuário Logado na Página Inicial
1. Faça login em `/auth/signin`
2. Acesse `http://localhost:3000/`
3. **Resultado Esperado**: Redirecionamento para `/home`

#### Cenário 3: Usuário Logado em Rota de Auth
1. Faça login
2. Acesse `http://localhost:3000/auth/signin`
3. **Resultado Esperado**: Redirecionamento para `/home`

### 2. Teste de Timeout de Sessão

#### Cenário 1: Sessão Válida
1. Faça login
2. Verifique se consegue acessar `/home`
3. **Resultado Esperado**: Acesso permitido

#### Cenário 2: Sessão Expirada (Simulação)
1. Faça login
2. Modifique o token para simular expiração (no DevTools)
3. Tente acessar uma API protegida
4. **Resultado Esperado**: Logout automático e redirecionamento para `/`

#### Cenário 3: Verificação Periódica
1. Faça login
2. Aguarde 5 minutos
3. Verifique se a verificação periódica está funcionando
4. **Resultado Esperado**: Logout automático se a sessão expirou

### 3. Teste de Componentes

#### AuthProvider
1. Abra o DevTools
2. Verifique se o contexto de autenticação está funcionando
3. Teste o logout manual
4. **Resultado Esperado**: Estado limpo e redirecionamento

#### Middleware
1. Verifique os logs do servidor
2. Teste diferentes rotas com e sem autenticação
3. **Resultado Esperado**: Logs de redirecionamento corretos

## 🐛 Debugging

### 1. Verificar Logs

#### Middleware
```javascript
// Verifique os logs no console do servidor
console.log("Middleware: Usuário logado na página inicial, redirecionando para home")
console.log("Middleware: Token expirado, fazendo logout")
```

#### AuthProvider
```javascript
// Verifique os logs no console do navegador
console.log("[AuthProvider] Sessão inicial:", session)
console.log("[AuthProvider] Sessão expirada, fazendo logout")
```

### 2. Verificar Cookies

No DevTools > Application > Cookies:
- `sb-access-token`: Token de acesso
- `sb-refresh-token`: Token de renovação
- Verifique se os cookies estão sendo definidos corretamente

### 3. Verificar Estado da Aplicação

No DevTools > React DevTools:
- Verifique o estado do `AuthProvider`
- Confirme se `user`, `session` e `loading` estão corretos

## 📊 Métricas de Teste

### 1. Performance
- **Tempo de Login**: < 2 segundos
- **Tempo de Redirecionamento**: < 1 segundo
- **Verificação de Timeout**: < 100ms

### 2. Segurança
- **Sessões Expiradas**: Logout automático
- **Tokens Inválidos**: Rejeição imediata
- **Rotas Protegidas**: Acesso negado para não autenticados

### 3. Usabilidade
- **Feedback Visual**: Indicadores de loading
- **Mensagens de Erro**: Claras e informativas
- **Redirecionamento**: Suave e intuitivo

## 🔧 Configuração de Teste

### 1. Ambiente de Desenvolvimento

```bash
# Variáveis de ambiente para teste
NEXT_PUBLIC_SUPABASE_URL=sua_url_de_teste
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_de_teste
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_de_teste
```

### 2. Banco de Dados de Teste

```sql
-- Criar usuário de teste
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'teste@openlove.com',
  crypt('senha123', gen_salt('bf')),
  NOW()
);
```

### 3. Dados de Teste

```sql
-- Inserir perfil de teste
INSERT INTO public.users (id, email, username, name)
VALUES (
  'ID_DO_USUARIO_DE_TESTE',
  'teste@openlove.com',
  'usuario_teste',
  'Usuário de Teste'
);
```

## 🚨 Problemas Comuns

### 1. Sessão Não Persiste
**Sintoma**: Usuário é deslogado após refresh
**Solução**: Verificar configuração de cookies no Supabase

### 2. Redirecionamento Infinito
**Sintoma**: Loop de redirecionamento
**Solução**: Verificar middleware e condições de redirecionamento

### 3. Timeout Não Funciona
**Sintoma**: Sessão não expira
**Solução**: Verificar verificação periódica no AuthProvider

### 4. APIs Retornam 401
**Sintoma**: Erro de autenticação em APIs
**Solução**: Verificar função `verifyAuth()` e tokens

## 📝 Checklist de Teste

- [ ] Login funciona corretamente
- [ ] Logout limpa o estado
- [ ] Redirecionamentos funcionam
- [ ] Timeout de sessão funciona
- [ ] APIs protegidas rejeitam não autenticados
- [ ] Verificação periódica funciona
- [ ] Mensagens de erro são claras
- [ ] Performance está adequada
- [ ] Segurança está implementada
- [ ] Usabilidade está boa

## 🔄 Atualizações

Este documento deve ser atualizado sempre que houver mudanças no sistema de autenticação. Mantenha os testes sincronizados com as funcionalidades implementadas. 