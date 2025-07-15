-- Script para criar o bucket covers no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Verificar se o bucket covers existe
DO $$
BEGIN
    -- Verificar se o bucket existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'covers'
    ) THEN
        -- Criar o bucket covers
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'covers',
            'covers',
            true,
            10485760, -- 10MB em bytes
            ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );
        
        RAISE NOTICE 'Bucket covers criado com sucesso';
    ELSE
        RAISE NOTICE 'Bucket covers já existe';
    END IF;
END $$;

-- Configurar RLS para o bucket covers
CREATE POLICY "Usuários podem fazer upload de suas próprias capas" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'covers' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem atualizar suas próprias capas" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'covers' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem deletar suas próprias capas" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'covers' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Imagens de capa são públicas para leitura" ON storage.objects
    FOR SELECT USING (bucket_id = 'covers');

-- Verificar se as políticas foram criadas
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%cover%'; 