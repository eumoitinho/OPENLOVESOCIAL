-- Limpeza completa de triggers problemáticos na tabela comments
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Remover todos os triggers da tabela comments
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'comments' AND NOT t.tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON comments CASCADE';
    END LOOP;
    
    -- Remover todas as funções que podem estar causando problemas
    DROP FUNCTION IF EXISTS create_notification() CASCADE;
    DROP FUNCTION IF EXISTS create_smart_notification() CASCADE;
    DROP FUNCTION IF EXISTS update_post_stats() CASCADE;
    DROP FUNCTION IF EXISTS update_comment_stats() CASCADE;
    DROP FUNCTION IF EXISTS create_mention_notifications() CASCADE;
    
    -- Recriar apenas a função essencial
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $func$ language 'plpgsql';
    
    -- Recriar apenas o trigger essencial
    CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
END $$;