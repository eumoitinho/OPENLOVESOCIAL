-- Script para criar posts de teste
-- Data: 2025-01-XX
-- Versão: 1.0

-- =====================================================
-- 1. VERIFICAR SE EXISTEM USUÁRIOS
-- =====================================================

-- Verificar quantos usuários existem
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as users_with_username,
    COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as users_with_name
FROM users;

-- =====================================================
-- 2. CRIAR POSTS DE TESTE
-- =====================================================

-- Post 1: Usuário 1
INSERT INTO posts (
    user_id,
    content,
    visibility,
    media_urls,
    media_types,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Olá! Este é meu primeiro post no OpenLove! 🎉 Estou muito animado para compartilhar experiências com vocês.',
    'public',
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
);

-- Post 2: Usuário 2 (se existir)
INSERT INTO posts (
    user_id,
    content,
    visibility,
    media_urls,
    media_types,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users OFFSET 1 LIMIT 1),
    'Que dia lindo para fazer novos amigos! 🌞 Quem mais está aproveitando o OpenLove hoje?',
    'public',
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
);

-- Post 3: Usuário 3 (se existir)
INSERT INTO posts (
    user_id,
    content,
    visibility,
    media_urls,
    media_types,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users OFFSET 2 LIMIT 1),
    'Acabei de descobrir essa plataforma incrível! 💕 O que vocês acham do OpenLove?',
    'public',
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
);

-- Post 4: Usuário 1 novamente
INSERT INTO posts (
    user_id,
    content,
    visibility,
    media_urls,
    media_types,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Compartilhando um momento especial! ✨ A vida é feita de pequenos momentos como este.',
    'public',
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
);

-- Post 5: Usuário 2 novamente
INSERT INTO posts (
    user_id,
    content,
    visibility,
    media_urls,
    media_types,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users OFFSET 1 LIMIT 1),
    'Quem mais está aqui para fazer conexões genuínas? 🤝 O OpenLove é perfeito para isso!',
    'public',
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
);

-- =====================================================
-- 3. CRIAR POSTS COM DIFERENTES TIPOS DE CONTEÚDO
-- =====================================================

-- Post com hashtags
INSERT INTO posts (
    user_id,
    content,
    visibility,
    hashtags,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Amo viajar! ✈️ #viagem #aventura #vida #openlove',
    'public',
    ARRAY['viagem', 'aventura', 'vida', 'openlove'],
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
);

-- Post com menções
INSERT INTO posts (
    user_id,
    content,
    visibility,
    mentions,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users OFFSET 1 LIMIT 1),
    'Oi @amigo! Vamos fazer uma conexão incrível! 👋',
    'public',
    ARRAY['amigo'],
    NOW() - INTERVAL '3 minutes',
    NOW() - INTERVAL '3 minutes'
);

-- Post privado (não deve aparecer na timeline pública)
INSERT INTO posts (
    user_id,
    content,
    visibility,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Este é um post privado que não deve aparecer na timeline pública.',
    'private',
    NOW() - INTERVAL '1 minute',
    NOW() - INTERVAL '1 minute'
);

-- =====================================================
-- 4. VERIFICAR POSTS CRIADOS
-- =====================================================

-- Contar posts por visibilidade
SELECT 
    visibility,
    COUNT(*) as total,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM posts 
GROUP BY visibility;

-- Verificar posts com usuários
SELECT 
    u.username,
    u.name,
    COUNT(p.id) as posts_count,
    MAX(p.created_at) as last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE p.id IS NOT NULL
GROUP BY u.id, u.username, u.name
ORDER BY posts_count DESC;

-- Verificar posts públicos (que devem aparecer na timeline)
SELECT 
    p.id,
    p.content,
    p.visibility,
    p.created_at,
    u.username,
    u.name
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.visibility = 'public'
ORDER BY p.created_at DESC;

-- =====================================================
-- 5. CRIAR ALGUNS LIKES E COMENTÁRIOS DE TESTE
-- =====================================================

-- Inserir alguns likes
INSERT INTO likes (target_id, target_type, user_id, created_at)
SELECT 
    p.id,
    'post',
    u.id,
    NOW() - INTERVAL '1 hour'
FROM posts p
CROSS JOIN users u
WHERE p.visibility = 'public'
LIMIT 5;

-- Inserir alguns comentários
INSERT INTO comments (post_id, user_id, content, created_at)
SELECT 
    p.id,
    u.id,
    'Que post incrível! 👍',
    NOW() - INTERVAL '30 minutes'
FROM posts p
CROSS JOIN users u
WHERE p.visibility = 'public'
LIMIT 3;

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Resumo final
SELECT 
    'POSTS' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN visibility = 'public' THEN 1 END) as publicos,
    COUNT(CASE WHEN visibility = 'private' THEN 1 END) as privados
FROM posts
UNION ALL
SELECT 
    'LIKES' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN target_type = 'post' THEN 1 END) as em_posts,
    0 as privados
FROM likes
UNION ALL
SELECT 
    'COMMENTS' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN post_id IS NOT NULL THEN 1 END) as em_posts,
    0 as privados
FROM comments;

Write-Host "✅ Posts de teste criados com sucesso!" -ForegroundColor Green 