-- Complete Assessment Data Import - All 36 Questions
-- This imports ALL the SACRED assessment questions from the CSV

-- Clear existing sample data
DELETE FROM questions WHERE question_id LIKE 'Q%';

-- Update/Insert all assessment sections
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

-- Insert ALL 36 questions
INSERT INTO questions (question_id, section, question_text, question_type, options, order_index, help_text) VALUES

-- Sexual Knowledge & Physical Expectations (6 questions)
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

-- Sexual Activities & Comfort Levels (8 questions)
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
'Some people are naturally more vocal during sex, others are quieter. Both are normal, but it helps to know what feels natural to you.'),

-- Orgasm, Pleasure & Sexual Performance (5 questions)
('orgasm-expectations', 'orgasm-pleasure', 'What are your expectations about reaching orgasm?', 'multiple_choice',
'{"options": ["I expect to reach orgasm most times we have sex", "I hope to reach orgasm regularly but know it may take practice", "I''m not sure if I''ll be able to reach orgasm easily", "Reaching orgasm isn''t a priority for me", "I don''t really know what to expect about my own sexual response"]}', 14,
'Many people have unrealistic expectations about orgasms - how often they should happen, how easy they should be, or whether they''re required for good sex.'),

('orgasm-patience', 'orgasm-pleasure', 'How do you feel about the possibility that reaching orgasm might take practice and patience?', 'multiple_choice',
'{"options": ["Completely fine - I expect a learning curve", "Somewhat concerned but willing to be patient", "Worried this might be frustrating for my partner", "Concerned this means something is wrong with me", "Very anxious about sexual performance in general"]}', 15,
'For many people, especially women, learning to climax takes time and patience. There''s nothing wrong with needing to figure this out together.'),

('orgasm-differences', 'orgasm-pleasure', 'What if your partner reaches orgasm much more quickly/easily than you do?', 'multiple_choice',
'{"options": ["This would be completely normal and fine", "I''d want to work together to figure out what I need", "I''d be somewhat disappointed but understanding", "I''d worry that I''m not normal or that something is wrong", "I''d feel pressure to fake orgasms to avoid disappointing my partner"]}', 16,
'It''s really common for partners to have different orgasm patterns - this doesn''t mean anything is wrong with either of you.'),

('partner-orgasm', 'orgasm-pleasure', 'How important is it that you''re able to help your partner reach orgasm?', 'multiple_choice',
'{"options": ["Extremely important - I want to learn exactly what they need", "Very important - I want to be a generous lover", "Somewhat important but I know it takes time to learn", "Not very important - I assume they''ll figure out their own needs", "I''m not sure this should be my responsibility"]}', 17,
'Wanting to please your partner sexually is natural and loving, but it''s worth examining your expectations about this responsibility.'),

('masturbation', 'orgasm-pleasure', 'What are your thoughts about masturbation within marriage?', 'multiple_choice',
'{"options": ["Completely fine for both partners as needed", "Okay occasionally but prefer sex together", "Acceptable only if discussed with partner first", "Uncomfortable with the idea in marriage", "Believe this isn''t appropriate for married Christians"]}', 18,
'Christians have different views on this topic. Some see it as normal and healthy, others have concerns about it in marriage.'),

-- Bodies, Nudity & Physical Intimacy (4 questions)
('body-comfort-self', 'bodies-nudity', 'How comfortable are you with your partner seeing your naked body?', 'multiple_choice',
'{"options": ["Very comfortable - I want them to see and appreciate my body", "Mostly comfortable but nervous about certain areas", "Somewhat uncomfortable but willing to work on it", "Very uncomfortable with full nudity", "I plan to avoid nudity during sex if possible"]}', 19,
'Being seen naked by your spouse can feel vulnerable, especially if you''re not used to it. Your comfort level with this may change over time.'),

