-- =====================================================
-- TESTE DO SISTEMA DE CURTIDAS
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
SELECT 
    'Verificando tabelas:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('likes', 'posts', 'users', 'notifications');

-- 2. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
SELECT 
    'Verificando funções:' as info,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_name IN (
    'toggle_post_like',
    'get_post_likes_count',
    'has_user_liked_post',
    'get_post_likes',
    'update_post_stats',
    'test_like_system',
    'trigger_notify_like'
);

-- 3. VERIFICAR SE OS TRIGGERS FORAM CRIADOS
SELECT 
    'Verificando triggers:' as info,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_name IN (
    'update_post_likes_stats',
    'trigger_notify_like'
);

-- 4. VERIFICAR ESTRUTURA DA TABELA LIKES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'likes'
ORDER BY ordinal_position;

-- 5. VERIFICAR ÍNDICES DA TABELA LIKES
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'likes';

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'likes';

-- 7. TESTAR FUNÇÃO DE CONTAGEM (se houver posts)
DO $$
DECLARE
    post_count INTEGER;
    test_post_id UUID;
BEGIN
    -- Verificar se existem posts
    SELECT COUNT(*) INTO post_count FROM posts;
    
    IF post_count > 0 THEN
        -- Pegar o primeiro post para teste
        SELECT id INTO test_post_id FROM posts LIMIT 1;
        
        RAISE NOTICE 'Testando sistema com post: %', test_post_id;
        RAISE NOTICE 'Contagem de likes: %', get_post_likes_count(test_post_id);
    ELSE
        RAISE NOTICE 'Nenhum post encontrado para teste';
    END IF;
END $$;

-- 8. MOSTRAR ESTATÍSTICAS ATUAIS
SELECT 
    'Posts totais:' as info,
    COUNT(*) as count
FROM posts

UNION ALL

SELECT 
    'Posts com likes:' as info,
    COUNT(*) as count
FROM posts 
WHERE likes_count > 0

UNION ALL

SELECT 
    'Total de likes:' as info,
    COUNT(*) as count
FROM likes 
WHERE target_type = 'post'

UNION ALL

SELECT 
    'Usuários únicos que curtiram:' as info,
    COUNT(DISTINCT user_id) as count
FROM likes 
WHERE target_type = 'post';

-- 9. VERIFICAR SE O SISTEMA DE NOTIFICAÇÕES ESTÁ CONFIGURADO
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE '✅ Sistema de notificações encontrado';
        
        -- Verificar se a função create_notification existe
        IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'create_notification') THEN
            RAISE NOTICE '✅ Função create_notification encontrada';
        ELSE
            RAISE NOTICE '⚠️ Função create_notification não encontrada';
        END IF;
        
        -- Verificar se o trigger de notificação foi criado
        IF EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'trigger_notify_like') THEN
            RAISE NOTICE '✅ Trigger de notificação criado';
        ELSE
            RAISE NOTICE '⚠️ Trigger de notificação não encontrado';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Sistema de notificações não encontrado';
    END IF;
END $$;

-- 10. RESUMO FINAL
SELECT 
    'SISTEMA DE CURTIDAS - RESUMO' as info,
    '' as count

UNION ALL

SELECT 
    'Tabelas criadas:' as info,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('likes', 'posts', 'users'))::text as count

UNION ALL

SELECT 
    'Funções criadas:' as info,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN (
        'toggle_post_like', 'get_post_likes_count', 'has_user_liked_post', 
        'get_post_likes', 'update_post_stats', 'test_like_system', 'trigger_notify_like'
    ))::text as count

UNION ALL

SELECT 
    'Triggers criados:' as info,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name IN (
        'update_post_likes_stats', 'trigger_notify_like'
    ))::text as count

UNION ALL

SELECT 
    'Sistema de notificações:' as info,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN '✅ Configurado' 
        ELSE '⚠️ Não configurado' 
    END as count

UNION ALL

SELECT 
    'Status geral:' as info,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes')
        AND EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'toggle_post_like')
        THEN '✅ SISTEMA FUNCIONANDO' 
        ELSE '❌ SISTEMA COM PROBLEMAS' 
    END as count; 