-- OpenLove Sample Data
-- Este script insere dados de exemplo para testar a aplicação
-- Alinhado com o schema do projeto ConnectHub e corrigindo erros de sintaxe JSON

-- Inserir usuários de exemplo
INSERT INTO users (
    email, username, name, bio, avatar_url, location, age, gender,
    interests, relationship_status, looking_for, is_premium, is_verified,
    privacy_settings, stats
) VALUES 
-- Usuários Premium
(
    'maria.silva@email.com', 'maria_silva', 'Maria Silva',
    'Amo viajar, conhecer pessoas novas e viver experiências únicas! Sempre em busca de conexões verdadeiras.',
    '/placeholder.svg?height=100&width=100', 'Rio de Janeiro, RJ', 28, 'Feminino',
    ARRAY['Viagens', 'Fotografia', 'Gastronomia', 'Praia', 'Música']::TEXT[],
    'Solteira', ARRAY['Relacionamento sério', 'Amizades']::TEXT[],
    true, true,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 45, "followers": 1250, "following": 320, "likes_received": 2100, "comments_received": 450, "profile_views": 5600, "earnings": 850.50}'::jsonb
),
(
    'joao.santos@email.com', 'joao_santos', 'João Santos',
    'Empresário apaixonado por tecnologia e inovação. Procuro pessoas interessantes para compartilhar momentos especiais.',
    '/placeholder.svg?height=100&width=100', 'São Paulo, SP', 32, 'Masculino',
    ARRAY['Tecnologia', 'Negócios', 'Esportes', 'Cinema', 'Culinária']::TEXT[],
    'Solteiro', ARRAY['Relacionamento sério', 'Networking']::TEXT[],
    true, true,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 67, "followers": 2100, "following": 180, "likes_received": 3200, "comments_received": 680, "profile_views": 8900, "earnings": 1250.75}'::jsonb
),
(
    'ana.costa@email.com', 'ana_costa', 'Ana Costa',
    'Artista e designer gráfica. Amo arte, cultura e pessoas criativas. Sempre aberta a novas experiências!',
    '/placeholder.svg?height=100&width=100', 'Belo Horizonte, MG', 26, 'Feminino',
    ARRAY['Arte', 'Design', 'Cultura', 'Música', 'Teatro']::TEXT[],
    'Solteira', ARRAY['Relacionamento casual', 'Amizades', 'Networking']::TEXT[],
    true, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 89, "followers": 1800, "following": 450, "likes_received": 2800, "comments_received": 520, "profile_views": 6700, "earnings": 650.25}'::jsonb
),
-- Usuários Gratuitos
(
    'carlos.oliveira@email.com', 'carlos_oliveira', 'Carlos Oliveira',
    'Professor de educação física, amo esportes e vida saudável. Procuro alguém para compartilhar aventuras!',
    '/placeholder.svg?height=100&width=100', 'Porto Alegre, RS', 29, 'Masculino',
    ARRAY['Esportes', 'Fitness', 'Natureza', 'Aventura']::TEXT[],
    'Solteiro', ARRAY['Relacionamento sério']::TEXT[],
    false, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 23, "followers": 340, "following": 120, "likes_received": 450, "comments_received": 89, "profile_views": 1200, "earnings": 0}'::jsonb
),
(
    'lucia.ferreira@email.com', 'lucia_ferreira', 'Lúcia Ferreira',
    'Enfermeira dedicada, amo cuidar das pessoas. Procuro alguém carinhoso e sincero para dividir a vida.',
    '/placeholder.svg?height=100&width=100', 'Salvador, BA', 31, 'Feminino',
    ARRAY['Saúde', 'Cuidados', 'Família', 'Leitura']::TEXT[],
    'Divorciada', ARRAY['Relacionamento sério']::TEXT[],
    false, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "friends", "show_online_status": true}'::jsonb,
    '{"posts": 18, "followers": 280, "following": 95, "likes_received": 320, "comments_received": 67, "profile_views": 890, "earnings": 0}'::jsonb
),
(
    'pedro.almeida@email.com', 'pedro_almeida', 'Pedro Almeida',
    'Músico e compositor. A música é minha paixão! Procuro alguém que compartilhe do amor pela arte.',
    '/placeholder.svg?height=100&width=100', 'Recife, PE', 27, 'Masculino',
    ARRAY['Música', 'Composição', 'Arte', 'Shows']::TEXT[],
    'Solteiro', ARRAY['Relacionamento casual', 'Amizades']::TEXT[],
    false, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 34, "followers": 520, "following": 200, "likes_received": 680, "comments_received": 145, "profile_views": 1500, "earnings": 0}'::jsonb
),
(
    'fernanda.lima@email.com', 'fernanda_lima', 'Fernanda Lima',
    'Advogada e ativista. Luto por justiça e igualdade. Procuro pessoas conscientes e engajadas.',
    '/placeholder.svg?height=100&width=100', 'Brasília, DF', 33, 'Feminino',
    ARRAY['Direito', 'Ativismo', 'Política', 'Justiça Social']::TEXT[],
    'Solteira', ARRAY['Relacionamento sério', 'Networking']::TEXT[],
    false, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 41, "followers": 750, "following": 180, "likes_received": 920, "comments_received": 210, "profile_views": 2100, "earnings": 0}'::jsonb
),
(
    'rafael.costa@email.com', 'rafael_costa', 'Rafael Costa',
    'Chef de cozinha apaixonado por gastronomia. Amo criar pratos especiais e momentos únicos.',
    '/placeholder.svg?height=100&width=100', 'Florianópolis, SC', 30, 'Masculino',
    ARRAY['Gastronomia', 'Culinária', 'Vinhos', 'Restaurantes']::TEXT[],
    'Solteiro', ARRAY['Relacionamento sério', 'Amizades']::TEXT[],
    false, false,
    '{"profile_visibility": "public", "show_age": true, "show_location": true, "allow_messages": "everyone", "show_online_status": true}'::jsonb,
    '{"posts": 29, "followers": 420, "following": 150, "likes_received": 580, "comments_received": 120, "profile_views": 1300, "earnings": 0}'::jsonb
);

