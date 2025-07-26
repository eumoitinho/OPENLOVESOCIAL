-- ================================================================
-- SIMPLE VERIFICATION SYSTEM SETUP
-- ================================================================
-- Purpose: Create basic verification system without dependencies
-- Date: 2025-01-25
-- ================================================================

-- Check if tables exist before creating
DO $$
BEGIN
    -- Create verification_requests table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_requests') THEN
        CREATE TABLE public.verification_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            verification_code VARCHAR(50) NOT NULL UNIQUE,
            required_text TEXT NOT NULL,
            day_of_week VARCHAR(20) NOT NULL,
            photo_url TEXT,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
            attempt_number INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
            submitted_at TIMESTAMP WITH TIME ZONE,
            reviewed_at TIMESTAMP WITH TIME ZONE,
            reviewed_by UUID,
            rejection_reason TEXT
        );
        
        RAISE NOTICE 'Created verification_requests table';
    END IF;

    -- Create verification_history table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_history') THEN
        CREATE TABLE public.verification_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            request_id UUID,
            action VARCHAR(30) NOT NULL,
            details JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created verification_history table';
    END IF;

    -- Create verification_settings table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_settings') THEN
        CREATE TABLE public.verification_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value JSONB NOT NULL,
            description TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default settings
        INSERT INTO public.verification_settings (setting_key, setting_value, description) VALUES
        ('max_attempts_per_user', '3', 'Maximum verification attempts per user'),
        ('code_expiry_hours', '24', 'Hours until verification code expires'),
        ('verification_required_actions', '["comment", "message", "media_upload"]', 'Actions that require verification')
        ON CONFLICT (setting_key) DO NOTHING;
        
        RAISE NOTICE 'Created verification_settings table with defaults';
    END IF;
END $$;

-- ================================================================
-- BASIC FUNCTIONS
-- ================================================================

-- Simple verification code generation function
CREATE OR REPLACE FUNCTION generate_verification_code(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_username TEXT;
    v_day_name TEXT;
    v_code TEXT;
    v_required_text TEXT;
BEGIN
    -- Get username (handle case where users table might have different structure)
    SELECT COALESCE(username, 'user') INTO v_username
    FROM public.users 
    WHERE id = p_user_id OR auth_id = p_user_id::text
    LIMIT 1;
    
    IF v_username IS NULL THEN
        v_username := 'user';
    END IF;
    
    -- Get day of week in Portuguese
    v_day_name := CASE EXTRACT(DOW FROM NOW())
        WHEN 0 THEN 'DOMINGO'
        WHEN 1 THEN 'SEGUNDA'
        WHEN 2 THEN 'TERÇA'
        WHEN 3 THEN 'QUARTA'
        WHEN 4 THEN 'QUINTA'
        WHEN 5 THEN 'SEXTA'
        WHEN 6 THEN 'SÁBADO'
    END;
    
    -- Generate random code
    v_code := UPPER(substring(md5(random()::text) from 1 for 6));
    
    -- Create required text
    v_required_text := 'OPENLOVE ' || v_day_name || ' @' || v_username || ' ' || v_code;
    
    RETURN json_build_object(
        'code', v_code,
        'day_of_week', v_day_name,
        'required_text', v_required_text,
        'username', v_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple permission check function
CREATE OR REPLACE FUNCTION can_user_perform_action(p_user_id UUID, p_action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_verified BOOLEAN := FALSE;
    v_role TEXT := 'user';
    v_required_actions TEXT[];
BEGIN
    -- Get user verification status (handle different table structures)
    SELECT COALESCE(is_verified, FALSE), COALESCE(role, 'user')
    INTO v_is_verified, v_role
    FROM public.users 
    WHERE id = p_user_id OR auth_id = p_user_id::text
    LIMIT 1;
    
    -- Admins can always perform actions
    IF v_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- If user is verified, allow all actions
    IF v_is_verified THEN
        RETURN TRUE;
    END IF;
    
    -- Get required actions from settings (with fallback)
    SELECT COALESCE(
        (SELECT ARRAY(SELECT json_array_elements_text(setting_value::json))
         FROM verification_settings WHERE setting_key = 'verification_required_actions'),
        ARRAY['comment', 'message', 'media_upload']
    ) INTO v_required_actions;
    
    -- Check if action requires verification
    IF p_action = ANY(v_required_actions) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- BASIC INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id 
ON public.verification_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_verification_requests_status 
ON public.verification_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_history_user_id 
ON public.verification_history(user_id, created_at DESC);

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'SIMPLE VERIFICATION SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Tables: verification_requests, verification_history, verification_settings';
    RAISE NOTICE 'Functions: generate_verification_code(), can_user_perform_action()';
    RAISE NOTICE 'Next: Create storage bucket "verification-photos"';
    RAISE NOTICE '================================================================';
END $$;