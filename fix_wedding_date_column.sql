-- Add missing wedding_date column to couple_assessments table
-- This field is required by the onboarding flow but missing from the schema

ALTER TABLE public.couple_assessments 
ADD COLUMN IF NOT EXISTS wedding_date DATE;

-- Add a comment for documentation
COMMENT ON COLUMN public.couple_assessments.wedding_date IS 'The wedding date provided during onboarding';