-- Criar relacionamentos de seguir
INSERT INTO follows (follower_id, following_id) 
SELECT u1.id, u2.id 
FROM users u1, users u2 
WHERE u1.username IN ('maria_silva', 'joao_santos', 'ana_costa', 'carlos_oliveira')
AND u2.username IN ('lucia_ferreira', 'pedro_almeida', 'fernanda_lima', 'rafael_costa')
AND u1.id != u2.id;

-- Inserir posts de exemplo
INSERT INTO posts (
    user_id, content, media_urls, media_types, hashtags, visibility, location, stats
) VALUES 
(
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Que dia incrível na praia de Copacabana! O pôr do sol estava simplesmente mágico hoje. Nada melhor que aproveitar esses momentos únicos que a vida nos oferece. 🌅',
    ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image', 'image']::TEXT[],
    ARRAY['#praia', '#copacabana', '#pordesol', '#riodejaneiro', '#momentomagico']::TEXT[],
    'public',
    'Copacabana, Rio de Janeiro',
    '{"likes": 89, "comments": 23, "shares": 12, "views": 450}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Experimentando a nova culinária japonesa no centro da cidade! A apresentação dos pratos é uma verdadeira obra de arte. Recomendo muito este lugar para quem aprecia boa gastronomia.',
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image']::TEXT[],
    ARRAY['#gastronomia', '#culinarijaponesa', '#arte', '#recomendo']::TEXT[],
    'public',
    'Centro, Rio de Janeiro',
    '{"likes": 67, "comments": 18, "shares": 8, "views": 320}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Acabei de finalizar mais um projeto incrível! A tecnologia realmente pode transformar vidas e negócios. Muito orgulhoso da equipe que trabalhou comigo neste desafio.',
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image']::TEXT[],
    ARRAY['#tecnologia', '#inovacao', '#projeto', '#equipe', '#transformacao']::TEXT[],
    'public',
    'São Paulo, SP',
    '{"likes": 124, "comments": 31, "shares": 19, "views": 680}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Treino matinal concluído! Começar o dia cuidando da saúde é fundamental. Quem mais está mantendo a rotina de exercícios?',
    ARRAY['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image', 'image']::TEXT[],
    ARRAY['#treino', '#saude', '#rotina', '#exercicios', '#bemestar']::TEXT[],
    'public',
    'São Paulo, SP',
    '{"likes": 78, "comments": 15, "shares": 6, "views": 290}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Finalizando mais uma arte digital! Este projeto me desafiou muito, mas o resultado ficou exatamente como imaginei. A criatividade não tem limites!',
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image']::TEXT[],
    ARRAY['#arte', '#design', '#criatividade', '#digital', '#projeto']::TEXT[],
    'public',
    'Belo Horizonte, MG',
    '{"likes": 156, "comments": 42, "shares": 28, "views": 890}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'carlos_oliveira'),
    'Trilha incrível hoje pela manhã! A natureza sempre nos surpreende com sua beleza. Quem quer se juntar na próxima aventura?',
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image']::TEXT[],
    ARRAY['#trilha', '#natureza', '#aventura', '#beleza']::TEXT[],
    'public',
    'Porto Alegre, RS',
    '{"likes": 34, "comments": 8, "shares": 3, "views": 120}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'lucia_ferreira'),
    'Mais um dia de trabalho gratificante no hospital. Cuidar das pessoas é minha maior paixão. Cada sorriso que recebo vale todo o esforço.',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY['#enfermagem', '#cuidado', '#hospital', '#gratidao']::TEXT[],
    'public',
    'Salvador, BA',
    '{"likes": 45, "comments": 12, "shares": 5, "views": 180}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'pedro_almeida'),
    'Ensaiando para o show de amanhã! A música tem o poder de conectar almas e tocar corações. Espero vocês lá!',
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    ARRAY['image']::TEXT[],
    ARRAY['#musica', '#show', '#ensaio', '#alma', '#coracao']::TEXT[],
    'public',
    'Recife, PE',
    '{"likes": 67, "comments": 19, "shares": 11, "views": 250}'::jsonb
);

