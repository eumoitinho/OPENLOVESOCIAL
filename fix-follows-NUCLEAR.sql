-- OPÇÃO NUCLEAR: REMOVE TODOS OS TRIGGERS DA TABELA FOLLOWS
-- Use este script SE TODOS OS OUTROS FIXES FALHARAM
-- ATENÇÃO: Isso desabilita TODAS as funcionalidades automáticas (stats, notificações, etc.)

-- ==============================================================================
-- PASSO 1: BACKUP DE INFORMAÇÕES IMPORTANTES
-- ==============================================================================

-- Listar todos os triggers que serão removidos (para referência)
SELECT 
    'TRIGGER A SER REMOVIDO: ' || trigger_name || ' - ' || action_statement as backup_info
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- ==============================================================================
-- PASSO 2: REMOVER TODOS OS TRIGGERS DA TABELA FOLLOWS
-- ==============================================================================

-- Método 1: Desabilitar todos os triggers
ALTER TABLE follows DISABLE TRIGGER ALL;

-- Método 2: Remover triggers específicos conhecidos
DROP TRIGGER IF EXISTS update_user_follows_stats ON follows;
DROP TRIGGER IF EXISTS create_smart_notification_follows ON follows;
DROP TRIGGER IF EXISTS create_follow_notification ON follows;
DROP TRIGGER IF EXISTS trigger_new_follower ON follows;
DROP TRIGGER IF EXISTS create_notification_follows ON follows;
DROP TRIGGER IF EXISTS smart_notification_trigger ON follows;
DROP TRIGGER IF EXISTS follow_stats_trigger ON follows;
DROP TRIGGER IF EXISTS notification_trigger ON follows;

-- Método 3: Remover triggers usando pg_trigger (mais agressivo)
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'follows'::regclass
        AND NOT tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.tgname || ' ON follows';
        RAISE NOTICE 'Removido trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- ==============================================================================
-- PASSO 3: CRIAR FUNÇÃO SIMPLES PARA STATS (OPCIONAL)
-- ==============================================================================

-- Função bem simples que não vai dar erro
CREATE OR REPLACE FUNCTION simple_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Só atualiza stats básicas, sem verificações complexas
    IF TG_OP = 'INSERT' THEN
        -- Incrementar followers
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb,
            '{followers}',
            (COALESCE((stats->>'followers')::int, 0) + 1)::text::jsonb
        )
        WHERE id = NEW.following_id;
        
        -- Incrementar following
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb,
            '{following}',
            (COALESCE((stats->>'following')::int, 0) + 1)::text::jsonb
        )
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar followers
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb,
            '{followers}',
            GREATEST((COALESCE((stats->>'followers')::int, 0) - 1), 0)::text::jsonb
        )
        WHERE id = OLD.following_id;
        
        -- Decrementar following
        UPDATE users 
        SET stats = jsonb_set(
            COALESCE(stats, '{}')::jsonb,
            '{following}',
            GREATEST((COALESCE((stats->>'following')::int, 0) - 1), 0)::text::jsonb
        )
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PASSO 4: CRIAR APENAS O TRIGGER ESSENCIAL (OPCIONAL)
-- ==============================================================================

-- Só criar se quiser manter as estatísticas básicas
-- CREATE TRIGGER simple_follow_stats_trigger
--     AFTER INSERT OR DELETE ON follows
--     FOR EACH ROW EXECUTE FUNCTION simple_follow_stats();

-- ==============================================================================
-- PASSO 5: VERIFICAR SE FUNCIONOU
-- ==============================================================================

-- Verificar se não há mais triggers
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODOS OS TRIGGERS REMOVIDOS COM SUCESSO!'
        ELSE '⚠️ AINDA EXISTEM ' || COUNT(*) || ' TRIGGERS ATIVOS'
    END as resultado
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- Listar triggers restantes (se houver)
SELECT 
    'TRIGGER RESTANTE: ' || trigger_name as info
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- ==============================================================================
-- PASSO 6: TESTE MANUAL
-- ==============================================================================

-- Agora teste a inserção manual para ver se funciona
-- Substitua pelos UUIDs reais dos seus usuários
-- INSERT INTO follows (follower_id, following_id) VALUES 
-- ('seu-user-id-aqui', 'outro-user-id-aqui');

-- Se funcionou, você pode testar a API novamente

-- ==============================================================================
-- RESULTADO FINAL
-- ==============================================================================

SELECT '🚀 OPÇÃO NUCLEAR EXECUTADA!' as resultado;
SELECT 'Teste agora a funcionalidade de follow na aplicação.' as instrucoes;
SELECT 'Se funcionar, você pode recriar os triggers necessários depois.' as observacao;
SELECT 'IMPORTANTE: Sem triggers, não haverá notificações automáticas.' as aviso;