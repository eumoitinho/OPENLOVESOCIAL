-- Dados de exemplo para testar o sistema de timeline
-- Este script popula o banco com dados realistas para desenvolvimento

-- Inserir alguns usuários de exemplo (se não existirem)
INSERT INTO profiles (id, username, full_name, email, avatar_url, is_verified, bio, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'maria_silva', 'Maria Silva', 'maria@example.com', 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png', true, 'Desenvolvedora apaixonada por tecnologia 💻', NOW() - INTERVAL '30 days'),
    ('550e8400-e29b-41d4-a716-446655440002', 'joao_santos', 'João Santos', 'joao@example.com', 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png', false, 'Designer UI/UX criativo 🎨', NOW() - INTERVAL '25 days'),
    ('550e8400-e29b-41d4-a716-446655440003', 'ana_costa', 'Ana Costa', 'ana@example.com', 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png', true, 'Empreendedora digital 🚀', NOW() - INTERVAL '20 days'),
    ('550e8400-e29b-41d4-a716-446655440004', 'pedro_lima', 'Pedro Lima', 'pedro@example.com', 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png', false, 'Fotógrafo profissional 📸', NOW() - INTERVAL '15 days'),
    ('550e8400-e29b-41d4-a716-446655440005', 'carla_mendes', 'Carla Mendes', 'carla@example.com', 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png', true, 'Marketing digital e growth 📈', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Inserir posts de exemplo com diferentes tipos e conteúdos
INSERT INTO posts (id, author_id, content, post_type, visibility, media_urls, hashtags, mentions, location, engagement_score, view_count, share_count, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Acabei de lançar meu novo projeto em React! 🚀 Muito animada para compartilhar com vocês. O que acham?', 'text', 'public', '{}', '{"react", "javascript", "webdev", "projeto"}', '{}', 'São Paulo, SP', 45, 234, 12, NOW() - INTERVAL '2 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Design é sobre resolver problemas, não apenas fazer algo bonito ✨', 'text', 'public', '{}', '{"design", "ux", "ui", "criatividade"}', '{}', NULL, 67, 189, 8, NOW() - INTERVAL '4 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Perdidos nas cores da noite 🌌✨ Às vezes o desfoque revela mais que a clareza.', 'image', 'public', '{"https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png"}', '{"AbstractVibes", "Dreamscape", "VisualPoetry", "arte"}', '{}', 'Rio de Janeiro, RJ', 123, 456, 23, NOW() - INTERVAL '6 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Sessão de fotos incrível hoje! A luz estava perfeita 📸☀️', 'image', 'public', '{"https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png"}', '{"fotografia", "luz", "sessao", "profissional"}', '{}', 'Belo Horizonte, MG', 89, 312, 15, NOW() - INTERVAL '8 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Dicas de growth hacking que mudaram meu negócio: 1) Foque no produto 2) Meça tudo 3) Teste constantemente 📊', 'text', 'public', '{}', '{"growth", "marketing", "dicas", "empreendedorismo"}', '{}', NULL, 156, 678, 34, NOW() - INTERVAL '10 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Trabalhando no novo sistema de autenticação. Segurança em primeiro lugar! 🔐', 'text', 'friends', '{}', '{"seguranca", "auth", "desenvolvimento"}', '{}', NULL, 23, 89, 4, NOW() - INTERVAL '12 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Evento de networking foi incrível! Conheci pessoas fantásticas 🤝', 'text', 'public', '{}', '{"networking", "evento", "conexoes"}', '{}', 'São Paulo, SP', 78, 234, 11, NOW() - INTERVAL '1 day'),
    
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Novo projeto de branding em andamento. Cores vibrantes e identidade única! 🎨', 'image', 'public', '{"https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png"}', '{"branding", "design", "cores", "identidade"}', '{}', NULL, 134, 445, 19, NOW() - INTERVAL '1 day 2 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Golden hour no centro da cidade. Magia pura! ✨📷', 'image', 'public', '{"https://cdn.shadcnstudio.com/ss-assets/components/card/image-4.png"}', '{"goldenhour", "fotografia", "cidade", "magia"}', '{}', 'Centro, SP', 201, 567, 28, NOW() - INTERVAL '1 day 4 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'Métricas do mês: +150% de crescimento! Estratégia funcionando 📈🎉', 'text', 'public', '{}', '{"metricas", "crescimento", "estrategia", "sucesso"}', '{}', NULL, 267, 789, 45, NOW() - INTERVAL '1 day 6 hours');

-- Inserir interações com os posts
INSERT INTO post_interactions (post_id, user_id, interaction_type, created_at)
VALUES 
    -- Likes no primeiro post
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'like', NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'love', NOW() - INTERVAL '1 hour 30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'like', NOW() - INTERVAL '45 minutes'),
    
    -- Interações no post de design
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'like', NOW() - INTERVAL '3 hours'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'love', NOW() - INTERVAL '3 hours 15 minutes'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'wow', NOW() - INTERVAL '2 hours 45 minutes'),
    
    -- Muitas interações no post com imagem
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'love', NOW() - INTERVAL '5 hours'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'wow', NOW() - INTERVAL '5 hours 20 minutes'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'like', NOW() - INTERVAL '4 hours 30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'love', NOW() - INTERVAL '4 hours'),
    
    -- Interações diversas nos outros posts
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'like', NOW() - INTERVAL '7 hours'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'love', NOW() - INTERVAL '7 hours 15 minutes'),
    
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'like', NOW() - INTERVAL '9 hours'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'wow', NOW() - INTERVAL '9 hours 30 minutes'),
    
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'love', NOW() - INTERVAL '1 day 5 hours'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'wow', NOW() - INTERVAL '1 day 5 hours 15 minutes'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'like', NOW() - INTERVAL '1 day 5 hours 30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'love', NOW() - INTERVAL '1 day 5 hours 45 minutes');

