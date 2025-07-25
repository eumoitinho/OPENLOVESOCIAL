-- Quick fix for storage and RLS issues
-- Execute this manually in Supabase SQL Editor

-- 1. Create media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- 2. Fix posts RLS policies (drop and recreate)
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can view posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Simple policies that work
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Storage policies for media bucket
CREATE POLICY "Users can upload to media bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view media files" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'media');

-- 4. Update existing users with null premium_type
UPDATE users 
SET premium_type = 'free' 
WHERE premium_type IS NULL;

-- 5. Refresh schema
NOTIFY pgrst, 'reload schema';