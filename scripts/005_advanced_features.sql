-- Funcionalidades avançadas do ConnectHub
-- Execute este script no Supabase SQL Editor

-- Tabela de conversas/chats
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2),
    CHECK (participant_1 != participant_2)
);

-- Tabela de mensagens
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos (expandida)
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    meeting_url TEXT,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_cancelled BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    event_type VARCHAR(50) DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'workshop', 'conference', 'social', 'other')),
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes de eventos
CREATE TABLE public.event_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'maybe', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'premium', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de denúncias
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reported_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (reported_user_id IS NOT NULL AND reported_post_id IS NULL AND reported_comment_id IS NULL) OR
        (reported_user_id IS NULL AND reported_post_id IS NOT NULL AND reported_comment_id IS NULL) OR
        (reported_user_id IS NULL AND reported_post_id IS NULL AND reported_comment_id IS NOT NULL)
    )
);

-- Tabela de banimentos
CREATE TABLE public.bans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'event_invite', 'community_invite', 'like', 'comment', 'follow', 'system')),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id UUID, -- ID do objeto relacionado (post, evento, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_community ON events(community_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_bans_user ON bans(user_id);
CREATE INDEX idx_bans_active ON bans(is_active);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Habilitar RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversations
CREATE POLICY "Usuários podem ver suas próprias conversas" ON public.conversations
  FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Usuários podem criar conversas" ON public.conversations
  FOR INSERT WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Políticas RLS para messages
CREATE POLICY "Usuários podem ver mensagens de suas conversas" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
    )
  );

CREATE POLICY "Usuários podem enviar mensagens" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Políticas RLS para events
CREATE POLICY "Todos podem ver eventos públicos" ON public.events
  FOR SELECT USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Usuários podem criar eventos" ON public.events
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Criadores podem editar seus eventos" ON public.events
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas RLS para event_participants
CREATE POLICY "Usuários podem ver participantes de eventos que podem ver" ON public.event_participants
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE NOT is_private OR created_by = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar sua participação" ON public.event_participants
  FOR ALL USING (user_id = auth.uid());

-- Políticas RLS para subscriptions
CREATE POLICY "Usuários podem ver sua própria assinatura" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sistema pode gerenciar assinaturas" ON public.subscriptions
  FOR ALL USING (true); -- Será controlado via service role

-- Políticas RLS para reports
CREATE POLICY "Usuários podem ver seus próprios reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Usuários podem criar reports" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Políticas RLS para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Controlado via service role

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bans_updated_at BEFORE UPDATE ON bans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para buscar usuários
CREATE OR REPLACE FUNCTION search_users(
  search_query TEXT DEFAULT '',
  interest_filter TEXT[] DEFAULT '{}',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[],
  location TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.bio, p.avatar_url, p.interests, 
         p.location, p.is_verified, p.created_at
  FROM profiles p
  WHERE 
    (search_query = '' OR 
     p.full_name ILIKE '%' || search_query || '%' OR 
     p.username ILIKE '%' || search_query || '%' OR
     p.bio ILIKE '%' || search_query || '%')
    AND 
    (array_length(interest_filter, 1) IS NULL OR 
     p.interests && interest_filter)
  ORDER BY 
    CASE WHEN p.is_verified THEN 0 ELSE 1 END,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar conversa
CREATE OR REPLACE FUNCTION create_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Verificar se conversa já existe
  SELECT id INTO conversation_id
  FROM conversations
  WHERE (participant_1 = current_user_id AND participant_2 = other_user_id)
     OR (participant_1 = other_user_id AND participant_2 = current_user_id);
  
  -- Se não existe, criar nova
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (LEAST(current_user_id, other_user_id), GREATEST(current_user_id, other_user_id))
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE messages 
  SET is_read = TRUE 
  WHERE messages.conversation_id = mark_messages_as_read.conversation_id 
    AND sender_id != auth.uid()
    AND is_read = FALSE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar role de admin aos profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
CREATE INDEX idx_profiles_role ON profiles(role);

-- Política para admins verem reports
CREATE POLICY "Admins podem ver todos os reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Política para admins gerenciarem reports
CREATE POLICY "Admins podem gerenciar reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
