-- Script para testar a criação de posts diretamente no banco
-- Este script vai verificar se a estrutura está correta e criar posts de teste

-- 1. Verificar se há usuários no sistema
SELECT COUNT(*) as total_users FROM users;

-- 2. Verificar estrutura da tabela posts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- 3. Verificar se há posts existentes
SELECT COUNT(*) as total_posts FROM posts;

-- 4. Criar posts de teste se não houver nenhum
DO $$
DECLARE
    user_id UUID;
    post_count INTEGER;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO user_id FROM users LIMIT 1;
    
    -- Verificar se há posts
    SELECT COUNT(*) INTO post_count FROM posts;
    
    -- Se não há posts, criar alguns de teste
    IF post_count = 0 AND user_id IS NOT NULL THEN
        INSERT INTO posts (user_id, content, visibility, created_at) VALUES
        (user_id, 'Olá! Este é meu primeiro post no OpenLove! 🎉', 'public', NOW() - INTERVAL '2 hours'),
        (user_id, 'Estou muito feliz de fazer parte desta comunidade! ❤️', 'public', NOW() - INTERVAL '1 hour'),
        (user_id, 'Quem mais está animado para conhecer novas pessoas? 😊', 'public', NOW() - INTERVAL '30 minutes');
        
        RAISE NOTICE 'Posts de teste criados com sucesso!';
    ELSE
        RAISE NOTICE 'Posts já existem ou não há usuários disponíveis';
    END IF;
END $$;

-- 5. Verificar posts criados
SELECT 
    p.id,
    p.content,
    p.visibility,
    p.created_at,
    u.username,
    u.full_name
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Testar inserção de post com mídia
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO user_id FROM users LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        INSERT INTO posts (user_id, content, media_urls, media_types, visibility, created_at) VALUES
        (user_id, 'Post com imagem de teste! 📸', ARRAY['https://example.com/image.jpg'], ARRAY['image'], 'public', NOW());
        
        RAISE NOTICE 'Post com mídia criado com sucesso!';
    END IF;
END $$;

-- 7. Verificar estrutura final
SELECT 
    'Tabela posts' as tabela,
    COUNT(*) as total_posts,
    COUNT(DISTINCT user_id) as usuarios_com_posts
FROM posts;

SELECT 'Teste de posts concluído!' as status; 