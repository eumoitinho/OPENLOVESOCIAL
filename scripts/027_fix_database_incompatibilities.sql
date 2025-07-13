-- =====================================================
-- SCRIPT DE CORREÇÃO DE INCOMPATIBILIDADES - OPENLOVE
-- =====================================================
-- Data: $(date)
-- Descrição: Corrige incompatibilidades entre código e banco de dados
-- =====================================================

-- =====================================================
-- 1. ADIÇÃO DE CAMPOS FALTANTES NA TABELA USERS
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
-- 2. CRIAÇÃO DE TABELAS DO SISTEMA DE ANÚNCIOS
-- =====================================================

-- Tabela de anunciantes
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    cta_text VARCHAR(100),
    cta_url VARCHAR(255),
    type VARCHAR(50) DEFAULT 'banner', -- banner, timeline, sidebar, story
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- impression, click, conversion
    metadata JSONB,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de anúncios
CREATE TABLE IF NOT EXISTS public.ad_transactions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(50),
    external_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAÇÃO DE TABELAS DO SISTEMA DE CONTEÚDO PREMIUM
-- =====================================================

-- Tabela de conteúdo premium
CREATE TABLE IF NOT EXISTS public.paid_content (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL, -- image, video, text, audio
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
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.paid_content(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, refunded
    purchased_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, content_id)
);

-- =====================================================
-- 4. CRIAÇÃO DE TABELAS DE ESTATÍSTICAS
-- =====================================================

-- Tabela de interações com posts
CREATE TABLE IF NOT EXISTS public.post_interactions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- like, share, save, report
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id, interaction_type)
);

-- Tabela de ganhos dos usuários
CREATE TABLE IF NOT EXISTS public.user_earnings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- content_sales, tips, referrals, etc.
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para anúncios
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser_id ON public.ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_type ON public.ad_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_id ON public.ad_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_event_type ON public.ad_metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_timestamp ON public.ad_metrics(timestamp);

-- Índices para conteúdo premium
CREATE INDEX IF NOT EXISTS idx_paid_content_creator_id ON public.paid_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_paid_content_is_active ON public.paid_content(is_active);
CREATE INDEX IF NOT EXISTS idx_content_purchases_buyer_id ON public.content_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_content_id ON public.content_purchases(content_id);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON public.post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_user_earnings_user_id ON public.user_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_earnings_status ON public.user_earnings(status);

-- =====================================================
-- 6. CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_earnings ENABLE ROW LEVEL SECURITY;

-- Políticas para advertisers
CREATE POLICY "Users can view verified advertisers" ON public.advertisers
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can manage own advertiser profile" ON public.advertisers
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para ad_campaigns
CREATE POLICY "Users can view active campaigns" ON public.ad_campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Advertisers can manage own campaigns" ON public.ad_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.advertisers 
            WHERE id = advertiser_id AND user_id = auth.uid()
        )
    );

-- Políticas para ad_metrics
CREATE POLICY "Users can create metrics" ON public.ad_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Advertisers can view own campaign metrics" ON public.ad_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ad_campaigns c
            JOIN public.advertisers a ON c.advertiser_id = a.id
            WHERE c.id = campaign_id AND a.user_id = auth.uid()
        )
    );

-- Políticas para paid_content
CREATE POLICY "Users can view active paid content" ON public.paid_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Creators can manage own content" ON public.paid_content
    FOR ALL USING (auth.uid() = creator_id);

-- Políticas para content_purchases
CREATE POLICY "Users can view own purchases" ON public.content_purchases
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases" ON public.content_purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Políticas para post_interactions
CREATE POLICY "Users can manage own interactions" ON public.post_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_earnings
CREATE POLICY "Users can view own earnings" ON public.user_earnings
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_advertisers_updated_at 
    BEFORE UPDATE ON public.advertisers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at 
    BEFORE UPDATE ON public.ad_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_transactions_updated_at 
    BEFORE UPDATE ON public.ad_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paid_content_updated_at 
    BEFORE UPDATE ON public.paid_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. CORREÇÃO DE QUERIES PROBLEMÁTICAS
-- =====================================================

-- Nota: As correções de queries devem ser feitas no código TypeScript
-- Este script apenas cria as estruturas necessárias

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'advertisers',
    'ad_campaigns', 
    'ad_metrics',
    'ad_transactions',
    'paid_content',
    'content_purchases',
    'post_interactions',
    'user_earnings'
)
ORDER BY tablename;

-- Verificar se os campos foram adicionados na tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('wallet_balance', 'tokens', 'tokens_received')
ORDER BY column_name;

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 