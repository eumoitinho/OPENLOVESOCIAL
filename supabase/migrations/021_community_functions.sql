-- Função para incrementar contador de membros da comunidade
CREATE OR REPLACE FUNCTION increment_community_members(community_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE communities 
  SET member_count = member_count + 1,
      updated_at = NOW()
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar contador de membros da comunidade
CREATE OR REPLACE FUNCTION decrement_community_members(community_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE communities 
  SET member_count = GREATEST(member_count - 1, 0),
      updated_at = NOW()
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Função para recalcular contador de membros
CREATE OR REPLACE FUNCTION recalculate_community_members(community_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE communities 
  SET member_count = (
    SELECT COUNT(*)
    FROM community_members
    WHERE community_id = communities.id
    AND status = 'active'
  ),
  updated_at = NOW()
  WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário pode participar de mais comunidades
CREATE OR REPLACE FUNCTION can_join_more_communities(user_id UUID, max_communities INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO current_count
  FROM community_members
  WHERE user_id = user_id
  AND status = 'active';
  
  -- -1 significa ilimitado
  IF max_communities = -1 THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_communities;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de comunidades do usuário
CREATE OR REPLACE FUNCTION get_user_community_stats(user_id UUID)
RETURNS TABLE (
  total_communities INTEGER,
  admin_communities INTEGER,
  moderator_communities INTEGER,
  member_communities INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_communities,
    COUNT(CASE WHEN role = 'admin' THEN 1 END)::INTEGER as admin_communities,
    COUNT(CASE WHEN role = 'moderator' THEN 1 END)::INTEGER as moderator_communities,
    COUNT(CASE WHEN role = 'member' THEN 1 END)::INTEGER as member_communities
  FROM community_members
  WHERE user_id = user_id
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em community_members
CREATE OR REPLACE FUNCTION update_community_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar campo updated_at se não existir
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_community_members_updated_at ON community_members;
CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_members_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_community_members_user_status ON community_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_community_members_community_status ON community_members(community_id, status);
CREATE INDEX IF NOT EXISTS idx_communities_verified ON communities(is_verified);
CREATE INDEX IF NOT EXISTS idx_communities_private ON communities(is_private);

-- Comentários para documentação
COMMENT ON FUNCTION increment_community_members(UUID) IS 'Incrementa contador de membros da comunidade';
COMMENT ON FUNCTION decrement_community_members(UUID) IS 'Decrementa contador de membros da comunidade';
COMMENT ON FUNCTION recalculate_community_members(UUID) IS 'Recalcula contador de membros baseado em membros ativos';
COMMENT ON FUNCTION can_join_more_communities(UUID, INTEGER) IS 'Verifica se usuário pode participar de mais comunidades';
COMMENT ON FUNCTION get_user_community_stats(UUID) IS 'Retorna estatísticas de comunidades do usuário';