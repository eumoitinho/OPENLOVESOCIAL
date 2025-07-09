-- Script de Manutenção e Verificação do Banco de Dados
-- Este script contém funções para manter a performance e integridade dos dados

-- Função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS TEXT AS $$
DECLARE
    deleted_views INTEGER;
    deleted_interactions INTEGER;
    deleted_metrics INTEGER;
    result_text TEXT;
BEGIN
    -- Limpar visualizações antigas (manter apenas dos últimos X dias)
    DELETE FROM post_views 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS deleted_views = ROW_COUNT;
    
    -- Limpar interações com anúncios antigas
    DELETE FROM ad_interactions 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS deleted_interactions = ROW_COUNT;
    
    -- Limpar métricas antigas de anúncios
    DELETE FROM ad_metrics 
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    GET DIAGNOSTICS deleted_metrics = ROW_COUNT;
    
    -- Limpar hashtags antigas
    DELETE FROM trending_hashtags 
    WHERE date < CURRENT_DATE - INTERVAL '30 days';
    
    result_text := format('Limpeza concluída: %s visualizações, %s interações com ads, %s métricas removidas', 
                         deleted_views, deleted_interactions, deleted_metrics);
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para recalcular engagement scores
CREATE OR REPLACE FUNCTION recalculate_engagement_scores()
RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE posts 
    SET engagement_score = calculate_engagement_score(id)
    WHERE created_at >= NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN format('Engagement scores atualizados para %s posts', updated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar hashtags em tendência
CREATE OR REPLACE FUNCTION update_trending_hashtags()
RETURNS TEXT AS $$
DECLARE
    processed_count INTEGER := 0;
    hashtag_record RECORD;
BEGIN
    -- Limpar hashtags do dia atual
    DELETE FROM trending_hashtags WHERE date = CURRENT_DATE;
    
    -- Inserir hashtags baseadas nos posts recentes
    FOR hashtag_record IN
        SELECT 
            unnest(hashtags) as hashtag,
            COUNT(*) as usage_count,
            SUM(engagement_score) as total_engagement
        FROM posts 
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND hashtags IS NOT NULL 
        AND array_length(hashtags, 1) > 0
        GROUP BY unnest(hashtags)
        HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC, SUM(engagement_score) DESC
        LIMIT 50
    LOOP
        INSERT INTO trending_hashtags (hashtag, usage_count, trend_score, date)
        VALUES (
            hashtag_record.hashtag,
            hashtag_record.usage_count,
            (hashtag_record.usage_count * 2) + (hashtag_record.total_engagement * 0.1),
            CURRENT_DATE
        );
        
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN format('Processadas %s hashtags em tendência', processed_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar integridade dos dados
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar posts órfãos (sem autor)
    RETURN QUERY
    SELECT 
        'Posts órfãos'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERRO' END::TEXT,
        format('%s posts sem autor válido', COUNT(*))::TEXT
    FROM posts p
    LEFT JOIN profiles pr ON p.author_id = pr.id
    WHERE pr.id IS NULL;
    
    -- Verificar interações órfãs
    RETURN QUERY
    SELECT 
        'Interações órfãs'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'AVISO' END::TEXT,
        format('%s interações com posts inexistentes', COUNT(*))::TEXT
    FROM post_interactions pi
    LEFT JOIN posts p ON pi.post_id = p.id
    WHERE p.id IS NULL;
    
    -- Verificar comentários órfãos
    RETURN QUERY
    SELECT 
        'Comentários órfãos'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'AVISO' END::TEXT,
        format('%s comentários com posts inexistentes', COUNT(*))::TEXT
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
    WHERE p.id IS NULL;
    
    -- Verificar engagement scores desatualizados
    RETURN QUERY
    SELECT 
        'Engagement scores'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'AVISO' END::TEXT,
        format('%s posts com engagement score possivelmente desatualizado', COUNT(*))::TEXT
    FROM posts p
    WHERE p.engagement_score != calculate_engagement_score(p.id)
    AND p.created_at >= NOW() - INTERVAL '7 days';
    
    -- Verificar anúncios expirados ainda ativos
    RETURN QUERY
    SELECT 
        'Anúncios expirados'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'AVISO' END::TEXT,
        format('%s anúncios expirados ainda marcados como ativos', COUNT(*))::TEXT
    FROM advertisements
    WHERE is_active = TRUE 
    AND end_date IS NOT NULL 
    AND end_date < NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    period TEXT
) AS $$
BEGIN
    -- Total de usuários
    RETURN QUERY
    SELECT 
        'Total de usuários'::TEXT,
        COUNT(*)::TEXT,
        'Todos os tempos'::TEXT
    FROM profiles;
    
    -- Posts hoje
    RETURN QUERY
    SELECT 
        'Posts hoje'::TEXT,
        COUNT(*)::TEXT,
        'Hoje'::TEXT
    FROM posts
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Posts esta semana
    RETURN QUERY
    SELECT 
        'Posts esta semana'::TEXT,
        COUNT(*)::TEXT,
        'Últimos 7 dias'::TEXT
    FROM posts
    WHERE created_at >= NOW() - INTERVAL '7 days';
    
    -- Interações hoje
    RETURN QUERY
    SELECT 
        'Interações hoje'::TEXT,
        COUNT(*)::TEXT,
        'Hoje'::TEXT
    FROM post_interactions
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Comentários hoje
    RETURN QUERY
    SELECT 
        'Comentários hoje'::TEXT,
        COUNT(*)::TEXT,
        'Hoje'::TEXT
    FROM comments
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Anúncios ativos
    RETURN QUERY
    SELECT 
        'Anúncios ativos'::TEXT,
        COUNT(*)::TEXT,
        'Atual'::TEXT
    FROM advertisements
    WHERE is_active = TRUE
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW());
    
    -- Top hashtag do dia
    RETURN QUERY
    SELECT 
        'Top hashtag hoje'::TEXT,
        COALESCE(hashtag, 'Nenhuma')::TEXT,
        'Hoje'::TEXT
    FROM trending_hashtags
    WHERE date = CURRENT_DATE
    ORDER BY trend_score DESC
    LIMIT 1;
    
    -- Usuário mais ativo (por posts)
    RETURN QUERY
    SELECT 
        'Usuário mais ativo'::TEXT,
        COALESCE(pr.username, 'Nenhum')::TEXT,
        'Últimos 7 dias'::TEXT
    FROM profiles pr
    JOIN (
        SELECT author_id, COUNT(*) as post_count
        FROM posts
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY author_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) top_user ON pr.id = top_user.author_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para otimizar performance do banco
CREATE OR REPLACE FUNCTION optimize_database()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- Atualizar estatísticas das tabelas
    ANALYZE posts;
    ANALYZE post_interactions;
    ANALYZE post_views;
    ANALYZE comments;
    ANALYZE advertisements;
    
    result_text := result_text || 'Estatísticas das tabelas atualizadas. ';
    
    -- Reindexar tabelas principais se necessário
    REINDEX INDEX CONCURRENTLY idx_posts_created_at;
    REINDEX INDEX CONCURRENTLY idx_posts_engagement_score;
    REINDEX INDEX CONCURRENTLY idx_post_interactions_post_id;
    
    result_text := result_text || 'Índices principais reindexados. ';
    
    -- Vacuum nas tabelas com mais atividade
    VACUUM ANALYZE posts;
    VACUUM ANALYZE post_interactions;
    VACUUM ANALYZE post_views;
    
    result_text := result_text || 'Vacuum executado nas tabelas principais.';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para backup de dados críticos
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS TEXT AS $$
DECLARE
    backup_count INTEGER;
