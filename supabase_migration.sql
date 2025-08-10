-- SACRED Database Migration - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-jwt-secret';

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    has_paid BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id TEXT UNIQUE NOT NULL, -- For compatibility with existing frontend
    question_text TEXT NOT NULL,
    section TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    options JSONB, -- Store answer options as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Couple Assessments table
CREATE TABLE public.couple_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner1_email TEXT NOT NULL,
    partner1_name TEXT,
    partner2_email TEXT,
    partner2_name TEXT,
    partner2_has_accessed BOOLEAN DEFAULT false,
    partner2_last_login TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partner1_completed', 'partner2_completed', 'completed')),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Answers table
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.couple_assessments(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL, -- References questions.question_id
    user_email TEXT NOT NULL,
    answer TEXT NOT NULL,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Open Ended Questions table
CREATE TABLE public.open_ended_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id TEXT UNIQUE NOT NULL,
    question_text TEXT NOT NULL,
    section TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Open Ended Answers table
CREATE TABLE public.open_ended_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.couple_assessments(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    partner_email TEXT,
    answer TEXT NOT NULL,
    is_visible_to_partner BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts table (for future content)
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID REFERENCES public.profiles(id),
    featured_image TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Resources table (videos, articles, etc.)
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('video', 'article', 'book', 'podcast')),
    url TEXT,
    description TEXT,
    category TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table (for shop functionality)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    category TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_couple_assessments_partner1_email ON public.couple_assessments(partner1_email);
CREATE INDEX idx_couple_assessments_partner2_email ON public.couple_assessments(partner2_email);
CREATE INDEX idx_answers_assessment_id ON public.answers(assessment_id);
CREATE INDEX idx_answers_user_email ON public.answers(user_email);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_questions_order ON public.questions("order");
CREATE INDEX idx_open_ended_answers_assessment_id ON public.open_ended_answers(assessment_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_ended_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_ended_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Questions policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read questions" ON public.questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Open ended questions policies
CREATE POLICY "Authenticated users can read open ended questions" ON public.open_ended_questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Couple assessments policies
CREATE POLICY "Users can view their own assessments" ON public.couple_assessments
    FOR SELECT USING (
        partner1_email = auth.jwt()::json->>'email' OR 
        partner2_email = auth.jwt()::json->>'email'
    );

CREATE POLICY "Partner1 can create assessments" ON public.couple_assessments
    FOR INSERT WITH CHECK (partner1_email = auth.jwt()::json->>'email');

CREATE POLICY "Partners can update their assessments" ON public.couple_assessments
    FOR UPDATE USING (
        partner1_email = auth.jwt()::json->>'email' OR 
        partner2_email = auth.jwt()::json->>'email'
    );

-- Answers policies
CREATE POLICY "Users can view answers for their assessments" ON public.answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couple_assessments ca
            WHERE ca.id = assessment_id 
            AND (ca.partner1_email = auth.jwt()::json->>'email' OR ca.partner2_email = auth.jwt()::json->>'email')
        )
    );

CREATE POLICY "Users can insert their own answers" ON public.answers
    FOR INSERT WITH CHECK (user_email = auth.jwt()::json->>'email');

CREATE POLICY "Users can update their own answers" ON public.answers
    FOR UPDATE USING (user_email = auth.jwt()::json->>'email');

-- Open ended answers policies
CREATE POLICY "Users can view open ended answers for their assessments" ON public.open_ended_answers
    FOR SELECT USING (
        user_email = auth.jwt()::json->>'email' OR 
        (partner_email = auth.jwt()::json->>'email' AND is_visible_to_partner = true)
    );

CREATE POLICY "Users can insert their own open ended answers" ON public.open_ended_answers
    FOR INSERT WITH CHECK (user_email = auth.jwt()::json->>'email');

CREATE POLICY "Users can update their own open ended answers" ON public.open_ended_answers
    FOR UPDATE USING (user_email = auth.jwt()::json->>'email');

-- Public resources (readable by all authenticated users)
CREATE POLICY "Authenticated users can read blog posts" ON public.blog_posts
    FOR SELECT USING (published = true AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read resources" ON public.resources
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read products" ON public.products
    FOR SELECT USING (active = true AND auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.couple_assessments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.open_ended_questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.open_ended_answers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample questions (you can customize these)
INSERT INTO public.questions (question_id, question_text, section, "order", options) VALUES
('freq_intimacy', 'How often do you expect to be intimate in marriage?', 'expectations', 1, '["Daily", "Few times a week", "Weekly", "Few times a month", "Monthly", "Other"]'),
('communication', 'How comfortable are you discussing intimacy openly?', 'communication', 2, '["Very comfortable", "Somewhat comfortable", "Neutral", "Somewhat uncomfortable", "Very uncomfortable"]'),
('boundaries', 'How important is it to establish physical boundaries before marriage?', 'boundaries', 3, '["Extremely important", "Very important", "Moderately important", "Slightly important", "Not important"]');

-- Insert sample open-ended questions
INSERT INTO public.open_ended_questions (question_id, question_text, section, "order") VALUES
('reflection_1', 'What does sacred intimacy mean to you in the context of marriage?', 'reflections', 1),
('reflection_2', 'How do you envision maintaining emotional connection alongside physical intimacy?', 'reflections', 2),
('reflection_3', 'What concerns or fears do you have about sexual intimacy in marriage?', 'reflections', 3);