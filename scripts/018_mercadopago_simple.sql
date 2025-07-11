-- Script simples para adicionar campos do Mercado Pago à tabela users
-- Execute este script no Supabase SQL Editor

-- Adicionar campos do Mercado Pago à tabela users (se não existirem)
DO $$ 
BEGIN
    -- Adicionar coluna plano se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'plano') THEN
        ALTER TABLE users ADD COLUMN plano VARCHAR(20) DEFAULT 'free';
        ALTER TABLE users ADD CONSTRAINT check_plano CHECK (plano IN ('free', 'gold', 'diamante', 'diamante_anual'));
    END IF;

    -- Adicionar coluna mp_customer_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'mp_customer_id') THEN
        ALTER TABLE users ADD COLUMN mp_customer_id TEXT;
    END IF;

    -- Adicionar coluna mp_subscription_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'mp_subscription_id') THEN
        ALTER TABLE users ADD COLUMN mp_subscription_id TEXT;
    END IF;

    -- Adicionar coluna status_assinatura se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status_assinatura') THEN
        ALTER TABLE users ADD COLUMN status_assinatura VARCHAR(20) DEFAULT 'inactive';
        ALTER TABLE users ADD CONSTRAINT check_status_assinatura CHECK (status_assinatura IN ('inactive', 'pending', 'authorized', 'cancelled', 'suspended'));
    END IF;

    -- Adicionar coluna ultimo_pagamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'ultimo_pagamento') THEN
        ALTER TABLE users ADD COLUMN ultimo_pagamento TIMESTAMP;
    END IF;

    -- Adicionar coluna proximo_pagamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'proximo_pagamento') THEN
        ALTER TABLE users ADD COLUMN proximo_pagamento TIMESTAMP;
    END IF;
END $$;

-- Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano);
CREATE INDEX IF NOT EXISTS idx_users_mp_customer_id ON users(mp_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_mp_subscription_id ON users(mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);

-- Função para atualizar status da assinatura
CREATE OR REPLACE FUNCTION update_subscription_status(
  user_email TEXT,
  new_status VARCHAR(20),
  subscription_id TEXT DEFAULT NULL,
  customer_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    status_assinatura = new_status,
    mp_subscription_id = COALESCE(subscription_id, mp_subscription_id),
    mp_customer_id = COALESCE(customer_id, mp_customer_id),
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar pagamento
CREATE OR REPLACE FUNCTION register_payment(
  user_email TEXT,
  payment_date TIMESTAMP,
  next_payment_date TIMESTAMP DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    ultimo_pagamento = payment_date,
    proximo_pagamento = COALESCE(next_payment_date, proximo_pagamento),
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar plano do usuário
CREATE OR REPLACE FUNCTION update_user_plan(
  user_email TEXT,
  new_plan VARCHAR(20),
  subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    plano = new_plan,
    mp_subscription_id = COALESCE(subscription_id, mp_subscription_id),
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON COLUMN users.plano IS 'Tipo de plano do usuário: free, gold, diamante, diamante_anual';
COMMENT ON COLUMN users.mp_customer_id IS 'ID do cliente no Mercado Pago';
COMMENT ON COLUMN users.mp_subscription_id IS 'ID da assinatura no Mercado Pago';
COMMENT ON COLUMN users.status_assinatura IS 'Status da assinatura: inactive, pending, authorized, cancelled, suspended';
COMMENT ON COLUMN users.ultimo_pagamento IS 'Data do último pagamento processado';
COMMENT ON COLUMN users.proximo_pagamento IS 'Data do próximo pagamento programado';

-- Verificar se RLS está habilitado e criar política se necessário
DO $$
BEGIN
    -- Habilitar RLS se não estiver habilitado
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Remover política se existir e criar novamente
    DROP POLICY IF EXISTS "Sistema pode gerenciar assinaturas" ON users;
    CREATE POLICY "Sistema pode gerenciar assinaturas" ON users
        FOR UPDATE USING (true); -- Controlado via service role
END $$;

-- Mensagem de confirmação
SELECT 'Campos do Mercado Pago adicionados com sucesso!' as status; 