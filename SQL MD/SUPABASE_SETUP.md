# Supabase Database Setup for SACRED CMS

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Navigate to your SACRED project: `https://supabase.com/dashboard/project/evdhaonwtwlteaocgapt`

## Step 2: Run the Database Schema

### Option A: Using the SQL Editor (Recommended)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** 
3. Copy and paste the entire contents from `/database/cms_schema.sql` into the editor
4. Click **"Run"** to execute the schema

### Option B: Copy-Paste Ready SQL (Use this if Option A doesn't work)

Here's the complete SQL to copy and paste:

```sql
-- SACRED CMS Database Schema
-- This file contains the complete database schema for the CMS functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Management Tables

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education Resources Table
CREATE TABLE IF NOT EXISTS education_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    resource_type TEXT CHECK (resource_type IN ('article', 'video', 'course', 'guide')) NOT NULL,
    thumbnail TEXT,
    video_url TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration_minutes INTEGER,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Recommendations Table
CREATE TABLE IF NOT EXISTS product_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    product_type TEXT CHECK (product_type IN ('book', 'course', 'tool', 'service')) NOT NULL,
    affiliate_url TEXT,
    image_url TEXT,
    price_range TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    author_name TEXT,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Content Management (for dynamic pages)
CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Management Extensions (add to existing profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'admin', 'editor')) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Analytics Tables for Admin Dashboard
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_education_resources_status ON education_resources(status);
CREATE INDEX IF NOT EXISTS idx_education_resources_type ON education_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);

-- Row Level Security (RLS) Policies

-- Blog Posts RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Editors can manage their own blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'editor' OR profiles.role = 'admin')
        )
        AND author_id = auth.uid()
    );

-- Education Resources RLS
ALTER TABLE education_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published education resources" ON education_resources
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all education resources" ON education_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Product Recommendations RLS
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active product recommendations" ON product_recommendations
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage product recommendations" ON product_recommendations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Page Content RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published page content" ON page_content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage page content" ON page_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Media Library RLS
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read media" ON media_library
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and editors can manage media" ON media_library
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'editor')
        )
    );

-- Analytics RLS (Admin only)
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can access all analytics" ON user_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access content analytics" ON content_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_education_resources_updated_at BEFORE UPDATE ON education_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_product_recommendations_updated_at BEFORE UPDATE ON product_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at) VALUES 
('Welcome to SACRED', 'welcome-to-sacred', 'An introduction to our platform', '<h2>Welcome to SACRED</h2><p>This is our first blog post...</p>', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO education_resources (title, slug, description, content, resource_type, status, published_at) VALUES 
('Understanding Intimacy in Marriage', 'understanding-intimacy-marriage', 'A foundational guide to marital intimacy', '<h2>Understanding Intimacy</h2><p>Content here...</p>', 'article', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_recommendations (title, description, product_type, featured, status) VALUES 
('The Seven Principles for Making Marriage Work', 'Essential reading for couples', 'book', true, 'active');
```

## Step 3: Create Admin User

After running the schema, you need to create your admin account:

1. **First, create a regular account**:
   - Go to http://localhost:5173/Login
   - Sign up with your email address
   - Verify your email when prompted

2. **Then promote yourself to admin**:
   - Go back to Supabase Dashboard → SQL Editor
   - Run this query (replace with your actual email):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Step 4: Set Up Storage (Optional - for media uploads)

1. In Supabase Dashboard, go to **Storage**
2. Click **"New Bucket"**
3. Name it: `media`
4. Make it **Public**
5. Click **"Create Bucket"**

## Step 5: Test Your Setup

1. Sign in at http://localhost:5173/Login
2. Go to http://localhost:5173/AdminCMS
3. You should see the full CMS dashboard!

## Troubleshooting

**If you get permission errors:**
- Make sure you're signed in as an admin user
- Check that the `role` column was added to your profile

**If tables don't exist:**
- Make sure all SQL ran successfully
- Check for any error messages in the SQL Editor

**If you can't access the CMS:**
- Verify your user has `role = 'admin'` in the profiles table
- Check browser console for any JavaScript errors

## Quick Test Commands

After setup, test with these SQL queries:

```sql
-- Check your admin status
SELECT email, role FROM profiles WHERE email = 'your-email@example.com';

-- See all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%blog%' OR table_name LIKE '%education%' OR table_name LIKE '%product%';

-- Check sample data
SELECT title, status FROM blog_posts;
```

That's it! Your SACRED CMS database should now be fully set up and ready to use.