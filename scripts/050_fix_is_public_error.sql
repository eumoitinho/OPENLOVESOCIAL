-- Script para corrigir erro da coluna is_public
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- CORRIGIR ERRO DA COLUNA is_public
-- =====================================================

-- 1. Verificar e corrigir tabela events
DO $$
BEGIN
    -- Verificar se a tabela events existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
        -- Adicionar coluna is_public se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_public') THEN
            ALTER TABLE events ADD COLUMN is_public BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_public adicionada à tabela events';
        END IF;
        
        -- Verificar se a coluna date existe, se não, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
            ALTER TABLE events ADD COLUMN date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Coluna date adicionada à tabela events';
        END IF;
        
        -- Verificar se a coluna start_date existe, se não, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_date') THEN
            ALTER TABLE events ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Coluna start_date adicionada à tabela events';
        END IF;
        
        -- Verificar se a coluna end_date existe, se não, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_date') THEN
            ALTER TABLE events ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Coluna end_date adicionada à tabela events';
        END IF;
        
        -- Verificar se a coluna user_id existe, se não, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'user_id') THEN
            ALTER TABLE events ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Coluna user_id adicionada à tabela events';
        END IF;
        
        RAISE NOTICE 'Tabela events verificada e corrigida';
    ELSE
        -- Criar tabela events se não existir
        CREATE TABLE public.events (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            location VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE,
            max_participants INTEGER,
            current_participants INTEGER DEFAULT 0,
            category VARCHAR(100),
            tags TEXT[],
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_events_user_id ON events(user_id);
        CREATE INDEX idx_events_start_date ON events(start_date);
        CREATE INDEX idx_events_location ON events(location);
        CREATE INDEX idx_events_category ON events(category);
        CREATE INDEX idx_events_is_public ON events(is_public);
        
        RAISE NOTICE 'Tabela events criada';
    END IF;
END $$;

-- 2. Verificar e corrigir tabela communities
DO $$
BEGIN
    -- Verificar se a tabela communities existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities' AND table_schema = 'public') THEN
        -- Adicionar coluna is_public se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'is_public') THEN
            ALTER TABLE communities ADD COLUMN is_public BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_public adicionada à tabela communities';
        END IF;
        
        RAISE NOTICE 'Tabela communities verificada e corrigida';
    ELSE
        -- Criar tabela communities se não existir
        CREATE TABLE public.communities (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            slug VARCHAR(255) UNIQUE NOT NULL,
            avatar_url TEXT,
            cover_url TEXT,
            category_id UUID,
            is_public BOOLEAN DEFAULT true,
            member_count INTEGER DEFAULT 0,
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_communities_slug ON communities(slug);
        CREATE INDEX idx_communities_category ON communities(category_id);
        CREATE INDEX idx_communities_is_public ON communities(is_public);
        
        RAISE NOTICE 'Tabela communities criada';
    END IF;
END $$;

-- 3. Verificar e corrigir tabela system_settings
DO $$
BEGIN
    -- Verificar se a tabela system_settings existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public') THEN
        -- Adicionar coluna is_public se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'is_public') THEN
            ALTER TABLE system_settings ADD COLUMN is_public BOOLEAN DEFAULT false;
            RAISE NOTICE 'Coluna is_public adicionada à tabela system_settings';
        END IF;
        
        RAISE NOTICE 'Tabela system_settings verificada e corrigida';
    ELSE
        -- Criar tabela system_settings se não existir
        CREATE TABLE public.system_settings (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
        CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
        
        RAISE NOTICE 'Tabela system_settings criada';
    END IF;
END $$;

-- 4. Verificar e corrigir tabela media
DO $$
BEGIN
    -- Verificar se a tabela media existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media' AND table_schema = 'public') THEN
        -- Adicionar coluna is_public se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'is_public') THEN
            ALTER TABLE media ADD COLUMN is_public BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_public adicionada à tabela media';
        END IF;
        
        RAISE NOTICE 'Tabela media verificada e corrigida';
    ELSE
        -- Criar tabela media se não existir
        CREATE TABLE public.media (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            url TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            width INTEGER,
            height INTEGER,
            duration INTEGER,
            alt_text TEXT,
            is_profile_picture BOOLEAN DEFAULT false,
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_media_user_id ON media(user_id);
        CREATE INDEX idx_media_file_type ON media(file_type);
        CREATE INDEX idx_media_created_at ON media(created_at);
        CREATE INDEX idx_media_profile_picture ON media(user_id, is_profile_picture) WHERE is_profile_picture = true;
        CREATE INDEX idx_media_is_public ON media(is_public);
        
        RAISE NOTICE 'Tabela media criada';
    END IF;
END $$;

-- 5. Configurar RLS para todas as tabelas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para events
DROP POLICY IF EXISTS "Users can view public events" ON events;
CREATE POLICY "Users can view public events" ON events
    FOR SELECT USING (
        is_public = true OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their events" ON events;
CREATE POLICY "Users can update their events" ON events
    FOR UPDATE USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can delete their events" ON events;
CREATE POLICY "Users can delete their events" ON events
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- 7. Criar políticas RLS para communities
DROP POLICY IF EXISTS "Users can view public communities" ON communities;
CREATE POLICY "Users can view public communities" ON communities
    FOR SELECT USING (
        is_public = true
    );

DROP POLICY IF EXISTS "Users can create communities" ON communities;
CREATE POLICY "Users can create communities" ON communities
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
    );

-- 8. Criar políticas RLS para system_settings
DROP POLICY IF EXISTS "Users can view public settings" ON system_settings;
CREATE POLICY "Users can view public settings" ON system_settings
    FOR SELECT USING (
        is_public = true
    );

-- 9. Criar políticas RLS para media
DROP POLICY IF EXISTS "Users can view public media" ON media;
CREATE POLICY "Users can view public media" ON media
    FOR SELECT USING (
        is_public = true
    );

DROP POLICY IF EXISTS "Users can view own media" ON media;
CREATE POLICY "Users can view own media" ON media
    FOR SELECT USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can insert own media" ON media;
CREATE POLICY "Users can insert own media" ON media
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update own media" ON media;
CREATE POLICY "Users can update own media" ON media
    FOR UPDATE USING (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can delete own media" ON media;
CREATE POLICY "Users can delete own media" ON media
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- 10. Verificar estrutura final
SELECT 'Estrutura das tabelas verificada:' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('events', 'communities', 'system_settings', 'media')
    AND column_name = 'is_public'
ORDER BY table_name, ordinal_position;

-- 11. Inserir dados de teste se necessário
INSERT INTO system_settings (setting_key, setting_value, description, is_public)
VALUES 
    ('site_name', 'OpenLove', 'Nome do site', true),
    ('site_description', 'Rede social para encontrar amor', 'Descrição do site', true),
    ('maintenance_mode', 'false', 'Modo de manutenção', true)
ON CONFLICT (setting_key) DO NOTHING;

SELECT 'Script de correção da coluna is_public executado com sucesso!' as status; 