-- Script para adicionar suporte a posts de áudio e enquetes
-- Data: 2025-01-XX
-- Versão: 1.0

-- 1. Adicionar colunas para áudio e enquetes na tabela posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER, -- duração em segundos
ADD COLUMN IF NOT EXISTS poll_question TEXT,
ADD COLUMN IF NOT EXISTS poll_options JSONB,
ADD COLUMN IF NOT EXISTS poll_votes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS poll_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'audio', 'poll', 'mixed'));

-- 2. Criar tabela para votos de enquetes
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL CHECK (option_index >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- um usuário só pode votar uma vez por enquete
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_audio ON posts(audio_url) WHERE audio_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_poll ON posts(poll_question) WHERE poll_question IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poll_votes_post ON poll_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON poll_votes(user_id);

-- 4. Função para calcular estatísticas de enquete
CREATE OR REPLACE FUNCTION get_poll_stats(post_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    poll_data JSONB;
    vote_counts JSONB := '{}';
    total_votes INTEGER := 0;
    option_count INTEGER;
    i INTEGER;
BEGIN
    -- Buscar dados da enquete
    SELECT poll_options, poll_votes INTO poll_data, vote_counts
    FROM posts WHERE id = post_uuid;
    
    IF poll_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calcular total de votos
    SELECT COUNT(*) INTO total_votes FROM poll_votes WHERE post_id = post_uuid;
    
    -- Calcular votos por opção
    SELECT jsonb_object_agg(option_index::text, votes) INTO vote_counts
    FROM (
        SELECT option_index, COUNT(*) as votes
        FROM poll_votes 
        WHERE post_id = post_uuid 
        GROUP BY option_index
    ) vote_counts;
    
    -- Retornar estatísticas
    RETURN jsonb_build_object(
        'total_votes', total_votes,
        'vote_counts', vote_counts,
        'options', poll_data,
        'percentages', CASE 
            WHEN total_votes > 0 THEN (
                SELECT jsonb_object_agg(option_index::text, ROUND((votes::float / total_votes * 100)::numeric, 1))
                FROM (
                    SELECT option_index, COUNT(*) as votes
                    FROM poll_votes 
                    WHERE post_id = post_uuid 
                    GROUP BY option_index
                ) vote_percentages
            )
            ELSE '{}'::jsonb
        END
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Função para votar em enquete
CREATE OR REPLACE FUNCTION vote_in_poll(
    post_uuid UUID,
    user_uuid UUID,
    option_idx INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    poll_exists BOOLEAN;
    poll_ended BOOLEAN;
    already_voted BOOLEAN;
BEGIN
    -- Verificar se a enquete existe
    SELECT EXISTS(
        SELECT 1 FROM posts 
        WHERE id = post_uuid 
        AND poll_question IS NOT NULL
    ) INTO poll_exists;
    
    IF NOT poll_exists THEN
        RAISE EXCEPTION 'Enquete não encontrada';
    END IF;
    
    -- Verificar se a enquete não expirou
    SELECT (poll_ends_at IS NOT NULL AND poll_ends_at < NOW()) INTO poll_ended
    FROM posts WHERE id = post_uuid;
    
    IF poll_ended THEN
        RAISE EXCEPTION 'Enquete expirada';
    END IF;
    
    -- Verificar se o usuário já votou
    SELECT EXISTS(
        SELECT 1 FROM poll_votes 
        WHERE post_id = post_uuid AND user_id = user_uuid
    ) INTO already_voted;
    
    IF already_voted THEN
        -- Atualizar voto existente
        UPDATE poll_votes 
        SET option_index = option_idx, created_at = NOW()
        WHERE post_id = post_uuid AND user_id = user_uuid;
    ELSE
        -- Inserir novo voto
        INSERT INTO poll_votes (post_id, user_id, option_index)
        VALUES (post_uuid, user_uuid, option_idx);
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para atualizar estatísticas de enquete
CREATE OR REPLACE FUNCTION update_poll_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar poll_votes na tabela posts
    UPDATE posts 
    SET poll_votes = (
        SELECT jsonb_object_agg(option_index::text, votes)
        FROM (
            SELECT option_index, COUNT(*) as votes
            FROM poll_votes 
            WHERE post_id = NEW.post_id 
            GROUP BY option_index
        ) vote_counts
    )
    WHERE id = NEW.post_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_update_poll_stats ON poll_votes;
CREATE TRIGGER trigger_update_poll_stats
    AFTER INSERT OR UPDATE OR DELETE ON poll_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_poll_stats();

-- 7. Função para criar post com áudio
CREATE OR REPLACE FUNCTION create_audio_post(
    user_uuid UUID,
    content_text TEXT,
    audio_url_param TEXT,
    audio_duration_param INTEGER,
    visibility_param VARCHAR(20) DEFAULT 'public'
)
RETURNS UUID AS $$
DECLARE
    new_post_id UUID;
BEGIN
    INSERT INTO posts (
        user_id, 
        content, 
        audio_url, 
        audio_duration, 
        post_type, 
        visibility,
        created_at
    ) VALUES (
        user_uuid,
        content_text,
        audio_url_param,
        audio_duration_param,
        'audio',
        visibility_param,
        NOW()
    ) RETURNING id INTO new_post_id;
    
    RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Função para criar post com enquete
CREATE OR REPLACE FUNCTION create_poll_post(
    user_uuid UUID,
    content_text TEXT,
    poll_question_param TEXT,
    poll_options_param JSONB,
    poll_duration_days INTEGER DEFAULT 7,
    visibility_param VARCHAR(20) DEFAULT 'public'
)
RETURNS UUID AS $$
DECLARE
    new_post_id UUID;
BEGIN
    INSERT INTO posts (
        user_id, 
        content, 
        poll_question, 
        poll_options, 
        poll_ends_at,
        post_type, 
        visibility,
        created_at
    ) VALUES (
        user_uuid,
        content_text,
        poll_question_param,
        poll_options_param,
        NOW() + INTERVAL '1 day' * poll_duration_days,
        'poll',
        visibility_param,
        NOW()
    ) RETURNING id INTO new_post_id;
    
    RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

-- 9. RLS Policies para poll_votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Política para inserir votos (apenas o próprio usuário)
CREATE POLICY "Users can vote in polls" ON poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para visualizar votos (apenas para posts públicos ou amigos)
CREATE POLICY "Users can view poll votes" ON poll_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = post_id
            AND (
                p.visibility = 'public' 
                OR p.user_id = auth.uid()
                OR (
                    p.visibility = 'friends_only' 
                    AND EXISTS (
                        SELECT 1 FROM friendships f
                        WHERE (f.user_id = p.user_id AND f.friend_id = auth.uid())
                        OR (f.friend_id = p.user_id AND f.user_id = auth.uid())
                        AND f.status = 'accepted'
                    )
                )
            )
        )
    );

-- 10. Atualizar RLS policies para posts com áudio/enquetes
DROP POLICY IF EXISTS "Users can view posts" ON posts;
CREATE POLICY "Users can view posts" ON posts
    FOR SELECT USING (
        visibility = 'public' 
        OR user_id = auth.uid()
        OR (
            visibility = 'friends_only' 
            AND EXISTS (
                SELECT 1 FROM friendships f
                WHERE (f.user_id = posts.user_id AND f.friend_id = auth.uid())
                OR (f.friend_id = posts.user_id AND f.user_id = auth.uid())
                AND f.status = 'accepted'
            )
        )
    );

-- 11. Comentários para documentação
COMMENT ON COLUMN posts.audio_url IS 'URL do arquivo de áudio no storage';
COMMENT ON COLUMN posts.audio_duration IS 'Duração do áudio em segundos';
COMMENT ON COLUMN posts.poll_question IS 'Pergunta da enquete';
COMMENT ON COLUMN posts.poll_options IS 'Array de opções da enquete';
COMMENT ON COLUMN posts.poll_votes IS 'Contagem de votos por opção (JSON)';
COMMENT ON COLUMN posts.poll_ends_at IS 'Data de expiração da enquete';
COMMENT ON COLUMN posts.post_type IS 'Tipo do post: text, image, video, audio, poll, mixed';

COMMENT ON TABLE poll_votes IS 'Tabela para armazenar votos individuais em enquetes';
COMMENT ON COLUMN poll_votes.option_index IS 'Índice da opção escolhida (0-based)';

-- 12. Verificar se as alterações foram aplicadas
DO $$
BEGIN
    -- Verificar se as colunas foram adicionadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'audio_url'
    ) THEN
        RAISE EXCEPTION 'Coluna audio_url não foi adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'poll_question'
    ) THEN
        RAISE EXCEPTION 'Coluna poll_question não foi adicionada';
    END IF;
    
    RAISE NOTICE 'Script executado com sucesso! Posts de áudio e enquetes habilitados.';
END $$; 