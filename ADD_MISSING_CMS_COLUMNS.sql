-- Add all missing columns needed by CMS components
-- This migration ensures both tables have all required columns

-- Add essential CMS columns to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add essential CMS columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS title TEXT,
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

-- If existing columns have different names, we might need to copy data
-- For example, if products has 'name' instead of 'title':
-- UPDATE products SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- Create unique indexes on slug columns (helps with SEO)
CREATE UNIQUE INDEX IF NOT EXISTS resources_slug_idx ON resources(slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- Verify the updated structures
SELECT 'UPDATED RESOURCES TABLE:' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'resources'
ORDER BY ordinal_position;

SELECT 'UPDATED PRODUCTS TABLE:' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;