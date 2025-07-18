#!/usr/bin/env pwsh

Write-Host "=== Comandos Stripe para PowerShell ===" -ForegroundColor Yellow

Write-Host "`n1. Primeiro, verifique se o Stripe CLI está instalado:" -ForegroundColor Cyan
Write-Host "stripe --version" -ForegroundColor White

Write-Host "`n2. Faça login no Stripe:" -ForegroundColor Cyan
Write-Host "stripe login" -ForegroundColor White

Write-Host "`n3. Criar Produto Open Ouro:" -ForegroundColor Cyan
Write-Host 'stripe products create --name "Open Ouro" --description "Mais recursos para quem quer se destacar e interagir mais" --metadata plan_type=gold --metadata max_images=5 --metadata max_video_size=25MB --metadata max_videos_monthly=10 --metadata max_communities=3 --metadata max_events_monthly=2' -ForegroundColor White

Write-Host "`n4. Criar Produto Open Diamante:" -ForegroundColor Cyan
Write-Host 'stripe products create --name "Open Diamante" --description "Para quem quer o máximo de liberdade, alcance e recursos" --metadata plan_type=diamante --metadata max_images=unlimited --metadata max_video_size=50MB --metadata max_videos_monthly=unlimited --metadata max_communities=5 --metadata max_events_monthly=10' -ForegroundColor White

Write-Host "`n5. Após obter os Product IDs, criar preços:" -ForegroundColor Cyan
Write-Host "# Substitua GOLD_PRODUCT_ID e DIAMOND_PRODUCT_ID pelos IDs retornados" -ForegroundColor Yellow

Write-Host "`n   Open Ouro Mensal (R$ 25,00):" -ForegroundColor White
Write-Host 'stripe prices create --product GOLD_PRODUCT_ID --currency brl --unit-amount 2500 --recurring-interval month --nickname "Open Ouro Mensal"' -ForegroundColor White

Write-Host "`n   Open Diamante Mensal (R$ 45,90):" -ForegroundColor White
Write-Host 'stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 4590 --recurring-interval month --nickname "Open Diamante Mensal"' -ForegroundColor White

Write-Host "`n   Open Diamante Anual (R$ 459,00):" -ForegroundColor White
Write-Host 'stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 45900 --recurring-interval year --nickname "Open Diamante Anual"' -ForegroundColor White

Write-Host "`n=== Comandos Prontos para Copiar ===" -ForegroundColor Green

Write-Host "`n# Produto Open Ouro" -ForegroundColor Yellow
$goldCommand = 'stripe products create --name "Open Ouro" --description "Mais recursos para quem quer se destacar e interagir mais" --metadata plan_type=gold --metadata max_images=5 --metadata max_video_size=25MB --metadata max_videos_monthly=10 --metadata max_communities=3 --metadata max_events_monthly=2'
Write-Host $goldCommand -ForegroundColor White

Write-Host "`n# Produto Open Diamante" -ForegroundColor Yellow
$diamondCommand = 'stripe products create --name "Open Diamante" --description "Para quem quer o máximo de liberdade, alcance e recursos" --metadata plan_type=diamante --metadata max_images=unlimited --metadata max_video_size=50MB --metadata max_videos_monthly=unlimited --metadata max_communities=5 --metadata max_events_monthly=10'
Write-Host $diamondCommand -ForegroundColor White

Write-Host "`n# Preços (substitua os Product IDs)" -ForegroundColor Yellow
Write-Host 'stripe prices create --product GOLD_PRODUCT_ID --currency brl --unit-amount 2500 --recurring-interval month --nickname "Open Ouro Mensal"' -ForegroundColor White
Write-Host 'stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 4590 --recurring-interval month --nickname "Open Diamante Mensal"' -ForegroundColor White
Write-Host 'stripe prices create --product DIAMOND_PRODUCT_ID --currency brl --unit-amount 45900 --recurring-interval year --nickname "Open Diamante Anual"' -ForegroundColor White

