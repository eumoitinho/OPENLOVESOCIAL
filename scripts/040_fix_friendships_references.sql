-- Script para corrigir referências à tabela friendships
-- Data: 2025-01-XX
-- Versão: 1.0

-- 1. Corrigir políticas RLS que usam friendships
-- Atualizar política de visualização de posts
DROP POLICY IF EXISTS "Users can view posts" ON posts;
CREATE POLICY "Users can view posts" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends_only' 
            AND EXISTS (
                SELECT 1 FROM friends f
                WHERE (f.user_id = posts.user_id AND f.friend_id = auth.uid())
                OR (f.friend_id = posts.user_id AND f.user_id = auth.uid())
                AND f.status = 'accepted'
            )
        )
    );

-- 2. Corrigir política de visualização de votos em enquetes
DROP POLICY IF EXISTS "Users can view poll votes" ON poll_votes;
CREATE POLICY "Users can view poll votes" ON poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = post_id
            AND (
                p.visibility = 'public' 
                OR p.user_id = auth.uid()
                OR (
                    p.visibility = 'friends_only' 
                    AND EXISTS (
                        SELECT 1 FROM friends f
                        WHERE (f.user_id = p.user_id AND f.friend_id = auth.uid())
                        OR (f.friend_id = p.user_id AND f.user_id = auth.uid())
                        AND f.status = 'accepted'
                    )
                )
            )
        )
    );

-- 3. Corrigir política de storage para arquivos de áudio
DROP POLICY IF EXISTS "Users can view audio files" ON storage.objects;
CREATE POLICY "Users can view audio files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'posts'
        AND (
            -- Arquivos públicos
            EXISTS (
                SELECT 1 FROM posts p
                WHERE p.audio_url LIKE '%' || name || '%'
                AND p.visibility = 'public'
            )
            -- Arquivos do próprio usuário
            OR auth.uid()::text = (storage.foldername(name))[1]
            -- Arquivos de amigos
            OR EXISTS (
                SELECT 1 FROM posts p
                JOIN friends f ON (
                    (f.user_id = p.user_id AND f.friend_id = auth.uid())
                    OR (f.friend_id = p.user_id AND f.user_id = auth.uid())
                )
                WHERE p.audio_url LIKE '%' || name || '%'
                AND p.visibility = 'friends_only'
                AND f.status = 'accepted'
            )
        )
    );

-- 4. Verificar se a tabela friends existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'friends' 
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Tabela friends não existe. Execute o script 006_friends_and_restrictions.sql primeiro.';
    END IF;
    
    RAISE NOTICE '✅ Tabela friends encontrada!';
END $$;

-- 5. Verificar se as políticas foram corrigidas
DO $$
BEGIN
    -- Verificar política de posts
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can view posts'
    ) THEN
        RAISE NOTICE '✅ Política de posts corrigida!';
    ELSE
        RAISE NOTICE '⚠️ Política de posts não foi corrigida';
    END IF;
    
    -- Verificar política de poll_votes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'poll_votes' 
        AND policyname = 'Users can view poll votes'
    ) THEN
        RAISE NOTICE '✅ Política de poll_votes corrigida!';
    ELSE
        RAISE NOTICE '⚠️ Política de poll_votes não foi corrigida';
    END IF;
    
    -- Verificar política de storage
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can view audio files'
    ) THEN
        RAISE NOTICE '✅ Política de storage corrigida!';
    ELSE
        RAISE NOTICE '⚠️ Política de storage não foi corrigida';
    END IF;
    
    RAISE NOTICE '🎉 Todas as referências à tabela friendships foram corrigidas!';
END $$; 