Write-Host "Testando API de perfil..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/profile" -Method GET -TimeoutSec 10
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Perfil encontrado:" -ForegroundColor Green
    Write-Host "Username: $($content.username)"
    Write-Host "Email: $($content.email)"
    Write-Host "Nome: $($content.name)"
} catch {
    Write-Host "Erro ao buscar perfil:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nPara debug completo, acesse: http://localhost:3000/debug-profile" -ForegroundColor Yellow 