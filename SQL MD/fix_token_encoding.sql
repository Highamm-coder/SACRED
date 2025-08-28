-- Fix for base64url encoding error
-- Run this SQL to update the token generation function

-- Drop and recreate the function with compatible encoding
DROP FUNCTION IF EXISTS generate_invite_token();

-- Function to generate secure random tokens (URL-safe base64)
CREATE OR REPLACE FUNCTION generate_invite_token() RETURNS TEXT AS $$
BEGIN
    -- Use base64 encoding and remove problematic characters for URL safety
    RETURN REPLACE(REPLACE(REPLACE(encode(gen_random_bytes(32), 'base64'), '/', '_'), '+', '-'), '=', '');
END;
$$ LANGUAGE plpgsql;