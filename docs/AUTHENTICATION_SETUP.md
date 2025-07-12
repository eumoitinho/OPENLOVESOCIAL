# Configuração do Sistema de Autenticação OpenLove

Este documento explica como configurar o sistema de autenticação com 2FA (Two-Factor Authentication) usando Supabase Auth.

## 🚀 Funcionalidades Implementadas

### 1. Login com Email/Senha
- Autenticação tradicional com email e senha
- Validação de campos em tempo real
- Feedback visual de erros

### 2. Verificação de Email (2FA)
- Envio automático de código de verificação por email
- Interface para inserção do código
- Reenvio de código com contador regressivo
- Verificação automática do status de confirmação

### 3. Redirecionamento Inteligente
- Redirecionamento automático para a página original após login
- Proteção de rotas baseada no status de autenticação
- Verificação de confirmação de email

### 4. Páginas de Confirmação
- Página dedicada para confirmação de email
- Feedback visual do status da confirmação
- Redirecionamento automático após confirmação

## 📋 Pré-requisitos

### 1. Configuração do Supabase
Certifique-se de que o Supabase está configurado com as seguintes variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Configuração de Email no Supabase
1. Acesse o dashboard do Supabase
2. Vá para **Settings > Auth > Email Templates**
3. Configure os templates de email para:
   - Confirmação de email
   - Redefinição de senha
   - Verificação de 2FA

### 3. Configuração do SMTP (Opcional)
Para emails personalizados, configure um provedor SMTP:
1. Vá para **Settings > Auth > SMTP Settings**
2. Configure seu provedor SMTP preferido

## 🗄️ Configuração do Banco de Dados

### 1. Executar Scripts SQL
Execute os scripts SQL na seguinte ordem:

```bash
# 1. Schema inicial
psql -h seu_host -U seu_usuario -d seu_banco -f scripts/001_initial_schema.sql

# 2. Dados de teste
psql -h seu_host -U seu_usuario -d seu_banco -f scripts/002_seed_data.sql

# 3. Permissões de autenticação
psql -h seu_host -U seu_usuario -d seu_banco -f scripts/003_auth_permissions.sql
```

### 2. Verificar Tabelas Criadas
As seguintes tabelas devem estar presentes:
- `profiles` - Perfis dos usuários
- `posts` - Posts da timeline
- `follows` - Relacionamentos de seguir
- `friends` - Amizades
- `notifications` - Notificações

## 🔧 Configuração das Políticas de Segurança

### 1. Row Level Security (RLS)
O script `003_auth_permissions.sql` configura automaticamente:
- RLS habilitado em todas as tabelas
- Políticas de acesso baseadas no usuário autenticado
- Funções auxiliares para verificação de permissões

### 2. Políticas Implementadas
- **Profiles**: Visualização pública, edição apenas do próprio perfil
- **Posts**: Visualização pública, criação/edição apenas dos próprios posts
- **Follows**: Visualização pública, gerenciamento apenas dos próprios follows
- **Friends**: Visualização pública, gerenciamento apenas das próprias amizades
- **Notifications**: Acesso apenas às próprias notificações

## 🎯 Fluxo de Autenticação

### 1. Login Inicial
```
Usuário insere email/senha → Supabase valida → 
Se email não confirmado → Envia código de verificação → 
Mostra tela de verificação
```

### 2. Verificação de Email
```
Usuário insere código → Supabase verifica → 
Se válido → Redireciona para página original → 
Se inválido → Mostra erro
```

### 3. Redirecionamento
```
Usuário acessa rota protegida → Middleware verifica autenticação → 
Se não autenticado → Redireciona para login com URL de retorno → 
Após login → Redireciona para URL original
```

## 🔒 Segurança

### 1. Proteção de Rotas
- Middleware verifica autenticação em todas as rotas protegidas
- Verificação de confirmação de email
- Redirecionamento automático para login

### 2. Validação de Dados
- Validação de email no frontend e backend
- Sanitização de inputs
- Proteção contra ataques de força bruta

### 3. Sessões Seguras
- Tokens JWT gerenciados pelo Supabase
- Refresh automático de tokens
- Logout seguro

## 🧪 Testando o Sistema

### 1. Teste de Registro
```bash
# 1. Acesse /auth/signup
# 2. Preencha o formulário
# 3. Verifique se o email de confirmação foi enviado
# 4. Clique no link de confirmação
# 5. Verifique se foi redirecionado para /auth/signin
```

### 2. Teste de Login
```bash
# 1. Acesse /auth/signin
# 2. Insira credenciais válidas
# 3. Se email não confirmado, teste o fluxo de verificação
# 4. Verifique se foi redirecionado para /home
```

### 3. Teste de Proteção de Rotas
```bash
# 1. Faça logout
# 2. Tente acessar /home
# 3. Verifique se foi redirecionado para /auth/signin
# 4. Faça login
# 5. Verifique se foi redirecionado para /home
```

## 🐛 Solução de Problemas

### 1. Email não sendo enviado
- Verifique a configuração SMTP no Supabase
- Confirme se os templates de email estão configurados
- Verifique os logs do Supabase

### 2. Erro de redirecionamento
- Verifique se o middleware está configurado corretamente
- Confirme se as rotas estão sendo protegidas adequadamente
- Verifique os logs do Next.js

### 3. Erro de permissões no banco
- Execute novamente o script `003_auth_permissions.sql`
- Verifique se o RLS está habilitado nas tabelas
- Confirme se as políticas estão criadas corretamente

### 4. Problemas de sessão
- Limpe os cookies do navegador
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o Supabase está acessível

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs do console do navegador
2. Verifique os logs do servidor Next.js
3. Verifique os logs do Supabase
4. Consulte a documentação do Supabase Auth

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas
- [ ] Login com Google/Facebook
- [ ] Autenticação por SMS
- [ ] Biometria (fingerprint/face ID)
- [ ] Sessões múltiplas
- [ ] Log de atividades de login

### Melhorias de Segurança
- [ ] Rate limiting
- [ ] Detecção de atividades suspeitas
- [ ] Backup codes para 2FA
- [ ] Logout em todos os dispositivos 