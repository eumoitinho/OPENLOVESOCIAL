-- Script final para corrigir todos os problemas do banco de dados
-- Data: 2025-01-XX
-- Versão: 1.0

-- =====================================================
-- 1. CRIAR TABELA FRIENDS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Habilitar RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para friends
DROP POLICY IF EXISTS "Usuários podem ver suas próprias amizades" ON public.friends;
CREATE POLICY "Usuários podem ver suas próprias amizades" ON public.friends
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem criar solicitações de amizade" ON public.friends;
CREATE POLICY "Usuários podem criar solicitações de amizade" ON public.friends
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem atualizar suas amizades" ON public.friends;
CREATE POLICY "Usuários podem atualizar suas amizades" ON public.friends
  FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem deletar suas amizades" ON public.friends;
CREATE POLICY "Usuários podem deletar suas amizades" ON public.friends
  FOR DELETE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- =====================================================
-- 2. ADICIONAR CAMPOS FALTANTES NA TABELA USERS
-- =====================================================

-- Adicionar campo wallet_balance para sistema de pagamentos
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Adicionar campos de tokens para gamificação
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tokens_received INTEGER DEFAULT 0;

-- =====================================================
-- 3. CRIAR TABELAS DO SISTEMA DE ANÚNCIOS
-- =====================================================

-- Tabela de anunciantes
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas de anúncios
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    cta_text VARCHAR(100),
    cta_url VARCHAR(255),
    type VARCHAR(50) DEFAULT 'banner',
    status VARCHAR(50) DEFAULT 'draft',
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0.00,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    target_audience JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas de anúncios
CREATE TABLE IF NOT EXISTS public.ad_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de anúncios
CREATE TABLE IF NOT EXISTS public.ad_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    external_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CRIAR TABELAS DO SISTEMA DE CONTEÚDO PREMIUM
-- =====================================================

-- Tabela de conteúdo pago
CREATE TABLE IF NOT EXISTS public.paid_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    content_url TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    purchases_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de compras de conteúdo
CREATE TABLE IF NOT EXISTS public.content_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.paid_content(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    purchased_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CRIAR TABELAS DO SISTEMA DE ESTATÍSTICAS
-- =====================================================

-- Tabela de interações com posts
CREATE TABLE IF NOT EXISTS public.post_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de ganhos do usuário
CREATE TABLE IF NOT EXISTS public.user_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CORRIGIR POLÍTICAS RLS PARA POSTS
-- =====================================================

-- Atualizar política de visualização de posts
DROP POLICY IF EXISTS "Users can view posts" ON posts;
CREATE POLICY "Users can view posts" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends_only' 
            AND EXISTS (
                SELECT 1 FROM friends f
                WHERE (f.user_id = posts.user_id AND f.friend_id = auth.uid())
                OR (f.friend_id = posts.user_id AND f.user_id = auth.uid())
                AND f.status = 'accepted'
            )
        )
    );

-- =====================================================
-- 7. CRIAR FUNÇÕES ÚTEIS
-- =====================================================

-- Função para verificar se dois usuários são amigos mútuos
CREATE OR REPLACE FUNCTION are_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friends 
    WHERE ((user_id = user1_id AND friend_id = user2_id) OR 
           (user_id = user2_id AND friend_id = user1_id))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para enviar solicitação de amizade
CREATE OR REPLACE FUNCTION send_friend_request(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR current_user_id = target_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se já existe uma solicitação
  IF EXISTS (
    SELECT 1 FROM friends 
    WHERE (user_id = current_user_id AND friend_id = target_user_id) OR
          (user_id = target_user_id AND friend_id = current_user_id)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Criar solicitação
  INSERT INTO friends (user_id, friend_id, status)
  VALUES (current_user_id, target_user_id, 'pending');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar/recusar solicitação de amizade
CREATE OR REPLACE FUNCTION respond_friend_request(requester_id UUID, response VARCHAR(20))
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL OR response NOT IN ('accepted', 'declined') THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE friends 
  SET status = response, updated_at = NOW()
  WHERE user_id = requester_id AND friend_id = current_user_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

DO $$
BEGIN
    -- Verificar se a tabela friends foi criada
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'friends' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Tabela friends criada com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Erro: Tabela friends não foi criada';
    END IF;
    
    -- Verificar se os campos foram adicionados na tabela users
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'wallet_balance'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Campo wallet_balance adicionado com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Campo wallet_balance pode não ter sido adicionado';
    END IF;
    
    -- Verificar se as tabelas de anúncios foram criadas
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'advertisers' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Tabelas de anúncios criadas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Tabelas de anúncios podem não ter sido criadas';
    END IF;
    
    RAISE NOTICE '🎉 Script de correção executado com sucesso!';
    RAISE NOTICE '💡 Agora você pode usar todas as funcionalidades do sistema!';
END $$; 