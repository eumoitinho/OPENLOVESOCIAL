# Script para executar correção final do banco de dados
# Data: 2025-01-XX
# Versao: 1.0

Write-Host "🔧 Iniciando correção final do banco de dados..." -ForegroundColor Yellow

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

Write-Host "📋 Configurações do banco:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   Port: $DB_PORT" -ForegroundColor Gray
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray

# Construir string de conexão
$connectionString = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

Write-Host "🚀 Executando script de correção..." -ForegroundColor Yellow

try {
    # Executar o script SQL
    $result = psql $connectionString -f "scripts/042_fix_final_database.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script executado com sucesso!" -ForegroundColor Green
        Write-Host "🎉 Todas as correções foram aplicadas!" -ForegroundColor Green
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Resumo das correções:" -ForegroundColor Cyan
        Write-Host "   ✅ Tabela friends criada" -ForegroundColor Gray
        Write-Host "   ✅ Campos wallet_balance, tokens adicionados" -ForegroundColor Gray
        Write-Host "   ✅ Tabelas de anúncios criadas" -ForegroundColor Gray
        Write-Host "   ✅ Tabelas de conteúdo premium criadas" -ForegroundColor Gray
        Write-Host "   ✅ Tabelas de estatísticas criadas" -ForegroundColor Gray
        Write-Host "   ✅ Políticas RLS corrigidas" -ForegroundColor Gray
        Write-Host "   ✅ Funções SQL criadas" -ForegroundColor Gray
        Write-Host "" -ForegroundColor White
        Write-Host "💡 Agora você pode usar todas as funcionalidades do sistema!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao executar script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro inesperado:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "" -ForegroundColor White
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Teste o registro de usuários" -ForegroundColor Gray
Write-Host "   2. Teste o sistema de amizades" -ForegroundColor Gray
Write-Host "   3. Teste o upload de posts" -ForegroundColor Gray
Write-Host "   4. Teste o sistema de notificações" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "✅ Correção finalizada com sucesso!" -ForegroundColor Green 