-- SACRED CMS Database Schema - CORRECTED VERSION
-- This file fixes all the column mapping issues and missing tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Management Tables

-- Blog Posts Table (already correct in original schema)
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

-- Education Resources Table - CORRECTED to match CMS component expectations
CREATE TABLE IF NOT EXISTS education_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    content TEXT,
    resource_type TEXT CHECK (resource_type IN ('article', 'video', 'book', 'course', 'tool')) NOT NULL,
    thumbnail TEXT,
    featured_image TEXT, -- Added for CMS compatibility
    video_url TEXT,
    external_url TEXT, -- Added for CMS compatibility
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration_minutes INTEGER,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author TEXT, -- Added for CMS compatibility (display name)
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Recommendations Table (already mostly correct, minor additions)
CREATE TABLE IF NOT EXISTS product_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    product_type TEXT CHECK (product_type IN ('book', 'course', 'tool', 'service')) NOT NULL,
    affiliate_url TEXT,
    external_url TEXT, -- Added for consistency
    image_url TEXT,
    featured_image TEXT, -- Added for consistency
    price_range TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    author_name TEXT,
    author TEXT, -- Added for consistency
    featured BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reflection Questions Table - MISSING FROM ORIGINAL SCHEMA
CREATE TABLE IF NOT EXISTS reflection_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT, -- Description/guidance for the question
    question_text TEXT, -- The actual question if different from title
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    order_index INTEGER DEFAULT 0,
    category TEXT, -- Optional categorization
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Content Management (for dynamic pages) - already correct
CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_slug TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE, -- Added for consistency with other tables
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Flexible content structure
    meta_title TEXT,
    meta_description TEXT,
    status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Library Table - already correct
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

-- User Management Extensions (add to existing profiles table) - already correct
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'admin', 'editor')) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Analytics Tables for Admin Dashboard - already correct
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
    content_type TEXT NOT NULL, -- 'blog_post', 'education_resource', etc.
    content_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- 'view', 'share', 'like', etc.
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
CREATE INDEX IF NOT EXISTS idx_education_resources_slug ON education_resources(slug);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_status ON product_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_slug ON product_recommendations(slug);
CREATE INDEX IF NOT EXISTS idx_reflection_questions_status ON reflection_questions(status);
CREATE INDEX IF NOT EXISTS idx_reflection_questions_slug ON reflection_questions(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);

-- Row Level Security (RLS) Policies

-- Blog Posts RLS - already correct
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
CREATE POLICY "Public can read published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Editors can manage their own blog posts" ON blog_posts;
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

DROP POLICY IF EXISTS "Public can read published education resources" ON education_resources;
CREATE POLICY "Public can read published education resources" ON education_resources
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all education resources" ON education_resources;
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

DROP POLICY IF EXISTS "Public can read active product recommendations" ON product_recommendations;
CREATE POLICY "Public can read active product recommendations" ON product_recommendations
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage product recommendations" ON product_recommendations;
CREATE POLICY "Admins can manage product recommendations" ON product_recommendations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Reflection Questions RLS - NEW TABLE
ALTER TABLE reflection_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published reflection questions" ON reflection_questions
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage reflection questions" ON reflection_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Page Content RLS - already correct
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published page content" ON page_content;
CREATE POLICY "Public can read published page content" ON page_content
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage page content" ON page_content;
CREATE POLICY "Admins can manage page content" ON page_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Media Library RLS - already correct
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read media" ON media_library;
CREATE POLICY "Authenticated users can read media" ON media_library
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and editors can manage media" ON media_library;
CREATE POLICY "Admins and editors can manage media" ON media_library
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'admin' OR profiles.role = 'editor')
        )
    );

-- Analytics RLS (Admin only) - already correct
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can access all analytics" ON user_analytics;
CREATE POLICY "Admins can access all analytics" ON user_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can access content analytics" ON content_analytics;
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
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
DROP TRIGGER IF EXISTS update_education_resources_updated_at ON education_resources;
CREATE TRIGGER update_education_resources_updated_at BEFORE UPDATE ON education_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
DROP TRIGGER IF EXISTS update_product_recommendations_updated_at ON product_recommendations;
CREATE TRIGGER update_product_recommendations_updated_at BEFORE UPDATE ON product_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reflection_questions_updated_at ON reflection_questions;
CREATE TRIGGER update_reflection_questions_updated_at BEFORE UPDATE ON reflection_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for automatic slug generation
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Create base slug from title
    base_slug := lower(
        regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
    
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Start with base slug
    final_slug := base_slug;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, status, published_at) 
VALUES (
    'Welcome to SACRED', 
    'welcome-to-sacred', 
    'An introduction to our platform', 
    '<h2>Welcome to SACRED</h2><p>This is our first blog post about preparing for the sacred nature of marital intimacy. SACRED helps Christian couples have the conversations no one taught them to have.</p>', 
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 
    'published', 
    NOW()
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO education_resources (title, slug, description, content, resource_type, author, external_url, status, published_at, order_index) 
VALUES (
    'Understanding Intimacy in Marriage', 
    'understanding-intimacy-marriage', 
    'A foundational guide to marital intimacy', 
    '<h2>Understanding Intimacy</h2><p>A comprehensive guide to building deeper intimacy in marriage...</p>', 
    'article',
    'SACRED Team',
    'https://example.com/intimacy-guide', 
    'published', 
    NOW(),
    1
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_recommendations (title, slug, description, product_type, author, featured, status, order_index) 
VALUES (
    'The Seven Principles for Making Marriage Work', 
    'seven-principles-marriage',
    'Essential reading for couples by Dr. John Gottman', 
    'book',
    'Dr. John Gottman', 
    true, 
    'active',
    1
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO reflection_questions (title, slug, content, status, published_at, order_index)
VALUES (
    'What are your deepest hopes for intimacy in your marriage?',
    'deepest-hopes-intimacy',
    'This question helps couples explore their expectations and desires for physical and emotional intimacy.',
    'published',
    NOW(),
    1
) ON CONFLICT (slug) DO NOTHING;