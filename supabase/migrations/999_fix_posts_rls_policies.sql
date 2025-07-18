-- Fix Posts RLS Policies for Timeline Visibility
-- This migration addresses critical issues with posts not appearing in timeline

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view posts" ON posts;
DROP POLICY IF EXISTS "Users can view public posts" ON posts;
DROP POLICY IF EXISTS "Allow public posts viewing" ON posts;

-- Create comprehensive RLS policies for posts

-- 1. Allow viewing public posts (authenticated and anonymous)
CREATE POLICY "Anyone can view public posts" ON posts
  FOR SELECT
  USING (visibility = 'public');

-- 2. Allow users to view their own posts regardless of visibility
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Allow users to view friends-only posts from people they follow
CREATE POLICY "Users can view friends posts" ON posts
  FOR SELECT
  USING (
    visibility = 'friends_only' 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM follows f 
      WHERE f.follower_id = auth.uid() 
        AND f.following_id = user_id
        AND f.status = 'accepted'
    )
  );

-- 4. Allow users to view private posts only if they are the owner
-- (This is already covered by policy 2, but explicit for clarity)
CREATE POLICY "Users can view private posts if owner" ON posts
  FOR SELECT
  USING (
    visibility = 'private' 
    AND auth.uid() = user_id
  );

-- Insert policies
-- 5. Users can create their own posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fix post_likes table policies
DROP POLICY IF EXISTS "Users can view likes" ON post_likes;
DROP POLICY IF EXISTS "Users can manage likes" ON post_likes;

-- Allow viewing likes on posts that user can see
CREATE POLICY "Users can view post likes" ON post_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_likes.post_id 
        AND (
          p.visibility = 'public'
          OR p.user_id = auth.uid()
          OR (
            p.visibility = 'friends_only' 
            AND EXISTS (
              SELECT 1 FROM follows f 
              WHERE f.follower_id = auth.uid() 
                AND f.following_id = p.user_id
                AND f.status = 'accepted'
            )
          )
        )
    )
  );

-- Allow users to like/unlike posts they can see
CREATE POLICY "Users can manage post likes" ON post_likes
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_likes.post_id 
        AND (
          p.visibility = 'public'
          OR p.user_id = auth.uid()
          OR (
            p.visibility = 'friends_only' 
            AND EXISTS (
              SELECT 1 FROM follows f 
              WHERE f.follower_id = auth.uid() 
                AND f.following_id = p.user_id
                AND f.status = 'accepted'
            )
          )
        )
    )
  )
  WITH CHECK (auth.uid() = user_id);

-- Fix comments table policies  
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

-- Allow viewing comments on posts that user can see
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = comments.post_id 
        AND (
          p.visibility = 'public'
          OR p.user_id = auth.uid()
          OR (
            p.visibility = 'friends_only' 
            AND EXISTS (
              SELECT 1 FROM follows f 
              WHERE f.follower_id = auth.uid() 
                AND f.following_id = p.user_id
                AND f.status = 'accepted'
            )
          )
        )
    )
  );

-- Allow users to comment on posts they can see
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = comments.post_id 
        AND (
          p.visibility = 'public'
          OR p.user_id = auth.uid()
          OR (
            p.visibility = 'friends_only' 
            AND EXISTS (
              SELECT 1 FROM follows f 
              WHERE f.follower_id = auth.uid() 
                AND f.following_id = p.user_id
                AND f.status = 'accepted'
            )
          )
        )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments or post owners can delete comments on their posts
CREATE POLICY "Users can delete comments" ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = comments.post_id 
        AND p.user_id = auth.uid()
    )
  );

-- Add check constraints for data integrity
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_visibility_check;

ALTER TABLE posts 
  ADD CONSTRAINT posts_visibility_check 
  CHECK (visibility IN ('public', 'friends_only', 'private'));

-- Ensure media arrays are consistent
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_media_consistency_check;

ALTER TABLE posts 
  ADD CONSTRAINT posts_media_consistency_check 
  CHECK (
    COALESCE(array_length(media_urls, 1), 0) = COALESCE(array_length(media_types, 1), 0)
  );

-- Add stats validation
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_stats_check;

ALTER TABLE posts 
  ADD CONSTRAINT posts_stats_check 
  CHECK (
    jsonb_typeof(stats) = 'object' 
    AND stats ? 'likes' 
    AND stats ? 'comments' 
    AND stats ? 'shares' 
    AND stats ? 'views'
  );

COMMENT ON POLICY "Anyone can view public posts" ON posts IS 
'Allows both authenticated and anonymous users to view public posts';

COMMENT ON POLICY "Users can view own posts" ON posts IS 
'Users can always view their own posts regardless of visibility';

COMMENT ON POLICY "Users can view friends posts" ON posts IS 
'Users can view friends_only posts from people they follow with accepted status';

COMMENT ON CONSTRAINT posts_visibility_check ON posts IS 
'Ensures visibility field only contains valid values';

COMMENT ON CONSTRAINT posts_media_consistency_check ON posts IS 
'Ensures media_urls and media_types arrays have the same length';

COMMENT ON CONSTRAINT posts_stats_check ON posts IS 
'Ensures stats column has required fields with proper structure';