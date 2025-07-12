-- =====================================================
-- FUNÇÕES DE ANÁLISE DO BANCO DE DADOS OPENLOVE
-- =====================================================
-- Execute cada função separadamente no SQL Query Editor

-- =====================================================
-- 1. ANÁLISE GERAL DA ESTRUTURA DO BANCO
-- =====================================================

-- Função para listar todas as tabelas
CREATE OR REPLACE FUNCTION analyze_all_tables()
RETURNS TABLE (
    table_name text,
    table_type text,
    row_count bigint,
    size_mb numeric,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::text,
        t.table_type::text,
        COALESCE(c.reltuples::bigint, 0) as row_count,
        COALESCE(pg_total_relation_size(c.oid) / 1024.0 / 1024.0, 0)::numeric(10,2) as size_mb,
        COALESCE(pd.description, 'Sem descrição')::text as description
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    LEFT JOIN pg_namespace n ON n.nspname = t.table_schema
    LEFT JOIN pg_description pd ON pd.objoid = c.oid AND pd.objsubid = 0
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. ANÁLISE DETALHADA DA TABELA USERS
-- =====================================================

-- Função para analisar estrutura da tabela users
CREATE OR REPLACE FUNCTION analyze_users_table_structure()
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    character_maximum_length integer,
    is_primary_key boolean,
    is_foreign_key boolean,
    referenced_table text,
    referenced_column text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        COALESCE(c.column_default, 'N/A')::text,
        c.character_maximum_length,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
        CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key,
        COALESCE(fk.referenced_table, 'N/A')::text,
        COALESCE(fk.referenced_column, 'N/A')::text
    FROM information_schema.columns c
    LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'users' 
        AND tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.column_name = pk.column_name
    LEFT JOIN (
        SELECT 
            kcu.column_name,
            ccu.table_name as referenced_table,
            ccu.column_name as referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'users' 
        AND tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.column_name = fk.column_name
    WHERE c.table_name = 'users'
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Função para analisar índices da tabela users
CREATE OR REPLACE FUNCTION analyze_users_indexes()
RETURNS TABLE (
    index_name text,
    index_type text,
    columns text,
    is_unique boolean,
    is_primary boolean,
    size_mb numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.relname::text as index_name,
        am.amname::text as index_type,
        array_to_string(array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)), ', ')::text as columns,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary,
        COALESCE(pg_relation_size(i.oid) / 1024.0 / 1024.0, 0)::numeric(10,2) as size_mb
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_am am ON am.oid = i.relam
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = 'users'
    GROUP BY i.relname, am.amname, ix.indisunique, ix.indisprimary, i.oid
    ORDER BY i.relname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. ANÁLISE DE ERROS E PROBLEMAS
-- =====================================================

-- Função para detectar problemas na tabela users
CREATE OR REPLACE FUNCTION detect_users_table_issues()
RETURNS TABLE (
    issue_type text,
    description text,
    severity text,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Coluna ausente'::text as issue_type,
        'Coluna ' || col || ' não encontrada na tabela users'::text as description,
        'CRÍTICO'::text as severity,
        'Adicionar coluna ' || col || ' à tabela users'::text as recommendation
    FROM (
        VALUES 
            ('username'),
            ('email'),
            ('full_name'),
            ('avatar_url'),
            ('bio'),
            ('birth_date'),
            ('gender'),
            ('location'),
            ('interests'),
            ('relationship_status'),
            ('looking_for'),
            ('is_verified'),
            ('is_premium'),
            ('premium_until'),
            ('mercadopago_customer_id'),
            ('stripe_customer_id'),
            ('created_at'),
            ('updated_at'),
            ('last_login'),
            ('status'),
            ('email_verified_at'),
            ('phone'),
            ('phone_verified_at'),
            ('profile_views_count'),
            ('posts_count'),
            ('followers_count'),
            ('following_count'),
            ('friends_count'),
            ('events_count'),
            ('communities_count'),
            ('open_dates_enabled'),
            ('open_dates_preferences'),
            ('notification_settings'),
            ('privacy_settings'),
            ('theme_preference'),
            ('language_preference'),
            ('timezone'),
            ('latitude'),
            ('longitude'),
            ('location_updated_at'),
            ('profile_completion_percentage'),
            ('account_status'),
            ('moderation_status'),
            ('moderation_notes'),
            ('admin_notes'),
            ('deleted_at'),
            ('deletion_reason'),
            ('restoration_token'),
            ('password_reset_token'),
            ('email_verification_token'),
            ('two_factor_secret'),
            ('two_factor_enabled'),
            ('login_attempts'),
            ('locked_until'),
            ('last_password_change'),
            ('password_history'),
            ('session_data'),
            ('preferences'),
            ('metadata')
    ) AS required_columns(col)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = col
    )
    
    UNION ALL
    
    SELECT 
        'Índice ausente'::text as issue_type,
        'Índice para ' || idx || ' não encontrado'::text as description,
        'ALTO'::text as severity,
        'Criar índice para ' || idx::text as recommendation
    FROM (
        VALUES 
            ('username'),
            ('email'),
            ('mercadopago_customer_id'),
            ('stripe_customer_id'),
            ('status'),
            ('is_premium'),
            ('location'),
            ('created_at')
    ) AS required_indexes(idx)
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname LIKE '%' || idx || '%'
    )
    
    UNION ALL
    
    SELECT 
        'Constraint ausente'::text as issue_type,
        'Constraint ' || con || ' não encontrada'::text as description,
        'MÉDIO'::text as severity,
        'Adicionar constraint ' || con::text as recommendation
    FROM (
        VALUES 
            ('users_username_unique'),
            ('users_email_unique'),
            ('users_mercadopago_customer_id_unique'),
            ('users_stripe_customer_id_unique')
    ) AS required_constraints(con)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = con
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. ANÁLISE DE USO E PERFORMANCE
-- =====================================================

