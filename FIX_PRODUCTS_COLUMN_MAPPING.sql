-- Fix products table column mapping issue
-- The error shows "null value in column 'name' violates not-null constraint"
-- But the CMS is sending 'title' - need to align column names

-- First, check current products table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Option 1: Add title column and copy data from name if it exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT;

-- Copy existing name data to title column if name exists and title is empty
UPDATE products 
SET title = name 
WHERE name IS NOT NULL 
AND (title IS NULL OR title = '');

-- Option 2: If we want to keep using 'name', we could rename it to title
-- ALTER TABLE products RENAME COLUMN name TO title;

-- Option 3: Make name nullable and add title as the primary name field
ALTER TABLE products ALTER COLUMN name DROP NOT NULL;

-- Add other missing columns that the CMS expects
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'book',
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Show updated structure
SELECT 'UPDATED PRODUCTS TABLE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;