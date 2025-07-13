-- Script para criar notificações de teste
-- Substitua o user_id pelos IDs reais dos usuários do seu banco

-- Primeiro, vamos pegar um user_id válido
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Inserir notificações de teste
        INSERT INTO notifications (user_id, type, title, content, data, is_read, created_at) VALUES
        (test_user_id, 'like', 'João curtiu seu post', 'Seu post recebeu uma nova curtida', '{"post_id": "123e4567-e89b-12d3-a456-426614174000", "user_id": "123e4567-e89b-12d3-a456-426614174001"}', false, NOW() - INTERVAL '5 minutes'),
        (test_user_id, 'comment', 'Maria comentou em seu post', 'Que foto incrível! Adoraria participar do próximo evento!', '{"post_id": "123e4567-e89b-12d3-a456-426614174000", "comment_id": "123e4567-e89b-12d3-a456-426614174002", "user_id": "123e4567-e89b-12d3-a456-426614174003"}', false, NOW() - INTERVAL '15 minutes'),
        (test_user_id, 'follow', 'Pedro começou a seguir você', 'Você tem um novo seguidor', '{"user_id": "123e4567-e89b-12d3-a456-426614174004"}', true, NOW() - INTERVAL '1 hour'),
        (test_user_id, 'event', 'Novo evento próximo de você', 'Workshop de Fotografia Íntima em São Paulo', '{"event_id": "123e4567-e89b-12d3-a456-426614174005", "location": "São Paulo, SP"}', false, NOW() - INTERVAL '2 hours'),
        (test_user_id, 'mention', 'Você foi mencionado em um post', 'Ana mencionou você em uma publicação sobre eventos', '{"post_id": "123e4567-e89b-12d3-a456-426614174006", "user_id": "123e4567-e89b-12d3-a456-426614174007"}', true, NOW() - INTERVAL '3 hours'),
        (test_user_id, 'system', 'Bem-vindo ao OpenLove!', 'Sua conta foi criada com sucesso. Explore a comunidade!', '{}', true, NOW() - INTERVAL '1 day');
        
        RAISE NOTICE 'Notificações de teste criadas para o usuário: %', test_user_id;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para criar notificações de teste';
    END IF;
END $$;

-- Verificar as notificações criadas
SELECT 
    id,
    type,
    title,
    content,
    is_read,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10; 