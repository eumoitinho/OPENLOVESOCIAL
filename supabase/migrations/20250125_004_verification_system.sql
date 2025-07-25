-- ================================================================
-- PROFILE VERIFICATION SYSTEM
-- ================================================================
-- Purpose: Complete profile verification system with photo validation
-- Date: 2025-01-25
-- Security Level: HIGH
-- ================================================================

-- Create verification requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Verification code components
    verification_code VARCHAR(50) NOT NULL UNIQUE,
    required_text TEXT NOT NULL, -- "OPENLOVE (DIA DA SEMANA) @USERNAME CODIGO"
    day_of_week VARCHAR(20) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
    
    -- Photo submission
    photo_url TEXT,
    photo_metadata JSONB DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin review
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Attempt tracking
    attempt_number INTEGER DEFAULT 1,
    total_attempts INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_attempt_number CHECK (attempt_number > 0 AND attempt_number <= 3),
    CONSTRAINT photo_required_when_submitted CHECK (
        (status = 'submitted' AND photo_url IS NOT NULL) OR 
        (status != 'submitted')
    )
);

-- Create verification history table
CREATE TABLE IF NOT EXISTS public.verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.verification_requests(id) ON DELETE SET NULL,
    
    action VARCHAR(30) NOT NULL CHECK (action IN (
        'code_generated', 'photo_submitted', 'approved', 'rejected', 
        'expired', 'cancelled', 'admin_review_started'
    )),
    
    -- Action details
    performed_by UUID REFERENCES public.users(id), -- NULL for system actions
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification settings table (admin configurable)
CREATE TABLE IF NOT EXISTS public.verification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default verification settings
INSERT INTO public.verification_settings (setting_key, setting_value, description) VALUES
('max_attempts_per_user', '3', 'Maximum verification attempts per user'),
('code_expiry_hours', '24', 'Hours until verification code expires'),
('auto_approve_premium', 'true', 'Auto-approve premium users after payment'),
('require_verification_for_interactions', 'true', 'Require verification for comments, messages, media posts'),
('allowed_file_types', '["image/jpeg", "image/png", "image/webp"]', 'Allowed photo file types for verification'),
('max_file_size_mb', '10', 'Maximum file size in MB for verification photos'),
('verification_required_actions', '["comment", "message", "media_upload", "event_create"]', 'Actions that require verification')
ON CONFLICT (setting_key) DO NOTHING;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_requests_expires_at ON public.verification_requests(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_verification_requests_code ON public.verification_requests(verification_code);

CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON public.verification_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_history_request_id ON public.verification_history(request_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_action ON public.verification_history(action, created_at DESC);

-- ================================================================
-- RLS POLICIES
-- ================================================================

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_settings ENABLE ROW LEVEL SECURITY;

-- Verification requests policies
CREATE POLICY "verification_requests_own" ON public.verification_requests
    FOR ALL
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "verification_requests_admin" ON public.verification_requests
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ));

-- Verification history policies  
CREATE POLICY "verification_history_own" ON public.verification_history
    FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "verification_history_admin" ON public.verification_history
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ));

-- Verification settings policies (admin only)
CREATE POLICY "verification_settings_admin_only" ON public.verification_settings
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users 
        WHERE auth_id = auth.uid() AND role = 'admin'
    ));

-- Service role policies
CREATE POLICY "service_role_verification_requests" ON public.verification_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_verification_history" ON public.verification_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_verification_settings" ON public.verification_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user RECORD;
    v_day_name TEXT;
    v_code TEXT;
    v_required_text TEXT;
    v_result JSON;
BEGIN
    -- Get user info
    SELECT username, name INTO v_user
    FROM users WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RAISE EXCEPTION 'User not found';
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
    v_code := UPPER(substring(encode(gen_random_bytes(4), 'hex') from 1 for 8));
    
    -- Create required text
    v_required_text := 'OPENLOVE ' || v_day_name || ' @' || v_user.username || ' ' || v_code;
    
    v_result := json_build_object(
        'code', v_code,
        'day_of_week', v_day_name,
        'required_text', v_required_text,
        'username', v_user.username
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_user_perform_action(
    p_user_id UUID,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user RECORD;
    v_required_actions TEXT[];
    v_settings RECORD;
BEGIN
    -- Get user verification status
    SELECT is_verified, is_premium, role INTO v_user
    FROM users WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Admins can always perform actions
    IF v_user.role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- If user is already verified, allow all actions
    IF v_user.is_verified THEN
        RETURN TRUE;
    END IF;
    
    -- Get verification settings
    SELECT 
        (settings.setting_value::boolean) AS require_verification,
        (actions.setting_value::json->>0) AS required_actions_json
    INTO v_settings
    FROM 
        (SELECT setting_value FROM verification_settings WHERE setting_key = 'require_verification_for_interactions') settings,
        (SELECT setting_value FROM verification_settings WHERE setting_key = 'verification_required_actions') actions;
    
    -- If verification is not required, allow all actions
    IF NOT COALESCE(v_settings.require_verification, true) THEN
        RETURN TRUE;
    END IF;
    
    -- Get required actions array
    SELECT ARRAY(
        SELECT json_array_elements_text(setting_value::json)
        FROM verification_settings 
        WHERE setting_key = 'verification_required_actions'
    ) INTO v_required_actions;
    
    -- Check if action requires verification
    IF p_action = ANY(v_required_actions) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old verification requests
CREATE OR REPLACE FUNCTION expire_old_verification_requests()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE verification_requests 
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE 
        status IN ('pending', 'submitted') 
        AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log expired requests
    INSERT INTO verification_history (user_id, request_id, action, details)
    SELECT 
        user_id, 
        id, 
        'expired',
        json_build_object('expired_at', NOW(), 'auto_expired', true)
    FROM verification_requests 
    WHERE status = 'expired' AND updated_at = (SELECT MAX(updated_at) FROM verification_requests WHERE status = 'expired');
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_updated_at();

-- History logging trigger
CREATE OR REPLACE FUNCTION log_verification_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO verification_history (user_id, request_id, action, details, performed_by)
        VALUES (
            NEW.user_id,
            NEW.id,
            NEW.status,
            json_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'changed_at', NOW()
            ),
            NEW.reviewed_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_verification_changes
    AFTER UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_changes();

-- ================================================================
-- GRANTS
-- ================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT SELECT, INSERT ON public.verification_history TO authenticated;
GRANT SELECT ON public.verification_settings TO authenticated;

GRANT EXECUTE ON FUNCTION generate_verification_code(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION can_user_perform_action(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION expire_old_verification_requests() TO service_role;

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'PROFILE VERIFICATION SYSTEM CREATED!';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- verification_requests (main verification data)';
    RAISE NOTICE '- verification_history (audit trail)';
    RAISE NOTICE '- verification_settings (admin configuration)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features implemented:';
    RAISE NOTICE '- Photo verification with custom codes';
    RAISE NOTICE '- Admin approval workflow';
    RAISE NOTICE '- Action restrictions for unverified users';
    RAISE NOTICE '- Automatic code expiration';
    RAISE NOTICE '- Complete audit trail';
    RAISE NOTICE '- Configurable settings';
    RAISE NOTICE '================================================================';
END $$;