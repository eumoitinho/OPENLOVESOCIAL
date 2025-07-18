-- Tabela para payment intents (Stripe + AbacatePay)
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  abacatepay_payment_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'brl',
  plan_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payment_id VARCHAR(255),
  status VARCHAR(50),
  error_message TEXT,
  data JSONB,
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar campos para integração com AbacatePay no perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS abacatepay_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_abacatepay_id ON payment_intents(abacatepay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_payment_id ON webhook_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at);

CREATE INDEX IF NOT EXISTS idx_profiles_plan_status ON profiles(plan_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires ON profiles(subscription_expires_at);

-- Trigger para atualizar updated_at em payment_intents
CREATE OR REPLACE FUNCTION update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON payment_intents;
CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_intents_updated_at();

-- RLS Policies para payment_intents
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios payment intents
CREATE POLICY "Users can view own payment intents" ON payment_intents
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar payment intents para si mesmos
CREATE POLICY "Users can create own payment intents" ON payment_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios payment intents
CREATE POLICY "Users can update own payment intents" ON payment_intents
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de webhooks
CREATE POLICY "Admins can view webhook logs" ON webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Função para verificar se assinatura está ativa
CREATE OR REPLACE FUNCTION is_subscription_active(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se tem plano ativo e não expirado
  IF profile_record.plan_status = 'active' AND 
     (profile_record.subscription_expires_at IS NULL OR 
      profile_record.subscription_expires_at > NOW()) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Função para obter plano efetivo do usuário
CREATE OR REPLACE FUNCTION get_effective_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN 'free';
  END IF;
  
  -- Se assinatura ativa, retornar plano atual
  IF is_subscription_active(user_id) THEN
    RETURN COALESCE(profile_record.plan_type, 'free');
  END IF;
  
  -- Se não, retornar free
  RETURN 'free';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE payment_intents IS 'Payment intents integrando Stripe e AbacatePay';
COMMENT ON COLUMN payment_intents.stripe_payment_intent_id IS 'ID do PaymentIntent no Stripe';
COMMENT ON COLUMN payment_intents.abacatepay_payment_id IS 'ID do pagamento no AbacatePay (PIX)';
COMMENT ON COLUMN payment_intents.payment_method IS 'Método de pagamento: card, pix, etc';
COMMENT ON COLUMN payment_intents.status IS 'Status: pending, completed, expired, cancelled';

COMMENT ON TABLE webhook_logs IS 'Logs de webhooks de provedores de pagamento';
COMMENT ON COLUMN webhook_logs.provider IS 'Provedor: stripe, abacatepay, etc';
COMMENT ON COLUMN webhook_logs.event_type IS 'Tipo do evento do webhook';
COMMENT ON COLUMN webhook_logs.data IS 'Dados completos do webhook em JSON';

COMMENT ON COLUMN profiles.abacatepay_customer_id IS 'ID do customer no AbacatePay';
COMMENT ON COLUMN profiles.plan_status IS 'Status do plano: active, inactive, expired';
COMMENT ON COLUMN profiles.subscription_expires_at IS 'Data de expiração da assinatura';

COMMENT ON FUNCTION is_subscription_active(UUID) IS 'Verifica se a assinatura do usuário está ativa';
COMMENT ON FUNCTION get_effective_plan(UUID) IS 'Retorna o plano efetivo do usuário (free se expirado)';