-- CMS Schema Migration Script
-- This script safely migrates existing data to the corrected schema
-- Run this on your existing Supabase database to fix CMS issues

-- Create a backup note
-- IMPORTANT: Always backup your database before running migrations!

BEGIN;

-- Add missing columns to education_resources table
ALTER TABLE education_resources 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add missing columns to product_recommendations table
ALTER TABLE product_recommendations 
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add missing columns to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create the missing reflection_questions table
CREATE TABLE IF NOT EXISTS reflection_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    question_text TEXT,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    order_index INTEGER DEFAULT 0,
    category TEXT,
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing data to populate new columns where possible
-- For education_resources: copy author_id display name to author column
UPDATE education_resources 
SET author = COALESCE(
    (SELECT full_name FROM profiles WHERE profiles.id = education_resources.author_id),
    'Unknown Author'
)
WHERE author IS NULL;

-- For education_resources: copy video_url to external_url if external_url is null
UPDATE education_resources 
SET external_url = video_url 
WHERE external_url IS NULL AND video_url IS NOT NULL;

-- For education_resources: copy thumbnail to featured_image if featured_image is null
UPDATE education_resources 
SET featured_image = thumbnail 
WHERE featured_image IS NULL AND thumbnail IS NOT NULL;

-- Generate slugs for education_resources if they don't exist
UPDATE education_resources 
SET slug = lower(
    regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    )
)
WHERE slug IS NULL;

-- Handle potential slug duplicates for education_resources
DO $$
DECLARE
    rec RECORD;
    new_slug TEXT;
    counter INTEGER;
BEGIN
    FOR rec IN 
        SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
        FROM education_resources 
        WHERE slug IS NOT NULL
    LOOP
        IF rec.rn > 1 THEN
            counter := rec.rn - 1;
            new_slug := rec.slug || '-' || counter;
            UPDATE education_resources SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- For product_recommendations: copy author_name to author
UPDATE product_recommendations 
SET author = author_name 
WHERE author IS NULL AND author_name IS NOT NULL;

-- For product_recommendations: copy affiliate_url to external_url if needed
UPDATE product_recommendations 
SET external_url = affiliate_url 
WHERE external_url IS NULL AND affiliate_url IS NOT NULL;

-- Generate slugs for product_recommendations
UPDATE product_recommendations 
SET slug = lower(
    regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    )
)
WHERE slug IS NULL;

-- Handle potential slug duplicates for product_recommendations
DO $$
DECLARE
    rec RECORD;
    new_slug TEXT;
    counter INTEGER;
BEGIN
    FOR rec IN 
        SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
        FROM product_recommendations 
        WHERE slug IS NOT NULL
    LOOP
        IF rec.rn > 1 THEN
            counter := rec.rn - 1;
            new_slug := rec.slug || '-' || counter;
            UPDATE product_recommendations SET slug = new_slug WHERE id = rec.id;
        END IF;
    END LOOP;
END $$;

-- Generate slugs for page_content using page_slug
UPDATE page_content 
SET slug = page_slug 
WHERE slug IS NULL;

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_education_resources_slug ON education_resources(slug);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_slug ON product_recommendations(slug);
CREATE INDEX IF NOT EXISTS idx_reflection_questions_status ON reflection_questions(status);
CREATE INDEX IF NOT EXISTS idx_reflection_questions_slug ON reflection_questions(slug);

-- Set up RLS for reflection_questions
ALTER TABLE reflection_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published reflection questions" ON reflection_questions
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage reflection questions" ON reflection_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add trigger for updated_at on reflection_questions
CREATE TRIGGER update_reflection_questions_updated_at 
BEFORE UPDATE ON reflection_questions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample reflection questions if the table is empty
INSERT INTO reflection_questions (title, slug, content, status, published_at, order_index)
SELECT * FROM (VALUES
    ('What are your deepest hopes for intimacy in your marriage?', 'deepest-hopes-intimacy', 'This question helps couples explore their expectations and desires for physical and emotional intimacy.', 'published', NOW(), 1),
    ('How do you want to honor God in your physical relationship?', 'honor-god-physical-relationship', 'Reflect on how your faith shapes your approach to marital intimacy.', 'published', NOW(), 2),
    ('What fears or concerns do you have about married life?', 'fears-concerns-married-life', 'A safe space to discuss anxieties and work through them together.', 'published', NOW(), 3),
    ('How do you envision growing together spiritually as a couple?', 'spiritual-growth-couple', 'Explore how your marriage can strengthen your faith journey.', 'published', NOW(), 4)
) AS new_questions(title, slug, content, status, published_at, order_index)
WHERE NOT EXISTS (SELECT 1 FROM reflection_questions LIMIT 1);

COMMIT;

-- Verification queries to run after migration
-- Uncomment these to verify the migration worked correctly:

/*
-- Check education_resources structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'education_resources' 
ORDER BY ordinal_position;

-- Check reflection_questions table exists and has data
SELECT COUNT(*) as reflection_questions_count FROM reflection_questions;

-- Check for any null slugs that need attention
SELECT 'education_resources' as table_name, COUNT(*) as null_slugs FROM education_resources WHERE slug IS NULL
UNION ALL
SELECT 'product_recommendations', COUNT(*) FROM product_recommendations WHERE slug IS NULL
UNION ALL
SELECT 'reflection_questions', COUNT(*) FROM reflection_questions WHERE slug IS NULL;

-- Test a sample query that was failing before
SELECT id, title, author, external_url, featured_image FROM education_resources LIMIT 5;
*/