-- Inserir comentários
INSERT INTO comments (post_id, user_id, content, stats) VALUES 
(
    (SELECT id FROM posts WHERE content LIKE '%Copacabana%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Que foto incrível, Maria! O Rio realmente tem os pores do sol mais bonitos do Brasil.',
    '{"likes": 5, "replies": 1}'::jsonb
),
(
    (SELECT id FROM posts WHERE content LIKE '%Copacabana%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Perfeito! Adoro esse lugar, sempre que vou ao Rio passo por lá.',
    '{"likes": 3, "replies": 0}'::jsonb
),
(
    (SELECT id FROM posts WHERE content LIKE '%tecnologia%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Parabéns pelo projeto, João! Você é realmente inspirador.',
    '{"likes": 8, "replies": 2}'::jsonb
),
(
    (SELECT id FROM posts WHERE content LIKE '%arte digital%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'pedro_almeida'),
    'Sua arte é sempre incrível, Ana! Muito talento.',
    '{"likes": 12, "replies": 1}'::jsonb
);

-- Inserir likes
INSERT INTO likes (user_id, target_type, target_id) 
SELECT u.id, 'post', p.id
FROM users u, posts p
WHERE u.username IN ('maria_silva', 'joao_santos', 'ana_costa', 'carlos_oliveira', 'lucia_ferreira')
AND p.user_id != u.id
LIMIT 50;

-- Inserir conversas
INSERT INTO conversations (type, created_by, last_message_at) VALUES 
('direct', (SELECT id FROM users WHERE username = 'maria_silva'), NOW() - INTERVAL '2 hours'),
('direct', (SELECT id FROM users WHERE username = 'joao_santos'), NOW() - INTERVAL '1 hour'),
('direct', (SELECT id FROM users WHERE username = 'ana_costa'), NOW() - INTERVAL '30 minutes');

-- Inserir participantes das conversas
INSERT INTO conversation_participants (conversation_id, user_id, last_read_at) VALUES 
-- Conversa 1: Maria e João
((SELECT id FROM conversations LIMIT 1 OFFSET 0), (SELECT id FROM users WHERE username = 'maria_silva'), NOW() - INTERVAL '2 hours'),
((SELECT id FROM conversations LIMIT 1 OFFSET 0), (SELECT id FROM users WHERE username = 'joao_santos'), NOW() - INTERVAL '1 hour'),
-- Conversa 2: João e Ana
((SELECT id FROM conversations LIMIT 1 OFFSET 1), (SELECT id FROM users WHERE username = 'joao_santos'), NOW() - INTERVAL '1 hour'),
((SELECT id FROM conversations LIMIT 1 OFFSET 1), (SELECT id FROM users WHERE username = 'ana_costa'), NOW() - INTERVAL '45 minutes'),
-- Conversa 3: Ana e Carlos
((SELECT id FROM conversations LIMIT 1 OFFSET 2), (SELECT id FROM users WHERE username = 'ana_costa'), NOW() - INTERVAL '30 minutes'),
((SELECT id FROM conversations LIMIT 1 OFFSET 2), (SELECT id FROM users WHERE username = 'carlos_oliveira'), NOW() - INTERVAL '25 minutes');

-- Inserir mensagens
INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES 
-- Conversa Maria e João
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 0),
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Oi João! Vi seu post sobre o projeto, parabéns! Ficou incrível.',
    'text'
),
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 0),
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Oi Maria! Muito obrigado! Seu feedback sempre é muito importante para mim.',
    'text'
),
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 0),
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Que tal marcarmos um café para conversarmos mais sobre seus projetos?',
    'text'
),
-- Conversa João e Ana
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 1),
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Ana, sua arte digital ficou sensacional! Você tem um talento incrível.',
    'text'
),
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 1),
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Muito obrigada, João! Fico feliz que tenha gostado. Sempre busco me superar.',
    'text'
),
-- Conversa Ana e Carlos
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 2),
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Carlos, vi que você fez uma trilha incrível! Adoro natureza também.',
    'text'
),
(
    (SELECT id FROM conversations LIMIT 1 OFFSET 2),
    (SELECT id FROM users WHERE username = 'carlos_oliveira'),
    'Oi Ana! Que legal! Você gostaria de se juntar na próxima trilha?',
    'text'
);

