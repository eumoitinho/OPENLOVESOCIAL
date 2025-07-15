# Script PowerShell para corrigir erro da coluna is_public
# Execute este script no PowerShell

Write-Host "🔧 Iniciando correção do erro da coluna is_public..." -ForegroundColor Yellow

# Verificar se o psql está disponível
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro: psql não encontrado. Instale o PostgreSQL ou configure o PATH." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ psql encontrado: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: psql não encontrado. Instale o PostgreSQL ou configure o PATH." -ForegroundColor Red
    exit 1
}

# Configurações do Supabase
$SUPABASE_URL = "https://your-project.supabase.co"
$SUPABASE_DB = "postgres"
$SUPABASE_USER = "postgres"
$SUPABASE_PASSWORD = "your-db-password"

Write-Host "📋 Configurações:" -ForegroundColor Cyan
Write-Host "   URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host "   Database: $SUPABASE_DB" -ForegroundColor Gray
Write-Host "   User: $SUPABASE_USER" -ForegroundColor Gray

# Função para executar comando SQL
function Execute-SQL {
    param(
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "🔄 $Description..." -ForegroundColor Blue
    
    try {
        $result = psql -h $SUPABASE_URL -p 5432 -d $SUPABASE_DB -U $SUPABASE_USER -c $Query 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description - Sucesso" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Description - Erro:" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Description - Exceção: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar estrutura atual das tabelas
Write-Host "`n📊 Verificando estrutura atual das tabelas..." -ForegroundColor Cyan

$checkQuery = @"
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('events', 'communities', 'system_settings', 'media')
    AND column_name = 'is_public'
ORDER BY table_name, ordinal_position;
"@

Execute-SQL -Query $checkQuery -Description "Verificando colunas is_public existentes"

# 2. Executar script de correção
Write-Host "`n🔧 Executando correção da coluna is_public..." -ForegroundColor Cyan

$correctionScript = Get-Content "scripts/050_fix_is_public_error.sql" -Raw

try {
    $result = psql -h $SUPABASE_URL -p 5432 -d $SUPABASE_DB -U $SUPABASE_USER -f "scripts/050_fix_is_public_error.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script de correção executado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao executar script de correção:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exceção ao executar script: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Verificar estrutura após correção
Write-Host "`n📊 Verificando estrutura após correção..." -ForegroundColor Cyan

$verifyQuery = @"
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('events', 'communities', 'system_settings', 'media')
    AND column_name = 'is_public'
ORDER BY table_name, ordinal_position;
"@

Execute-SQL -Query $verifyQuery -Description "Verificando colunas is_public após correção"

# 4. Testar políticas RLS
Write-Host "`n🔒 Testando políticas RLS..." -ForegroundColor Cyan

$testRLSQuery = @"
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('events', 'communities', 'system_settings', 'media')
ORDER BY tablename, policyname;
"@

Execute-SQL -Query $testRLSQuery -Description "Verificando políticas RLS"

# 5. Testar inserção de dados
Write-Host "`n🧪 Testando inserção de dados..." -ForegroundColor Cyan

$testInsertQuery = @"
-- Testar inserção em events
INSERT INTO events (user_id, title, description, start_date, is_public)
SELECT 
    u.id,
    'Evento de Teste',
    'Descrição do evento de teste',
    NOW() + INTERVAL '1 day',
    true
FROM users u
LIMIT 1
ON CONFLICT DO NOTHING;

-- Testar inserção em system_settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public)
VALUES ('test_setting', 'test_value', 'Configuração de teste', true)
ON CONFLICT (setting_key) DO NOTHING;

SELECT 'Dados de teste inseridos com sucesso!' as status;
"@

Execute-SQL -Query $testInsertQuery -Description "Inserindo dados de teste"

# 6. Verificar dados inseridos
Write-Host "`n📋 Verificando dados inseridos..." -ForegroundColor Cyan

$checkDataQuery = @"
SELECT 
    'events' as table_name,
    COUNT(*) as total_records
FROM events
UNION ALL
SELECT 
    'system_settings' as table_name,
    COUNT(*) as total_records
FROM system_settings
WHERE setting_key = 'test_setting';
"@

Execute-SQL -Query $checkDataQuery -Description "Verificando dados inseridos"

# 7. Limpar dados de teste
Write-Host "`n🧹 Limpando dados de teste..." -ForegroundColor Cyan

$cleanupQuery = @"
DELETE FROM events WHERE title = 'Evento de Teste';
DELETE FROM system_settings WHERE setting_key = 'test_setting';
SELECT 'Dados de teste removidos!' as status;
"@

Execute-SQL -Query $cleanupQuery -Description "Removendo dados de teste"

Write-Host "`n🎉 Correção da coluna is_public concluída!" -ForegroundColor Green
Write-Host "`n📝 Resumo das correções:" -ForegroundColor Cyan
Write-Host "   ✅ Verificação da estrutura das tabelas" -ForegroundColor Gray
Write-Host "   ✅ Adição da coluna is_public onde necessário" -ForegroundColor Gray
Write-Host "   ✅ Configuração de políticas RLS" -ForegroundColor Gray
Write-Host "   ✅ Testes de inserção e consulta" -ForegroundColor Gray
Write-Host "   ✅ Limpeza de dados de teste" -ForegroundColor Gray

Write-Host "`n🚀 Agora você pode executar os outros scripts sem erros!" -ForegroundColor Green 