-- Fix slug constraint issue for resources table
-- The error shows duplicate key violates unique constraint "resources_slug_idx"

-- First, let's see what slugs already exist
SELECT slug, COUNT(*) as count 
FROM resources 
WHERE slug IS NOT NULL 
GROUP BY slug 
HAVING COUNT(*) > 1;

-- Remove the unique constraint temporarily to fix duplicates
DROP INDEX IF EXISTS resources_slug_idx;
DROP INDEX IF EXISTS products_slug_idx;

-- Update any duplicate or null slugs
UPDATE resources 
SET slug = CONCAT(
  LOWER(REGEXP_REPLACE(COALESCE(title, 'resource'), '[^a-zA-Z0-9\s-]', '', 'g')),
  '-',
  id::text
)
WHERE slug IS NULL 
   OR slug IN (
     SELECT slug 
     FROM resources 
     WHERE slug IS NOT NULL 
     GROUP BY slug 
     HAVING COUNT(*) > 1
   );

UPDATE products 
SET slug = CONCAT(
  LOWER(REGEXP_REPLACE(COALESCE(title, 'product'), '[^a-zA-Z0-9\s-]', '', 'g')),
  '-',
  id::text
)
WHERE slug IS NULL 
   OR slug IN (
     SELECT slug 
     FROM products 
     WHERE slug IS NOT NULL 
     GROUP BY slug 
     HAVING COUNT(*) > 1
   );

-- Clean up slugs (replace spaces with hyphens, remove multiple hyphens)
UPDATE resources 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(slug, '\s+', '-', 'g'), '-+', '-', 'g'))
WHERE slug IS NOT NULL;

UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(slug, '\s+', '-', 'g'), '-+', '-', 'g'))
WHERE slug IS NOT NULL;

-- Now recreate the unique indexes (but allow nulls)
CREATE UNIQUE INDEX resources_slug_idx ON resources(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX products_slug_idx ON products(slug) WHERE slug IS NOT NULL;

-- Show final slug status
SELECT 'Resources with slugs:' as info, COUNT(*) as count FROM resources WHERE slug IS NOT NULL;
SELECT 'Products with slugs:' as info, COUNT(*) as count FROM products WHERE slug IS NOT NULL;
SELECT 'Duplicate resource slugs:' as info, COUNT(*) as count FROM (
  SELECT slug FROM resources WHERE slug IS NOT NULL GROUP BY slug HAVING COUNT(*) > 1
) dupes;
SELECT 'Duplicate product slugs:' as info, COUNT(*) as count FROM (
  SELECT slug FROM products WHERE slug IS NOT NULL GROUP BY slug HAVING COUNT(*) > 1
) dupes;