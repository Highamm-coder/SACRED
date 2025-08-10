-- Add the assessment sections that match the questions

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