-- Check current table schemas for resources and products
-- This helps identify what columns exist vs what the CMS components expect

-- Check resources table structure
SELECT 'RESOURCES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'resources'
ORDER BY ordinal_position;

-- Check products table structure  
SELECT 'PRODUCTS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Show sample data from both tables to understand current structure
SELECT 'SAMPLE RESOURCES DATA:' as info;
SELECT * FROM resources LIMIT 3;

SELECT 'SAMPLE PRODUCTS DATA:' as info;
SELECT * FROM products LIMIT 3;