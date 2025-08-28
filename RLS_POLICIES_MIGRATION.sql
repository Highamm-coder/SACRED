-- Add Row Level Security policies for resources and products tables
-- This migration creates RLS policies to allow admin access to CMS tables

-- Enable RLS on both tables (if not already enabled)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin full access to resources" ON resources;
DROP POLICY IF EXISTS "Allow public read access to published resources" ON resources;
DROP POLICY IF EXISTS "Allow admin full access to products" ON products;
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;

-- Resources table policies
-- Admin users can do everything
CREATE POLICY "Allow admin full access to resources" ON resources
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Public can read published resources
CREATE POLICY "Allow public read access to published resources" ON resources
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Products table policies  
-- Admin users can do everything
CREATE POLICY "Allow admin full access to products" ON products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Public can read active products
CREATE POLICY "Allow public read access to active products" ON products
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('resources', 'products')
ORDER BY tablename, policyname;