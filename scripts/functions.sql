-- =============================================================================
-- FUNÇÕES PRINCIPAIS DO SISTEMA OPENLOVE
-- =============================================================================

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_sender_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    sender_id,
    type,
    title,
    content,
    data,
    created_at
  ) VALUES (
    p_user_id,
    p_sender_id,
    p_type,
    p_title,
    p_content,
    p_data,
    NOW()
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Função para buscar estatísticas de notificações
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'unread', COUNT(*) FILTER (WHERE is_read = false),
    'mentions', COUNT(*) FILTER (WHERE type = 'mention'),
    'events', COUNT(*) FILTER (WHERE type = 'event'),
    'interactions', COUNT(*) FILTER (WHERE type IN ('like', 'comment', 'follow'))
  ) INTO v_stats
  FROM notifications
  WHERE user_id = p_user_id;
  
  RETURN v_stats;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications 
  SET is_read = true, updated_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications 
  SET is_read = true, updated_at = NOW()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para criar conversa
CREATE OR REPLACE FUNCTION create_conversation(
  p_type TEXT,
  p_name TEXT,
  p_participant_ids UUID[],
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  INSERT INTO conversations (
    type,
    name,
    participant_ids,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_type,
    p_name,
    p_participant_ids,
    p_created_by,
    NOW(),
    NOW()
  ) RETURNING id INTO v_conversation_id;
  
  RETURN v_conversation_id;
END;
$$;

-- Função para enviar mensagem
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_type TEXT DEFAULT 'text',
  p_file_url TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL,
  p_file_size INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    type,
    file_url,
    file_name,
    file_size,
    created_at
  ) VALUES (
    p_conversation_id,
    p_sender_id,
    p_content,
    p_type,
    p_file_url,
    p_file_name,
    p_file_size,
    NOW()
  ) RETURNING id INTO v_message_id;
  
  -- Atualizar última mensagem da conversa
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;

