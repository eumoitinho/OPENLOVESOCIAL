#!/usr/bin/env pwsh

Write-Host "=== Criando Produtos e Preços no Stripe ===" -ForegroundColor Yellow

# Verificar se o Stripe CLI está instalado
try {
    $stripeVersion = stripe --version
    Write-Host "✓ Stripe CLI encontrado: $stripeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Stripe CLI não encontrado. Instale em: https://stripe.com/docs/stripe-cli" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Criando Produto: Open Ouro ===" -ForegroundColor Cyan

# Criar produto Open Ouro
$goldProductCmd = @(
    "stripe", "products", "create",
    "--name", "Open Ouro",
    "--description", "Mais recursos para quem quer se destacar e interagir mais",
    "--metadata", "plan_type=gold",
    "--metadata", "max_images=5",
    "--metadata", "max_video_size=25MB",
    "--metadata", "max_videos_monthly=10",
    "--metadata", "max_communities=3",
    "--metadata", "max_events_monthly=2",
    "--metadata", "features=unlimited_messages,audio_posts,polls,private_communities"
)

try {
    $goldProduct = & $goldProductCmd[0] $goldProductCmd[1..($goldProductCmd.Length-1)]
    $goldProductJson = $goldProduct | ConvertFrom-Json
    $goldProductId = $goldProductJson.id
    Write-Host "✓ Produto Open Ouro criado: $goldProductId" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao criar produto Open Ouro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Criando Produto: Open Diamante ===" -ForegroundColor Cyan

# Criar produto Open Diamante
$diamondProductCmd = @(
    "stripe", "products", "create",
    "--name", "Open Diamante",
    "--description", "Para quem quer o máximo de liberdade, alcance e recursos",
    "--metadata", "plan_type=diamante",
    "--metadata", "max_images=unlimited",
    "--metadata", "max_video_size=50MB",
    "--metadata", "max_videos_monthly=unlimited",
    "--metadata", "max_communities=5",
    "--metadata", "max_events_monthly=10",
    "--metadata", "features=all_gold_features,voice_video_calls,advanced_analytics,unlimited_communities"
)

try {
    $diamondProduct = & $diamondProductCmd[0] $diamondProductCmd[1..($diamondProductCmd.Length-1)]
    $diamondProductJson = $diamondProduct | ConvertFrom-Json
    $diamondProductId = $diamondProductJson.id
    Write-Host "✓ Produto Open Diamante criado: $diamondProductId" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao criar produto Open Diamante: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Criando Preços ===" -ForegroundColor Cyan

# Criar preço Open Ouro Mensal (R$ 25,00)
Write-Host "Criando preço Open Ouro Mensal..." -ForegroundColor White
$goldPriceCmd = @(
    "stripe", "prices", "create",
    "--product", $goldProductId,
    "--currency", "brl",
    "--unit-amount", "2500",
    "--recurring-interval", "month",
    "--nickname", "Open Ouro Mensal"
)

try {
    $goldPrice = & $goldPriceCmd[0] $goldPriceCmd[1..($goldPriceCmd.Length-1)]
    $goldPriceJson = $goldPrice | ConvertFrom-Json
    Write-Host "✓ Preço Open Ouro Mensal criado: $($goldPriceJson.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao criar preço Open Ouro: $($_.Exception.Message)" -ForegroundColor Red
}

# Criar preço Open Diamante Mensal (R$ 45,90)
Write-Host "Criando preço Open Diamante Mensal..." -ForegroundColor White
$diamondMonthlyPriceCmd = @(
    "stripe", "prices", "create",
    "--product", $diamondProductId,
    "--currency", "brl",
    "--unit-amount", "4590",
    "--recurring-interval", "month",
    "--nickname", "Open Diamante Mensal"
)

try {
    $diamondMonthlyPrice = & $diamondMonthlyPriceCmd[0] $diamondMonthlyPriceCmd[1..($diamondMonthlyPriceCmd.Length-1)]
    $diamondMonthlyPriceJson = $diamondMonthlyPrice | ConvertFrom-Json
    Write-Host "✓ Preço Open Diamante Mensal criado: $($diamondMonthlyPriceJson.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao criar preço Open Diamante Mensal: $($_.Exception.Message)" -ForegroundColor Red
}

# Criar preço Open Diamante Anual (R$ 459,00 - 2 meses grátis)
Write-Host "Criando preço Open Diamante Anual..." -ForegroundColor White
$diamondYearlyPriceCmd = @(
    "stripe", "prices", "create",
    "--product", $diamondProductId,
    "--currency", "brl",
    "--unit-amount", "45900",
    "--recurring-interval", "year",
    "--nickname", "Open Diamante Anual"
)

try {
    $diamondYearlyPrice = & $diamondYearlyPriceCmd[0] $diamondYearlyPriceCmd[1..($diamondYearlyPriceCmd.Length-1)]
    $diamondYearlyPriceJson = $diamondYearlyPrice | ConvertFrom-Json
    Write-Host "✓ Preço Open Diamante Anual criado: $($diamondYearlyPriceJson.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao criar preço Open Diamante Anual: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Resumo dos IDs Criados ===" -ForegroundColor Yellow
Write-Host "Produto Open Ouro: $goldProductId" -ForegroundColor White
Write-Host "Produto Open Diamante: $diamondProductId" -ForegroundColor White
Write-Host "Preço Open Ouro Mensal: $($goldPriceJson.id)" -ForegroundColor White
Write-Host "Preço Open Diamante Mensal: $($diamondMonthlyPriceJson.id)" -ForegroundColor White
Write-Host "Preço Open Diamante Anual: $($diamondYearlyPriceJson.id)" -ForegroundColor White

Write-Host "`n=== Próximos Passos ===" -ForegroundColor Green
Write-Host "1. Copie os IDs acima para suas variáveis de ambiente" -ForegroundColor White
Write-Host "2. Atualize o arquivo .env.local com os IDs dos preços" -ForegroundColor White
Write-Host "3. Configure os webhooks do Stripe para processar pagamentos" -ForegroundColor White

Write-Host "`n=== Comandos para .env.local ===" -ForegroundColor Cyan
Write-Host "STRIPE_PRICE_GOLD_MONTHLY=$($goldPriceJson.id)" -ForegroundColor Yellow
Write-Host "STRIPE_PRICE_DIAMOND_MONTHLY=$($diamondMonthlyPriceJson.id)" -ForegroundColor Yellow
Write-Host "STRIPE_PRICE_DIAMOND_YEARLY=$($diamondYearlyPriceJson.id)" -ForegroundColor Yellow
Write-Host "STRIPE_PRODUCT_GOLD=$goldProductId" -ForegroundColor Yellow
Write-Host "STRIPE_PRODUCT_DIAMOND=$diamondProductId" -ForegroundColor Yellow 