-- Simple Assessment Tables Schema
-- Run this in Supabase SQL Editor

-- First create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Assessment Sections
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id TEXT UNIQUE NOT NULL,
    section TEXT NOT NULL,
    category TEXT,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options JSONB,
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    help_text TEXT,
    scoring_weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Interpretations
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

-- Assessment Config
CREATE TABLE IF NOT EXISTS assessment_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_assessment_sections_order ON assessment_sections(order_index);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_config ENABLE ROW LEVEL SECURITY;

-- Create policies (public read for active content)
DROP POLICY IF EXISTS "Public can read active questions" ON questions;
CREATE POLICY "Public can read active questions" ON questions
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active sections" ON assessment_sections;
CREATE POLICY "Public can read active sections" ON assessment_sections
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read interpretations" ON assessment_interpretations;
CREATE POLICY "Public can read interpretations" ON assessment_interpretations
    FOR SELECT USING (true);

-- Admin policies
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

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

-- Add update triggers
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_sections_updated_at ON assessment_sections;
CREATE TRIGGER update_assessment_sections_updated_at BEFORE UPDATE ON assessment_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_interpretations_updated_at ON assessment_interpretations;
CREATE TRIGGER update_assessment_interpretations_updated_at BEFORE UPDATE ON assessment_interpretations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_config_updated_at ON assessment_config;
CREATE TRIGGER update_assessment_config_updated_at BEFORE UPDATE ON assessment_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO assessment_sections (section_id, title, description, order_index, instructions) VALUES 
('expectations', 'Expectations & Goals', 'Understanding your hopes and expectations for marriage', 1, 'This section explores what you both expect from married life together.'),
('communication', 'Communication Styles', 'How you communicate with each other', 2, 'These questions help identify your communication patterns and preferences.'),
('intimacy', 'Intimacy & Connection', 'Physical and emotional intimacy expectations', 3, 'This section addresses important topics about intimacy in marriage.'),
('conflict', 'Conflict Resolution', 'How you handle disagreements and challenges', 4, 'Understanding how you both approach and resolve conflicts.'),
('spirituality', 'Spiritual Connection', 'Your spiritual life together', 5, 'Exploring your shared faith and spiritual journey as a couple.')
ON CONFLICT (section_id) DO NOTHING;

INSERT INTO questions (question_id, section, question_text, question_type, options, order_index) VALUES 
('Q1', 'expectations', 'What are your primary expectations for married life?', 'multiple_choice', 
'{"options": ["Deep companionship", "Starting a family", "Spiritual growth together", "Building a home", "Career partnership"]}', 1),
('Q2', 'expectations', 'How important is physical intimacy to you in marriage?', 'scale', 
'{"min": 1, "max": 10, "labels": {"1": "Not important", "10": "Extremely important"}}', 2),
('Q3', 'communication', 'How do you prefer to discuss difficult topics?', 'multiple_choice',
'{"options": ["Direct conversation", "Written communication", "With time to process first", "In the presence of others", "Avoid until necessary"]}', 3),
('Q4', 'intimacy', 'What does emotional intimacy mean to you?', 'text', null, 4),
('Q5', 'conflict', 'How do you typically respond when you disagree with your partner?', 'multiple_choice',
'{"options": ["Discuss immediately", "Take time to cool down first", "Try to find compromise", "Avoid conflict", "Seek outside perspective"]}', 5)
ON CONFLICT (question_id) DO NOTHING;

-- Success message
SELECT 'Simple Assessment Schema created successfully! 📝' as message;