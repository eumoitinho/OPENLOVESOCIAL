-- Criar tabela de solicitações de verificação
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('community', 'event')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_entity ON verification_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_requests_updated_at();

-- RLS Policies
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias solicitações
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem solicitações
CREATE POLICY "Users can create verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para admins atualizarem solicitações
CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Função para aprovar verificação
CREATE OR REPLACE FUNCTION approve_verification_request(
  request_id UUID,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  req_record verification_requests%ROWTYPE;
BEGIN
  -- Buscar a solicitação
  SELECT * INTO req_record
  FROM verification_requests
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE verification_requests
  SET 
    status = 'approved',
    admin_notes = approve_verification_request.admin_notes,
    reviewed_by = auth.uid(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Atualizar a entidade para verificada
  IF req_record.entity_type = 'community' THEN
    UPDATE communities
    SET is_verified = TRUE, updated_at = NOW()
    WHERE id = req_record.entity_id;
  ELSIF req_record.entity_type = 'event' THEN
    UPDATE events
    SET is_verified = TRUE, updated_at = NOW()
    WHERE id = req_record.entity_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar verificação
CREATE OR REPLACE FUNCTION reject_verification_request(
  request_id UUID,
  admin_notes TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE verification_requests
  SET 
    status = 'rejected',
    admin_notes = reject_verification_request.admin_notes,
    reviewed_by = auth.uid(),
    updated_at = NOW()
  WHERE id = request_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE verification_requests IS 'Solicitações de verificação para comunidades e eventos';
COMMENT ON COLUMN verification_requests.entity_type IS 'Tipo da entidade: community ou event';
COMMENT ON COLUMN verification_requests.entity_id IS 'ID da comunidade ou evento';
COMMENT ON COLUMN verification_requests.reason IS 'Razão fornecida pelo usuário para verificação';
COMMENT ON COLUMN verification_requests.status IS 'Status da solicitação: pending, under_review, approved, rejected';
COMMENT ON COLUMN verification_requests.admin_notes IS 'Notas do administrador sobre a decisão';

COMMENT ON FUNCTION approve_verification_request(UUID, TEXT) IS 'Aprova uma solicitação de verificação e marca a entidade como verificada';
COMMENT ON FUNCTION reject_verification_request(UUID, TEXT) IS 'Rejeita uma solicitação de verificação com notas administrativas';