('body-comfort-partner', 'bodies-nudity', 'How comfortable are you with seeing your partner''s naked body?', 'multiple_choice',
'{"options": ["Very excited to see and appreciate their body", "Comfortable and interested", "Somewhat nervous but looking forward to it", "Uncertain how I''ll feel when it actually happens", "Worried I might feel uncomfortable or awkward"]}', 20,
'You might feel excited, nervous, or uncertain about seeing your partner naked. All of these feelings are completely normal.'),

('body-hair', 'bodies-nudity', 'What are your expectations about body hair and grooming for sexual intimacy?', 'multiple_choice',
'{"options": ["Natural body hair is fine and normal", "Some trimming/grooming but nothing extreme", "Prefer significant grooming and hair removal", "Expect completely hairless genitals", "Haven''t really thought about this"]}', 21,
'Different people have different preferences about body hair and grooming. It''s worth discussing what feels comfortable for both of you.'),

('menstruation', 'bodies-nudity', 'How do you feel about menstruation affecting your sex life?', 'multiple_choice',
'{"options": ["No problem having sex during menstruation", "Willing to have sex during lighter days", "Prefer to avoid sex during menstruation", "Definitely no sex during menstruation", "I haven''t really considered how this will affect our sex life"]}', 22,
'A woman''s monthly cycle affects many things, including sexual desire and when you might want to have sex. Couples handle this differently.'),

-- Frequency, Initiation & Sexual Desire (5 questions)
('frequency', 'frequency-desire', 'How often do you realistically want to have sex in marriage?', 'multiple_choice',
'{"options": ["Daily or almost daily", "4-5 times per week", "2-3 times per week", "Once a week", "A few times per month", "I have no idea what to expect for myself"]}', 23,
'People have different natural levels of sexual desire. There''s no ''right'' frequency - it''s about what works for both of you.'),

('higher-desire-partner', 'frequency-desire', 'What if your partner wants sex significantly more often than you do?', 'multiple_choice',
'{"options": ["I''d try to meet their needs even if I''m not always interested", "I''d want to find a compromise that works for both of us", "I''d expect them to adjust to my lower level of desire", "I''d feel pressured and probably resentful", "I''d worry there''s something wrong with me"]}', 24,
'It''s really common for partners to have different levels of sexual desire. How you handle this difference matters a lot for your marriage.'),

('lower-desire-partner', 'frequency-desire', 'What if your partner wants sex significantly less often than you do?', 'multiple_choice',
'{"options": ["I''d be willing to adjust to their comfort level", "I''d want to understand what affects their desire", "I''d be disappointed but try to be understanding", "I''d feel rejected and frustrated", "I''d worry they don''t find me attractive"]}', 25,
'Being the partner with higher desire can feel frustrating or lead to feeling rejected. Your response to this situation really matters.'),

('initiation', 'frequency-desire', 'How do you want to communicate when you''re interested in having sex?', 'multiple_choice',
'{"options": ["Direct verbal communication (\"I want to have sex\")", "Physical touch and obvious signals", "Subtle hints and romantic gestures", "Wait for my partner to initiate most of the time", "I''m not sure how I''ll feel about initiating sex"]}', 26,
'Learning to initiate sex can feel awkward at first. Knowing your natural style helps you communicate this with your partner.'),

('rejection', 'frequency-desire', 'What if you''re not in the mood for sex when your partner initiates?', 'multiple_choice',
'{"options": ["I''d be open to being persuaded through affection and foreplay", "I''d explain that I''m not in the mood and suggest another time", "I''d probably go along with it to meet their needs", "I''d feel pressured and might become resentful", "I''d expect my partner to respect my \"no\" without question"]}', 27,
'There will be times when one of you wants sex and the other doesn''t. How you handle these moments affects your intimacy long-term.'),

