-- Add missing price column to product_recommendations table
-- This migration adds the price column that the ProductManagement component expects

-- Add price column to product_recommendations table
ALTER TABLE product_recommendations 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add any other missing columns that might be expected by the ProductManagement component
ALTER TABLE product_recommendations 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_recommendations'
ORDER BY ordinal_position;