-- Insert sample posts for testing timeline functionality
-- Note: Replace the UUIDs with actual user IDs from your profiles table

-- Sample posts from different users
INSERT INTO posts (profile_id, content, visibility) VALUES
  -- Replace these UUIDs with actual profile IDs from your database
  ('00000000-0000-0000-0000-000000000001', 'Olá pessoal! Acabei de me juntar ao ConnectHub. Estou animado para conhecer pessoas novas! 🎉', 'public'),
  ('00000000-0000-0000-0000-000000000002', 'Alguém mais aqui ama fotografia? Acabei de comprar uma nova câmera e estou procurando por locais interessantes para fotografar na cidade! 📸', 'public'),
  ('00000000-0000-0000-0000-000000000003', 'Organizando um encontro para amantes de café no próximo sábado. Quem está interessado? ☕', 'friends_only'),
  ('00000000-0000-0000-0000-000000000001', 'Que dia lindo hoje! Perfeito para uma caminhada no parque. 🌞', 'public'),
  ('00000000-0000-0000-0000-000000000004', 'Procurando por pessoas interessadas em jogos de tabuleiro. Temos um grupo que se encontra toda sexta-feira! 🎲', 'public'),
  ('00000000-0000-0000-0000-000000000002', 'Acabei de terminar um livro incrível sobre desenvolvimento pessoal. Alguém tem recomendações similares? 📚', 'friends_only'),
  ('00000000-0000-0000-0000-000000000005', 'Primeira vez usando o ConnectHub! Parece uma plataforma incrível para conhecer pessoas com interesses similares. 👋', 'public'),
  ('00000000-0000-0000-0000-000000000003', 'Alguém mais aqui pratica yoga? Estou procurando por um parceiro de prática! 🧘‍♀️', 'public'),
  ('00000000-0000-0000-0000-000000000001', 'Olá pessoal! Este é meu primeiro post no ConnectHub! 🎉', 'public'),
  ('00000000-0000-0000-0000-000000000001', 'Compartilhando uma foto do meu almoço hoje... estava delicioso! 😋', 'friends_only'),
  ('00000000-0000-0000-0000-000000000002', 'Procurando pessoas interessadas em hiking na região de São Paulo. Alguém se anima? 🥾', 'public'),
  ('00000000-0000-0000-0000-000000000002', 'Que dia lindo para sair e conhecer pessoas novas! ☀️', 'public'),
  ('00000000-0000-0000-0000-000000000003', 'Acabei de me cadastrar aqui! Animado para fazer novas conexões 💫', 'public');

-- Insert sample posts (only if profiles exist)
INSERT INTO posts (profile_id, content, visibility) 
SELECT 
  id,
  CASE 
    WHEN random() < 0.3 THEN 'Olá pessoal! Como estão hoje? 😊'
    WHEN random() < 0.6 THEN 'Compartilhando um momento especial da minha vida! ✨'
    ELSE 'Procurando novas conexões e amizades por aqui! 🤝'
  END,
  CASE 
    WHEN random() < 0.7 THEN 'public'
    ELSE 'friends_only'
  END
FROM profiles 
WHERE EXISTS (SELECT 1 FROM profiles)
LIMIT 10;

-- Sample likes for the posts
INSERT INTO likes (post_id, profile_id) VALUES
  -- Get post IDs and add some likes (you'll need to replace with actual post IDs)
  ((SELECT id FROM posts WHERE content LIKE 'Olá pessoal!%' LIMIT 1), '00000000-0000-0000-0000-000000000002'),
  ((SELECT id FROM posts WHERE content LIKE 'Olá pessoal!%' LIMIT 1), '00000000-0000-0000-0000-000000000003'),
  ((SELECT id FROM posts WHERE content LIKE 'Alguém mais aqui ama fotografia?%' LIMIT 1), '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM posts WHERE content LIKE 'Alguém mais aqui ama fotografia?%' LIMIT 1), '00000000-0000-0000-0000-000000000004'),
  ((SELECT id FROM posts WHERE content LIKE 'Que dia lindo hoje!%' LIMIT 1), '00000000-0000-0000-0000-000000000005'),
  ((SELECT id FROM posts WHERE content LIKE 'Procurando pessoas%' LIMIT 1), '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM posts WHERE content LIKE 'Que dia lindo%' LIMIT 1), '00000000-0000-0000-0000-000000000003');

-- Insert sample likes
INSERT INTO likes (post_id, profile_id)
SELECT DISTINCT
  p.id,
  pr.id
FROM posts p
CROSS JOIN profiles pr
WHERE p.profile_id != pr.id
  AND random() < 0.3
LIMIT 20;

-- Sample comments for the posts
INSERT INTO comments (post_id, profile_id, content) VALUES
  ((SELECT id FROM posts WHERE content LIKE 'Olá pessoal!%' LIMIT 1), '00000000-0000-0000-0000-000000000002', 'Bem-vindo ao ConnectHub! Você vai adorar a comunidade aqui! 😊'),
  ((SELECT id FROM posts WHERE content LIKE 'Alguém mais aqui ama fotografia?%' LIMIT 1), '00000000-0000-0000-0000-000000000001', 'Eu também amo fotografia! Que tipo de câmera você comprou?'),
  ((SELECT id FROM posts WHERE content LIKE 'Alguém mais aqui ama fotografia?%' LIMIT 1), '00000000-0000-0000-0000-000000000004', 'Conheço alguns lugares incríveis na cidade. Te mando uma mensagem!'),
  ((SELECT id FROM posts WHERE content LIKE 'Procurando por pessoas interessadas em jogos%' LIMIT 1), '00000000-0000-0000-0000-000000000003', 'Que tipos de jogos vocês jogam? Estou interessado!'),
  ((SELECT id FROM posts WHERE content LIKE 'Primeira vez usando o ConnectHub!%' LIMIT 1), '00000000-0000-0000-0000-000000000001', 'Bem-vindo! Se precisar de ajuda, é só perguntar! 👍'),
  ((SELECT id FROM posts WHERE content LIKE 'Procurando pessoas%' LIMIT 1), '00000000-0000-0000-0000-000000000001', 'Eu me interessei! Vamos conversar no chat?'),
  ((SELECT id FROM posts WHERE content LIKE 'Procurando pessoas%' LIMIT 1), '00000000-0000-0000-0000-000000000003', 'Também gosto de trilhas! Conta comigo 🏔️');

-- Insert sample comments
INSERT INTO comments (post_id, profile_id, content)
SELECT 
  p.id,
  pr.id,
  CASE 
    WHEN random() < 0.3 THEN 'Que legal! 👏'
    WHEN random() < 0.6 THEN 'Adorei seu post!'
    ELSE 'Concordo totalmente! 💯'
  END
FROM posts p
CROSS JOIN profiles pr
WHERE p.profile_id != pr.id
  AND random() < 0.2
LIMIT 15;

-- Note: To use this seed data properly, you should:
-- 1. First check what profile IDs exist in your profiles table
-- 2. Replace the placeholder UUIDs with actual profile IDs
-- 3. Or create test profiles first with known IDs

-- Example query to see existing profiles:
-- SELECT id, username, full_name FROM profiles LIMIT 10;