Write-Host "`n=== Executar Comandos Automaticamente ===" -ForegroundColor Green
Write-Host "Deseja executar os comandos automaticamente? (y/n)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`nExecutando comandos..." -ForegroundColor Yellow
    
    # Verificar se Stripe CLI está disponível
    try {
        $stripeVersion = & stripe --version
        Write-Host "✓ Stripe CLI encontrado: $stripeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Stripe CLI não encontrado. Instale primeiro:" -ForegroundColor Red
        Write-Host "choco install stripe-cli" -ForegroundColor Yellow
        exit 1
    }
    
    # Executar comando para criar produto Open Ouro
    Write-Host "`nCriando produto Open Ouro..." -ForegroundColor Cyan
    try {
        $goldResult = & stripe products create --name "Open Ouro" --description "Mais recursos para quem quer se destacar e interagir mais" --metadata plan_type=gold --metadata max_images=5 --metadata max_video_size=25MB --metadata max_videos_monthly=10 --metadata max_communities=3 --metadata max_events_monthly=2
        $goldProduct = $goldResult | ConvertFrom-Json
        Write-Host "✓ Produto Open Ouro criado: $($goldProduct.id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao criar produto Open Ouro: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    # Executar comando para criar produto Open Diamante
    Write-Host "`nCriando produto Open Diamante..." -ForegroundColor Cyan
    try {
        $diamondResult = & stripe products create --name "Open Diamante" --description "Para quem quer o máximo de liberdade, alcance e recursos" --metadata plan_type=diamante --metadata max_images=unlimited --metadata max_video_size=50MB --metadata max_videos_monthly=unlimited --metadata max_communities=5 --metadata max_events_monthly=10
        $diamondProduct = $diamondResult | ConvertFrom-Json
        Write-Host "✓ Produto Open Diamante criado: $($diamondProduct.id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao criar produto Open Diamante: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    # Criar preços
    Write-Host "`nCriando preços..." -ForegroundColor Cyan
    
    # Preço Open Ouro Mensal
    try {
        $goldPriceResult = & stripe prices create --product $goldProduct.id --currency brl --unit-amount 2500 --recurring-interval month --nickname "Open Ouro Mensal"
        $goldPrice = $goldPriceResult | ConvertFrom-Json
        Write-Host "✓ Preço Open Ouro Mensal criado: $($goldPrice.id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao criar preço Open Ouro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Preço Open Diamante Mensal
    try {
        $diamondMonthlyResult = & stripe prices create --product $diamondProduct.id --currency brl --unit-amount 4590 --recurring-interval month --nickname "Open Diamante Mensal"
        $diamondMonthly = $diamondMonthlyResult | ConvertFrom-Json
        Write-Host "✓ Preço Open Diamante Mensal criado: $($diamondMonthly.id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao criar preço Open Diamante Mensal: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Preço Open Diamante Anual
    try {
        $diamondYearlyResult = & stripe prices create --product $diamondProduct.id --currency brl --unit-amount 45900 --recurring-interval year --nickname "Open Diamante Anual"
        $diamondYearly = $diamondYearlyResult | ConvertFrom-Json
        Write-Host "✓ Preço Open Diamante Anual criado: $($diamondYearly.id)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao criar preço Open Diamante Anual: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n=== Resumo dos IDs Criados ===" -ForegroundColor Yellow
    Write-Host "STRIPE_PRODUCT_GOLD=$($goldProduct.id)" -ForegroundColor White
    Write-Host "STRIPE_PRODUCT_DIAMOND=$($diamondProduct.id)" -ForegroundColor White
    Write-Host "STRIPE_PRICE_GOLD_MONTHLY=$($goldPrice.id)" -ForegroundColor White
    Write-Host "STRIPE_PRICE_DIAMOND_MONTHLY=$($diamondMonthly.id)" -ForegroundColor White
    Write-Host "STRIPE_PRICE_DIAMOND_YEARLY=$($diamondYearly.id)" -ForegroundColor White
    
    Write-Host "`nAdicione estas variáveis ao seu .env.local" -ForegroundColor Green
} 