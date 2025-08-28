-- SACRED CMS - CLEAN Database Schema (Run in Supabase SQL Editor)
-- This avoids all column reference errors by creating everything in the right order

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 1: Add columns to existing profiles table safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_active' AND table_schema = 'public') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_login_at' AND table_schema = 'public') THEN
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'metadata' AND table_schema = 'public') THEN
        ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add constraint to role column (separate from column creation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'profiles_role_check') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'editor'));
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- STEP 2: Create all CMS tables
DROP TABLE IF EXISTS blog_posts CASCADE;
CREATE TABLE blog_posts (
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

DROP TABLE IF EXISTS education_resources CASCADE;
CREATE TABLE education_resources (
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

DROP TABLE IF EXISTS product_recommendations CASCADE;
CREATE TABLE product_recommendations (
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

DROP TABLE IF EXISTS page_content CASCADE;
CREATE TABLE page_content (
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

DROP TABLE IF EXISTS media_library CASCADE;
CREATE TABLE media_library (
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

DROP TABLE IF EXISTS user_analytics CASCADE;
CREATE TABLE user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS content_analytics CASCADE;
CREATE TABLE content_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create indexes
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_education_resources_status ON education_resources(status);
CREATE INDEX idx_education_resources_type ON education_resources(resource_type);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX idx_content_analytics_content ON content_analytics(content_type, content_id);

-- STEP 4: Set up Row Level Security AFTER tables are created
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
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

-- Education Resources Policies
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

-- Product Recommendations Policies
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

-- Page Content Policies
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

-- Media Library Policies
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

-- Analytics Policies (Admin only)
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

-- STEP 5: Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_resources_updated_at 
    BEFORE UPDATE ON education_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_recommendations_updated_at 
    BEFORE UPDATE ON product_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at 
    BEFORE UPDATE ON page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 6: Insert sample data
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at) VALUES 
('Welcome to SACRED', 'welcome-to-sacred', 'An introduction to our platform for Christian couples', '<h2>Welcome to SACRED</h2><p>This is your first blog post. SACRED helps Christian couples prepare for the sacred nature of marital intimacy.</p>', 'published', NOW());

INSERT INTO education_resources (title, slug, description, content, resource_type, status, published_at) VALUES 
('Understanding Intimacy in Marriage', 'understanding-intimacy-marriage', 'A foundational guide to marital intimacy for Christian couples', '<h2>Understanding Intimacy</h2><p>This resource explores the different dimensions of intimacy in Christian marriage.</p>', 'article', 'published', NOW());

INSERT INTO product_recommendations (title, description, product_type, featured, status) VALUES 
('The Seven Principles for Making Marriage Work', 'Essential reading for couples by Dr. John Gottman', 'book', true, 'active');

-- Success message
SELECT 'SACRED CMS Database setup completed successfully! 🎉' as result;