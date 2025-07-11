-- Configurações de autenticação para o OpenLove
-- Este script configura as permissões necessárias para o sistema de 2FA

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para users: usuários podem ver todos os perfis, mas só editar o próprio
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para posts: usuários podem ver todos os posts, mas só criar/editar os próprios
CREATE POLICY "Users can view all posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- Política para follows: usuários podem ver todos os follows, mas só gerenciar os próprios
CREATE POLICY "Users can view all follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

-- Política para notifications: usuários só podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para verificar se o email foi confirmado
CREATE OR REPLACE FUNCTION public.is_email_confirmed(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter dados do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_authenticated_user()
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  interests text[],
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.username,
    u.full_name,
    u.avatar_url,
    u.bio,
    u.interests,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria automaticamente um perfil quando um novo usuário se registra';
COMMENT ON FUNCTION public.is_email_confirmed(uuid) IS 'Verifica se o email de um usuário foi confirmado';
COMMENT ON FUNCTION public.get_authenticated_user() IS 'Retorna os dados do usuário autenticado';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC); 