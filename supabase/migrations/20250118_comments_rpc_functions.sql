-- Função para incrementar contador de comentários
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    '{comments}',
    (COALESCE((stats->>'comments')::int, 0) + 1)::text::jsonb
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar contador de comentários
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET stats = jsonb_set(
    COALESCE(stats, '{}'),
    '{comments}',
    GREATEST(COALESCE((stats->>'comments')::int, 0) - 1, 0)::text::jsonb
  )
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a tabela comment_likes existe
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- RLS para comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver todos os likes
CREATE POLICY "Users can view all comment likes" ON comment_likes
  FOR SELECT
  USING (true);

-- Política: usuários podem criar seus próprios likes
CREATE POLICY "Users can create their own likes" ON comment_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem deletar seus próprios likes
CREATE POLICY "Users can delete their own likes" ON comment_likes
  FOR DELETE
  USING (auth.uid() = user_id);