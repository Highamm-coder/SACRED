-- Import Real Assessment Data from CSV
-- This imports all the actual SACRED assessment questions

-- Clear existing data first
DELETE FROM questions WHERE question_id LIKE 'Q%';

-- Update assessment sections with real data
UPDATE assessment_sections SET 
    title = 'Sexual Knowledge & Physical Expectations',
    description = 'Understanding what you already know about sexual intimacy',
    instructions = 'Let''s start by understanding what you already know about sexual intimacy.',
    order_index = 1
WHERE section_id = 'expectations';

UPDATE assessment_sections SET 
    section_id = 'sexual-activities',
    title = 'Sexual Activities & Comfort Levels',
    description = 'Exploring your comfort with different aspects of intimacy',
    instructions = 'It''s totally normal if you don''t know what some of these activities are - that''s exactly why we''re asking! Click ''What is this?'' if you want a simple explanation before answering.',
    order_index = 2
WHERE section_id = 'communication';

UPDATE assessment_sections SET 
    section_id = 'orgasm-pleasure',
    title = 'Orgasm, Pleasure & Sexual Performance',
    description = 'Expectations around sexual pleasure and performance',
    instructions = 'Let''s talk about expectations around sexual pleasure and performance.',
    order_index = 3
WHERE section_id = 'intimacy';

UPDATE assessment_sections SET 
    section_id = 'bodies-nudity',
    title = 'Bodies, Nudity & Physical Intimacy',
    description = 'Comfort levels with physical intimacy and body image',
    instructions = 'Let''s explore comfort levels with physical intimacy and body image.',
    order_index = 4
WHERE section_id = 'conflict';

UPDATE assessment_sections SET 
    section_id = 'frequency-desire',
    title = 'Frequency, Initiation & Sexual Desire',
    description = 'Expectations around how often you''ll have sex and who initiates',
    instructions = 'Let''s talk about expectations around how often you''ll have sex and who initiates.',
    order_index = 5
WHERE section_id = 'spirituality';

