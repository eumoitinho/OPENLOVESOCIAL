-- ================================================================
-- FIX SERVICE ROLE PERMISSIONS FOR REGISTRATION
-- ================================================================
-- Purpose: Ensure service role can bypass RLS for user registration
-- Date: 2025-01-24
-- ================================================================

-- Ensure service_role has proper permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create a function that service_role can call to check username
CREATE OR REPLACE FUNCTION public.check_username_availability(username_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE username = username_param
    );
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.check_username_availability(TEXT) TO service_role;

-- Create a function that service_role can call to check email
CREATE OR REPLACE FUNCTION public.check_email_availability(email_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE email = email_param
    );
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION public.check_email_availability(TEXT) TO service_role;

-- Ensure service_role can insert into users table
GRANT INSERT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;

-- Also ensure service_role can manage subscriptions
GRANT ALL ON public.subscriptions TO service_role;

DO $$
BEGIN
    RAISE NOTICE 'SERVICE ROLE PERMISSIONS FIXED!';
    RAISE NOTICE 'Registration should work now with proper service role access!';
END $$;