-- Communication During Sex (4 questions)
('talking-comfort', 'communication-sex', 'How do you feel about talking during sexual intimacy?', 'multiple_choice',
'{"options": ["I want us to communicate openly about what feels good", "Some talking is fine but I prefer mostly non-verbal", "I''d be too self-conscious to talk much during sex", "I think talking would ruin the romance and spontaneity", "I''m not sure how I''ll feel about this in the moment"]}', 28,
'Communication during sex helps couples learn what feels good, but some people find it awkward at first.'),

('discomfort-communication', 'communication-sex', 'What if something your partner does doesn''t feel good or is uncomfortable?', 'multiple_choice',
'{"options": ["I''d tell them immediately and guide them to what feels better", "I''d gently redirect them physically without saying anything", "I''d endure it to avoid hurting their feelings", "I''d wait until afterward to discuss it", "I''d be too embarrassed to say anything"]}', 29,
'Being able to communicate when something doesn''t feel good is crucial for enjoyable sex, but it can feel hard to speak up in the moment.'),

('pleasure-communication', 'communication-sex', 'How do you want your partner to tell you what they enjoy sexually?', 'multiple_choice',
'{"options": ["Direct verbal feedback during sex (\"that feels amazing\")", "Physical guidance with their hands", "Discussions outside the bedroom about preferences", "I want to figure out what they like through trial and error", "I assume I''ll naturally know what feels good for them"]}', 30,
'Learning what your partner enjoys takes communication. Different people prefer different ways of receiving this feedback.'),

('new-activities', 'communication-sex', 'What if you want to try something new sexually?', 'multiple_choice',
'{"options": ["I''d bring it up directly and ask if they''re interested", "I''d suggest it during foreplay or sex", "I''d hint about it and see if they pick up on it", "I''d be too shy to bring up new ideas", "I''d rather stick with basics than risk making them uncomfortable"]}', 31,
'As you grow in your sexual relationship, you might become curious about trying new things. How you bring this up matters.'),

-- Sexual Problems & Challenges (5 questions)
('pain-response', 'sexual-challenges', 'What if you experience pain during penetration that doesn''t improve quickly?', 'multiple_choice',
'{"options": ["See a doctor immediately while being patient with each other", "Try different positions and more lubrication first", "Keep trying and assume it will get better with time", "Avoid penetration until it can happen without pain", "I''d be too embarrassed to seek help"]}', 32,
'Sexual pain is more common than people think and is definitely something that can be addressed. Your approach to handling it matters.'),

('orgasm-difficulty', 'sexual-challenges', 'What if one of you has difficulty reaching orgasm?', 'multiple_choice',
'{"options": ["Work together patiently to figure out what helps", "Seek resources and possibly professional help", "Focus on other aspects of intimacy while learning", "Try harder and practice more frequently", "Accept that some people just don''t climax easily"]}', 33,
'Difficulty with orgasm is really common, especially for women and especially at first. How you approach this together makes all the difference.'),

('erectile-issues', 'sexual-challenges', 'What if you experience erectile dysfunction or premature ejaculation?', 'multiple_choice',
'{"options": ["Address it openly and seek medical help if needed", "Try techniques and be patient while figuring it out", "Focus on other ways to pleasure each other", "I''d be very embarrassed and want to avoid discussing it", "I''d assume this means I''m not attracted enough to my partner"]}', 34,
'These issues are more common than men want to admit, especially when starting sexual activity. They''re usually very treatable.'),

('expectations-vs-reality', 'sexual-challenges', 'What if your sex life doesn''t meet your expectations in the first year?', 'multiple_choice',
'{"options": ["Communicate openly and work together to improve it", "Seek counseling or medical help if needed", "Give it more time and keep practicing", "Accept that maybe we''re just not sexually compatible", "I''d worry that something is fundamentally wrong with our marriage"]}', 35,
'Many couples find that building a great sex life takes time - longer than they expected. Your response to this reality is important.');

-- Success message
SELECT 'All 35 SACRED assessment questions imported successfully! 🎉' as message;