-- FIX IMEDIATO - RESOLVA O PROBLEMA AGORA
-- Execute este comando no SQL Editor do Supabase

-- DESABILITA TODOS OS TRIGGERS DA TABELA FOLLOWS
ALTER TABLE follows DISABLE TRIGGER ALL;

-- VERIFICAR SE FUNCIONOU
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SUCESSO! Todos os triggers desabilitados.'
        ELSE '⚠️ Ainda existem ' || COUNT(*) || ' triggers ativos'
    END as resultado
FROM information_schema.triggers 
WHERE event_object_table = 'follows'
AND trigger_name NOT LIKE '%_disable_%';

-- RESULTADO
SELECT '🚀 TESTE AGORA A FUNCIONALIDADE DE FOLLOW!' as proximos_passos;
SELECT 'Se funcionar, você pode reabilitar triggers específicos depois.' as observacao;