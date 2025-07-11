-- Script para corrigir constraint de status_assinatura
-- Execute este script no Supabase SQL Editor

-- Remover constraint existente se existir
DO $$
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_status_assinatura' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT check_status_assinatura;
    END IF;
    
    -- Verificar se há outra constraint similar
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%status_assinatura%' 
        AND table_name = 'users'
    ) THEN
        -- Listar constraints para debug
        RAISE NOTICE 'Encontradas constraints de status_assinatura: %', 
            (SELECT string_agg(constraint_name, ', ') 
             FROM information_schema.table_constraints 
             WHERE constraint_name LIKE '%status_assinatura%' 
             AND table_name = 'users');
    END IF;
END $$;

-- Adicionar nova constraint com valores corretos (incluindo 'active')
ALTER TABLE users ADD CONSTRAINT check_status_assinatura 
CHECK (status_assinatura IN ('inactive', 'pending', 'authorized', 'cancelled', 'suspended', 'active'));

-- Mensagem de confirmação
SELECT 'Constraint de status_assinatura corrigida com sucesso!' as status; 