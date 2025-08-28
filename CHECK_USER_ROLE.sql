-- Check current user's profile and role
-- This query helps debug RLS policy issues

-- Check current authenticated user
SELECT 
    auth.uid() as current_user_id,
    auth.role() as auth_role;

-- Check if current user exists in profiles table and their role
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- Show all admin users (to verify admin users exist)
SELECT 
    id,
    email,
    full_name,
    role,
    is_active
FROM profiles 
WHERE role = 'admin';

-- If the current user needs to be made admin, use this query:
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- To check all users and their roles:
-- SELECT id, email, full_name, role FROM profiles ORDER BY created_at;