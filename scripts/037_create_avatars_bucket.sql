-- Script para criar o bucket avatars no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Verificar se o bucket avatars existe
DO $$
BEGIN
    -- Verificar se o bucket existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        -- Criar o bucket avatars
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'avatars',
            'avatars',
            true,
            5242880, -- 5MB em bytes
            ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );
        
        RAISE NOTICE 'Bucket avatars criado com sucesso';
    ELSE
        RAISE NOTICE 'Bucket avatars já existe';
    END IF;
END $$;

-- Configurar RLS para o bucket avatars
CREATE POLICY "Usuários podem fazer upload de suas próprias imagens" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem atualizar suas próprias imagens" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Usuários podem deletar suas próprias imagens" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Imagens de avatar são públicas para leitura" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

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
AND policyname LIKE '%avatar%'; 