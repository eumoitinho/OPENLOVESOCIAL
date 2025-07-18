-- Script de migração para adicionar suporte Stripe mantendo Mercado Pago
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar campos Stripe à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'mercadopago' CHECK (payment_provider IN ('mercadopago', 'stripe'));

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_payment_provider ON users(payment_provider);

-- 3. Função para criar/atualizar cliente Stripe
CREATE OR REPLACE FUNCTION update_stripe_customer(
  user_email TEXT,
  customer_id TEXT,
  subscription_id TEXT DEFAULT NULL,
  price_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    stripe_customer_id = customer_id,
    stripe_subscription_id = COALESCE(subscription_id, stripe_subscription_id),
    stripe_price_id = COALESCE(price_id, stripe_price_id),
    payment_provider = 'stripe',
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para atualizar assinatura Stripe
CREATE OR REPLACE FUNCTION update_stripe_subscription(
  user_email TEXT,
  subscription_id TEXT,
  status VARCHAR(20),
  price_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    stripe_subscription_id = subscription_id,
    stripe_price_id = COALESCE(price_id, stripe_price_id),
    status_assinatura = status,
    updated_at = NOW()
  WHERE email = user_email;
  
  -- Log para auditoria
  RAISE NOTICE 'Stripe subscription updated for %: % (%)', user_email, subscription_id, status;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para processar webhook Stripe
CREATE OR REPLACE FUNCTION process_stripe_webhook(
  event_type TEXT,
  customer_id TEXT,
  subscription_id TEXT DEFAULT NULL,
  status TEXT DEFAULT NULL,
  price_id TEXT DEFAULT NULL,
  payment_date TIMESTAMP DEFAULT NULL,
  next_payment_date TIMESTAMP DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Buscar email do usuário pelo customer_id
  SELECT email INTO user_email FROM users WHERE stripe_customer_id = customer_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found for customer_id: %', customer_id;
  END IF;
  
  -- Processar diferentes tipos de eventos
  CASE event_type
    WHEN 'customer.subscription.created', 'customer.subscription.updated' THEN
      PERFORM update_stripe_subscription(user_email, subscription_id, status, price_id);
      
    WHEN 'customer.subscription.deleted' THEN
      UPDATE users SET 
        status_assinatura = 'cancelled',
        plano = 'free',
        updated_at = NOW()
      WHERE email = user_email;
      
    WHEN 'invoice.payment_succeeded' THEN
      UPDATE users SET 
        ultimo_pagamento = payment_date,
        proximo_pagamento = next_payment_date,
        status_assinatura = 'authorized',
        updated_at = NOW()
      WHERE email = user_email;
      
    WHEN 'invoice.payment_failed' THEN
      UPDATE users SET 
        status_assinatura = 'suspended',
        updated_at = NOW()
      WHERE email = user_email;
      
    ELSE
      RAISE NOTICE 'Unhandled event type: %', event_type;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para migrar usuário de MP para Stripe
CREATE OR REPLACE FUNCTION migrate_user_to_stripe(
  user_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    stripe_customer_id = stripe_customer_id,
    stripe_subscription_id = stripe_subscription_id,
    payment_provider = 'stripe',
    updated_at = NOW()
  WHERE email = user_email;
  
  -- Log da migração
  INSERT INTO audit_logs (action, user_email, details, created_at)
  VALUES ('stripe_migration', user_email, 
    jsonb_build_object(
      'from_provider', 'mercadopago',
      'to_provider', 'stripe',
      'mp_customer_id', (SELECT mp_customer_id FROM users WHERE email = user_email),
      'stripe_customer_id', stripe_customer_id
    ),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Criar tabela de logs de auditoria se não existir
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  user_email TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 8. View para relatório de migração
CREATE OR REPLACE VIEW migration_status AS
SELECT 
  payment_provider,
  plano,
  status_assinatura,
  COUNT(*) as total_users,
  COUNT(CASE WHEN mp_customer_id IS NOT NULL THEN 1 END) as mp_users,
  COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END) as stripe_users
FROM users
GROUP BY payment_provider, plano, status_assinatura
ORDER BY payment_provider, plano;

-- 9. Comentários para documentação
COMMENT ON COLUMN users.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN users.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN users.stripe_price_id IS 'ID do preço/plano no Stripe';
COMMENT ON COLUMN users.payment_provider IS 'Provedor de pagamento ativo: mercadopago ou stripe';

-- 10. Políticas RLS para permitir que o sistema gerencie dados Stripe
DROP POLICY IF EXISTS "Sistema pode gerenciar pagamentos Stripe" ON users;
CREATE POLICY "Sistema pode gerenciar pagamentos Stripe" ON users
  FOR UPDATE USING (true);

-- Exemplos de uso:
-- SELECT update_stripe_customer('usuario@email.com', 'cus_123', 'sub_456', 'price_789');
-- SELECT process_stripe_webhook('customer.subscription.created', 'cus_123', 'sub_456', 'active', 'price_789');
-- SELECT migrate_user_to_stripe('usuario@email.com', 'cus_123', 'sub_456');
-- SELECT * FROM migration_status;