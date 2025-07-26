#!/usr/bin/env pwsh

# Script para debugar problema de perfil não encontrado

Write-Host "=== DEBUG: Problema de Perfil Não Encontrado ===" -ForegroundColor Yellow

# Verificar se o servidor está rodando
Write-Host "`n1. Verificando se o servidor está rodando..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✓ Servidor está rodando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Servidor não está rodando ou não responde" -ForegroundColor Red
    Write-Host "Execute: pnpm dev" -ForegroundColor Yellow
    exit 1
}

# Testar API de perfil com diferentes usernames
Write-Host "`n2. Testando API de perfil..." -ForegroundColor Cyan

$testUsernames = @("admin", "test", "user", "exemplo", "demo")

foreach ($username in $testUsernames) {
    Write-Host "   Testando username: $username" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/profile/$username" -Method GET -TimeoutSec 10
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ $username encontrado: $($content.profile.full_name)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   ✗ $username não encontrado (Status: $statusCode)" -ForegroundColor Red
    }
}

# Testar API de perfil atual (sem username)
Write-Host "`n3. Testando API de perfil atual..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/profile" -Method GET -TimeoutSec 10
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✓ Perfil atual encontrado: $($content.username)" -ForegroundColor Green
    Write-Host "   ID: $($content.id)" -ForegroundColor Gray
    Write-Host "   Email: $($content.email)" -ForegroundColor Gray
    Write-Host "   Nome: $($content.full_name)" -ForegroundColor Gray
    
    # Testar com o username do usuário atual
    if ($content.username) {
        Write-Host "`n4. Testando com username do usuário atual: $($content.username)" -ForegroundColor Cyan
        try {
            $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/profile/$($content.username)" -Method GET -TimeoutSec 10
            $content2 = $response2.Content | ConvertFrom-Json
            Write-Host "✓ Perfil encontrado via username: $($content2.profile.full_name)" -ForegroundColor Green
        } catch {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "✗ Perfil não encontrado via username (Status: $statusCode)" -ForegroundColor Red
            
            # Mostrar detalhes do erro
            if ($_.Exception.Response) {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Host "   Erro: $errorContent" -ForegroundColor Red
            }
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode
    Write-Host "✗ Erro ao buscar perfil atual (Status: $statusCode)" -ForegroundColor Red
    Write-Host "   Usuário provavelmente não está logado" -ForegroundColor Yellow
}

# Verificar logs do servidor
Write-Host "`n5. Verificando logs recentes..." -ForegroundColor Cyan
Write-Host "   Abra o terminal onde o servidor está rodando e verifique os logs" -ForegroundColor Gray
Write-Host "   Procure por mensagens de erro relacionadas a 'profile' ou 'username'" -ForegroundColor Gray

Write-Host "`n=== POSSÍVEIS SOLUÇÕES ===" -ForegroundColor Yellow
Write-Host "1. Verificar se o usuário tem um username válido na tabela users" -ForegroundColor White
Write-Host "2. Verificar se a API está buscando na tabela correta (users vs profiles)" -ForegroundColor White
Write-Host "3. Verificar se o username não está null ou vazio" -ForegroundColor White
Write-Host "4. Verificar se há erro de case-sensitivity no username" -ForegroundColor White
Write-Host "5. Verificar se o usuário está logado corretamente" -ForegroundColor White

Write-Host "`n=== PRÓXIMOS PASSOS ===" -ForegroundColor Yellow
Write-Host "1. Execute este script: .\test-profile-debug.ps1" -ForegroundColor White
Write-Host "2. Verifique os logs do servidor Next.js" -ForegroundColor White
Write-Host "3. Acesse http://localhost:3000/api/profile para ver seus dados" -ForegroundColor White
Write-Host "4. Acesse http://localhost:3000/api/profile/SEU_USERNAME" -ForegroundColor White 