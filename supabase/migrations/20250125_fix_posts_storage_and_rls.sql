-- Migration to fix posts storage and RLS policies
-- Created: 2025-01-25

-- =========================================
-- 1. Create storage buckets if they don't exist
-- =========================================

-- Create media bucket for posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create covers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 2. Fix RLS policies for posts table
-- =========================================

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can view posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create comprehensive RLS policies for posts
CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view posts" ON posts
  FOR SELECT
  USING (
    visibility = 'public' 
    OR user_id = auth.uid()
    OR (
      visibility = 'friends' 
      AND EXISTS (
        SELECT 1 FROM friends 
        WHERE (user_id = auth.uid() AND friend_id = posts.user_id)
           OR (friend_id = auth.uid() AND user_id = posts.user_id)
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- =========================================
-- 3. Storage RLS policies
-- =========================================

-- Media bucket policies
CREATE POLICY "Users can upload to media bucket" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view media files" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'media');

CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket policies
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their avatars" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their avatars" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Covers bucket policies
CREATE POLICY "Users can upload covers" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'covers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view covers" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'covers');

CREATE POLICY "Users can update their covers" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'covers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their covers" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'covers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =========================================
-- 4. Fix premium_type constraint and update existing users
-- =========================================

-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_premium_type_check;

-- Add the new constraint that includes 'free'
ALTER TABLE users ADD CONSTRAINT users_premium_type_check 
  CHECK (premium_type IN ('free', 'gold', 'diamond', 'diamond_annual') OR premium_type IS NULL);

-- Fix existing users that have null premium_type
UPDATE users 
SET premium_type = 'free' 
WHERE premium_type IS NULL;

-- =========================================
-- 5. Add helpful indexes for performance
-- =========================================

-- Index for posts visibility and user lookups
CREATE INDEX IF NOT EXISTS idx_posts_user_visibility ON posts(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Index for friends lookups in RLS policies
CREATE INDEX IF NOT EXISTS idx_friends_user_friend_status ON friends(user_id, friend_id, status);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_status ON friends(friend_id, user_id, status);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';