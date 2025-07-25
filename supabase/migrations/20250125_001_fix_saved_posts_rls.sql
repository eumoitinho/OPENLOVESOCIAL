-- Fix saved_posts RLS policies
-- Date: 2025-01-25

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

-- Service role bypass policy
CREATE POLICY "service_role_bypass_saved_posts" ON public.saved_posts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);