-- Função para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION mark_messages_read(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE messages 
  SET is_read = true, updated_at = NOW()
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para seguir usuário
CREATE OR REPLACE FUNCTION follow_user(p_follower_id UUID, p_followed_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se já está seguindo
  IF EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = p_follower_id AND followed_id = p_followed_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Inserir follow
  INSERT INTO follows (follower_id, followed_id, created_at)
  VALUES (p_follower_id, p_followed_id, NOW());
  
  -- Criar notificação
  PERFORM create_notification(
    p_followed_id,
    p_follower_id,
    'follow',
    'Novo seguidor',
    'Alguém começou a seguir você',
    jsonb_build_object('follower_id', p_follower_id)
  );
  
  RETURN true;
END;
$$;

-- Função para deixar de seguir usuário
CREATE OR REPLACE FUNCTION unfollow_user(p_follower_id UUID, p_followed_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM follows 
  WHERE follower_id = p_follower_id AND followed_id = p_followed_id;
  
  RETURN FOUND;
END;
$$;

-- Função para curtir post
CREATE OR REPLACE FUNCTION like_post(p_user_id UUID, p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_owner_id UUID;
BEGIN
  -- Verificar se já curtiu
  IF EXISTS (
    SELECT 1 FROM post_likes 
    WHERE user_id = p_user_id AND post_id = p_post_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Buscar dono do post
  SELECT user_id INTO v_post_owner_id
  FROM posts WHERE id = p_post_id;
  
  -- Inserir curtida
  INSERT INTO post_likes (user_id, post_id, created_at)
  VALUES (p_user_id, p_post_id, NOW());
  
  -- Criar notificação se não for o próprio post
  IF v_post_owner_id != p_user_id THEN
    PERFORM create_notification(
      v_post_owner_id,
      p_user_id,
      'like',
      'Nova curtida',
      'Alguém curtiu seu post',
      jsonb_build_object('post_id', p_post_id)
    );
  END IF;
  
  RETURN true;
END;
$$;

-- Função para descurtir post
CREATE OR REPLACE FUNCTION unlike_post(p_user_id UUID, p_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM post_likes 
  WHERE user_id = p_user_id AND post_id = p_post_id;
  
  RETURN FOUND;
END;
$$;

-- Função para comentar post
CREATE OR REPLACE FUNCTION comment_post(
  p_user_id UUID,
  p_post_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comment_id UUID;
  v_post_owner_id UUID;
BEGIN
  -- Buscar dono do post
  SELECT user_id INTO v_post_owner_id
  FROM posts WHERE id = p_post_id;
  
  -- Inserir comentário
  INSERT INTO post_comments (user_id, post_id, content, created_at)
  VALUES (p_user_id, p_post_id, p_content, NOW())
  RETURNING id INTO v_comment_id;
  
  -- Criar notificação se não for o próprio post
  IF v_post_owner_id != p_user_id THEN
    PERFORM create_notification(
      v_post_owner_id,
      p_user_id,
      'comment',
      'Novo comentário',
      'Alguém comentou seu post',
      jsonb_build_object('post_id', p_post_id, 'comment_id', v_comment_id)
    );
  END IF;
  
  RETURN v_comment_id;
END;
$$;

-- Função para buscar usuários com filtros
CREATE OR REPLACE FUNCTION search_users(
  p_query TEXT DEFAULT NULL,
  p_locations TEXT[] DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_verified BOOLEAN DEFAULT NULL,
  p_premium BOOLEAN DEFAULT NULL,
  p_has_posts BOOLEAN DEFAULT NULL,
  p_has_followers BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  interests TEXT[],
  verified BOOLEAN,
  premium BOOLEAN,
  followers_count BIGINT,
  posts_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.full_name,
    u.avatar_url,
    u.bio,
    u.location,
    u.interests,
    u.verified,
    u.premium,
    COALESCE(f.followers_count, 0) as followers_count,
    COALESCE(p.posts_count, 0) as posts_count
  FROM users u
  LEFT JOIN (
    SELECT followed_id, COUNT(*) as followers_count
    FROM follows
    GROUP BY followed_id
  ) f ON u.id = f.followed_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as posts_count
    FROM posts
    GROUP BY user_id
  ) p ON u.id = p.user_id
  WHERE (
    p_query IS NULL OR 
    u.username ILIKE '%' || p_query || '%' OR
    u.full_name ILIKE '%' || p_query || '%' OR
    u.bio ILIKE '%' || p_query || '%'
  )
  AND (p_locations IS NULL OR u.location = ANY(p_locations))
  AND (p_interests IS NULL OR u.interests && p_interests)
  AND (p_verified IS NULL OR u.verified = p_verified)
  AND (p_premium IS NULL OR u.premium = p_premium)
  AND (p_has_posts IS NULL OR p.posts_count > 0)
  AND (p_has_followers IS NULL OR f.followers_count > 0)
  ORDER BY u.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Função para buscar posts da timeline
CREATE OR REPLACE FUNCTION get_timeline_posts(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  media_urls TEXT[],
  likes_count BIGINT,
  comments_count BIGINT,
  is_liked BOOLEAN,
  created_at TIMESTAMP,
  user_username TEXT,
  user_full_name TEXT,
  user_avatar_url TEXT,
  user_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.media_urls,
    COALESCE(l.likes_count, 0) as likes_count,
    COALESCE(c.comments_count, 0) as comments_count,
    COALESCE(pl.is_liked, false) as is_liked,
    p.created_at,
    u.username as user_username,
    u.full_name as user_full_name,
    u.avatar_url as user_avatar_url,
    u.verified as user_verified
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as likes_count
    FROM post_likes
    GROUP BY post_id
  ) l ON p.id = l.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comments_count
    FROM post_comments
    GROUP BY post_id
  ) c ON p.id = c.post_id
  LEFT JOIN (
    SELECT post_id, true as is_liked
    FROM post_likes
    WHERE user_id = p_user_id
  ) pl ON p.id = pl.post_id
  WHERE p.user_id IN (
    SELECT followed_id FROM follows WHERE follower_id = p_user_id
    UNION
    SELECT p_user_id
  )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Função para atualizar estatísticas de usuário
CREATE OR REPLACE FUNCTION update_user_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET 
    followers_count = (
      SELECT COUNT(*) FROM follows WHERE followed_id = p_user_id
    ),
    following_count = (
      SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id
    ),
    posts_count = (
      SELECT COUNT(*) FROM posts WHERE user_id = p_user_id
    ),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '1 day' * p_days
    AND is_read = true;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para buscar conversas do usuário
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  participant_ids UUID[],
  last_message_content TEXT,
  last_message_sender_name TEXT,
  last_message_created_at TIMESTAMP,
  unread_count BIGINT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.name,
    c.participant_ids,
    lm.content as last_message_content,
    u.full_name as last_message_sender_name,
    lm.created_at as last_message_created_at,
    COALESCE(um.unread_count, 0) as unread_count,
    c.created_at,
    c.updated_at
  FROM conversations c
  LEFT JOIN LATERAL (
    SELECT content, sender_id, created_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN users u ON lm.sender_id = u.id
  LEFT JOIN (
    SELECT conversation_id, COUNT(*) as unread_count
    FROM messages
    WHERE sender_id != p_user_id AND is_read = false
    GROUP BY conversation_id
  ) um ON c.id = um.conversation_id
  WHERE p_user_id = ANY(c.participant_ids)
  ORDER BY c.updated_at DESC;
END;
$$; 