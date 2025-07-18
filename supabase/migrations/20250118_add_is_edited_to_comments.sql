-- Adicionar coluna is_edited à tabela comments se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'comments'
        AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE public.comments
        ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Criar índice para melhor performance se ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'comments'
        AND indexname = 'idx_comments_post_id'
    ) THEN
        CREATE INDEX idx_comments_post_id ON public.comments(post_id);
    END IF;
END $$;

-- Criar índice para comentários do usuário se ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'comments'
        AND indexname = 'idx_comments_user_id'
    ) THEN
        CREATE INDEX idx_comments_user_id ON public.comments(user_id);
    END IF;
END $$;