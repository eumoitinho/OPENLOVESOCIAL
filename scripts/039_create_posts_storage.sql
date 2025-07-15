-- Script para configurar storage para posts de áudio
-- Data: 2025-01-XX
-- Versão: 1.0

-- 1. Criar bucket para posts se não existir
-- Nota: Buckets são criados via Supabase Dashboard ou API
-- Este script é para documentação

-- 2. Configurar políticas de acesso para o bucket 'posts'
-- Política para inserir arquivos (apenas usuários autenticados)
CREATE POLICY "Users can upload audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'posts' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para visualizar arquivos (apenas para posts públicos ou amigos)
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
                JOIN friendships f ON (
                    (f.user_id = p.user_id AND f.friend_id = auth.uid())
                    OR (f.friend_id = p.user_id AND f.user_id = auth.uid())
                )
                WHERE p.audio_url LIKE '%' || name || '%'
                AND p.visibility = 'friends_only'
                AND f.status = 'accepted'
            )
        )
    );

-- Política para atualizar arquivos (apenas o proprietário)
CREATE POLICY "Users can update their audio files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'posts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política para deletar arquivos (apenas o proprietário)
CREATE POLICY "Users can delete their audio files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'posts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 3. Função para limpar arquivos órfãos
CREATE OR REPLACE FUNCTION cleanup_orphaned_audio_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Encontrar arquivos de áudio que não têm posts correspondentes
    FOR file_record IN
        SELECT name, (storage.foldername(name))[1] as user_id
        FROM storage.objects
        WHERE bucket_id = 'posts'
        AND name LIKE '%/audio/%'
    LOOP
        -- Verificar se existe um post com este arquivo
        IF NOT EXISTS (
            SELECT 1 FROM posts 
            WHERE audio_url LIKE '%' || file_record.name || '%'
            AND user_id::text = file_record.user_id
        ) THEN
            -- Deletar arquivo órfão
            DELETE FROM storage.objects 
            WHERE bucket_id = 'posts' 
            AND name = file_record.name;
            
            deleted_count := deleted_count + 1;
        END IF;
    END LOOP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para deletar arquivo quando post é deletado
CREATE OR REPLACE FUNCTION delete_audio_file_on_post_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o post tinha áudio, deletar o arquivo
    IF OLD.audio_url IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'posts'
        AND name = (
            SELECT SPLIT_PART(OLD.audio_url, '/', -1)
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_delete_audio_file ON posts;
CREATE TRIGGER trigger_delete_audio_file
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION delete_audio_file_on_post_delete();

-- 5. Função para obter estatísticas de uso de áudio
CREATE OR REPLACE FUNCTION get_audio_usage_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    total_files INTEGER;
    total_size BIGINT;
    avg_duration NUMERIC;
BEGIN
    -- Contar arquivos de áudio do usuário
    SELECT COUNT(*), COALESCE(SUM(metadata->>'size')::BIGINT, 0)
    INTO total_files, total_size
    FROM storage.objects
    WHERE bucket_id = 'posts'
    AND name LIKE user_uuid::text || '/audio/%';
    
    -- Calcular duração média
    SELECT COALESCE(AVG(audio_duration), 0)
    INTO avg_duration
    FROM posts
    WHERE user_id = user_uuid
    AND audio_url IS NOT NULL;
    
    RETURN jsonb_build_object(
        'total_files', total_files,
        'total_size_mb', ROUND((total_size / 1024.0 / 1024.0)::numeric, 2),
        'avg_duration_seconds', ROUND(avg_duration, 1),
        'last_upload', (
            SELECT MAX(created_at)
            FROM posts
            WHERE user_id = user_uuid
            AND audio_url IS NOT NULL
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar configuração
DO $$
BEGIN
    -- Verificar se as políticas foram criadas
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload audio files'
    ) THEN
        RAISE NOTICE '✅ Políticas de storage configuradas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Políticas de storage podem não ter sido criadas';
    END IF;
    
    -- Verificar se as funções foram criadas
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'cleanup_orphaned_audio_files'
    ) THEN
        RAISE NOTICE '✅ Funções de limpeza criadas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Funções de limpeza podem não ter sido criadas';
    END IF;
    
    RAISE NOTICE '🎵 Storage configurado para posts de áudio!';
END $$; 