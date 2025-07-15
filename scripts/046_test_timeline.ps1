# Script para testar a timeline e verificar posts
# Data: 2025-01-XX
# Versao: 1.0

Write-Host "🔍 Testando Timeline e Posts..." -ForegroundColor Yellow

# 1. Verificar se há posts no banco de dados
Write-Host "📊 Verificando posts no banco de dados..." -ForegroundColor Cyan

$checkPostsQuery = @"
SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_posts,
    COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_posts,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as posts_with_users,
    MIN(created_at) as oldest_post,
    MAX(created_at) as newest_post
FROM posts;
"@

try {
    $result = Invoke-SqlQuery -Query $checkPostsQuery
    Write-Host "✅ Posts encontrados:" -ForegroundColor Green
    Write-Host "   Total: $($result.total_posts)" -ForegroundColor White
    Write-Host "   Públicos: $($result.public_posts)" -ForegroundColor White
    Write-Host "   Privados: $($result.private_posts)" -ForegroundColor White
    Write-Host "   Com usuários: $($result.posts_with_users)" -ForegroundColor White
    Write-Host "   Post mais antigo: $($result.oldest_post)" -ForegroundColor White
    Write-Host "   Post mais recente: $($result.newest_post)" -ForegroundColor White
} catch {
    Write-Host "❌ Erro ao verificar posts: $_" -ForegroundColor Red
}

# 2. Verificar usuários que criaram posts
Write-Host "👥 Verificando usuários que criaram posts..." -ForegroundColor Cyan

$checkUsersQuery = @"
SELECT 
    u.id,
    u.username,
    u.name,
    COUNT(p.id) as posts_count,
    MAX(p.created_at) as last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE p.id IS NOT NULL
GROUP BY u.id, u.username, u.name
ORDER BY posts_count DESC
LIMIT 10;
"@

try {
    $users = Invoke-SqlQuery -Query $checkUsersQuery
    Write-Host "✅ Top 10 usuários com mais posts:" -ForegroundColor Green
    foreach ($user in $users) {
        Write-Host "   $($user.username) ($($user.name)): $($user.posts_count) posts" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao verificar usuários: $_" -ForegroundColor Red
}

# 3. Testar API de timeline
Write-Host "🌐 Testando API de timeline..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/timeline" -Method GET
    Write-Host "✅ API de timeline funcionando!" -ForegroundColor Green
    Write-Host "   Posts retornados: $($response.data.Count)" -ForegroundColor White
    Write-Host "   Tem mais posts: $($response.hasMore)" -ForegroundColor White
    Write-Host "   Página: $($response.page)" -ForegroundColor White
    Write-Host "   Limite: $($response.limit)" -ForegroundColor White
    
    if ($response.debug) {
        Write-Host "📊 Debug info:" -ForegroundColor Cyan
        Write-Host "   Posts encontrados: $($response.debug.postsFound)" -ForegroundColor White
        Write-Host "   Autores encontrados: $($response.debug.authorsFound)" -ForegroundColor White
        Write-Host "   Likes encontrados: $($response.debug.likesFound)" -ForegroundColor White
        Write-Host "   Comentários encontrados: $($response.debug.commentsFound)" -ForegroundColor White
        Write-Host "   Usuário autenticado: $($response.debug.userAuthenticated)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao testar API de timeline: $_" -ForegroundColor Red
}

# 4. Verificar estrutura da tabela posts
Write-Host "📋 Verificando estrutura da tabela posts..." -ForegroundColor Cyan

$checkStructureQuery = @"
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
"@

try {
    $structure = Invoke-SqlQuery -Query $checkStructureQuery
    Write-Host "✅ Estrutura da tabela posts:" -ForegroundColor Green
    foreach ($column in $structure) {
        Write-Host "   $($column.column_name): $($column.data_type) $($column.is_nullable)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao verificar estrutura: $_" -ForegroundColor Red
}

# 5. Verificar políticas RLS
Write-Host "🔐 Verificando políticas RLS..." -ForegroundColor Cyan

$checkRLSQuery = @"
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts';
"@

try {
    $policies = Invoke-SqlQuery -Query $checkRLSQuery
    Write-Host "✅ Políticas RLS para posts:" -ForegroundColor Green
    foreach ($policy in $policies) {
        Write-Host "   $($policy.policyname): $($policy.cmd)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao verificar políticas RLS: $_" -ForegroundColor Red
}

Write-Host "✅ Teste concluído!" -ForegroundColor Green 