-- Inserir eventos
INSERT INTO events (
    creator_id, title, description, event_date, location, max_participants,
    price, is_premium_only, category, tags, settings
) VALUES 
(
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Encontro na Praia de Copacabana',
    'Vamos nos encontrar para assistir o pôr do sol na praia mais famosa do Rio! Será um momento mágico para conhecer pessoas novas e fazer amizades.',
    NOW() + INTERVAL '3 days',
    'Praia de Copacabana, Rio de Janeiro',
    20, 0, false, 'Social',
    ARRAY['praia', 'por-do-sol', 'amizades', 'rio-de-janeiro']::TEXT[],
    '{"allow_guests": true, "require_approval": false, "is_private": false, "allow_photos": true}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'Workshop de Tecnologia e Inovação',
    'Workshop exclusivo sobre as últimas tendências em tecnologia. Ideal para empreendedores e profissionais da área tech.',
    NOW() + INTERVAL '1 week',
    'Centro de Convenções, São Paulo',
    50, 150.00, true, 'Profissional',
    ARRAY['tecnologia', 'inovacao', 'workshop', 'empreendedorismo']::TEXT[],
    '{"allow_guests": false, "require_approval": true, "is_private": false, "allow_photos": true}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Exposição de Arte Digital',
    'Vernissage da minha nova exposição de arte digital. Venham conhecer meus trabalhos mais recentes!',
    NOW() + INTERVAL '5 days',
    'Galeria de Arte Moderna, Belo Horizonte',
    30, 25.00, false, 'Cultural',
    ARRAY['arte', 'exposicao', 'digital', 'cultura']::TEXT[],
    '{"allow_guests": true, "require_approval": false, "is_private": false, "allow_photos": true}'::jsonb
),
(
    (SELECT id FROM users WHERE username = 'pedro_almeida'),
    'Show Acústico no Bar',
    'Apresentação especial com minhas composições autorais. Ambiente intimista e acolhedor.',
    NOW() + INTERVAL '2 days',
    'Bar do Pedro, Recife',
    40, 30.00, false, 'Entretenimento',
    ARRAY['musica', 'show', 'acustico', 'composicoes']::TEXT[],
    '{"allow_guests": true, "require_approval": false, "is_private": false, "allow_photos": true}'::jsonb
);

