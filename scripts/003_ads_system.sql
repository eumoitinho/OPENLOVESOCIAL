-- Sistema de Anúncios para OpenLove
-- Script para criar tabelas e estruturas necessárias

-- Tabela de Anunciantes
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    category VARCHAR(100),
    description TEXT,
    website_url TEXT,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Brasil',
    verified BOOLEAN DEFAULT FALSE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Campanhas de Anúncio
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('banner', 'timeline', 'sidebar', 'story')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cta VARCHAR(100),
    image_url TEXT,
    video_url TEXT,
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0.00,
    duration INTEGER NOT NULL, -- em dias
    start_date DATE,
    end_date DATE,
    target_audience TEXT[], -- array de strings
    category VARCHAR(100),
    tags TEXT[], -- array de hashtags
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'rejected')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0.00, -- click-through rate
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Métricas de Anúncios
CREATE TABLE IF NOT EXISTS ad_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion')),
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações de Pagamento
CREATE TABLE IF NOT EXISTS ad_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'refund')),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações de Anúncios
CREATE TABLE IF NOT EXISTS ad_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser_id ON ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_type ON ad_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_category ON ad_campaigns(category);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_priority ON ad_campaigns(priority);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_start_date ON ad_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_end_date ON ad_campaigns(end_date);

CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_id ON ad_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_event_type ON ad_metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_timestamp ON ad_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_user_id ON ad_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_ad_transactions_advertiser_id ON ad_transactions(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_status ON ad_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_type ON ad_transactions(type);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_created_at ON ad_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_verified ON advertisers(verified);
CREATE INDEX IF NOT EXISTS idx_advertisers_category ON advertisers(category);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_transactions_updated_at BEFORE UPDATE ON ad_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON ad_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular CTR automaticamente
CREATE OR REPLACE FUNCTION calculate_campaign_ctr()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.impressions > 0 THEN
        NEW.ctr = (NEW.clicks::DECIMAL / NEW.impressions::DECIMAL) * 100;
    ELSE
        NEW.ctr = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular CTR
CREATE TRIGGER update_campaign_ctr BEFORE UPDATE ON ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION calculate_campaign_ctr();

-- Inserir configurações padrão
INSERT INTO ad_settings (setting_key, setting_value, description) VALUES
('pricing', '{"cpm": 5.00, "cpc": 0.50, "min_budget": 50.00, "max_budget": 10000.00}', 'Configurações de preços dos anúncios'),
('targeting', '{"age_range": [18, 65], "locations": ["São Paulo", "Rio de Janeiro", "Brasília"], "interests": ["casais", "eventos", "lifestyle"]}', 'Configurações de segmentação'),
('approval', '{"auto_approve": false, "review_time": 24, "moderation_enabled": true}', 'Configurações de aprovação de anúncios'),
('display', '{"max_ads_per_page": 3, "ad_spacing": 3, "sidebar_ads_enabled": true}', 'Configurações de exibição de anúncios')
ON CONFLICT (setting_key) DO NOTHING;

-- Políticas RLS (Row Level Security)
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para advertisers
CREATE POLICY "Users can view their own advertiser profile" ON advertisers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own advertiser profile" ON advertisers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own advertiser profile" ON advertisers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para ad_campaigns
CREATE POLICY "Advertisers can view their own campaigns" ON ad_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advertisers 
            WHERE advertisers.id = ad_campaigns.advertiser_id 
            AND advertisers.user_id = auth.uid()
        )
    );

CREATE POLICY "Advertisers can manage their own campaigns" ON ad_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM advertisers 
            WHERE advertisers.id = ad_campaigns.advertiser_id 
            AND advertisers.user_id = auth.uid()
        )
    );

-- Políticas para ad_metrics (apenas inserção, visualização limitada)
CREATE POLICY "Anyone can insert ad metrics" ON ad_metrics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Advertisers can view metrics for their campaigns" ON ad_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ad_campaigns 
            JOIN advertisers ON advertisers.id = ad_campaigns.advertiser_id
            WHERE ad_campaigns.id = ad_metrics.campaign_id 
            AND advertisers.user_id = auth.uid()
        )
    );

-- Políticas para ad_transactions
CREATE POLICY "Advertisers can view their own transactions" ON ad_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advertisers 
            WHERE advertisers.id = ad_transactions.advertiser_id 
            AND advertisers.user_id = auth.uid()
        )
    );

CREATE POLICY "Advertisers can insert their own transactions" ON ad_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM advertisers 
            WHERE advertisers.id = ad_transactions.advertiser_id 
            AND advertisers.user_id = auth.uid()
        )
    );

-- Políticas para ad_settings (apenas leitura para todos)
CREATE POLICY "Anyone can view ad settings" ON ad_settings
    FOR SELECT USING (true);

-- Comentários para documentação
COMMENT ON TABLE advertisers IS 'Tabela de anunciantes/criadores de campanhas';
COMMENT ON TABLE ad_campaigns IS 'Tabela de campanhas de anúncio';
COMMENT ON TABLE ad_metrics IS 'Tabela de métricas e eventos de anúncios';
COMMENT ON TABLE ad_transactions IS 'Tabela de transações financeiras de anúncios';
COMMENT ON TABLE ad_settings IS 'Tabela de configurações do sistema de anúncios';

COMMENT ON COLUMN ad_campaigns.target_audience IS 'Array de strings com público-alvo';
COMMENT ON COLUMN ad_campaigns.tags IS 'Array de hashtags para segmentação';
COMMENT ON COLUMN ad_metrics.metadata IS 'Dados adicionais do evento em formato JSON';
COMMENT ON COLUMN ad_transactions.metadata IS 'Dados adicionais da transação em formato JSON'; 