BEGIN
    -- Criar tabela de backup se não existir
    CREATE TABLE IF NOT EXISTS posts_backup AS SELECT * FROM posts WHERE 1=0;
    CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles WHERE 1=0;
    
    -- Backup dos posts dos últimos 30 dias
    INSERT INTO posts_backup 
    SELECT * FROM posts 
    WHERE created_at >= NOW() - INTERVAL '30 days'
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS backup_count = ROW_COUNT;
    
    RETURN format('Backup realizado: %s posts dos últimos 30 dias', backup_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para monitoramento de performance
CREATE OR REPLACE FUNCTION monitor_performance()
RETURNS TABLE (
    table_name TEXT,
    total_size TEXT,
    index_size TEXT,
    row_count BIGINT,
    last_vacuum TIMESTAMP,
    last_analyze TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        n_live_tup as row_count,
        last_vacuum,
        last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND tablename IN ('posts', 'post_interactions', 'post_views', 'comments', 'profiles', 'advertisements')
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar job de manutenção automática (executar diariamente)
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    cleanup_result TEXT;
    trending_result TEXT;
    integrity_issues INTEGER;
BEGIN
    -- Limpeza de dados antigos
    SELECT cleanup_old_data(90) INTO cleanup_result;
    result_text := result_text || cleanup_result || E'\n';
    
    -- Atualizar hashtags em tendência
    SELECT update_trending_hashtags() INTO trending_result;
    result_text := result_text || trending_result || E'\n';
    
    -- Recalcular engagement scores
    result_text := result_text || recalculate_engagement_scores() || E'\n';
    
    -- Verificar integridade e contar problemas
    SELECT COUNT(*) INTO integrity_issues
    FROM check_data_integrity()
    WHERE status != 'OK';
    
    result_text := result_text || format('Verificação de integridade: %s problemas encontrados', integrity_issues);
    
    -- Log da manutenção
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('maintenance', result_text, NOW())
    ON CONFLICT DO NOTHING;
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN format('Erro na manutenção: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de logs do sistema se não existir
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para logs
CREATE INDEX IF NOT EXISTS idx_system_logs_type_date ON system_logs(log_type, created_at DESC);

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN format('Removidos %s logs antigos', deleted_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para as novas funções
GRANT EXECUTE ON FUNCTION cleanup_old_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_engagement_scores() TO authenticated;
GRANT EXECUTE ON FUNCTION update_trending_hashtags() TO authenticated;
GRANT EXECUTE ON FUNCTION check_data_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION optimize_database() TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION daily_maintenance() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_logs(INTEGER) TO authenticated;

-- Comentários para documentação
COMMENT ON FUNCTION cleanup_old_data(INTEGER) IS 'Remove dados antigos para manter performance';
COMMENT ON FUNCTION recalculate_engagement_scores() IS 'Recalcula scores de engajamento dos posts';
COMMENT ON FUNCTION update_trending_hashtags() IS 'Atualiza hashtags em tendência baseado na atividade';
COMMENT ON FUNCTION check_data_integrity() IS 'Verifica integridade dos dados e relacionamentos';
COMMENT ON FUNCTION get_system_stats() IS 'Retorna estatísticas gerais do sistema';
COMMENT ON FUNCTION optimize_database() IS 'Otimiza performance do banco de dados';
COMMENT ON FUNCTION monitor_performance() IS 'Monitora performance das tabelas principais';
COMMENT ON FUNCTION daily_maintenance() IS 'Executa manutenção diária automatizada';

-- Exemplo de uso das funções de manutenção
-- SELECT * FROM get_system_stats();
-- SELECT * FROM check_data_integrity();
-- SELECT * FROM monitor_performance();
-- SELECT daily_maintenance();
