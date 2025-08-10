-- Import remaining 22 assessment questions (14-35)

INSERT INTO questions (question_id, section, question_text, question_type, options, "order", order_index, help_text) VALUES

-- Orgasm, Pleasure & Sexual Performance (5 questions)
('orgasm-expectations', 'orgasm-pleasure', 'What are your expectations about reaching orgasm?', 'multiple_choice',
'{"options": ["I expect to reach orgasm most times we have sex", "I hope to reach orgasm regularly but know it may take practice", "I am not sure if I will be able to reach orgasm easily", "Reaching orgasm is not a priority for me", "I do not really know what to expect about my own sexual response"]}', 14, 14,
'Many people have unrealistic expectations about orgasms - how often they should happen, how easy they should be.'),

('orgasm-patience', 'orgasm-pleasure', 'How do you feel about the possibility that reaching orgasm might take practice and patience?', 'multiple_choice',
'{"options": ["Completely fine - I expect a learning curve", "Somewhat concerned but willing to be patient", "Worried this might be frustrating for my partner", "Concerned this means something is wrong with me", "Very anxious about sexual performance in general"]}', 15, 15,
'For many people, especially women, learning to climax takes time and patience.'),

('orgasm-differences', 'orgasm-pleasure', 'What if your partner reaches orgasm much more quickly/easily than you do?', 'multiple_choice',
'{"options": ["This would be completely normal and fine", "I would want to work together to figure out what I need", "I would be somewhat disappointed but understanding", "I would worry that I am not normal or that something is wrong", "I would feel pressure to fake orgasms to avoid disappointing my partner"]}', 16, 16,
'It is really common for partners to have different orgasm patterns.'),

('partner-orgasm', 'orgasm-pleasure', 'How important is it that you are able to help your partner reach orgasm?', 'multiple_choice',
'{"options": ["Extremely important - I want to learn exactly what they need", "Very important - I want to be a generous lover", "Somewhat important but I know it takes time to learn", "Not very important - I assume they will figure out their own needs", "I am not sure this should be my responsibility"]}', 17, 17,
'Wanting to please your partner sexually is natural and loving.'),

('masturbation', 'orgasm-pleasure', 'What are your thoughts about masturbation within marriage?', 'multiple_choice',
'{"options": ["Completely fine for both partners as needed", "Okay occasionally but prefer sex together", "Acceptable only if discussed with partner first", "Uncomfortable with the idea in marriage", "Believe this is not appropriate for married Christians"]}', 18, 18,
'Christians have different views on this topic.'),

-- Bodies, Nudity & Physical Intimacy (4 questions)
('body-comfort-self', 'bodies-nudity', 'How comfortable are you with your partner seeing your naked body?', 'multiple_choice',
'{"options": ["Very comfortable - I want them to see and appreciate my body", "Mostly comfortable but nervous about certain areas", "Somewhat uncomfortable but willing to work on it", "Very uncomfortable with full nudity", "I plan to avoid nudity during sex if possible"]}', 19, 19,
'Being seen naked by your spouse can feel vulnerable, especially if you are not used to it.'),

('body-comfort-partner', 'bodies-nudity', 'How comfortable are you with seeing your partner naked body?', 'multiple_choice',
'{"options": ["Very excited to see and appreciate their body", "Comfortable and interested", "Somewhat nervous but looking forward to it", "Uncertain how I will feel when it actually happens", "Worried I might feel uncomfortable or awkward"]}', 20, 20,
'You might feel excited, nervous, or uncertain about seeing your partner naked. All of these feelings are completely normal.'),

('body-hair', 'bodies-nudity', 'What are your expectations about body hair and grooming for sexual intimacy?', 'multiple_choice',
'{"options": ["Natural body hair is fine and normal", "Some trimming/grooming but nothing extreme", "Prefer significant grooming and hair removal", "Expect completely hairless genitals", "Have not really thought about this"]}', 21, 21,
'Different people have different preferences about body hair and grooming.'),

('menstruation', 'bodies-nudity', 'How do you feel about menstruation affecting your sex life?', 'multiple_choice',
'{"options": ["No problem having sex during menstruation", "Willing to have sex during lighter days", "Prefer to avoid sex during menstruation", "Definitely no sex during menstruation", "I have not really considered how this will affect our sex life"]}', 22, 22,
'A womans monthly cycle affects many things, including sexual desire and when you might want to have sex.'),

-- Frequency, Initiation & Sexual Desire (5 questions)
('frequency', 'frequency-desire', 'How often do you realistically want to have sex in marriage?', 'multiple_choice',
'{"options": ["Daily or almost daily", "4-5 times per week", "2-3 times per week", "Once a week", "A few times per month", "I have no idea what to expect for myself"]}', 23, 23,
'People have different natural levels of sexual desire. There is no right frequency.'),

('higher-desire-partner', 'frequency-desire', 'What if your partner wants sex significantly more often than you do?', 'multiple_choice',
'{"options": ["I would try to meet their needs even if I am not always interested", "I would want to find a compromise that works for both of us", "I would expect them to adjust to my lower level of desire", "I would feel pressured and probably resentful", "I would worry there is something wrong with me"]}', 24, 24,
'It is really common for partners to have different levels of sexual desire.'),

