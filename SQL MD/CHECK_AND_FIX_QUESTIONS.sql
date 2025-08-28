-- Check existing questions table structure and add missing columns
-- This will work with whatever columns currently exist

-- First, let's see what we have (this will show the table structure)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;

-- Add missing columns safely
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS help_text TEXT;

-- Now import without question_type and help_text first, then update them
DELETE FROM questions WHERE question_id NOT LIKE 'Q%';

-- Simple import with just the basic columns that should exist
INSERT INTO questions (question_id, section, question_text, options, "order", order_index) VALUES
('sexual-experience-virginity', 'sexual-knowledge', 'Are you a virgin, and have you and your partner discussed what virginity means to each of you?', 
'{"options": ["Yes, I am a virgin and my partner knows this", "No, I am not a virgin but my partner thinks I am a virgin", "No, I am not a virgin and my partner knows this", "We have not discussed our sexual experience levels"]}', 1, 1),

('knowledge-level', 'sexual-knowledge', 'How much do you actually know about what happens during sex?',
'{"options": ["I feel pretty well-informed about the physical and emotional realities", "I understand the basics but know there is more to learn", "I have a general idea but lots of questions about what it is really like", "I really do not know much about the actual experience"]}', 2, 2),

('pain-expectations', 'sexual-knowledge', 'What are your expectations about pain during first-time sex?',
'{"options": ["I have heard it is really painful and I am pretty worried about it", "I expect some discomfort at first but think it will get better quickly", "I do not really expect pain - maybe just some newness to adjust to", "I honestly have no idea what to expect and that makes me nervous"]}', 3, 3);

-- Then update the columns if they exist
UPDATE questions SET question_type = 'multiple_choice' WHERE question_id IN ('sexual-experience-virginity', 'knowledge-level', 'pain-expectations');
UPDATE questions SET help_text = 'People define virginity differently - some count only intercourse, others include oral sex or other intimate activities.' WHERE question_id = 'sexual-experience-virginity';
UPDATE questions SET help_text = 'There is no shame in not knowing much - most people saving sex for marriage learn from bits and pieces.' WHERE question_id = 'knowledge-level';
UPDATE questions SET help_text = 'You have probably heard different stories about first-time sex - some scary, some not.' WHERE question_id = 'pain-expectations';