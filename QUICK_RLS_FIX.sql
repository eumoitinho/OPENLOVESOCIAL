-- Quick RLS fix for critical tables
-- Run this in Supabase Dashboard SQL Editor

-- ================================================================
-- LIKES TABLE - CRITICAL FIX
-- ================================================================

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate likes policies
DROP POLICY IF EXISTS "likes_read_all" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;

CREATE POLICY "likes_read_all" ON public.likes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "likes_insert_own" ON public.likes
    FOR INSERT TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "likes_delete_own" ON public.likes
    FOR DELETE TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ================================================================
-- COMMENTS TABLE - CRITICAL FIX  
-- ================================================================

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate comments policies
DROP POLICY IF EXISTS "comments_read_all" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;

CREATE POLICY "comments_read_all" ON public.comments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "comments_insert_own" ON public.comments
    FOR INSERT TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ================================================================
-- SAVED_POSTS TABLE - CRITICAL FIX
-- ================================================================

-- Enable RLS
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate saved_posts policies
DROP POLICY IF EXISTS "saved_posts_read_own" ON public.saved_posts;
DROP POLICY IF EXISTS "saved_posts_insert_own" ON public.saved_posts;
DROP POLICY IF EXISTS "saved_posts_delete_own" ON public.saved_posts;

CREATE POLICY "saved_posts_read_own" ON public.saved_posts
    FOR SELECT TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "saved_posts_insert_own" ON public.saved_posts
    FOR INSERT TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "saved_posts_delete_own" ON public.saved_posts
    FOR DELETE TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Verify policies were created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('likes', 'comments', 'saved_posts')
ORDER BY tablename, policyname;