-- Função para analisar estatísticas da tabela users
CREATE OR REPLACE FUNCTION analyze_users_statistics()
RETURNS TABLE (
    metric text,
    value text,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Total de usuários'::text as metric,
        COUNT(*)::text as value,
        'Número total de registros na tabela users'::text as description
    FROM users
    
    UNION ALL
    
    SELECT 
        'Usuários verificados'::text as metric,
        COUNT(*)::text as value,
        'Usuários com email verificado'::text as description
    FROM users WHERE email_verified_at IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'Usuários premium'::text as metric,
        COUNT(*)::text as value,
        'Usuários com plano premium ativo'::text as description
    FROM users WHERE is_premium = true AND (premium_until IS NULL OR premium_until > NOW())
    
    UNION ALL
    
    SELECT 
        'Usuários ativos (últimos 30 dias)'::text as metric,
        COUNT(*)::text as value,
        'Usuários que fizeram login nos últimos 30 dias'::text as description
    FROM users WHERE last_login > NOW() - INTERVAL '30 days'
    
    UNION ALL
    
    SELECT 
        'Usuários deletados'::text as metric,
        COUNT(*)::text as value,
        'Usuários marcados como deletados'::text as description
    FROM users WHERE deleted_at IS NOT NULL
    
    UNION ALL
    
    SELECT 
        'Tamanho da tabela'::text as metric,
        (pg_total_relation_size('users'::regclass) / 1024.0 / 1024.0)::numeric(10,2)::text || ' MB' as value,
        'Tamanho total da tabela users em disco'::text as description;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ANÁLISE DE RELACIONAMENTOS
-- =====================================================

-- Função para analisar foreign keys relacionadas à tabela users
CREATE OR REPLACE FUNCTION analyze_users_relationships()
RETURNS TABLE (
    table_name text,
    column_name text,
    constraint_name text,
    referenced_table text,
    referenced_column text,
    relationship_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.table_name::text,
        kcu.column_name::text,
        tc.constraint_name::text,
        ccu.table_name::text as referenced_table,
        ccu.column_name::text as referenced_column,
        CASE 
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN 'Foreign Key'
            WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'Primary Key'
            ELSE tc.constraint_type
        END::text as relationship_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE (tc.table_name = 'users' OR ccu.table_name = 'users')
    AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY')
    ORDER BY tc.table_name, kcu.column_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ANÁLISE DE RLS (Row Level Security)
-- =====================================================

-- Função para analisar políticas RLS
CREATE OR REPLACE FUNCTION analyze_rls_policies()
RETURNS TABLE (
    table_name text,
    policy_name text,
    policy_type text,
    policy_definition text,
    is_enabled boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename::text as table_name,
        policyname::text as policy_name,
        permissive::text as policy_type,
        pg_get_expr(qual, polrelid)::text as policy_definition,
        true as is_enabled
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ANÁLISE DE FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para analisar funções relacionadas à tabela users
CREATE OR REPLACE FUNCTION analyze_users_functions()
RETURNS TABLE (
    function_name text,
    function_type text,
    parameters text,
    return_type text,
    language text,
    definition text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.proname::text as function_name,
        CASE 
            WHEN p.prokind = 'f' THEN 'Function'
            WHEN p.prokind = 'p' THEN 'Procedure'
            WHEN p.prokind = 'a' THEN 'Aggregate'
            WHEN p.prokind = 'w' THEN 'Window'
            ELSE 'Unknown'
        END::text as function_type,
        pg_get_function_arguments(p.oid)::text as parameters,
        pg_get_function_result(p.oid)::text as return_type,
        l.lanname::text as language,
        COALESCE(pg_get_functiondef(p.oid), 'N/A')::text as definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname = 'public'
    AND (
        pg_get_functiondef(p.oid) ILIKE '%users%'
        OR pg_get_function_arguments(p.oid) ILIKE '%users%'
        OR pg_get_function_result(p.oid) ILIKE '%users%'
    )
    ORDER BY p.proname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. RELATÓRIO COMPLETO
-- =====================================================

-- Função para gerar relatório completo
CREATE OR REPLACE FUNCTION generate_complete_report()
RETURNS TABLE (
    section text,
    item text,
    details text,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'ESTRUTURA DA TABELA USERS'::text as section,
        'Colunas'::text as item,
        (SELECT COUNT(*)::text FROM information_schema.columns WHERE table_name = 'users') as details,
        CASE 
            WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users') >= 50 THEN 'OK'
            ELSE 'INCOMPLETO'
        END::text as status
    
    UNION ALL
    
    SELECT 
        'ESTRUTURA DA TABELA USERS'::text as section,
        'Índices'::text as item,
        (SELECT COUNT(*)::text FROM pg_indexes WHERE tablename = 'users') as details,
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'users') >= 8 THEN 'OK'
            ELSE 'INCOMPLETO'
        END::text as status
    
    UNION ALL
    
    SELECT 
        'ESTRUTURA DA TABELA USERS'::text as section,
        'Constraints'::text as item,
        (SELECT COUNT(*)::text FROM information_schema.table_constraints WHERE table_name = 'users') as details,
        CASE 
            WHEN (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'users') >= 4 THEN 'OK'
            ELSE 'INCOMPLETO'
        END::text as status
    
    UNION ALL
    
    SELECT 
        'PROBLEMAS DETECTADOS'::text as section,
        'Issues'::text as item,
        (SELECT COUNT(*)::text FROM detect_users_table_issues()) as details,
        CASE 
            WHEN (SELECT COUNT(*) FROM detect_users_table_issues()) = 0 THEN 'OK'
            ELSE 'PROBLEMAS ENCONTRADOS'
        END::text as status
    
    UNION ALL
    
    SELECT 
        'RELACIONAMENTOS'::text as section,
        'Foreign Keys'::text as item,
        (SELECT COUNT(*)::text FROM analyze_users_relationships() WHERE relationship_type = 'Foreign Key') as details,
        'INFO'::text as status
    
    UNION ALL
    
    SELECT 
        'SEGURANÇA'::text as section,
        'RLS Policies'::text as item,
        (SELECT COUNT(*)::text FROM analyze_rls_policies() WHERE table_name = 'public.users') as details,
        CASE 
            WHEN (SELECT COUNT(*) FROM analyze_rls_policies() WHERE table_name = 'public.users') > 0 THEN 'OK'
            ELSE 'AUSENTE'
        END::text as status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
EXECUTE CADA FUNÇÃO SEPARADAMENTE NO SQL QUERY EDITOR:

1. Para ver todas as tabelas:
   SELECT * FROM analyze_all_tables();

2. Para analisar estrutura da tabela users:
   SELECT * FROM analyze_users_table_structure();

3. Para ver índices da tabela users:
   SELECT * FROM analyze_users_indexes();

4. Para detectar problemas:
   SELECT * FROM detect_users_table_issues();

5. Para estatísticas da tabela users:
   SELECT * FROM analyze_users_statistics();

6. Para relacionamentos:
   SELECT * FROM analyze_users_relationships();

7. Para políticas RLS:
   SELECT * FROM analyze_rls_policies();

8. Para funções relacionadas:
   SELECT * FROM analyze_users_functions();

9. Para relatório completo:
   SELECT * FROM generate_complete_report();
*/ 