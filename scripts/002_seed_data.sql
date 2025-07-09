-- Dados iniciais para o ConnectHub
-- Execute após o script de schema inicial

-- Inserir categorias de interesse
INSERT INTO interest_categories (name, description, icon, color) VALUES
('Tecnologia', 'Programação, gadgets, inovação e tendências tech', 'laptop', '#3B82F6'),
('Esportes', 'Futebol, basquete, corrida, academia e atividades físicas', 'activity', '#10B981'),
('Arte', 'Pintura, desenho, fotografia e expressões artísticas', 'palette', '#F59E0B'),
('Música', 'Instrumentos, bandas, festivais e produção musical', 'music', '#8B5CF6'),
('Culinária', 'Receitas, restaurantes, técnicas culinárias', 'chef-hat', '#EF4444'),
('Viagem', 'Destinos, dicas de viagem, culturas e aventuras', 'map-pin', '#06B6D4'),
('Leitura', 'Livros, literatura, clubes de leitura', 'book-open', '#84CC16'),
('Jogos', 'Videogames, jogos de tabuleiro, RPG', 'gamepad-2', '#F97316'),
('Fitness', 'Academia, yoga, pilates, vida saudável', 'dumbbell', '#14B8A6'),
('Fotografia', 'Técnicas, equipamentos, edição de fotos', 'camera', '#6366F1');

-- Inserir comunidades de exemplo
INSERT INTO communities (name, slug, description, category_id, created_by) VALUES
('Desenvolvedores JavaScript', 'dev-javascript', 'Comunidade para desenvolvedores que trabalham com JavaScript, Node.js, React e outras tecnologias JS.', 
 (SELECT id FROM interest_categories WHERE name = 'Tecnologia'), NULL),

('Corredores de São Paulo', 'corredores-sp', 'Grupo de corrida para quem mora em São Paulo. Organizamos treinos e participamos de provas juntos.', 
 (SELECT id FROM interest_categories WHERE name = 'Esportes'), NULL),

('Fotógrafos Iniciantes', 'foto-iniciantes', 'Espaço para quem está começando na fotografia. Compartilhe suas fotos e aprenda com outros fotógrafos.', 
 (SELECT id FROM interest_categories WHERE name = 'Fotografia'), NULL),

('Clube do Livro', 'clube-livro', 'Lemos um livro por mês e discutimos online e em encontros presenciais.', 
 (SELECT id FROM interest_categories WHERE name = 'Leitura'), NULL),

('Chefs Caseiros', 'chefs-caseiros', 'Para quem ama cozinhar em casa. Compartilhe receitas, dicas e organize jantares colaborativos.', 
 (SELECT id FROM interest_categories WHERE name = 'Culinária'), NULL);

-- Atualizar member_count das comunidades
UPDATE communities SET member_count = 0;

-- Inserir alguns eventos de exemplo
INSERT INTO events (title, description, event_date, location, community_id, created_by) VALUES
('Workshop: React Hooks Avançados', 'Aprenda a usar hooks customizados e otimizar performance em aplicações React.', 
 NOW() + INTERVAL '7 days', 'Online - Zoom', 
 (SELECT id FROM communities WHERE slug = 'dev-javascript'), NULL),

('Treino de Corrida no Ibirapuera', 'Treino intervalado de 5km no parque. Encontro na entrada principal às 7h.', 
 NOW() + INTERVAL '3 days', 'Parque Ibirapuera - Portão 2', 
 (SELECT id FROM communities WHERE slug = 'corredores-sp'), NULL),

('Discussão: "O Nome do Vento"', 'Vamos discutir o primeiro livro da série Crônica do Matador do Rei.', 
 NOW() + INTERVAL '10 days', 'Café Cultura - Vila Madalena', 
 (SELECT id FROM communities WHERE slug = 'clube-livro'), NULL);

-- Inserir alguns posts de exemplo
INSERT INTO posts (title, content, post_type, community_id, author_id) VALUES
('Bem-vindos à comunidade!', 'Olá pessoal! Este é um espaço para compartilharmos conhecimento sobre JavaScript. Sintam-se à vontade para fazer perguntas e compartilhar projetos.', 
 'announcement', (SELECT id FROM communities WHERE slug = 'dev-javascript'), NULL),

('Dúvida sobre async/await', 'Estou com dificuldade para entender quando usar async/await vs Promises. Alguém pode me ajudar com exemplos práticos?', 
 'question', (SELECT id FROM communities WHERE slug = 'dev-javascript'), NULL),

('Minha primeira foto macro', 'Tirei essa foto de uma flor no jardim. O que acham? Aceito críticas construtivas!', 
 'discussion', (SELECT id FROM communities WHERE slug = 'foto-iniciantes'), NULL);

-- Inserir comentários de exemplo
INSERT INTO comments (content, post_id, author_id) VALUES
('Ótima iniciativa! Estou ansioso para participar das discussões.', 
 (SELECT id FROM posts WHERE title = 'Bem-vindos à comunidade!'), NULL),

('Async/await é mais legível, mas Promises são mais flexíveis para casos complexos. Posso fazer um post explicando melhor!', 
 (SELECT id FROM posts WHERE title = 'Dúvida sobre async/await'), NULL),

('Linda foto! A composição está ótima. Que equipamento você usou?', 
 (SELECT id FROM posts WHERE title = 'Minha primeira foto macro'), NULL);
