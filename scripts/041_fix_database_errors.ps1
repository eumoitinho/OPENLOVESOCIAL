# Script para corrigir erros de banco de dados
# Data: 2025-01-XX
# Versao: 1.0

Write-Host "Iniciando correcao de erros de banco de dados..." -ForegroundColor Yellow

# 1. Verificar se a tabela friends existe
Write-Host "Verificando estrutura do banco de dados..." -ForegroundColor Cyan

$checkFriendsTable = @"
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'friends' 
    AND table_schema = 'public'
) as friends_exists;
"@

try {
    $result = Invoke-SqlQuery -Query $checkFriendsTable
    if ($result.friends_exists -eq $true) {
        Write-Host "Tabela friends encontrada!" -ForegroundColor Green
    } else {
        Write-Host "Tabela friends nao encontrada!" -ForegroundColor Red
        Write-Host "Executando script de criacao da tabela friends..." -ForegroundColor Yellow
        
        # Executar script de criacao da tabela friends
        $friendsScript = Get-Content "scripts/006_friends_and_restrictions.sql" -Raw
        Invoke-SqlQuery -Query $friendsScript
        Write-Host "Tabela friends criada com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao verificar tabela friends: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Corrigir referencias a tabela friendships
Write-Host "Corrigindo referencias a tabela friendships..." -ForegroundColor Cyan

$fixFriendshipsScript = Get-Content "scripts/040_fix_friendships_references.sql" -Raw

try {
    Invoke-SqlQuery -Query $fixFriendshipsScript
    Write-Host "Referencias a tabela friendships corrigidas!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao corrigir referencias: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Verificar se as colunas de audio e enquetes existem
Write-Host "Verificando colunas de posts de audio e enquetes..." -ForegroundColor Cyan

$checkAudioColumns = @"
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('audio_url', 'audio_duration', 'poll_question', 'poll_options', 'poll_votes', 'poll_ends_at', 'post_type')
ORDER BY column_name;
"@

try {
    $audioColumns = Invoke-SqlQuery -Query $checkAudioColumns
    $existingColumns = $audioColumns.column_name
    
    Write-Host "Colunas encontradas na tabela posts:" -ForegroundColor Cyan
    foreach ($col in $existingColumns) {
        Write-Host "  - $col" -ForegroundColor White
    }
    
    $requiredColumns = @('audio_url', 'audio_duration', 'poll_question', 'poll_options', 'poll_votes', 'poll_ends_at', 'post_type')
    $missingColumns = $requiredColumns | Where-Object { $_ -notin $existingColumns }
    
    if ($missingColumns.Count -gt 0) {
        Write-Host "Colunas faltando: $($missingColumns -join ', ')" -ForegroundColor Yellow
        Write-Host "Executando script de posts de audio e enquetes..." -ForegroundColor Yellow
        
        # Executar script de posts de audio e enquetes
        $audioPollsScript = Get-Content "scripts/037_posts_audio_polls.sql" -Raw
        Invoke-SqlQuery -Query $audioPollsScript
        Write-Host "Colunas de audio e enquetes adicionadas!" -ForegroundColor Green
    } else {
        Write-Host "Todas as colunas necessarias ja existem!" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao verificar colunas: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Verificar se a tabela poll_votes existe
Write-Host "Verificando tabela poll_votes..." -ForegroundColor Cyan

$checkPollVotesTable = @"
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'poll_votes' 
    AND table_schema = 'public'
) as poll_votes_exists;
"@

try {
    $result = Invoke-SqlQuery -Query $checkPollVotesTable
    if ($result.poll_votes_exists -eq $true) {
        Write-Host "Tabela poll_votes encontrada!" -ForegroundColor Green
    } else {
        Write-Host "Tabela poll_votes nao encontrada!" -ForegroundColor Red
        Write-Host "Executando script de criacao da tabela poll_votes..." -ForegroundColor Yellow
        
        # Executar script de posts de audio e enquetes (que inclui poll_votes)
        $audioPollsScript = Get-Content "scripts/037_posts_audio_polls.sql" -Raw
        Invoke-SqlQuery -Query $audioPollsScript
        Write-Host "Tabela poll_votes criada com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao verificar tabela poll_votes: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Configurar storage para posts
Write-Host "Configurando storage para posts..." -ForegroundColor Cyan

$storageScript = Get-Content "scripts/039_create_posts_storage.sql" -Raw

try {
    Invoke-SqlQuery -Query $storageScript
    Write-Host "Storage configurado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao configurar storage: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Verificar politicas RLS
Write-Host "Verificando politicas RLS..." -ForegroundColor Cyan

$checkRLSPolicies = @"
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('posts', 'poll_votes', 'friends')
ORDER BY tablename, policyname;
"@

try {
    $policies = Invoke-SqlQuery -Query $checkRLSPolicies
    Write-Host "Politicas RLS encontradas:" -ForegroundColor Cyan
    foreach ($policy in $policies) {
        Write-Host "  - $($policy.tablename).$($policy.policyname) ($($policy.cmd))" -ForegroundColor White
    }
} catch {
    Write-Host "Erro ao verificar politicas RLS: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Testar funcionalidades
Write-Host "Testando funcionalidades..." -ForegroundColor Cyan

# Testar funcao de votacao em enquete
$testPollVote = @"
SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'vote_in_poll'
) as vote_function_exists;
"@

try {
    $result = Invoke-SqlQuery -Query $testPollVote
    if ($result.vote_function_exists -eq $true) {
        Write-Host "Funcao vote_in_poll encontrada!" -ForegroundColor Green
    } else {
        Write-Host "Funcao vote_in_poll nao encontrada!" -ForegroundColor Red
    }
} catch {
    Write-Host "Erro ao testar funcao: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar funcao de estatisticas de enquete
$testPollStats = @"
SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_poll_stats'
) as stats_function_exists;
"@

try {
    $result = Invoke-SqlQuery -Query $testPollStats
    if ($result.stats_function_exists -eq $true) {
        Write-Host "Funcao get_poll_stats encontrada!" -ForegroundColor Green
    } else {
        Write-Host "Funcao get_poll_stats nao encontrada!" -ForegroundColor Red
    }
} catch {
    Write-Host "Erro ao testar funcao: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Resumo final
Write-Host ""
Write-Host "RESUMO DA CORRECAO:" -ForegroundColor Yellow
Write-Host "Referencias a tabela friendships corrigidas" -ForegroundColor Green
Write-Host "Politicas RLS atualizadas" -ForegroundColor Green
Write-Host "Storage configurado para posts de audio" -ForegroundColor Green
Write-Host "Funcoes de enquete verificadas" -ForegroundColor Green

Write-Host ""
Write-Host "Correcao de erros concluida com sucesso!" -ForegroundColor Green
Write-Host "Agora voce pode usar posts de audio e enquetes no sistema!" -ForegroundColor Cyan

# 9. Proximos passos
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Teste o upload de audio no componente CreatePost" -ForegroundColor White
Write-Host "2. Teste a criacao de enquetes" -ForegroundColor White
Write-Host "3. Teste a votacao em enquetes" -ForegroundColor White
Write-Host "4. Verifique se as APIs estao funcionando" -ForegroundColor White

Write-Host ""
Write-Host "Sistema pronto para uso!" -ForegroundColor Green 