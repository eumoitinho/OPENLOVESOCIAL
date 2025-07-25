-- ================================================================
-- EMERGENCY FIX FOR ANON PERMISSIONS
-- ================================================================
-- Purpose: Add anon role permissions for username checking
-- ================================================================

-- Add policy for anon role to read users table
CREATE POLICY "users_anon_read" ON public.users
    FOR SELECT 
    TO anon
    USING (true);

-- Ensure anon has explicit permissions
GRANT SELECT ON public.users TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Also ensure authenticated role has all necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify policies exist
SELECT 
    schemaname,
    tablename, 
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

DO $$
BEGIN
    RAISE NOTICE 'ANON PERMISSIONS FIXED!';
    RAISE NOTICE 'Username checking should work now!';
END $$;