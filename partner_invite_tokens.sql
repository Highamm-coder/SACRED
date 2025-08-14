-- Partner Invite Tokens System
-- This creates a secure token system for Partner 2 invitations

-- Partner Invite Tokens table
CREATE TABLE IF NOT EXISTS public.partner_invite_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT UNIQUE NOT NULL, -- Secure random token for invite links
    assessment_id UUID REFERENCES public.couple_assessments(id) ON DELETE CASCADE,
    partner1_email TEXT NOT NULL, -- Who sent the invite
    partner2_email TEXT, -- Who the invite is for (optional, can be filled later)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE, -- When partner 2 used the token
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_partner_invite_tokens_token ON public.partner_invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_partner_invite_tokens_assessment ON public.partner_invite_tokens(assessment_id);

-- Function to generate secure random tokens
CREATE OR REPLACE FUNCTION generate_invite_token() RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create a new invite token
CREATE OR REPLACE FUNCTION create_partner_invite_token(
    p_assessment_id UUID,
    p_partner1_email TEXT,
    p_expires_in_hours INTEGER DEFAULT 168 -- Default 7 days
) RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
BEGIN
    new_token := generate_invite_token();
    
    INSERT INTO public.partner_invite_tokens (
        token,
        assessment_id,
        partner1_email,
        expires_at
    ) VALUES (
        new_token,
        p_assessment_id,
        p_partner1_email,
        timezone('utc'::text, now()) + INTERVAL '1 hour' * p_expires_in_hours
    );
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use a token
CREATE OR REPLACE FUNCTION use_invite_token(
    p_token TEXT,
    p_partner2_email TEXT
) RETURNS TABLE(
    assessment_id UUID,
    partner1_email TEXT,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Find the token
    SELECT * INTO token_record
    FROM public.partner_invite_tokens
    WHERE token = p_token;
    
    -- Check if token exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, FALSE, 'Invalid invite link';
        RETURN;
    END IF;
    
    -- Check if token is expired
    IF token_record.expires_at < timezone('utc'::text, now()) THEN
        UPDATE public.partner_invite_tokens
        SET status = 'expired', updated_at = timezone('utc'::text, now())
        WHERE token = p_token;
        
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, FALSE, 'This invite link has expired';
        RETURN;
    END IF;
    
    -- Check if token is already used
    IF token_record.status = 'used' THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, FALSE, 'This invite link has already been used';
        RETURN;
    END IF;
    
    -- Mark token as used
    UPDATE public.partner_invite_tokens
    SET 
        status = 'used',
        used_at = timezone('utc'::text, now()),
        partner2_email = p_partner2_email,
        updated_at = timezone('utc'::text, now())
    WHERE token = p_token;
    
    -- Return success
    RETURN QUERY SELECT 
        token_record.assessment_id,
        token_record.partner1_email,
        TRUE,
        NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies
ALTER TABLE public.partner_invite_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own invite tokens
CREATE POLICY "Users can read their own invite tokens" ON public.partner_invite_tokens
    FOR SELECT USING (auth.email() = partner1_email OR auth.email() = partner2_email);

-- Policy: Users can create invite tokens for their assessments
CREATE POLICY "Users can create invite tokens" ON public.partner_invite_tokens
    FOR INSERT WITH CHECK (auth.email() = partner1_email);

-- Policy: System can update tokens (for token usage)
CREATE POLICY "System can update tokens" ON public.partner_invite_tokens
    FOR UPDATE USING (true);