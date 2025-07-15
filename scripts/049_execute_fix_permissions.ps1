# Script para executar correção de permissões e erros
# Data: 2025-01-XX
# Versao: 1.0

Write-Host "🔧 Iniciando correção de permissões e erros..." -ForegroundColor Yellow

# Verificar se o psql está disponível
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL client encontrado!" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL client não encontrado!" -ForegroundColor Red
        Write-Host "💡 Instale o PostgreSQL client ou configure as variáveis de ambiente" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar PostgreSQL client" -ForegroundColor Red
    exit 1
}

# Configurações do banco (substitua pelos seus dados)
$DB_HOST = "db.YOUR_PROJECT.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "YOUR_PASSWORD"

Write-Host "📊 Configurações do banco:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor White
Write-Host "   Port: $DB_PORT" -ForegroundColor White
Write-Host "   Database: $DB_NAME" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White

# Construir string de conexão
$connectionString = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

Write-Host "🔗 String de conexão: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}" -ForegroundColor Cyan

# Executar script de correção
Write-Host "🚀 Executando script de correção..." -ForegroundColor Yellow

try {
    $result = psql $connectionString -f "scripts/048_fix_permissions_and_errors.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script executado com sucesso!" -ForegroundColor Green
        Write-Host "📋 Resultado:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "❌ Erro ao executar script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script: $_" -ForegroundColor Red
    exit 1
}

# Testar se as correções funcionaram
Write-Host "🧪 Testando correções..." -ForegroundColor Yellow

# Teste 1: Verificar se a tabela friends existe e tem permissões
$testFriendsQuery = @"
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'friends') as friends_exists,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'friends') as friends_has_policies;
"@

try {
    $friendsResult = psql $connectionString -c $testFriendsQuery -t 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tabela friends verificada!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao verificar tabela friends" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar tabela friends: $_" -ForegroundColor Red
}

# Teste 2: Verificar se a tabela events existe e tem a coluna date
$testEventsQuery = @"
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'events') as events_exists,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') as events_has_date;
"@

try {
    $eventsResult = psql $connectionString -c $testEventsQuery -t 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tabela events verificada!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao verificar tabela events" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar tabela events: $_" -ForegroundColor Red
}

# Teste 3: Verificar se a tabela posts tem permissões corretas
$testPostsQuery = @"
SELECT 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') as posts_exists,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'posts') as posts_has_policies;
"@

try {
    $postsResult = psql $connectionString -c $testPostsQuery -t 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tabela posts verificada!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao verificar tabela posts" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar tabela posts: $_" -ForegroundColor Red
}

# Teste 4: Tentar inserir um post de teste
$testInsertQuery = @"
INSERT INTO posts (user_id, content, visibility)
SELECT 
    id,
    'Post de teste após correção - ' || NOW(),
    'public'
FROM users 
LIMIT 1
RETURNING id;
"@

try {
    $insertResult = psql $connectionString -c $testInsertQuery -t 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Inserção de post de teste funcionou!" -ForegroundColor Green
        Write-Host "📝 Post criado com ID: $insertResult" -ForegroundColor White
    } else {
        Write-Host "❌ Erro ao inserir post de teste" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar inserção: $_" -ForegroundColor Red
}

# Teste 5: Verificar se a API de timeline funciona
Write-Host "🌐 Testando API de timeline..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/timeline" -Method GET -TimeoutSec 10
    Write-Host "✅ API de timeline funcionando!" -ForegroundColor Green
    Write-Host "   Posts retornados: $($response.data.Count)" -ForegroundColor White
    Write-Host "   Tem mais posts: $($response.hasMore)" -ForegroundColor White
} catch {
    Write-Host "❌ Erro ao testar API de timeline: $_" -ForegroundColor Red
    Write-Host "💡 Certifique-se de que o servidor Next.js está rodando" -ForegroundColor Cyan
}

Write-Host "✅ Correção concluída!" -ForegroundColor Green
Write-Host "🎯 Agora teste criar um post e verificar a timeline" -ForegroundColor Cyan 