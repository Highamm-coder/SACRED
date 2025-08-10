-- Add wedding_date column to couple_assessments table
ALTER TABLE public.couple_assessments 
ADD COLUMN wedding_date DATE;

-- Add comment to the column
COMMENT ON COLUMN public.couple_assessments.wedding_date IS 'The wedding date provided by the couple during onboarding';