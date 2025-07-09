-- Adicionar novos campos à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS can_sell_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS offers_programs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Criar tabela de conteúdo pago
CREATE TABLE IF NOT EXISTS paid_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL, -- photo, video, audio, document
    content_url TEXT NOT NULL,
    preview_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    purchase_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de compras de conteúdo
CREATE TABLE IF NOT EXISTS content_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES paid_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

-- Criar tabela de programas/cursos
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced
    price DECIMAL(10,2) NOT NULL,
    duration_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de matrículas em programas
CREATE TABLE IF NOT EXISTS program_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price_paid DECIMAL(10,2) NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    progress INTEGER DEFAULT 0, -- 0-100
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(program_id, user_id)
);

-- Criar tabela de ganhos dos usuários
CREATE TABLE IF NOT EXISTS user_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    content_earnings DECIMAL(10,2) DEFAULT 0.00,
    program_earnings DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Criar função para atualizar ganhos do criador
CREATE OR REPLACE FUNCTION update_creator_earnings(creator_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_earnings (user_id, total_earnings, content_earnings)
    VALUES (creator_id, amount, amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_earnings = user_earnings.total_earnings + amount,
        content_earnings = user_earnings.content_earnings + amount,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_paid_content_user_id ON paid_content(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_content_active ON paid_content(is_active);
CREATE INDEX IF NOT EXISTS idx_content_purchases_user_id ON content_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_content_id ON content_purchases(content_id);
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_user_id ON program_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program_id ON program_enrollments(program_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE paid_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_earnings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para paid_content
CREATE POLICY "Usuários podem ver conteúdo ativo" ON paid_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Criadores podem gerenciar seu conteúdo" ON paid_content
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para content_purchases
CREATE POLICY "Usuários podem ver suas compras" ON content_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem comprar conteúdo" ON content_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para programs
CREATE POLICY "Usuários podem ver programas ativos" ON programs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Mentores podem gerenciar seus programas" ON programs
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para program_enrollments
CREATE POLICY "Usuários podem ver suas matrículas" ON program_enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem se matricular" ON program_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_earnings
CREATE POLICY "Usuários podem ver seus ganhos" ON user_earnings
    FOR SELECT USING (auth.uid() = user_id);

-- Criar view para estatísticas de conteúdo
CREATE OR REPLACE VIEW content_stats AS
SELECT 
    pc.id,
    pc.title,
    pc.price,
    pc.purchase_count,
    pc.rating,
    COALESCE(SUM(cp.price), 0) as total_revenue
FROM paid_content pc
LEFT JOIN content_purchases cp ON pc.id = cp.content_id
GROUP BY pc.id, pc.title, pc.price, pc.purchase_count, pc.rating;

-- Criar view para estatísticas de programas
CREATE OR REPLACE VIEW program_stats AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.enrollment_count,
    p.rating,
    COALESCE(SUM(pe.price_paid), 0) as total_revenue
FROM programs p
LEFT JOIN program_enrollments pe ON p.id = pe.program_id
GROUP BY p.id, p.title, p.price, p.enrollment_count, p.rating;

-- Inserir dados de exemplo para testes
INSERT INTO paid_content (user_id, title, description, content_type, content_url, preview_url, price) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Fotos Exclusivas - Set 1', 'Coleção de fotos profissionais exclusivas', 'photo', '/content/photos/set1.jpg', '/content/previews/set1_preview.jpg', 25.00),
((SELECT id FROM auth.users LIMIT 1), 'Vídeo Tutorial Premium', 'Tutorial avançado sobre fotografia', 'video', '/content/videos/tutorial1.mp4', '/content/previews/tutorial1_preview.jpg', 49.90);

INSERT INTO programs (user_id, title, description, category, level, price, duration_hours) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Curso de Fotografia Digital', 'Aprenda fotografia do básico ao avançado', 'photography', 'beginner', 199.00, 20),
((SELECT id FROM auth.users LIMIT 1), 'Mentoria em Negócios Online', 'Consultoria personalizada para empreendedores', 'business', 'intermediate', 299.00, 10);
