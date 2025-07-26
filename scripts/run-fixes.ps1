# =====================================================
# SCRIPT DE EXECUÇÃO DE CORREÇÕES - OPENLOVE (Windows)
# =====================================================
# Data: $(date)
# Descrição: Executa todas as correções de incompatibilidades no Windows
# =====================================================

# Configurações
$ErrorActionPreference = "Stop"

Write-Host "🚀 OPENLOVE - Script de Correção de Incompatibilidades" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto OPENLOVE" -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Node.js não está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Ambiente verificado" -ForegroundColor Green
Write-Host ""

# 1. Executar correções no código
Write-Host "📝 PASSO 1: Corrigindo queries no código..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow

if (Test-Path "scripts/fix-code-queries.js") {
    try {
        node scripts/fix-code-queries.js
        Write-Host ""
    } catch {
        Write-Host "⚠️  Erro ao executar script de correção de código" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Script de correção de código não encontrado" -ForegroundColor Yellow
}

# 2. Instruções para o banco de dados
Write-Host "🗄️  PASSO 2: Correções no banco de dados" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para corrigir o banco de dados, execute o seguinte script no Supabase SQL Editor:" -ForegroundColor White
Write-Host ""
Write-Host "📋 Copie e cole o conteúdo do arquivo:" -ForegroundColor White
Write-Host "   scripts/027_fix_database_incompatibilities.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   → Selecione seu projeto" -ForegroundColor White
Write-Host "   → SQL Editor" -ForegroundColor White
Write-Host "   → Cole o script e execute" -ForegroundColor White
Write-Host ""

# 3. Verificar se há erros de TypeScript
Write-Host "🔍 PASSO 3: Verificando erros de TypeScript..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow

try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Host "Executando verificação de tipos com pnpm..." -ForegroundColor White
        pnpm run type-check 2>$null
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Executando verificação de tipos com npm..." -ForegroundColor White
        npm run type-check 2>$null
    } else {
        Write-Host "⚠️  Execute 'npx tsc --noEmit' para verificar tipos" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Execute 'npx tsc --noEmit' para verificar tipos" -ForegroundColor Yellow
}

Write-Host ""

# 4. Instruções finais
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "1. ✅ Execute o script de correção do banco de dados no Supabase" -ForegroundColor White
Write-Host "2. ✅ Teste as funcionalidades corrigidas:" -ForegroundColor White
Write-Host "   - Sistema de amizades" -ForegroundColor White
Write-Host "   - Dashboard" -ForegroundColor White
Write-Host "   - Sistema de perfis" -ForegroundColor White
Write-Host "3. ✅ Verifique se não há erros de compilação" -ForegroundColor White
Write-Host "4. ✅ Teste o sistema de anúncios (após criar tabelas)" -ForegroundColor White
Write-Host "5. ✅ Teste o sistema de conteúdo premium (após criar tabelas)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação:" -ForegroundColor White
Write-Host "   - RELATORIO_INCOMPATIBILIDADES.md" -ForegroundColor Cyan
Write-Host "   - scripts/028_fix_code_queries.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Scripts disponíveis:" -ForegroundColor White
Write-Host "   - scripts/027_fix_database_incompatibilities.sql" -ForegroundColor Cyan
Write-Host "   - scripts/fix-code-queries.js" -ForegroundColor Cyan
Write-Host "   - scripts/run-fixes.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: Se encontrar problemas, verifique os backups em:" -ForegroundColor White
Write-Host "   backups/before-fix-$(Get-Date -Format 'yyyy-MM-dd')/" -ForegroundColor Cyan
Write-Host ""

# Aguardar input do usuário
Read-Host "Pressione Enter para sair" 
