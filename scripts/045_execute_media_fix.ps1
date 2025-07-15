# Script para corrigir problemas de upload de mídia
# Data: 2025-01-XX
# Versao: 1.0

Write-Host "🔧 Iniciando correção de upload de mídia..." -ForegroundColor Yellow

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
$DB_PASSWORD = "YOUR_PASSWORD_HERE"

# Construir string de conexão
$connectionString = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

Write-Host "📋 Executando correção do banco de dados..." -ForegroundColor Cyan

try {
    # Executar script de correção
    $result = psql $connectionString -f "scripts/044_fix_media_upload.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script executado com sucesso!" -ForegroundColor Green
        Write-Host "📦 Bucket 'media' configurado" -ForegroundColor Green
        Write-Host "🗄️ Tabela 'media' criada/atualizada" -ForegroundColor Green
        Write-Host "🔒 Políticas RLS configuradas" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao executar script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique se o bucket 'media' foi criado no Supabase Storage" -ForegroundColor White
Write-Host "2. Teste o upload de uma imagem ou vídeo" -ForegroundColor White
Write-Host "3. Verifique se as URLs estão sendo geradas corretamente" -ForegroundColor White
Write-Host ""
Write-Host "✅ Correção concluída!" -ForegroundColor Green 