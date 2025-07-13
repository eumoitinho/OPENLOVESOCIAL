-- Script para criar tabela de reações de mensagens
-- Execute este script no seu banco de dados Supabase

-- Criar tabela de reações de mensagens
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL CHECK (reaction IN ('heart', 'thumbsup', 'laugh', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um usuário só pode ter uma reação por mensagem
    UNIQUE(message_id, user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_reaction ON message_reactions(reaction);
CREATE INDEX IF NOT EXISTS idx_message_reactions_created_at ON message_reactions(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Usuários podem ver reações de mensagens em conversas que participam
CREATE POLICY "Users can view reactions in their conversations" ON message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            JOIN messages m ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );

-- Usuários podem adicionar reações em mensagens de conversas que participam
CREATE POLICY "Users can add reactions in their conversations" ON message_reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            JOIN messages m ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Usuários podem atualizar suas próprias reações
CREATE POLICY "Users can update their own reactions" ON message_reactions
    FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar suas próprias reações
CREATE POLICY "Users can delete their own reactions" ON message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_message_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_message_reactions_updated_at
    BEFORE UPDATE ON message_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_message_reactions_updated_at();

-- Função para buscar reações de uma mensagem agrupadas
CREATE OR REPLACE FUNCTION get_message_reactions(message_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_object_agg(
        reaction,
        json_agg(
            json_build_object(
                'id', mr.id,
                'userId', mr.user_id,
                'userName', p.full_name,
                'userAvatar', p.avatar_url,
                'createdAt', mr.created_at
            )
        )
    ) INTO result
    FROM message_reactions mr
    JOIN profiles p ON p.id = mr.user_id
    WHERE mr.message_id = message_id_param
    GROUP BY mr.reaction;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar/atualizar reação
CREATE OR REPLACE FUNCTION add_message_reaction(
    message_id_param UUID,
    reaction_param VARCHAR(50)
)
RETURNS JSON AS $$
DECLARE
    existing_reaction_id UUID;
    result JSON;
BEGIN
    -- Verificar se o usuário participa da conversa
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants cp
        JOIN messages m ON m.conversation_id = cp.conversation_id
        WHERE m.id = message_id_param
        AND cp.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Você não participa desta conversa';
    END IF;

    -- Verificar se já existe uma reação do usuário
    SELECT id INTO existing_reaction_id
    FROM message_reactions
    WHERE message_id = message_id_param
    AND user_id = auth.uid();

    IF existing_reaction_id IS NOT NULL THEN
        -- Atualizar reação existente
        UPDATE message_reactions
        SET reaction = reaction_param,
            updated_at = NOW()
        WHERE id = existing_reaction_id;
        
        result := json_build_object(
            'action', 'updated',
            'message', 'Reação atualizada com sucesso'
        );
    ELSE
        -- Adicionar nova reação
        INSERT INTO message_reactions (message_id, user_id, reaction)
        VALUES (message_id_param, auth.uid(), reaction_param);
        
        result := json_build_object(
            'action', 'added',
            'message', 'Reação adicionada com sucesso'
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE message_reactions IS 'Tabela para armazenar reações dos usuários em mensagens';
COMMENT ON COLUMN message_reactions.reaction IS 'Tipo de reação: heart, thumbsup, laugh, sad, angry';
COMMENT ON FUNCTION get_message_reactions IS 'Função para buscar reações de uma mensagem agrupadas por tipo';
COMMENT ON FUNCTION add_message_reaction IS 'Função para adicionar ou atualizar reação de um usuário em uma mensagem'; 