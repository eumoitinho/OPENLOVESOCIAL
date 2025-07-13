# Correções de Autenticação - OpenLove

Este documento descreve as correções aplicadas para resolver problemas de autenticação e registro de usuários.

## 🚨 Problemas Identificados

### 1. Erro no Registro de Usuário
**Erro:** `Database error creating new user`
**Causa:** O service role não tinha permissões adequadas para inserir usuários na tabela `users` devido às políticas RLS (Row Level Security).

### 2. Usuário Não Aparece como Logado
**Problema:** Após o registro/login, o usuário é redirecionado para `/home` mas aparece como "não logado".
**Causa:** Problemas na criação do perfil do usuário e no tratamento de sessão.

## 🔧 Correções Aplicadas

### 1. Script SQL de Correção de Permissões

**Arquivo:** `scripts/032_fix_auth_permissions.sql`

**O que faz:**
- Garante que o service role tem todas as permissões necessárias
- Cria políticas RLS adequadas para o service role
- Desabilita e reabilita RLS para aplicar as novas políticas
- Cria função auxiliar para inserção segura de usuários
- Garante permissões em extensões e funções necessárias

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `scripts/032_fix_auth_permissions.sql`
4. Execute o script
5. Verifique se a mensagem "Permissões de autenticação corrigidas com sucesso!" aparece

### 2. Melhorias no AuthProvider

**Arquivo:** `app/components/auth/AuthProvider.tsx`

**Melhorias aplicadas:**
- Logs detalhados para debug
- Melhor tratamento de sessão
- Verificação mais robusta de timeout
- Tratamento melhorado de erros

### 3. Correções na API de Registro

**Arquivo:** `app/api/auth/register/route.ts`

**Melhorias aplicadas:**
- Logs detalhados em cada etapa
- Melhor tratamento de erros
- Limpeza automática em caso de falha
- Verificação mais robusta de dados

### 4. Correções no Redirecionamento de Login

**Arquivo:** `app/auth/signin/page.tsx`

**Melhorias aplicadas:**
- Delay de 500ms antes do redirecionamento para garantir que a sessão seja estabelecida
- Melhor tratamento de erros de verificação de email

## 🚀 Como Aplicar as Correções

### Passo 1: Execute o Script SQL
```sql
-- Execute no Supabase SQL Editor
-- Conteúdo do arquivo scripts/032_fix_auth_permissions.sql
```

### Passo 2: Verifique as Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
```

### Passo 3: Reinicie o Servidor
```bash
pnpm dev
```

### Passo 4: Teste o Registro
1. Acesse a página de registro
2. Crie uma nova conta
3. Verifique se não há erros no console
4. Confirme se o usuário é redirecionado corretamente para `/home`
5. Verifique se o usuário aparece como logado

## 🔍 Debug e Troubleshooting

### Verificar Logs do Servidor
```bash
# No terminal onde o servidor está rodando
# Procure por mensagens como:
# "Criando usuário no Supabase Auth..."
# "Usuário criado no Auth com sucesso: [ID]"
# "Criando perfil na tabela users..."
# "Perfil criado com sucesso: [dados]"
```

### Verificar Logs do Navegador
```javascript
// No console do navegador, procure por:
// "[AuthProvider] Auth state changed: [event] [user_id]"
// "[AuthProvider] Sessão obtida: Sim/Não"
// "[AuthProvider] Perfil carregado: Sim/Não"
```

### Verificar Permissões no Supabase
1. Acesse o Supabase Dashboard
2. Vá para Authentication > Policies
3. Verifique se a tabela `users` tem as políticas corretas
4. Confirme que o service role tem permissões adequadas

### Problemas Comuns

#### 1. "Service role key not found"
**Solução:** Verifique se a variável `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente.

#### 2. "RLS policy violation"
**Solução:** Execute novamente o script SQL de correção de permissões.

#### 3. "User not found in users table"
**Solução:** Verifique se o trigger de criação automática de perfil está funcionando.

#### 4. "Session not established"
**Solução:** Verifique se o AuthProvider está sendo carregado corretamente.

## 📋 Checklist de Verificação

- [ ] Script SQL executado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor reiniciado
- [ ] Registro de novo usuário funciona
- [ ] Login funciona corretamente
- [ ] Redirecionamento funciona
- [ ] Usuário aparece como logado
- [ ] Logs não mostram erros
- [ ] Políticas RLS aplicadas corretamente

## 🔄 Próximos Passos

Se as correções não resolverem o problema:

1. **Verifique a versão do Supabase:** Certifique-se de que está usando uma versão compatível
2. **Teste com usuário limpo:** Crie um novo projeto Supabase para teste
3. **Verifique logs detalhados:** Ative logs mais detalhados no Supabase
4. **Contate o suporte:** Se necessário, abra uma issue no GitHub

## 📞 Suporte

Para problemas técnicos:
1. Verifique este documento
2. Consulte os logs de erro
3. Teste com um novo usuário
4. Abra uma issue no GitHub com detalhes do problema 