-- Inserir participantes nos eventos
INSERT INTO event_participants (event_id, user_id, status) VALUES 
-- Evento da Maria
((SELECT id FROM events WHERE title LIKE '%Copacabana%'), (SELECT id FROM users WHERE username = 'joao_santos'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Copacabana%'), (SELECT id FROM users WHERE username = 'ana_costa'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Copacabana%'), (SELECT id FROM users WHERE username = 'carlos_oliveira'), 'maybe'),
-- Evento do João
((SELECT id FROM events WHERE title LIKE '%Workshop%'), (SELECT id FROM users WHERE username = 'maria_silva'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Workshop%'), (SELECT id FROM users WHERE username = 'ana_costa'), 'going'),
-- Evento da Ana
((SELECT id FROM events WHERE title LIKE '%Exposição%'), (SELECT id FROM users WHERE username = 'maria_silva'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Exposição%'), (SELECT id FROM users WHERE username = 'pedro_almeida'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Exposição%'), (SELECT id FROM users WHERE username = 'rafael_costa'), 'maybe'),
-- Evento do Pedro
((SELECT id FROM events WHERE title LIKE '%Show%'), (SELECT id FROM users WHERE username = 'ana_costa'), 'going'),
((SELECT id FROM events WHERE title LIKE '%Show%'), (SELECT id FROM users WHERE username = 'lucia_ferreira'), 'going');

-- Atualizar contadores de participantes nos eventos
UPDATE events SET current_participants = (
    SELECT COUNT(*) FROM event_participants ep 
    WHERE ep.event_id = events.id AND ep.status = 'going'
);

-- Inserir notificações (corrigido para usar jsonb_build_object)
INSERT INTO notifications (user_id, type, title, content, data, is_read) VALUES 
(
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'like',
    'João Santos curtiu seu post',
    'Seu post sobre Copacabana recebeu uma nova curtida',
    jsonb_build_object(
        'post_id', (SELECT id FROM posts WHERE content LIKE '%Copacabana%' LIMIT 1)::text,
        'user_id', (SELECT id FROM users WHERE username = 'joao_santos')::text
    ),
    false
),
(
    (SELECT id FROM users WHERE username = 'joao_santos'),
    'comment',
    'Maria Silva comentou em seu post',
    'Parabéns pelo projeto, João! Você é realmente inspirador.',
    jsonb_build_object(
        'post_id', (SELECT id FROM posts WHERE content LIKE '%tecnologia%' LIMIT 1)::text,
        'user_id', (SELECT id FROM users WHERE username = 'maria_silva')::text
    ),
    false
),
(
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'follow',
    'Carlos Oliveira começou a seguir você',
    'Você tem um novo seguidor',
    jsonb_build_object(
        'user_id', (SELECT id FROM users WHERE username = 'carlos_oliveira')::text
    ),
    false
),
(
    (SELECT id FROM users WHERE username = 'pedro_almeida'),
    'event_join',
    'Ana Costa confirmou presença no seu evento',
    'Ana Costa confirmou presença no Show Acústico no Bar',
    jsonb_build_object(
        'event_id', (SELECT id FROM events WHERE title LIKE '%Show%' LIMIT 1)::text,
        'user_id', (SELECT id FROM users WHERE username = 'ana_costa')::text
    ),
    false
);

-- Inserir conteúdo premium
INSERT INTO premium_content (
    creator_id, title, description, price, media_urls, preview_url, category, tags
) VALUES 
(
    (SELECT id FROM users WHERE username = 'maria_silva'),
    'Ensaio Fotográfico Exclusivo - Praia',
    'Coleção exclusiva de fotos do meu ensaio na praia. Conteúdo artístico e sensual.',
    49.90,
    ARRAY['/placeholder.svg?height=600&width=400', '/placeholder.svg?height=600&width=400', '/placeholder.svg?height=600&width=400']::TEXT[],
    '/placeholder.svg?height=300&width=200',
    'Fotografia',
    ARRAY['ensaio', 'praia', 'exclusivo', 'artistico']::TEXT[]
),
(
    (SELECT id FROM users WHERE username = 'ana_costa'),
    'Tutorial de Arte Digital Avançada',
    'Curso completo sobre técnicas avançadas de arte digital. Inclui arquivos de projeto.',
    89.90,
    ARRAY['/placeholder.svg?height=400&width=600']::TEXT[],
    '/placeholder.svg?height=200&width=300',
    'Educação',
    ARRAY['tutorial', 'arte-digital', 'curso', 'tecnicas']::TEXT[]
);