('lower-desire-partner', 'frequency-desire', 'What if your partner wants sex significantly less often than you do?', 'multiple_choice',
'{"options": ["I would be willing to adjust to their comfort level", "I would want to understand what affects their desire", "I would be disappointed but try to be understanding", "I would feel rejected and frustrated", "I would worry they do not find me attractive"]}', 25, 25,
'Being the partner with higher desire can feel frustrating or lead to feeling rejected.'),

('initiation', 'frequency-desire', 'How do you want to communicate when you are interested in having sex?', 'multiple_choice',
'{"options": ["Direct verbal communication", "Physical touch and obvious signals", "Subtle hints and romantic gestures", "Wait for my partner to initiate most of the time", "I am not sure how I will feel about initiating sex"]}', 26, 26,
'Learning to initiate sex can feel awkward at first.'),

('rejection', 'frequency-desire', 'What if you are not in the mood for sex when your partner initiates?', 'multiple_choice',
'{"options": ["I would be open to being persuaded through affection and foreplay", "I would explain that I am not in the mood and suggest another time", "I would probably go along with it to meet their needs", "I would feel pressured and might become resentful", "I would expect my partner to respect my no without question"]}', 27, 27,
'There will be times when one of you wants sex and the other does not.'),

-- Communication During Sex (4 questions)
('talking-comfort', 'communication-sex', 'How do you feel about talking during sexual intimacy?', 'multiple_choice',
'{"options": ["I want us to communicate openly about what feels good", "Some talking is fine but I prefer mostly non-verbal", "I would be too self-conscious to talk much during sex", "I think talking would ruin the romance and spontaneity", "I am not sure how I will feel about this in the moment"]}', 28, 28,
'Communication during sex helps couples learn what feels good, but some people find it awkward at first.'),

('discomfort-communication', 'communication-sex', 'What if something your partner does does not feel good or is uncomfortable?', 'multiple_choice',
'{"options": ["I would tell them immediately and guide them to what feels better", "I would gently redirect them physically without saying anything", "I would endure it to avoid hurting their feelings", "I would wait until afterward to discuss it", "I would be too embarrassed to say anything"]}', 29, 29,
'Being able to communicate when something does not feel good is crucial for enjoyable sex.'),

('pleasure-communication', 'communication-sex', 'How do you want your partner to tell you what they enjoy sexually?', 'multiple_choice',
'{"options": ["Direct verbal feedback during sex", "Physical guidance with their hands", "Discussions outside the bedroom about preferences", "I want to figure out what they like through trial and error", "I assume I will naturally know what feels good for them"]}', 30, 30,
'Learning what your partner enjoys takes communication.'),

('new-activities', 'communication-sex', 'What if you want to try something new sexually?', 'multiple_choice',
'{"options": ["I would bring it up directly and ask if they are interested", "I would suggest it during foreplay or sex", "I would hint about it and see if they pick up on it", "I would be too shy to bring up new ideas", "I would rather stick with basics than risk making them uncomfortable"]}', 31, 31,
'As you grow in your sexual relationship, you might become curious about trying new things.'),

-- Sexual Problems & Challenges (4 questions)
('pain-response', 'sexual-challenges', 'What if you experience pain during penetration that does not improve quickly?', 'multiple_choice',
'{"options": ["See a doctor immediately while being patient with each other", "Try different positions and more lubrication first", "Keep trying and assume it will get better with time", "Avoid penetration until it can happen without pain", "I would be too embarrassed to seek help"]}', 32, 32,
'Sexual pain is more common than people think and is definitely something that can be addressed.'),

('orgasm-difficulty', 'sexual-challenges', 'What if one of you has difficulty reaching orgasm?', 'multiple_choice',
'{"options": ["Work together patiently to figure out what helps", "Seek resources and possibly professional help", "Focus on other aspects of intimacy while learning", "Try harder and practice more frequently", "Accept that some people just do not climax easily"]}', 33, 33,
'Difficulty with orgasm is really common, especially for women and especially at first.'),

('erectile-issues', 'sexual-challenges', 'What if you experience erectile dysfunction or premature ejaculation?', 'multiple_choice',
'{"options": ["Address it openly and seek medical help if needed", "Try techniques and be patient while figuring it out", "Focus on other ways to pleasure each other", "I would be very embarrassed and want to avoid discussing it", "I would assume this means I am not attracted enough to my partner"]}', 34, 34,
'These issues are more common than men want to admit, especially when starting sexual activity.'),

('expectations-vs-reality', 'sexual-challenges', 'What if your sex life does not meet your expectations in the first year?', 'multiple_choice',
'{"options": ["Communicate openly and work together to improve it", "Seek counseling or medical help if needed", "Give it more time and keep practicing", "Accept that maybe we are just not sexually compatible", "I would worry that something is fundamentally wrong with our marriage"]}', 35, 35,
'Many couples find that building a great sex life takes time - longer than they expected.');