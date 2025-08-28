-- Add Misalignment Discussion Questions to Assessment System
-- This adds support for discussion questions when couples have misaligned answers

-- Add discussion_question field to existing questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS discussion_question TEXT;

COMMENT ON COLUMN questions.discussion_question IS 
'Discussion question to ask couples when they have misaligned answers on this question';

-- Create misalignment_discussions table for tracking couple progress
CREATE TABLE IF NOT EXISTS misalignment_discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES couple_assessments(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES questions(question_id),
    partner1_answer TEXT NOT NULL,
    partner2_answer TEXT NOT NULL, 
    discussion_question TEXT NOT NULL,
    is_discussed BOOLEAN DEFAULT FALSE,
    discussed_at TIMESTAMPTZ NULL,
    notes TEXT, -- Optional notes couples can add
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique constraint per assessment + question
    UNIQUE(assessment_id, question_id)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_misalignment_discussions_assessment 
    ON misalignment_discussions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_misalignment_discussions_discussed 
    ON misalignment_discussions(is_discussed);

-- Row Level Security
ALTER TABLE misalignment_discussions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own assessment discussions
CREATE POLICY "Users can access their own misalignment discussions" 
ON misalignment_discussions FOR ALL USING (
    assessment_id IN (
        SELECT id FROM couple_assessments 
        WHERE partner1_email = auth.email() 
           OR partner2_email = auth.email()
    )
);

-- Add update trigger
CREATE TRIGGER update_misalignment_discussions_updated_at 
    BEFORE UPDATE ON misalignment_discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing questions with discussion questions
UPDATE questions SET discussion_question = CASE 
    WHEN question_id = 'sexual-experience-virginity' THEN 
        'How can you both feel safe and comfortable discussing your sexual histories and what they mean to each of you?'
    
    WHEN question_id = 'knowledge-level' THEN 
        'What would help you both feel more prepared and confident about your sexual relationship together?'
    
    WHEN question_id = 'pain-expectations' THEN 
        'How can you support each other through any physical adjustments in your early intimate experiences?'
    
    WHEN question_id = 'orgasm-knowledge' THEN 
        'What would make you both feel comfortable learning about sexual pleasure together?'
    
    WHEN question_id = 'female-arousal' THEN 
        'How do you want to approach learning about what brings each other pleasure?'
    
    WHEN question_id = 'male-arousal' THEN 
        'What would help you both communicate openly about your physical needs and responses?'
    
    WHEN question_id = 'nudity-comfort' THEN 
        'How can you help each other feel comfortable and confident with physical vulnerability?'
    
    WHEN question_id = 'intercourse' THEN 
        'What would help you both approach your first sexual experiences with patience and care?'
    
    WHEN question_id = 'manual-stimulation' THEN 
        'How do you want to explore physical touch and what feels good for each other?'
    
    WHEN question_id = 'oral-sex' THEN 
        'What values and boundaries do you both want to establish around different expressions of intimacy?'
    
    WHEN question_id = 'anal-sex' THEN 
        'How will you communicate about activities that one of you is curious about but the other isn''t interested in?'
    
    WHEN question_id = 'sexual-positions' THEN 
        'What approach to exploring intimacy would make you both feel adventurous yet comfortable?'
    
    WHEN question_id = 'talking-during-sex' THEN 
        'How can you create an environment where you both feel free to communicate during intimate moments?'
    
    WHEN question_id = 'orgasm-expectations' THEN 
        'How can you both focus on pleasure and connection rather than performance expectations?'
    
    WHEN question_id = 'orgasm-patience' THEN 
        'What would help you maintain patience and encouragement as you learn your sexual responses together?'
    
    WHEN question_id = 'orgasm-differences' THEN 
        'How will you celebrate each other''s unique sexual responses rather than comparing yourselves?'
    
    WHEN question_id = 'partner-orgasm' THEN 
        'How can you both focus on generous intimacy while avoiding pressure to perform?'
    
    WHEN question_id = 'masturbation' THEN 
        'What boundaries and understanding do you want to establish around personal sexuality within marriage?'
    
    WHEN question_id = 'body-comfort-self' THEN 
        'What would help you both feel beautiful and confident in your own skin together?'
    
    WHEN question_id = 'body-comfort-partner' THEN 
        'How can you express appreciation for each other''s bodies in ways that build confidence?'
    
    WHEN question_id = 'body-hair' THEN 
        'What grooming preferences and boundaries do you want to discuss and respect for each other?'
    
    WHEN question_id = 'menstruation' THEN 
        'How do you want to navigate intimacy throughout the wife''s monthly cycles?'
    
    WHEN question_id = 'frequency' THEN 
        'How can you find a rhythm of intimacy that honors both of your natural desires?'
    
    WHEN question_id = 'higher-desire-partner' THEN 
        'How will the partner with higher desire express their needs while respecting their spouse''s comfort level?'
    
    WHEN question_id = 'lower-desire-partner' THEN 
        'How will the partner with lower desire communicate their needs while staying open to intimacy?'
    
    WHEN question_id = 'initiation' THEN 
        'What signals and approaches to initiation would feel natural and welcome for both of you?'
    
    WHEN question_id = 'rejection' THEN 
        'How can you handle moments when one person wants intimacy and the other doesn''t?'
    
    WHEN question_id = 'talking-comfort' THEN 
        'What would help you both feel comfortable communicating during intimate moments?'
    
    WHEN question_id = 'discomfort-communication' THEN 
        'How can you create safe communication when something doesn''t feel good physically?'
    
    WHEN question_id = 'pleasure-communication' THEN 
        'What''s the best way for you to guide each other toward what feels most pleasurable?'
    
    WHEN question_id = 'new-activities' THEN 
        'How do you want to approach discussing and potentially trying new things together?'
    
    WHEN question_id = 'pain-response' THEN 
        'What plan will you have for addressing any physical discomfort in your intimate relationship?'
    
    WHEN question_id = 'orgasm-difficulty' THEN 
        'How will you support each other through any challenges with sexual response or satisfaction?'
    
    WHEN question_id = 'erectile-issues' THEN 
        'How can you approach any physical performance concerns with patience and practical solutions?'
    
    WHEN question_id = 'expectations-vs-reality' THEN 
        'What will you do if your intimate relationship takes more time to develop than you initially expected?'
    
    ELSE discussion_question -- Keep any existing values
END
WHERE question_id IN (
    'sexual-experience-virginity', 'knowledge-level', 'pain-expectations', 'orgasm-knowledge', 
    'female-arousal', 'male-arousal', 'nudity-comfort', 'intercourse', 'manual-stimulation', 
    'oral-sex', 'anal-sex', 'sexual-positions', 'talking-during-sex', 'orgasm-expectations', 
    'orgasm-patience', 'orgasm-differences', 'partner-orgasm', 'masturbation', 
    'body-comfort-self', 'body-comfort-partner', 'body-hair', 'menstruation', 'frequency', 
    'higher-desire-partner', 'lower-desire-partner', 'initiation', 'rejection', 
    'talking-comfort', 'discomfort-communication', 'pleasure-communication', 'new-activities', 
    'pain-response', 'orgasm-difficulty', 'erectile-issues', 'expectations-vs-reality'
);

-- Create RPC function to find couple misalignments
CREATE OR REPLACE FUNCTION find_couple_misalignments(p_assessment_id UUID)
RETURNS TABLE (
    question_id TEXT,
    question_text TEXT,
    section TEXT,
    partner1_answer TEXT,
    partner2_answer TEXT,
    discussion_question TEXT,
    partner1_name TEXT,
    partner2_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.question_id,
        q.question_text,
        q.section,
        a1.answer as partner1_answer,
        a2.answer as partner2_answer,
        q.discussion_question,
        ca.partner1_name,
        ca.partner2_name
    FROM couple_assessments ca
    JOIN answers a1 ON a1.assessment_id = ca.id AND a1.user_email = ca.partner1_email
    JOIN answers a2 ON a2.assessment_id = ca.id AND a2.user_email = ca.partner2_email 
        AND a2.question_id = a1.question_id
    JOIN questions q ON q.question_id = a1.question_id
    WHERE ca.id = p_assessment_id 
        AND a1.answer != a2.answer
        AND q.discussion_question IS NOT NULL
    ORDER BY q.section, q.order_index;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_couple_misalignments(UUID) TO authenticated;

-- Success message
SELECT 'Misalignment discussion questions added successfully! 💬' as message;