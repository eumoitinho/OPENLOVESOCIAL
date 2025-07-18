-- DEBUG SIMPLES E COMPATÍVEL PARA SUPABASE
-- Execute este script para identificar o problema

-- ==============================================================================
-- PASSO 1: TRIGGERS ATIVOS NA TABELA FOLLOWS
-- ==============================================================================

SELECT 
    '🔴 TRIGGER: ' || trigger_name || ' (' || event_manipulation || ')' as info,
    action_statement as detalhes
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
ORDER BY trigger_name;

-- ==============================================================================
-- PASSO 2: FUNÇÕES SUSPEITAS
-- ==============================================================================

SELECT 
    '🔍 FUNÇÃO: ' || routine_name as info,
    routine_type as tipo
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
-- PASSO 3: FUNÇÕES QUE USAM user_id E follows
-- ==============================================================================

SELECT 
    '⚠️ PROBLEMÁTICA: ' || routine_name as info
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_definition LIKE '%user_id%'
AND routine_definition LIKE '%follows%'
ORDER BY routine_name;

-- ==============================================================================
-- PASSO 4: COLUNAS DA TABELA FOLLOWS
-- ==============================================================================

SELECT 
    '📊 COLUNA: ' || column_name || ' (' || data_type || ')' as info
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- ==============================================================================
-- SOLUÇÃO IMEDIATA
-- ==============================================================================

-- Se você viu triggers problemáticos acima, execute o comando abaixo:
-- DESCOMENTE A PRÓXIMA LINHA PARA EXECUTAR:

-- ALTER TABLE follows DISABLE TRIGGER ALL;

SELECT '✅ DEBUG EXECUTADO!' as resultado;
SELECT 'Se encontrou triggers, descomente a linha ALTER TABLE acima e execute novamente.' as instrucao;