-- Fix questions table structure and import data
-- First, let's see what columns exist and add missing ones

-- Add missing columns to existing questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS help_text TEXT;

-- Now import all the real questions (using simpler column structure)
DELETE FROM questions WHERE question_id NOT LIKE 'Q%' OR question_id IS NULL;

INSERT INTO questions (question_id, section, question_text, question_type, options, order_index, help_text) VALUES

-- Sexual Knowledge & Physical Expectations (6 questions)
('sexual-experience-virginity', 'sexual-knowledge', 'Are you a virgin, and have you and your partner discussed what virginity means to each of you?', 'multiple_choice', 
'{"options": ["Yes, I am a virgin and my partner knows this", "No, I am not a virgin but my partner thinks I am a virgin", "No, I am not a virgin and my partner knows this", "We have not discussed our sexual experience levels"]}', 1,
'People define virginity differently - some count only intercourse, others include oral sex or other intimate activities.'),

('knowledge-level', 'sexual-knowledge', 'How much do you actually know about what happens during sex?', 'multiple_choice',
'{"options": ["I feel pretty well-informed about the physical and emotional realities", "I understand the basics but know there is more to learn", "I have a general idea but lots of questions about what it is really like", "I really do not know much about the actual experience"]}', 2,
'There is no shame in not knowing much - most people saving sex for marriage learn from bits and pieces.'),

('pain-expectations', 'sexual-knowledge', 'What are your expectations about pain during first-time sex?', 'multiple_choice',
'{"options": ["I have heard it is really painful and I am pretty worried about it", "I expect some discomfort at first but think it will get better quickly", "I do not really expect pain - maybe just some newness to adjust to", "I honestly have no idea what to expect and that makes me nervous"]}', 3,
'You have probably heard different stories about first-time sex - some scary, some not.'),

('orgasm-knowledge', 'sexual-knowledge', 'Rate your knowledge about orgasms and sexual climax:', 'scale',
'{"min": 1, "max": 5, "labels": {"1": "I really do not know anything about this", "2": "I have heard the word but do not know much", "3": "I have a basic idea but lots of questions", "4": "I understand the basics pretty well", "5": "I feel well-informed about this topic"}}', 4,
'Orgasms are a normal part of sexual pleasure, but many people do not really understand what they are or how they work.'),

('female-arousal', 'sexual-knowledge', 'What do you know about how women get aroused and what they need to feel pleasure?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there is more to learn", "I know very little about this", "I have never really learned about this topic"]}', 5,
'Understanding how women''s bodies respond sexually is crucial for a satisfying marriage, regardless of your gender.'),

('male-arousal', 'sexual-knowledge', 'What do you know about how men get aroused and what they need to feel satisfied?', 'multiple_choice',
'{"options": ["I understand pretty well how this works", "I know some basics but there is more to learn", "I know very little about this", "I have never really learned about this topic"]}', 6,
'Male sexuality might seem straightforward, but there is more to learn about what men actually need for satisfying intimacy.'),

-- Sexual Activities & Comfort Levels (8 questions)
('nudity-comfort', 'sexual-activities', 'How do you feel about being completely naked during sex?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 7,
'Being naked together is the foundation of sexual intimacy. It is normal to feel nervous about this level of vulnerability.'),

('intercourse', 'sexual-activities', 'How do you feel about having intercourse (penis in vagina)?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 8,
'This is probably what you think of most when you imagine sex. Your feelings about it are all completely normal.'),

('manual-stimulation', 'sexual-activities', 'How do you feel about using your hands to sexually pleasure your partner?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no"]}', 9,
'Using your hands to pleasure your partner is often how couples learn what feels good together.'),

('oral-sex', 'sexual-activities', 'How do you feel about oral sex in marriage?', 'multiple_choice',
'{"options": ["Excited/very interested", "Interested but nervous/want to learn", "Neutral/willing to try", "Does not appeal to me/want to say no", "I have concerns about whether this fits our values"]}', 10,
'This is one of those topics that Christians have different opinions about.'),

('anal-sex', 'sexual-activities', 'How do you feel about anal sex in marriage?', 'multiple_choice',
'{"options": ["Interested in trying this", "Curious but want to learn about it safely first", "This does not appeal to me and I want to be able to say no", "I have concerns about whether this fits our values"]}', 11,
'This is definitely not something all couples try, and it is completely fine to say no.'),

('sexual-positions', 'sexual-activities', 'How do you feel about having sex in different positions?', 'multiple_choice',
'{"options": ["Very interested in exploring different positions", "Like to try some when we are ready", "Prefer to get comfortable with basics first", "Like the idea of keeping things simple"]}', 12,
'There are many ways to have sex beyond the basic position. Some couples love exploring variety, others prefer keeping things simple.'),

('talking-during-sex-activity', 'sexual-activities', 'How do you feel about talking during sex?', 'multiple_choice',
'{"options": ["Want us to talk openly about what feels good", "Some talking sounds good but I might be naturally quieter", "More comfortable with non-verbal communication", "Prefer to focus on the physical connection without much talking"]}', 13,
'Some people are naturally more vocal during sex, others are quieter. Both are normal.'),

-- Orgasm, Pleasure & Sexual Performance (5 questions)
('orgasm-expectations', 'orgasm-pleasure', 'What are your expectations about reaching orgasm?', 'multiple_choice',
'{"options": ["I expect to reach orgasm most times we have sex", "I hope to reach orgasm regularly but know it may take practice", "I am not sure if I will be able to reach orgasm easily", "Reaching orgasm is not a priority for me", "I do not really know what to expect about my own sexual response"]}', 14,
'Many people have unrealistic expectations about orgasms - how often they should happen, how easy they should be.'),

('orgasm-patience', 'orgasm-pleasure', 'How do you feel about the possibility that reaching orgasm might take practice and patience?', 'multiple_choice',
'{"options": ["Completely fine - I expect a learning curve", "Somewhat concerned but willing to be patient", "Worried this might be frustrating for my partner", "Concerned this means something is wrong with me", "Very anxious about sexual performance in general"]}', 15,
'For many people, especially women, learning to climax takes time and patience.'),

('orgasm-differences', 'orgasm-pleasure', 'What if your partner reaches orgasm much more quickly/easily than you do?', 'multiple_choice',
'{"options": ["This would be completely normal and fine", "I would want to work together to figure out what I need", "I would be somewhat disappointed but understanding", "I would worry that I am not normal or that something is wrong", "I would feel pressure to fake orgasms to avoid disappointing my partner"]}', 16,
'It is really common for partners to have different orgasm patterns.'),

('partner-orgasm', 'orgasm-pleasure', 'How important is it that you are able to help your partner reach orgasm?', 'multiple_choice',
'{"options": ["Extremely important - I want to learn exactly what they need", "Very important - I want to be a generous lover", "Somewhat important but I know it takes time to learn", "Not very important - I assume they will figure out their own needs", "I am not sure this should be my responsibility"]}', 17,
'Wanting to please your partner sexually is natural and loving.'),

('masturbation', 'orgasm-pleasure', 'What are your thoughts about masturbation within marriage?', 'multiple_choice',
'{"options": ["Completely fine for both partners as needed", "Okay occasionally but prefer sex together", "Acceptable only if discussed with partner first", "Uncomfortable with the idea in marriage", "Believe this is not appropriate for married Christians"]}', 18,
'Christians have different views on this topic.');

-- Success message
SELECT 'Questions table fixed and data imported successfully! 🎉' as message;