-- Inserir alguns comentários
INSERT INTO comments (id, post_id, author_id, content, created_at)
VALUES 
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Parabéns! Ficou incrível o projeto! 👏', NOW() - INTERVAL '1 hour 15 minutes'),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Adorei a interface! Quando vai estar disponível?', NOW() - INTERVAL '50 minutes'),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Que foto linda! A composição está perfeita 📸', NOW() - INTERVAL '4 hours 15 minutes'),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Dicas valiosas! Vou aplicar no meu projeto', NOW() - INTERVAL '9 hours 15 minutes'),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Que crescimento incrível! Qual foi o segredo?', NOW() - INTERVAL '1 day 5 hours 20 minutes');

-- Inserir compartilhamentos
INSERT INTO post_shares (post_id, user_id, share_type, message, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'direct', 'Olha que projeto legal!', NOW() - INTERVAL '1 hour 30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'story', NULL, NOW() - INTERVAL '4 hours 45 minutes'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'direct', 'Dicas importantes para empreendedores!', NOW() - INTERVAL '9 hours 20 minutes'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'direct', 'Inspirador! 📈', NOW() - INTERVAL '1 day 5 hours 30 minutes');

-- Inserir posts salvos
INSERT INTO saved_posts (post_id, user_id, collection_name, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Projetos Inspiradores', NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Arte e Design', NOW() - INTERVAL '4 hours'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Dicas de Negócio', NOW() - INTERVAL '9 hours'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Crescimento', NOW() - INTERVAL '1 day 5 hours');

-- Inserir anúncios de exemplo
INSERT INTO advertisements (id, title, description, image_url, link_url, ad_type, target_audience, budget_daily, budget_total, is_active, created_by, created_at)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', 'Dreamy Colorwave Gradient', 'Uma mistura suave de rosas vibrantes, roxos e azuis para um toque mágico.', 'https://cdn.shadcnstudio.com/ss-assets/components/card/image-3.png', 'https://example.com/gradient-pack', 'banner', '{"interests": ["design", "arte"], "age_range": [18, 45]}', 50.00, 1500.00, true, '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days'),
    
    ('880e8400-e29b-41d4-a716-446655440002', 'Ethereal Swirl Gradient', 'Gradientes suaves e fluidos misturando vermelhos ricos e azuis em um redemoinho abstrato.', 'https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png', 'https://example.com/swirl-collection', 'sponsored_post', '{"interests": ["fotografia", "design"], "location": ["São Paulo", "Rio de Janeiro"]}', 75.00, 2250.00, true, '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '1 day'),
    
    ('880e8400-e29b-41d4-a716-446655440003', 'Curso de Growth Marketing', 'Aprenda as estratégias que aumentaram nosso faturamento em 300% em 6 meses!', 'https://cdn.shadcnstudio.com/ss-assets/components/card/image-4.png', 'https://example.com/curso-growth', 'video_ad', '{"interests": ["marketing", "empreendedorismo"], "age_range": [25, 50]}', 100.00, 5000.00, true, '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '3 days');

-- Inserir métricas dos anúncios
INSERT INTO ad_metrics (ad_id, impressions, clicks, conversions, spend, date)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', 1250, 45, 3, 45.50, CURRENT_DATE - INTERVAL '2 days'),
    ('880e8400-e29b-41d4-a716-446655440001', 1890, 67, 5, 48.75, CURRENT_DATE - INTERVAL '1 day'),
    ('880e8400-e29b-41d4-a716-446655440001', 2100, 78, 7, 52.00, CURRENT_DATE),
    
    ('880e8400-e29b-41d4-a716-446655440002', 2340, 89, 12, 71.25, CURRENT_DATE - INTERVAL '1 day'),
    ('880e8400-e29b-41d4-a716-446655440002', 2567, 95, 15, 74.50, CURRENT_DATE),
    
    ('880e8400-e29b-41d4-a716-446655440003', 3450, 156, 23, 98.75, CURRENT_DATE - INTERVAL '3 days'),
    ('880e8400-e29b-41d4-a716-446655440003', 3789, 167, 28, 102.50, CURRENT_DATE - INTERVAL '2 days'),
    ('880e8400-e29b-41d4-a716-446655440003', 4123, 189, 34, 105.00, CURRENT_DATE - INTERVAL '1 day'),
    ('880e8400-e29b-41d4-a716-446655440003', 4456, 201, 41, 108.25, CURRENT_DATE);

-- Inserir interações com anúncios
INSERT INTO ad_interactions (ad_id, user_id, interaction_type, created_at)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'view', NOW() - INTERVAL '2 hours'),
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'click', NOW() - INTERVAL '1 hour 45 minutes'),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'view', NOW() - INTERVAL '3 hours'),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'click', NOW() - INTERVAL '2 hours 30 minutes'),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'view', NOW() - INTERVAL '4 hours'),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'click', NOW() - INTERVAL '3 hours 15 minutes'),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'conversion', NOW() - INTERVAL '2 hours 45 minutes');

