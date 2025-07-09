-- Insert sample posts for testing timeline functionality
-- Using existing profiles

-- First, let's create some sample posts using existing profiles
INSERT INTO posts (author_id, content, visibility) 
SELECT 
  id,
  'Olá pessoal! Este é meu primeiro post no ConnectHub! 🎉',
  'public'
FROM profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO posts (author_id, content, visibility) 
SELECT 
  id,
  'Procurando pessoas interessadas em fotografia na região. Alguém se anima? 📸',
  'public'
FROM profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO posts (author_id, content, visibility) 
SELECT 
  id,
  'Que dia lindo para conhecer pessoas novas! ☀️',
  'friends_only'
FROM profiles 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert more varied sample posts
INSERT INTO posts (author_id, content, visibility) 
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.2 THEN 'Olá pessoal! Como estão hoje? 😊'
    WHEN random() < 0.4 THEN 'Compartilhando um momento especial da minha vida! ✨'
    WHEN random() < 0.6 THEN 'Procurando novas conexões e amizades por aqui! 🤝'
    WHEN random() < 0.8 THEN 'Alguém mais aqui gosta de [hobby]? Vamos conversar! 🎯'
    ELSE 'Que semana incrível! Espero que todos estejam bem 💫'
  END,
  CASE 
    WHEN random() < 0.7 THEN 'public'
    ELSE 'friends_only'
  END
FROM profiles p
WHERE EXISTS (SELECT 1 FROM profiles)
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample likes (only if posts exist)
INSERT INTO likes (post_id, user_id)
SELECT DISTINCT
  p.id,
  pr.id
FROM posts p
CROSS JOIN profiles pr
WHERE p.author_id != pr.id
  AND random() < 0.3
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insert sample comments (only if posts exist)
-- First, ensure comments have both author_id and user_id set
INSERT INTO comments (post_id, author_id, user_id, content)
SELECT 
  p.id,
  pr.id,
  pr.id,
  CASE 
    WHEN random() < 0.3 THEN 'Que legal! 👏'
    WHEN random() < 0.6 THEN 'Adorei seu post!'
    ELSE 'Concordo totalmente! 💯'
  END
FROM posts p
CROSS JOIN profiles pr
WHERE p.author_id != pr.id
  AND random() < 0.2
LIMIT 8
ON CONFLICT DO NOTHING;

-- Add some specific comments for testing
INSERT INTO comments (post_id, author_id, user_id, content)
SELECT 
  p.id,
  pr.id,
  pr.id,
  'Bem-vindo ao ConnectHub! Você vai adorar a comunidade aqui! 😊'
FROM posts p
CROSS JOIN profiles pr
WHERE p.content LIKE '%primeiro post%'
  AND p.author_id != pr.id
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO comments (post_id, author_id, user_id, content)
SELECT 
  p.id,
  pr.id,
  pr.id,
  'Eu também amo fotografia! Vamos trocar algumas dicas?'
FROM posts p
CROSS JOIN profiles pr
WHERE p.content LIKE '%fotografia%'
  AND p.author_id != pr.id
LIMIT 1
ON CONFLICT DO NOTHING;
