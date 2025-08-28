-- Assessment Management Tables for SACRED CMS
-- Run this in Supabase SQL Editor to add assessment editing capabilities

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id TEXT UNIQUE NOT NULL, -- String identifier like 'Q1', 'Q2A', etc.
    section TEXT NOT NULL, -- 'expectations', 'communication', 'intimacy', etc.
    category TEXT, -- Sub-category within section
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'scale', 'text', 'boolean', 'ranking')) DEFAULT 'multiple_choice',
    options JSONB, -- For multiple choice, scale options, etc.
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    help_text TEXT, -- Optional explanation or help for the question
    scoring_weight DECIMAL(3,2) DEFAULT 1.0, -- For weighted scoring
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Sections Table (for organizing questions)
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id TEXT UNIQUE NOT NULL, -- 'expectations', 'communication', etc.
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Icon name for UI
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT, -- Instructions shown before this section
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Interpretations Table (for scoring results)
CREATE TABLE IF NOT EXISTS assessment_interpretations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id TEXT REFERENCES assessment_sections(section_id),
    score_range_min INTEGER,
    score_range_max INTEGER,
    interpretation_title TEXT NOT NULL,
    interpretation_text TEXT NOT NULL,
    recommendations TEXT, -- Recommendations for this score range
    color_code TEXT DEFAULT '#6B5B73', -- Color for UI display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Flow Configuration
CREATE TABLE IF NOT EXISTS assessment_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_sections_order ON assessment_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_assessment_interpretations_section ON assessment_interpretations(section_id);

-- Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_config ENABLE ROW LEVEL SECURITY;

-- Public can read active questions and sections
CREATE POLICY "Public can read active questions" ON questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active sections" ON assessment_sections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read interpretations" ON assessment_interpretations
    FOR SELECT USING (true);

-- Admins can manage all assessment content
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage sections" ON assessment_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage interpretations" ON assessment_interpretations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage config" ON assessment_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add update triggers
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_sections_updated_at BEFORE UPDATE ON assessment_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_interpretations_updated_at BEFORE UPDATE ON assessment_interpretations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

INSERT INTO assessment_interpretations (section_id, score_range_min, score_range_max, interpretation_title, interpretation_text) VALUES 
('expectations', 0, 30, 'Developing Expectations', 'Your expectations are still forming. This is normal and healthy as you prepare for marriage.'),
('expectations', 31, 70, 'Well-Defined Expectations', 'You have a good sense of what you want from married life. Continue discussing these with your partner.'),
('expectations', 71, 100, 'Clear Vision', 'You have very clear expectations for marriage. Ensure these align with your partner''s vision.'),
('communication', 0, 30, 'Communication Growth Needed', 'Working on communication skills will benefit your relationship greatly.'),
('communication', 31, 70, 'Good Communication Foundation', 'You have solid communication skills with room for continued growth.'),
('communication', 71, 100, 'Excellent Communicators', 'You communicate very well together. Keep practicing these skills.');

-- Success message
SELECT 'Assessment Management Tables created successfully! 📝' as result;