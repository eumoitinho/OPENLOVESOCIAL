# Script para corrigir erro de cache do Next.js
Write-Host "🔧 Corrigindo erro de cache do Next.js..." -ForegroundColor Yellow

# Parar o servidor se estiver rodando
Write-Host "⏹️ Parando servidor de desenvolvimento..." -ForegroundColor Blue
taskkill /f /im node.exe 2>$null

# Limpar cache do Next.js
Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Blue
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cache .next removido" -ForegroundColor Green
}

# Limpar cache do node_modules
Write-Host "🧹 Limpando cache do node_modules..." -ForegroundColor Blue
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ Cache node_modules removido" -ForegroundColor Green
}

# Limpar cache do pnpm
Write-Host "🧹 Limpando cache do pnpm..." -ForegroundColor Blue
pnpm store prune 2>$null
Write-Host "✅ Cache pnpm limpo" -ForegroundColor Green

# Reinstalar dependências se necessário
Write-Host "📦 Verificando dependências..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
    pnpm install
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
}

# Iniciar servidor de desenvolvimento
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "O servidor será iniciado em modo de desenvolvimento" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Cyan
Write-Host ""

# Iniciar o servidor
pnpm dev 