-- Add new sections
INSERT INTO assessment_sections (section_id, title, description, instructions, order_index) VALUES
('sexual-knowledge', 'Sexual Knowledge & Physical Expectations', 'Understanding what you already know about sexual intimacy', 'Let''s start by understanding what you already know about sexual intimacy.', 1),
('sexual-activities', 'Sexual Activities & Comfort Levels', 'Exploring your comfort with different aspects of intimacy', 'It''s totally normal if you don''t know what some of these activities are - that''s exactly why we''re asking!', 2),
('orgasm-pleasure', 'Orgasm, Pleasure & Sexual Performance', 'Expectations around sexual pleasure and performance', 'Let''s talk about expectations around sexual pleasure and performance.', 3),
('bodies-nudity', 'Bodies, Nudity & Physical Intimacy', 'Comfort levels with physical intimacy and body image', 'Let''s explore comfort levels with physical intimacy and body image.', 4),
('frequency-desire', 'Frequency, Initiation & Sexual Desire', 'Expectations around how often you''ll have sex and who initiates', 'Let''s talk about expectations around how often you''ll have sex and who initiates.', 5),
('communication-sex', 'Communication During Sex', 'How you''ll communicate during intimate moments', 'Let''s explore how you''ll communicate during intimate moments.', 6),
('sexual-challenges', 'Sexual Problems & Challenges', 'How to handle potential challenges in your sexual relationship', 'Let''s discuss how you might handle potential challenges in your sexual relationship.', 7)
ON CONFLICT (section_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    instructions = EXCLUDED.instructions,
    order_index = EXCLUDED.order_index;

-- Insert all the real questions
INSERT INTO questions (question_id, section, question_text, question_type, options, order_index, help_text) VALUES

-- Sexual Knowledge questions
('sexual-experience-virginity', 'sexual-knowledge', 'Are you a virgin, and have you and your partner discussed what virginity means to each of you?', 'multiple_choice', 
'{"options": ["Yes, I''m a virgin and my partner knows this", "No, I''m not a virgin but my partner thinks I''m a virgin", "No, I''m not a virgin and my partner knows this", "We haven''t discussed our sexual experience levels"]}', 1,
'People define virginity differently - some count only intercourse, others include oral sex or other intimate activities. What matters most is that you and your partner are completely honest about your actual experience levels and understand each other''s definitions.'),

('knowledge-level', 'sexual-knowledge', 'How much do you actually know about what happens during sex?', 'multiple_choice',
'{"options": ["I feel pretty well-informed about the physical and emotional realities", "I understand the basics but know there''s more to learn", "I have a general idea but lots of questions about what it''s really like", "I really don''t know much about the actual experience"]}', 2,
'There''s no shame in not knowing much - most people saving sex for marriage learn from bits and pieces rather than comprehensive education.'),

('pain-expectations', 'sexual-knowledge', 'What are your expectations about pain during first-time sex?', 'multiple_choice',
'{"options": ["I''ve heard it''s really painful and I''m pretty worried about it", "I expect some discomfort at first but think it''ll get better quickly", "I don''t really expect pain - maybe just some newness to adjust to", "I honestly have no idea what to expect and that makes me nervous"]}', 3,
'You''ve probably heard different stories about first-time sex - some scary, some not. Your expectations matter because they affect how you approach your wedding night.'),

('orgasm-knowledge', 'sexual-knowledge', 'Rate your knowledge about orgasms and sexual climax:', 'scale',
'{"min": 1, "max": 5, "labels": {"1": "I really don''t know anything about this", "2": "I''ve heard the word but don''t know much", "3": "I have a basic idea but lots of questions", "4": "I understand the basics pretty well", "5": "I feel well-informed about this topic"}}', 4,
'Orgasms are a normal part of sexual pleasure, but many people don''t really understand what they are or how they work.'),

('female-arousal', 'sexual-knowledge', 'What do you know about how women get aroused and what they need to feel pleasure?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there''s more to learn", "I know very little about this", "I''ve never really learned about this topic"]}', 5,
'Understanding how women''s bodies respond sexually is crucial for a satisfying marriage, regardless of your gender.'),

('male-arousal', 'sexual-knowledge', 'What do you know about how men get aroused and what they need to feel satisfied?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there''s more to learn", "I know very little about this", "I''ve never really learned about this topic"]}', 6,
'Male sexuality might seem straightforward, but there''s more to learn about what men actually need for satisfying intimacy.'),

-- Sexual Activities questions
('nudity-comfort', 'sexual-activities', 'How do you feel about being completely naked during sex?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Doesn''t appeal to me/want to say no"]}', 7,
'Being naked together is the foundation of sexual intimacy. It''s normal to feel nervous about this level of vulnerability.'),

('intercourse', 'sexual-activities', 'How do you feel about having intercourse (penis in vagina)?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Doesn''t appeal to me/want to say no"]}', 8,
'This is probably what you think of most when you imagine sex. Your feelings about it - excitement, nervousness, or uncertainty - are all completely normal.'),

('manual-stimulation', 'sexual-activities', 'How do you feel about using your hands to sexually pleasure your partner?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Doesn''t appeal to me/want to say no"]}', 9,
'Using your hands to pleasure your partner is often how couples learn what feels good together. It''s an important part of sexual intimacy for most couples.'),

('oral-sex', 'sexual-activities', 'How do you feel about oral sex in marriage?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Doesn''t appeal to me/want to say no", "I have concerns about whether this fits our values"]}', 10,
'This is one of those topics that Christians have different opinions about. Some see it as a beautiful part of marriage, others have concerns.'),

('anal-sex', 'sexual-activities', 'How do you feel about anal sex in marriage?', 'multiple_choice',
'{"options": ["Interested in trying this", "Curious but want to learn about it safely first", "This doesn''t appeal to me and I want to be able to say no", "I have concerns about whether this fits our values"]}', 11,
'This is definitely not something all couples try, and it''s completely fine to say no. Even asking about it helps you practice communicating boundaries.'),

('sexual-positions', 'sexual-activities', 'How do you feel about having sex in different positions?', 'multiple_choice',
'{"options": ["Very interested in exploring different positions", "Like to try some when we''re ready", "Prefer to get comfortable with basics first", "Like the idea of keeping things simple"]}', 12,
'There are many ways to have sex beyond the basic position. Some couples love exploring variety, others prefer keeping things simple.'),

('talking-during-sex', 'sexual-activities', 'How do you feel about talking during sex?', 'multiple_choice',
'{"options": ["Want us to talk openly about what feels good", "Some talking sounds good but I might be naturally quieter", "More comfortable with non-verbal communication", "Prefer to focus on the physical connection without much talking"]}', 13,
'Some people are naturally more vocal during sex, others are quieter. Both are normal, but it helps to know what feels natural to you.');

-- Success message
SELECT 'Real assessment data imported successfully! 📝' as message;