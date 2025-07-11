-- Script para adicionar campos do Mercado Pago à tabela users
-- Execute este script no Supabase SQL Editor

-- Adicionar campos do Mercado Pago à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plano VARCHAR(20) DEFAULT 'free' CHECK (plano IN ('free', 'gold', 'diamante', 'diamante_anual')),
ADD COLUMN IF NOT EXISTS mp_customer_id TEXT,
ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS status_assinatura VARCHAR(20) DEFAULT 'inactive' CHECK (status_assinatura IN ('inactive', 'pending', 'authorized', 'cancelled', 'suspended')),
ADD COLUMN IF NOT EXISTS ultimo_pagamento TIMESTAMP,
ADD COLUMN IF NOT EXISTS proximo_pagamento TIMESTAMP;

-- Criar índices para performance
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

-- Política RLS para permitir que o sistema atualize dados de assinatura
-- Remove a política se existir e cria novamente
DROP POLICY IF EXISTS "Sistema pode gerenciar assinaturas" ON users;
CREATE POLICY "Sistema pode gerenciar assinaturas" ON users
  FOR UPDATE USING (true); -- Controlado via service role

-- Exemplo de uso das funções:
-- SELECT update_subscription_status('usuario@email.com', 'authorized', 'sub_123', 'cust_456');
-- SELECT register_payment('usuario@email.com', NOW(), NOW() + INTERVAL '1 month');
-- SELECT update_user_plan('usuario@email.com', 'gold', 'sub_123'); 