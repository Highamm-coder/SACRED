-- Add missing content column to resources table
-- Run this in Supabase SQL Editor

-- Add content column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS content TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Content column added to resources table successfully! 📝' as result;