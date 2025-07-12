# Configuração das Variáveis de Ambiente

Este documento explica como configurar as variáveis de ambiente necessárias para o projeto OpenLove.

## 📋 Variáveis Obrigatórias

### 1. Supabase Configuration
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Como obter as chaves do Supabase

1. Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings > API**
4. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 Variáveis Opcionais

### 1. Mercado Pago (para pagamentos)
```env
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Stripe (alternativa para pagamentos)
```env
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. Redis (para cache e sessões)
```env
REDIS_URL=your-redis-url
```

### 4. NextAuth (para autenticação adicional)
```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 5. Email (para notificações)
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### 6. Cloudinary (para upload de arquivos)
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 🚀 Configuração Inicial

### 1. Criar arquivo .env.local
```bash
# Na raiz do projeto
touch .env.local
```

### 2. Adicionar variáveis básicas
```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (recomendado)
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Gerar chave secreta para NextAuth
```bash
# No terminal
openssl rand -base64 32
```

## 🔒 Segurança

### 1. Arquivos .env
- **NUNCA** commite arquivos `.env` no Git
- Use `.env.example` para documentar as variáveis necessárias
- Mantenha as chaves secretas seguras

### 2. Variáveis públicas vs privadas
- `NEXT_PUBLIC_*` → Acessíveis no cliente (browser)
- Sem `NEXT_PUBLIC_` → Apenas no servidor

### 3. Rotação de chaves
- Troque as chaves regularmente
- Monitore o uso das chaves
- Use diferentes chaves para desenvolvimento e produção

## 🐛 Solução de Problemas

### 1. Erro "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão escritas corretamente
- Reinicie o servidor após adicionar variáveis

### 2. Erro de conexão com Supabase
- Verifique se a URL do Supabase está correta
- Confirme se as chaves são válidas
- Teste a conexão no dashboard do Supabase

### 3. Erro de permissões
- Verifique se está usando a chave correta (anon vs service_role)
- Confirme se as políticas RLS estão configuradas
- Execute os scripts SQL necessários

## 📝 Exemplo Completo

```env
# Supabase Configuration (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration (RECOMENDADO)
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000

# Mercado Pago (OPCIONAL)
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789012345678901234567890
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Redis (OPCIONAL)
REDIS_URL=redis://localhost:6379

# Email (OPCIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (OPCIONAL)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔄 Atualizações

### 1. Adicionar novas variáveis
1. Adicione a variável no código
2. Documente no `.env.example`
3. Atualize esta documentação
4. Notifique a equipe

### 2. Remover variáveis obsoletas
1. Remova do código
2. Atualize a documentação
3. Limpe arquivos `.env` antigos

## 📞 Suporte

Para problemas com variáveis de ambiente:
1. Verifique se todas as variáveis obrigatórias estão configuradas
2. Confirme se os valores estão corretos
3. Teste a conexão com os serviços externos
4. Consulte a documentação específica de cada serviço 