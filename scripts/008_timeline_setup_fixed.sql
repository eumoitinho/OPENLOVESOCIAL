-- Check if posts table exists and has the right structure
DO $$
BEGIN
    -- Add missing columns to posts table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'media_url') THEN
        ALTER TABLE posts ADD COLUMN media_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'media_type') THEN
        ALTER TABLE posts ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'visibility') THEN
        ALTER TABLE posts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends_only'));
    END IF;
END $$;

-- Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Update comments table to ensure it has the right structure
DO $$
BEGIN
    -- Check if comments table has user_id column, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id') THEN
        ALTER TABLE comments ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        -- Copy author_id to user_id if author_id exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') THEN
            UPDATE comments SET user_id = author_id WHERE user_id IS NULL;
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
DROP POLICY IF EXISTS "Users can view posts based on visibility and premium status" ON posts;
CREATE POLICY "Users can view posts based on visibility and premium status" ON posts
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'friends_only' AND (
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM friends 
        WHERE (user_id = posts.author_id AND friend_id = auth.uid() AND status = 'accepted') OR
              (user_id = auth.uid() AND friend_id = posts.author_id AND status = 'accepted')
      ) OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_premium = true
      )
    ))
  );

DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for likes
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own likes" ON likes;
CREATE POLICY "Users can manage their own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for comments
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON comments;
CREATE POLICY "Users can view comments on visible posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id AND (
        posts.visibility = 'public' OR
        posts.author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM friends 
          WHERE (user_id = posts.author_id AND friend_id = auth.uid() AND status = 'accepted') OR
                (user_id = auth.uid() AND friend_id = posts.author_id AND status = 'accepted')
        ) OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND is_premium = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert comments on visible posts" ON comments;
CREATE POLICY "Users can insert comments on visible posts" ON comments
  FOR INSERT WITH CHECK (
    (auth.uid() = author_id OR auth.uid() = user_id) AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id AND (
        posts.visibility = 'public' OR
        posts.author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM friends 
          WHERE (user_id = posts.author_id AND friend_id = auth.uid() AND status = 'accepted') OR
                (user_id = auth.uid() AND friend_id = posts.author_id AND status = 'accepted')
        ) OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND is_premium = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id OR auth.uid() = user_id);
