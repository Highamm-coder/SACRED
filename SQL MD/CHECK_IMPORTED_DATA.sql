-- Check if the questions were imported correctly

-- Count questions by section
SELECT section, COUNT(*) as question_count 
FROM questions 
WHERE is_active = true 
GROUP BY section 
ORDER BY section;

-- Check assessment sections
SELECT section_id, title, order_index 
FROM assessment_sections 
ORDER BY order_index;

-- Check first few questions
SELECT question_id, section, question_text, question_type, is_active 
FROM questions 
WHERE is_active = true 
ORDER BY "order" 
LIMIT 10;