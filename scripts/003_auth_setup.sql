-- Configuração de autenticação para ConnectHub
-- Execute este script no Supabase SQL Editor após os scripts anteriores

-- Criar função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para communities
CREATE POLICY "Todos podem ver comunidades públicas" ON public.communities
  FOR SELECT USING (NOT is_private OR id IN (
    SELECT community_id FROM community_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Criadores podem gerenciar suas comunidades" ON public.communities
  FOR ALL USING (created_by = auth.uid());

-- Políticas RLS para community_members
CREATE POLICY "Membros podem ver outros membros da mesma comunidade" ON public.community_members
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar sua própria participação" ON public.community_members
  FOR ALL USING (user_id = auth.uid());

-- Políticas RLS para posts
CREATE POLICY "Usuários podem ver posts de comunidades que participam" ON public.posts
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar posts em comunidades que participam" ON public.posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Autores podem editar seus próprios posts" ON public.posts
  FOR UPDATE USING (author_id = auth.uid());

-- Políticas RLS para comments
CREATE POLICY "Usuários podem ver comentários de posts que podem ver" ON public.comments
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM posts WHERE community_id IN (
        SELECT community_id FROM community_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem criar comentários" ON public.comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Autores podem editar seus próprios comentários" ON public.comments
  FOR UPDATE USING (author_id = auth.uid());

-- Políticas RLS para events
CREATE POLICY "Usuários podem ver eventos de comunidades que participam" ON public.events
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar eventos em comunidades que participam" ON public.events
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para user_follows
CREATE POLICY "Usuários podem ver quem seguem e quem os segue" ON public.user_follows
  FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar quem seguem" ON public.user_follows
  FOR ALL USING (follower_id = auth.uid());

-- Função para buscar perfil do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  id UUID,
  username VARCHAR(50),
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[],
  location TEXT,
  website TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.bio, p.avatar_url, p.interests, 
         p.location, p.website, p.is_verified, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
