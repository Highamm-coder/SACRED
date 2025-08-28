-- Assessment Tables Migration
-- This handles existing tables and adds missing columns

-- First, let's check what exists and add missing columns to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS help_text TEXT;

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS scoring_weight DECIMAL(3,2) DEFAULT 1.0;

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE;

-- Update existing questions to have proper order_index values
UPDATE questions SET order_index = COALESCE("order", 0) WHERE order_index = 0 OR order_index IS NULL;

-- Now create the other tables if they don't exist
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_interpretations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id TEXT,
    score_range_min INTEGER,
    score_range_max INTEGER,
    interpretation_title TEXT NOT NULL,
    interpretation_text TEXT NOT NULL,
    recommendations TEXT,
    color_code TEXT DEFAULT '#6B5B73',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section);
CREATE INDEX IF NOT EXISTS idx_assessment_sections_order ON assessment_sections(order_index);

-- Enable RLS on new tables
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_config ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables (drop first if they exist)
DROP POLICY IF EXISTS "Public can read active sections" ON assessment_sections;
CREATE POLICY "Public can read active sections" ON assessment_sections
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read interpretations" ON assessment_interpretations;
CREATE POLICY "Public can read interpretations" ON assessment_interpretations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage sections" ON assessment_sections;
CREATE POLICY "Admins can manage sections" ON assessment_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage interpretations" ON assessment_interpretations;
CREATE POLICY "Admins can manage interpretations" ON assessment_interpretations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage config" ON assessment_config;
CREATE POLICY "Admins can manage config" ON assessment_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Insert sample sections
INSERT INTO assessment_sections (section_id, title, description, order_index, instructions) VALUES 
('expectations', 'Expectations & Goals', 'Understanding your hopes and expectations for marriage', 1, 'This section explores what you both expect from married life together.'),
('communication', 'Communication Styles', 'How you communicate with each other', 2, 'These questions help identify your communication patterns and preferences.'),
('intimacy', 'Intimacy & Connection', 'Physical and emotional intimacy expectations', 3, 'This section addresses important topics about intimacy in marriage.'),
('conflict', 'Conflict Resolution', 'How you handle disagreements and challenges', 4, 'Understanding how you both approach and resolve conflicts.'),
('spirituality', 'Spiritual Connection', 'Your spiritual life together', 5, 'Exploring your shared faith and spiritual journey as a couple.')
ON CONFLICT (section_id) DO NOTHING;

-- Success message
SELECT 'Assessment tables migrated successfully! 📝' as message;