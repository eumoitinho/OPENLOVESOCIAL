-- Enhanced User Profiles and Registration System
-- This script creates the necessary tables and functions for the new registration system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for better data consistency
CREATE TYPE profile_type_enum AS ENUM ('single', 'couple');
CREATE TYPE subscription_plan_enum AS ENUM ('free', 'premium-monthly', 'premium-yearly');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');

-- Enhanced profiles table with new fields
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    profile_type profile_type_enum DEFAULT 'single',
    seeking TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    bio TEXT,
    city VARCHAR(255),
    subscription_plan subscription_plan_enum DEFAULT 'free',
    is_premium BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status_enum DEFAULT 'pending',
    partner_info JSONB,
    privacy_settings JSONB DEFAULT '{"show_age": true, "show_location": true, "show_online_status": true}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner profiles table for couple accounts
CREATE TABLE IF NOT EXISTS partner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nickname VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    eye_color VARCHAR(50),
    hair_color VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Age verification table for compliance
CREATE TABLE IF NOT EXISTS age_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    age_at_registration INTEGER NOT NULL,
    verification_method VARCHAR(50) DEFAULT 'self_declared',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Username history for audit purposes
CREATE TABLE IF NOT EXISTS username_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_username VARCHAR(50),
    new_username VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason VARCHAR(255)
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to calculate age from birth date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to verify minimum age (18+)
CREATE OR REPLACE FUNCTION verify_minimum_age(birth_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN calculate_age(birth_date) >= 18;
END;
$$ LANGUAGE plpgsql;

-- Function to check username availability
CREATE OR REPLACE FUNCTION is_username_available(username_to_check VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM profiles WHERE LOWER(username) = LOWER(username_to_check)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile with validation
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    p_username VARCHAR(50),
    p_full_name VARCHAR(255),
    p_email VARCHAR(255),
    p_birth_date DATE,
    p_profile_type profile_type_enum DEFAULT 'single',
    p_seeking TEXT[] DEFAULT '{}',
    p_interests TEXT[] DEFAULT '{}',
    p_bio TEXT DEFAULT '',
    p_city VARCHAR(255) DEFAULT '',
    p_subscription_plan subscription_plan_enum DEFAULT 'free',
    p_partner_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Validate minimum age
    IF NOT verify_minimum_age(p_birth_date) THEN
        RAISE EXCEPTION 'User must be at least 18 years old';
    END IF;
    
    -- Validate username availability
    IF NOT is_username_available(p_username) THEN
        RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    -- Insert profile
    INSERT INTO profiles (
        id, username, full_name, email, birth_date, profile_type,
        seeking, interests, bio, city, subscription_plan,
        is_premium, partner_info
    ) VALUES (
        user_id, LOWER(p_username), p_full_name, p_email, p_birth_date, p_profile_type,
        p_seeking, p_interests, p_bio, p_city, p_subscription_plan,
        (p_subscription_plan != 'free'), p_partner_info
    ) RETURNING id INTO profile_id;
    
    -- Insert age verification record
    INSERT INTO age_verification (profile_id, birth_date, age_at_registration)
    VALUES (profile_id, p_birth_date, calculate_age(p_birth_date));
    
    -- If couple profile, create partner profile
    IF p_profile_type = 'couple' AND p_partner_info IS NOT NULL THEN
        INSERT INTO partner_profiles (
            profile_id, nickname, age, height, weight, eye_color, hair_color
        ) VALUES (
            profile_id,
            (p_partner_info->>'nickname')::VARCHAR(100),
            (p_partner_info->>'age')::INTEGER,
            (p_partner_info->>'height')::INTEGER,
            (p_partner_info->>'weight')::INTEGER,
            (p_partner_info->>'eye_color')::VARCHAR(50),
            (p_partner_info->>'hair_color')::VARCHAR(50)
        );
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_profiles_updated_at
    BEFORE UPDATE ON partner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE username_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Partner profiles policies
CREATE POLICY "Users can manage their partner profiles" ON partner_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = partner_profiles.profile_id 
            AND profiles.id = auth.uid()
        )
    );

-- Age verification policies
CREATE POLICY "Users can view their own age verification" ON age_verification
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = age_verification.profile_id 
            AND profiles.id = auth.uid()
        )
    );

-- Username history policies
CREATE POLICY "Users can view their own username history" ON username_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = username_history.profile_id 
            AND profiles.id = auth.uid()
        )
    );

-- Subscription history policies
CREATE POLICY "Users can view their own subscription history" ON subscription_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = subscription_history.profile_id 
            AND profiles.id = auth.uid()
        )
    );

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features) VALUES
('Free', 0.00, 0.00, '{"max_connections": 10, "max_events": 2, "messaging": "friends_only", "ads": true}'),
('Premium Monthly', 55.00, NULL, '{"max_connections": "unlimited", "max_events": "unlimited", "messaging": "everyone", "ads": false, "advanced_filters": true, "profile_boost": true, "read_receipts": true}'),
('Premium Yearly', NULL, 550.00, '{"max_connections": "unlimited", "max_events": "unlimited", "messaging": "everyone", "ads": false, "advanced_filters": true, "profile_boost": true, "read_receipts": true, "discount": "2_months_free"}')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_profile_id ON partner_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_age_verification_profile_id ON age_verification(profile_id);
CREATE INDEX IF NOT EXISTS idx_username_history_profile_id ON username_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_profile_id ON subscription_history(profile_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'Enhanced user profiles with comprehensive registration data';
COMMENT ON TABLE partner_profiles IS 'Additional profile information for couple accounts';
COMMENT ON TABLE age_verification IS 'Age verification records for compliance';
COMMENT ON TABLE username_history IS 'Audit trail for username changes';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans and features';
COMMENT ON TABLE subscription_history IS 'User subscription history and payments';
COMMENT ON FUNCTION calculate_age(DATE) IS 'Calculate age from birth date';
COMMENT ON FUNCTION verify_minimum_age(DATE) IS 'Verify user is at least 18 years old';
COMMENT ON FUNCTION is_username_available(VARCHAR) IS 'Check if username is available';
COMMENT ON FUNCTION create_user_profile IS 'Create complete user profile with validation';
