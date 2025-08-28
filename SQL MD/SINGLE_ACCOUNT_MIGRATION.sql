-- ============================================================================
-- SACRED EMAIL MIGRATION - SINGLE ACCOUNT SYSTEM
-- This migration converts from the Partner1/Partner2 two-email system 
-- to a single-account system where each user owns their own assessments
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CREATE NEW SINGLE ACCOUNT SCHEMA
-- ============================================================================

-- New Assessments table (single account ownership)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    title TEXT DEFAULT 'Sacred Pre-Marriage Assessment',
    description TEXT DEFAULT 'Personal assessment for marriage readiness and expectations',
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    score JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- New Assessment Responses table (stores individual answers)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_text TEXT,
    section TEXT,
    response_value TEXT NOT NULL,
    response_type TEXT DEFAULT 'text' CHECK (response_type IN ('text', 'number', 'boolean', 'json')),
    score INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_email ON public.assessments(user_email);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON public.assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id ON public.assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_section ON public.assessment_responses(section);

-- Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_assessments_updated_at ON public.assessments;
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON public.assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_responses_updated_at ON public.assessment_responses;
CREATE TRIGGER update_assessment_responses_updated_at 
    BEFORE UPDATE ON public.assessment_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments table
DROP POLICY IF EXISTS "Users can read their own assessments" ON public.assessments;
CREATE POLICY "Users can read their own assessments" ON public.assessments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own assessments" ON public.assessments;
CREATE POLICY "Users can create their own assessments" ON public.assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
CREATE POLICY "Users can update their own assessments" ON public.assessments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.assessments;
CREATE POLICY "Users can delete their own assessments" ON public.assessments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for assessment_responses table
DROP POLICY IF EXISTS "Users can read their assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can read their assessment responses" ON public.assessment_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessments 
            WHERE assessments.id = assessment_responses.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create their assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can create their assessment responses" ON public.assessment_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assessments 
            WHERE assessments.id = assessment_responses.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can update their assessment responses" ON public.assessment_responses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.assessments 
            WHERE assessments.id = assessment_responses.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can delete their assessment responses" ON public.assessment_responses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.assessments 
            WHERE assessments.id = assessment_responses.assessment_id 
            AND assessments.user_id = auth.uid()
        )
    );

-- Admin policies for both tables
DROP POLICY IF EXISTS "Admins can manage all assessments" ON public.assessments;
CREATE POLICY "Admins can manage all assessments" ON public.assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all assessment responses" ON public.assessment_responses;
CREATE POLICY "Admins can manage all assessment responses" ON public.assessment_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- PART 2: DATA MIGRATION FUNCTIONS
-- ============================================================================

-- Function to migrate data from couple_assessments to new single account system
CREATE OR REPLACE FUNCTION migrate_couple_assessments_to_single_account()
RETURNS TEXT AS $$
DECLARE
    couple_record RECORD;
    new_assessment_id1 UUID;
    new_assessment_id2 UUID;
    answer_record RECORD;
    partner1_user_id UUID;
    partner2_user_id UUID;
    migration_count INTEGER := 0;
