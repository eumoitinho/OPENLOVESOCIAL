-- Complete RLS fix for all missing policies
-- Run this in Supabase Dashboard SQL Editor

-- ================================================================
-- LIKES TABLE RLS POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "likes_read_all" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_authenticated" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;
DROP POLICY IF EXISTS "service_role_bypass_likes" ON public.likes;

-- Create RLS policies for likes table
CREATE POLICY "likes_read_all" ON public.likes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "likes_insert_own" ON public.likes
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "likes_delete_own" ON public.likes
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Service role bypass policy for likes
CREATE POLICY "service_role_bypass_likes" ON public.likes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- COMMENTS TABLE RLS POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "comments_read_all" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
DROP POLICY IF EXISTS "service_role_bypass_comments" ON public.comments;

-- Create RLS policies for comments table
CREATE POLICY "comments_read_all" ON public.comments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "comments_insert_own" ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Service role bypass policy for comments
CREATE POLICY "service_role_bypass_comments" ON public.comments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- SAVED_POSTS TABLE RLS POLICIES (Already done but ensuring)
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "saved_posts_read_own" ON public.saved_posts;
DROP POLICY IF EXISTS "saved_posts_insert_own" ON public.saved_posts;
DROP POLICY IF EXISTS "saved_posts_delete_own" ON public.saved_posts;
DROP POLICY IF EXISTS "service_role_bypass_saved_posts" ON public.saved_posts;

-- Create RLS policies for saved_posts table
CREATE POLICY "saved_posts_read_own" ON public.saved_posts
    FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "saved_posts_insert_own" ON public.saved_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "saved_posts_delete_own" ON public.saved_posts
    FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Service role bypass policy for saved_posts
CREATE POLICY "service_role_bypass_saved_posts" ON public.saved_posts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- VERIFICATION SYSTEM TABLES RLS POLICIES (If they exist)
-- ================================================================

-- For verification_requests table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_requests') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "verification_requests_read_own" ON public.verification_requests;
        DROP POLICY IF EXISTS "verification_requests_insert_own" ON public.verification_requests;
        DROP POLICY IF EXISTS "verification_requests_update_own" ON public.verification_requests;
        DROP POLICY IF EXISTS "service_role_bypass_verification_requests" ON public.verification_requests;

        -- Create new policies
        CREATE POLICY "verification_requests_read_own" ON public.verification_requests
            FOR SELECT
            TO authenticated
            USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

        CREATE POLICY "verification_requests_insert_own" ON public.verification_requests
            FOR INSERT
            TO authenticated
            WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

        CREATE POLICY "verification_requests_update_own" ON public.verification_requests
            FOR UPDATE
            TO authenticated
            USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

        CREATE POLICY "service_role_bypass_verification_requests" ON public.verification_requests
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END
$$;

-- ================================================================
-- ENABLE RLS ON ALL RELEVANT TABLES (Ensure)
-- ================================================================

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on verification tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_requests') THEN
        ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_history') THEN
        ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_settings') THEN
        ALTER TABLE public.verification_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- ================================================================
-- VERIFY POLICIES WERE CREATED
-- ================================================================

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual 
        ELSE 'No USING clause' 
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
        ELSE 'No WITH CHECK clause' 
    END as with_check_clause
FROM pg_policies 
WHERE tablename IN ('likes', 'comments', 'saved_posts', 'verification_requests')
ORDER BY tablename, policyname;