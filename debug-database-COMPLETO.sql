-- SCRIPT DE DEBUG COMPLETO PARA IDENTIFICAR O PROBLEMA DOS TRIGGERS
-- Execute este script no SQL Editor do Supabase para descobrir o que está acontecendo

-- ==============================================================================
-- PASSO 1: IDENTIFICAR TODOS OS TRIGGERS ATIVOS NA TABELA FOLLOWS
-- ==============================================================================

SELECT 
    '🔴 TRIGGER ATIVO: ' || trigger_name || ' - ' || event_manipulation || ' - ' || action_timing as debug_info,
    action_statement,
    action_orientation,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
ORDER BY trigger_name;

-- ==============================================================================
-- PASSO 2: IDENTIFICAR TODAS AS FUNÇÕES QUE PODEM ESTAR SENDO CHAMADAS
-- ==============================================================================

SELECT 
    '🔍 FUNÇÃO ENCONTRADA: ' || routine_name as debug_info,
    routine_type,
    routine_language,
    routine_definition
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND (
    routine_name LIKE '%follow%' OR 
    routine_name LIKE '%user_stats%' OR
    routine_name LIKE '%notification%' OR
    routine_name LIKE '%smart%'
)
ORDER BY routine_name;

-- ==============================================================================
-- PASSO 3: BUSCAR FUNÇÕES QUE REFERENCIAM user_id
-- ==============================================================================

SELECT 
    '⚠️ FUNÇÃO PROBLEMÁTICA: ' || routine_name as debug_info,
    'REFERENCIA user_id: ' || CASE WHEN routine_definition LIKE '%user_id%' THEN 'SIM' ELSE 'NÃO' END
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_definition LIKE '%user_id%'
AND routine_definition LIKE '%follows%'
ORDER BY routine_name;

-- ==============================================================================
-- PASSO 4: VERIFICAR CONSTRAINTS E POLÍTICAS RLS
-- ==============================================================================

-- Verificar constraints da tabela follows
SELECT 
    '📋 CONSTRAINT: ' || constraint_name || ' - ' || constraint_type as debug_info
FROM information_schema.table_constraints 
WHERE table_name = 'follows';

-- Verificar políticas RLS
SELECT 
    '🔐 POLÍTICA RLS: ' || policyname || ' - ' || cmd || ' - ' || permissive as debug_info
FROM pg_policies 
WHERE tablename = 'follows';

-- ==============================================================================
-- PASSO 5: VERIFICAR TRIGGERS EM OUTRAS TABELAS QUE PODEM AFETAR FOLLOWS
-- ==============================================================================

-- Buscar triggers que podem ser chamados indiretamente
SELECT 
    '🔗 TRIGGER INDIRETO: ' || trigger_name || ' em ' || event_object_table as debug_info,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%follows%'
OR action_statement LIKE '%user_stats%'
OR action_statement LIKE '%notification%'
ORDER BY event_object_table, trigger_name;

-- ==============================================================================
-- PASSO 6: VERIFICAR EXTENSÕES E CONFIGURAÇÕES
-- ==============================================================================

-- Verificar extensões instaladas
SELECT 
    '🔌 EXTENSÃO: ' || extname || ' - ' || extversion as debug_info
FROM pg_extension;

-- Verificar se há triggers de sistema
SELECT 
    '⚙️ TRIGGER SISTEMA: ' || trigger_name || ' em ' || event_object_table as debug_info
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('follows', 'users', 'notifications')
ORDER BY event_object_table, trigger_name;

-- ==============================================================================
-- PASSO 7: VERIFICAR COLUNAS DA TABELA FOLLOWS
-- ==============================================================================

SELECT 
    '📊 COLUNA: ' || column_name || ' - ' || data_type || ' - ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULLABLE' ELSE 'NOT NULL' END as debug_info
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- ==============================================================================
-- PASSO 8: TESTAR INSERÇÃO DIRETA (SEM TRIGGERS)
-- ==============================================================================

-- Desabilitar triggers temporariamente para teste
-- CUIDADO: Isso pode afetar a integridade dos dados temporariamente
-- SELECT 'Desabilitando triggers para teste...' as debug_info;
-- ALTER TABLE follows DISABLE TRIGGER ALL;

-- Teste de inserção direta (substitua pelos UUIDs reais)
-- INSERT INTO follows (follower_id, following_id) VALUES 
-- ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Reabilitar triggers
-- ALTER TABLE follows ENABLE TRIGGER ALL;
-- SELECT 'Triggers reabilitados' as debug_info;

-- ==============================================================================
-- PASSO 9: VERIFICAR LOGS DE ERRO
-- ==============================================================================

-- Verificar se há outros triggers ocultos ou configurações especiais
SELECT 
    '🔄 TRIGGER DETALHADO: ' || t.trigger_name as debug_info,
    t.event_object_table,
    t.action_timing,
    t.event_manipulation,
    t.action_statement,
    p.prosrc as function_code
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.event_object_table = 'follows'
ORDER BY t.trigger_name;

-- ==============================================================================
-- RESULTADO FINAL
-- ==============================================================================

SELECT '✅ DEBUG COMPLETO EXECUTADO! Analise os resultados acima.' as resultado;
SELECT 'Procure por triggers que mencionam user_id ou funções problemáticas.' as instrucoes;
SELECT 'Se encontrar triggers problemáticos, use o script de fix correspondente.' as proximos_passos;