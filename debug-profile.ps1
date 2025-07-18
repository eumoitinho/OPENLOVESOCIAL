Write-Host "=== DEBUG: Problema de Perfil ===" -ForegroundColor Yellow

# Verificar se o servidor está rodando
Write-Host "`nVerificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✓ Servidor rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Servidor não está rodando" -ForegroundColor Red
    Write-Host "Execute: pnpm dev" -ForegroundColor Yellow
    exit 1
}

# Testar API de perfil atual
Write-Host "`nTestando API de perfil atual..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/profile" -Method GET -TimeoutSec 10
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✓ Perfil atual encontrado" -ForegroundColor Green
    Write-Host "   Username: $($content.username)" -ForegroundColor Gray
    Write-Host "   Email: $($content.email)" -ForegroundColor Gray
    Write-Host "   Nome: $($content.name)" -ForegroundColor Gray
    
    # Testar com o username do usuário atual
    if ($content.username) {
        Write-Host "`nTestando perfil por username: $($content.username)" -ForegroundColor Cyan
        try {
            $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/profile/$($content.username)" -Method GET -TimeoutSec 10
            Write-Host "✓ Perfil encontrado via username" -ForegroundColor Green
        } catch {
            Write-Host "✗ Perfil não encontrado via username" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ Usuário não tem username definido" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Erro ao buscar perfil atual" -ForegroundColor Red
    Write-Host "   Usuário provavelmente não está logado" -ForegroundColor Yellow
}

Write-Host "`n=== SOLUÇÕES ===" -ForegroundColor Yellow
Write-Host "1. Acesse http://localhost:3000/debug-profile para debug completo" -ForegroundColor White
Write-Host "2. Verifique se está logado em http://localhost:3000/auth/signin" -ForegroundColor White
Write-Host "3. Acesse http://localhost:3000/profile para ver seu perfil" -ForegroundColor White 