-- Final Questions Import - Fixed for existing table structure
-- This works with the existing questions table structure

-- Add missing columns if they don't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS help_text TEXT;

-- Clear existing sample data
DELETE FROM questions WHERE question_id LIKE 'Q%';

-- Import questions with both 'order' and 'order_index' columns
INSERT INTO questions (question_id, section, question_text, question_type, options, "order", order_index, help_text) VALUES

-- Sexual Knowledge & Physical Expectations (6 questions)
('sexual-experience-virginity', 'sexual-knowledge', 'Are you a virgin, and have you and your partner discussed what virginity means to each of you?', 'multiple_choice', 
'{"options": ["Yes, I am a virgin and my partner knows this", "No, I am not a virgin but my partner thinks I am a virgin", "No, I am not a virgin and my partner knows this", "We have not discussed our sexual experience levels"]}', 1, 1,
'People define virginity differently - some count only intercourse, others include oral sex or other intimate activities.'),

('knowledge-level', 'sexual-knowledge', 'How much do you actually know about what happens during sex?', 'multiple_choice',
'{"options": ["I feel pretty well-informed about the physical and emotional realities", "I understand the basics but know there is more to learn", "I have a general idea but lots of questions about what it is really like", "I really do not know much about the actual experience"]}', 2, 2,
'There is no shame in not knowing much - most people saving sex for marriage learn from bits and pieces.'),

('pain-expectations', 'sexual-knowledge', 'What are your expectations about pain during first-time sex?', 'multiple_choice',
'{"options": ["I have heard it is really painful and I am pretty worried about it", "I expect some discomfort at first but think it will get better quickly", "I do not really expect pain - maybe just some newness to adjust to", "I honestly have no idea what to expect and that makes me nervous"]}', 3, 3,
'You have probably heard different stories about first-time sex - some scary, some not.'),

('orgasm-knowledge', 'sexual-knowledge', 'Rate your knowledge about orgasms and sexual climax:', 'scale',
'{"min": 1, "max": 5, "labels": {"1": "I really do not know anything about this", "2": "I have heard the word but do not know much", "3": "I have a basic idea but lots of questions", "4": "I understand the basics pretty well", "5": "I feel well-informed about this topic"}}', 4, 4,
'Orgasms are a normal part of sexual pleasure, but many people do not really understand what they are or how they work.'),

('female-arousal', 'sexual-knowledge', 'What do you know about how women get aroused and what they need to feel pleasure?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there is more to learn", "I know very little about this", "I have never really learned about this topic"]}', 5, 5,
'Understanding how womens bodies respond sexually is crucial for a satisfying marriage, regardless of your gender.'),

('male-arousal', 'sexual-knowledge', 'What do you know about how men get aroused and what they need to feel satisfied?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there is more to learn", "I know very little about this", "I have never really learned about this topic"]}', 6, 6,
'Male sexuality might seem straightforward, but there is more to learn about what men actually need for satisfying intimacy.'),

-- Sexual Activities & Comfort Levels (8 questions)
('nudity-comfort', 'sexual-activities', 'How do you feel about being completely naked during sex?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 7, 7,
'Being naked together is the foundation of sexual intimacy. It is normal to feel nervous about this level of vulnerability.'),

('intercourse', 'sexual-activities', 'How do you feel about having intercourse (penis in vagina)?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 8, 8,
'This is probably what you think of most when you imagine sex. Your feelings about it are all completely normal.'),

('manual-stimulation', 'sexual-activities', 'How do you feel about using your hands to sexually pleasure your partner?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 9, 9,
'Using your hands to pleasure your partner is often how couples learn what feels good together.'),

('oral-sex', 'sexual-activities', 'How do you feel about oral sex in marriage?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no", "I have concerns about whether this fits our values"]}', 10, 10,
'This is one of those topics that Christians have different opinions about.'),

('anal-sex', 'sexual-activities', 'How do you feel about anal sex in marriage?', 'multiple_choice',
'{"options": ["Interested in trying this", "Curious but want to learn about it safely first", "This does not appeal to me and I want to be able to say no", "I have concerns about whether this fits our values"]}', 11, 11,
'This is definitely not something all couples try, and it is completely fine to say no.'),

('sexual-positions', 'sexual-activities', 'How do you feel about having sex in different positions?', 'multiple_choice',
'{"options": ["Very interested in exploring different positions", "Like to try some when we are ready", "Prefer to get comfortable with basics first", "Like the idea of keeping things simple"]}', 12, 12,
'There are many ways to have sex beyond the basic position. Some couples love exploring variety, others prefer keeping things simple.'),

('talking-during-sex-activity', 'sexual-activities', 'How do you feel about talking during sex?', 'multiple_choice',
'{"options": ["Want us to talk openly about what feels good", "Some talking sounds good but I might be naturally quieter", "More comfortable with non-verbal communication", "Prefer to focus on the physical connection without much talking"]}', 13, 13,
'Some people are naturally more vocal during sex, others are quieter. Both are normal.'),

-- Success message for first batch
SELECT 'First 13 questions imported successfully! Run the next script for remaining questions.' as message;