BEGIN
    -- Iterate through all couple assessments
    FOR couple_record IN SELECT * FROM public.couple_assessments LOOP
        
        -- Get user IDs for partner emails
        SELECT id INTO partner1_user_id FROM public.profiles WHERE email = couple_record.partner1_email;
        SELECT id INTO partner2_user_id FROM public.profiles WHERE email = couple_record.partner2_email;
        
        -- Create assessment for Partner 1 if they have a profile
        IF partner1_user_id IS NOT NULL THEN
            INSERT INTO public.assessments (
                user_id,
                user_email,
                status,
                created_at,
                updated_at,
                completed_at
            ) VALUES (
                partner1_user_id,
                couple_record.partner1_email,
                CASE 
                    WHEN couple_record.status IN ('partner1_completed', 'completed') THEN 'completed'
                    ELSE 'in_progress'
                END,
                couple_record.created_date,
                couple_record.updated_at,
                CASE 
                    WHEN couple_record.status IN ('partner1_completed', 'completed') THEN couple_record.updated_at
                    ELSE NULL
                END
            ) RETURNING id INTO new_assessment_id1;
            
            -- Migrate Partner 1's answers
            FOR answer_record IN 
                SELECT * FROM public.answers 
                WHERE assessment_id = couple_record.id 
                AND user_email = couple_record.partner1_email 
            LOOP
                INSERT INTO public.assessment_responses (
                    assessment_id,
                    question_id,
                    section,
                    response_value,
                    created_at,
                    updated_at
                ) VALUES (
                    new_assessment_id1,
                    answer_record.question_id,
                    answer_record.section,
                    answer_record.answer,
                    answer_record.created_at,
                    answer_record.updated_at
                );
            END LOOP;
            
            migration_count := migration_count + 1;
        END IF;
        
        -- Create assessment for Partner 2 if they have a profile and have accessed
        IF partner2_user_id IS NOT NULL AND couple_record.partner2_has_accessed THEN
            INSERT INTO public.assessments (
                user_id,
                user_email,
                status,
                created_at,
                updated_at,
                completed_at
            ) VALUES (
                partner2_user_id,
                couple_record.partner2_email,
                CASE 
                    WHEN couple_record.status IN ('partner2_completed', 'completed') THEN 'completed'
                    ELSE 'in_progress'
                END,
                couple_record.created_date,
                couple_record.updated_at,
                CASE 
                    WHEN couple_record.status IN ('partner2_completed', 'completed') THEN couple_record.updated_at
                    ELSE NULL
                END
            ) RETURNING id INTO new_assessment_id2;
            
            -- Migrate Partner 2's answers
            FOR answer_record IN 
                SELECT * FROM public.answers 
                WHERE assessment_id = couple_record.id 
                AND user_email = couple_record.partner2_email 
            LOOP
                INSERT INTO public.assessment_responses (
                    assessment_id,
                    question_id,
                    section,
                    response_value,
                    created_at,
                    updated_at
                ) VALUES (
                    new_assessment_id2,
                    answer_record.question_id,
                    answer_record.section,
                    answer_record.answer,
                    answer_record.created_at,
                    answer_record.updated_at
                );
            END LOOP;
            
            migration_count := migration_count + 1;
        END IF;
        
    END LOOP;
    
    RETURN 'Migration completed. Created ' || migration_count || ' individual assessments from couple assessments.';
END;
$$ LANGUAGE plpgsql;

-- Function to update assessment progress and scores
CREATE OR REPLACE FUNCTION update_assessment_progress_and_scores()
RETURNS TEXT AS $$
DECLARE
    assessment_record RECORD;
    total_questions INTEGER;
    answered_questions INTEGER;
    calculated_progress INTEGER;
    updated_count INTEGER := 0;
BEGIN
    -- Get total number of active questions
    SELECT COUNT(*) INTO total_questions FROM public.questions WHERE is_active = true;
    
    -- Update progress for each assessment
    FOR assessment_record IN SELECT id FROM public.assessments LOOP
        -- Count answered questions for this assessment
        SELECT COUNT(*) INTO answered_questions 
        FROM public.assessment_responses 
        WHERE assessment_id = assessment_record.id;
        
        -- Calculate progress percentage
        IF total_questions > 0 THEN
            calculated_progress := ROUND((answered_questions::DECIMAL / total_questions::DECIMAL) * 100);
        ELSE
            calculated_progress := 0;
        END IF;
        
        -- Update the assessment
        UPDATE public.assessments 
        SET 
            progress = calculated_progress,
            status = CASE 
                WHEN calculated_progress = 100 AND status != 'completed' THEN 'completed'
                WHEN calculated_progress = 100 AND completed_at IS NULL THEN status
                ELSE status
            END,
            completed_at = CASE 
                WHEN calculated_progress = 100 AND completed_at IS NULL THEN NOW()
                ELSE completed_at
            END
        WHERE id = assessment_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN 'Updated progress for ' || updated_count || ' assessments. Total questions: ' || total_questions;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Single Account Migration Schema created successfully! 🎉' as message;
SELECT 'Next steps:' as next_steps;
SELECT '1. Review the new schema structure' as step1;
SELECT '2. Run: SELECT migrate_couple_assessments_to_single_account();' as step2;
SELECT '3. Run: SELECT update_assessment_progress_and_scores();' as step3;
SELECT '4. Test the new single account system' as step4;