-- Inserir preferências do timeline
INSERT INTO timeline_preferences (user_id, show_reposts, show_ads, content_filter, preferred_languages, algorithm_preference)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', true, true, '{"nsfw": false, "violence": false}', '{"pt", "en"}', 'engagement'),
    ('550e8400-e29b-41d4-a716-446655440002', true, false, '{"nsfw": false, "violence": false}', '{"pt"}', 'chronological'),
    ('550e8400-e29b-41d4-a716-446655440003', false, true, '{"nsfw": false, "violence": true}', '{"pt", "en", "es"}', 'balanced'),
    ('550e8400-e29b-41d4-a716-446655440004', true, true, '{"nsfw": true, "violence": false}', '{"pt", "en"}', 'balanced'),
    ('550e8400-e29b-41d4-a716-446655440005', true, true, '{"nsfw": false, "violence": false}', '{"pt"}', 'engagement');

-- Inserir hashtags em tendência
INSERT INTO trending_hashtags (hashtag, usage_count, trend_score, category, date)
VALUES 
    ('react', 45, 89.5, 'tecnologia', CURRENT_DATE),
    ('design', 67, 134.2, 'criatividade', CURRENT_DATE),
    ('fotografia', 34, 68.8, 'arte', CURRENT_DATE),
    ('marketing', 56, 112.4, 'negócios', CURRENT_DATE),
    ('javascript', 23, 46.9, 'tecnologia', CURRENT_DATE),
    ('empreendedorismo', 78, 156.7, 'negócios', CURRENT_DATE),
    ('arte', 89, 178.3, 'criatividade', CURRENT_DATE),
    ('growth', 45, 90.1, 'negócios', CURRENT_DATE),
    ('webdev', 34, 68.5, 'tecnologia', CURRENT_DATE),
    ('ux', 56, 112.8, 'design', CURRENT_DATE);

-- Inserir algumas visualizações de posts
INSERT INTO post_views (post_id, user_id, view_duration, created_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 15, NOW() - INTERVAL '1 hour'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 23, NOW() - INTERVAL '1 hour 15 minutes'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 45, NOW() - INTERVAL '5 hours'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 67, NOW() - INTERVAL '4 hours 30 minutes'),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 89, NOW() - INTERVAL '1 day 5 hours');

-- Atualizar engagement scores de todos os posts
UPDATE posts SET engagement_score = calculate_engagement_score(id);

-- Verificar se os dados foram inseridos corretamente
SELECT 'Posts inseridos:' as info, COUNT(*) as total FROM posts WHERE created_at >= CURRENT_DATE - INTERVAL '2 days';
SELECT 'Interações inseridas:' as info, COUNT(*) as total FROM post_interactions;
SELECT 'Comentários inseridos:' as info, COUNT(*) as total FROM comments WHERE created_at >= CURRENT_DATE - INTERVAL '2 days';
SELECT 'Anúncios inseridos:' as info, COUNT(*) as total FROM advertisements;
SELECT 'Hashtags trending:' as info, COUNT(*) as total FROM trending_hashtags WHERE date = CURRENT_DATE;
