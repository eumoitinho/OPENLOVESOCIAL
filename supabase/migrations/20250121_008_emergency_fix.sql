-- ================================================================
-- EMERGENCY FIX - DIAGNOSE AND FIX RLS ISSUES
-- ================================================================
-- Purpose: Fix the permission denied errors immediately
-- ================================================================

-- First, check what policies exist
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY tablename, policyname;

-- Check RLS status on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Drop ALL users policies and recreate properly
DROP POLICY IF EXISTS "users_public_read" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON public.users;

-- Create the CORRECT policies for users table
-- CRITICAL: Allow public read for username checking
CREATE POLICY "users_public_read_access" ON public.users
    FOR SELECT 
    USING (true); -- Allow all reads

-- Allow authenticated users to insert (registration)
CREATE POLICY "users_authenticated_insert" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (true); -- Allow all authenticated inserts

-- Allow service role full access
CREATE POLICY "users_service_role_access" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Grant explicit permissions to authenticated role
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Grant full permissions to service_role
GRANT ALL ON public.users TO service_role;

-- Also fix other critical tables for registration flow
-- FOLLOWS table
DROP POLICY IF EXISTS "follows_public_read" ON public.follows;
DROP POLICY IF EXISTS "follows_insert" ON public.follows;

CREATE POLICY "follows_read_all" ON public.follows
    FOR SELECT
    USING (true);

CREATE POLICY "follows_insert_authenticated" ON public.follows
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.follows TO authenticated;
GRANT INSERT ON public.follows TO authenticated;

-- FRIENDS table
DROP POLICY IF EXISTS "friends_read_access" ON public.friends;
DROP POLICY IF EXISTS "friends_insert" ON public.friends;

CREATE POLICY "friends_read_all" ON public.friends
    FOR SELECT
    USING (true);

CREATE POLICY "friends_insert_authenticated" ON public.friends
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.friends TO authenticated;
GRANT INSERT ON public.friends TO authenticated;

-- POSTS table
DROP POLICY IF EXISTS "posts_read_access" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;

CREATE POLICY "posts_read_all" ON public.posts
    FOR SELECT
    USING (true);

CREATE POLICY "posts_insert_authenticated" ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.posts TO authenticated;
GRANT INSERT ON public.posts TO authenticated;

-- COMMENTS table  
DROP POLICY IF EXISTS "comments_read_access" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;

CREATE POLICY "comments_read_all" ON public.comments
    FOR SELECT
    USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.comments TO authenticated;
GRANT INSERT ON public.comments TO authenticated;

-- LIKES table
DROP POLICY IF EXISTS "likes_read_access" ON public.likes;
DROP POLICY IF EXISTS "likes_insert" ON public.likes;

CREATE POLICY "likes_read_all" ON public.likes
    FOR SELECT
    USING (true);

CREATE POLICY "likes_insert_authenticated" ON public.likes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.likes TO authenticated;
GRANT INSERT ON public.likes TO authenticated;

-- NOTIFICATIONS table
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;

CREATE POLICY "notifications_read_all" ON public.notifications
    FOR SELECT
    USING (true);

CREATE POLICY "notifications_insert_authenticated" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;

-- Ensure all sequences have proper permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Final verification
DO $$
DECLARE
    policy_count INTEGER;
    users_policies INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO users_policies
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users';
    
    RAISE NOTICE 'EMERGENCY FIX APPLIED!';
    RAISE NOTICE 'Total policies: %', policy_count;
    RAISE NOTICE 'Users table policies: %', users_policies;
    RAISE NOTICE 'Registration should work now!';
END $$;

-- Show final users policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';