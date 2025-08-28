-- ============================================================================
-- SACRED EMAIL MIGRATION RUNNER
-- Complete migration from two-email partner system to single-account system
-- This script includes backup, migration, and rollback functionality
-- ============================================================================

-- Step 1: Create backup tables for rollback purposes
CREATE TABLE IF NOT EXISTS backup_couple_assessments AS 
SELECT * FROM public.couple_assessments WHERE 1=0; -- Create structure only

CREATE TABLE IF NOT EXISTS backup_answers AS 
SELECT * FROM public.answers WHERE 1=0; -- Create structure only

CREATE TABLE IF NOT EXISTS backup_partner_invite_tokens AS 
SELECT * FROM public.partner_invite_tokens WHERE 1=0; -- Create structure only

-- Function to create backups before migration
CREATE OR REPLACE FUNCTION create_migration_backup()
RETURNS TEXT AS $$
BEGIN
    -- Backup couple_assessments
    DELETE FROM backup_couple_assessments;
    INSERT INTO backup_couple_assessments SELECT * FROM public.couple_assessments;
    
    -- Backup answers
    DELETE FROM backup_answers;
    INSERT INTO backup_answers SELECT * FROM public.answers;
    
    -- Backup partner_invite_tokens (if exists)
    DELETE FROM backup_partner_invite_tokens;
    INSERT INTO backup_partner_invite_tokens 
    SELECT * FROM public.partner_invite_tokens 
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partner_invite_tokens');
    
    RETURN 'Backup created successfully. Tables backed up: couple_assessments, answers, partner_invite_tokens';
END;
$$ LANGUAGE plpgsql;

-- Function to validate migration prerequisites
CREATE OR REPLACE FUNCTION validate_migration_prerequisites()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT) AS $$
BEGIN
    -- Check 1: Ensure new schema exists
    RETURN QUERY SELECT 
        'New Schema Exists'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessments') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'assessments and assessment_responses tables must exist'::TEXT;
    
    -- Check 2: Verify profiles table exists with proper structure
    RETURN QUERY SELECT 
        'Profiles Table Ready'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'profiles table must exist with email column for user mapping'::TEXT;
    
    -- Check 3: Check for existing data in couple_assessments
    RETURN QUERY SELECT 
        'Source Data Available'::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM public.couple_assessments) > 0 
             THEN 'PASS' ELSE 'WARNING' END::TEXT,
        ('Found ' || (SELECT COUNT(*) FROM public.couple_assessments)::TEXT || ' couple assessments to migrate')::TEXT;
    
    -- Check 4: Check for existing data in new tables (should be empty before migration)
    RETURN QUERY SELECT 
        'Target Tables Empty'::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM public.assessments) = 0 
             THEN 'PASS' ELSE 'WARNING' END::TEXT,
        ('Found ' || (SELECT COUNT(*) FROM public.assessments)::TEXT || ' existing assessments - may be re-running migration')::TEXT;
        
    -- Check 5: Verify RLS policies are in place
    RETURN QUERY SELECT 
        'RLS Policies Active'::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('assessments', 'assessment_responses')) >= 8
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Row Level Security policies must be configured for data protection'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to run the complete migration
CREATE OR REPLACE FUNCTION run_complete_migration()
RETURNS TEXT AS $$
DECLARE
    validation_failed BOOLEAN := FALSE;
    validation_record RECORD;
    migration_result TEXT;
    progress_result TEXT;
BEGIN
    -- Step 1: Run prerequisites check
    FOR validation_record IN SELECT * FROM validate_migration_prerequisites() LOOP
        IF validation_record.status = 'FAIL' THEN
            validation_failed := TRUE;
            RAISE NOTICE 'VALIDATION FAILED: % - %', validation_record.check_name, validation_record.details;
        ELSE
            RAISE NOTICE 'VALIDATION %: % - %', validation_record.status, validation_record.check_name, validation_record.details;
        END IF;
    END LOOP;
    
    IF validation_failed THEN
        RETURN 'Migration aborted due to validation failures. Check the notices above.';
    END IF;
    
    -- Step 2: Create backup
    PERFORM create_migration_backup();
    RAISE NOTICE 'Backup created successfully';
    
    -- Step 3: Run data migration
    SELECT migrate_couple_assessments_to_single_account() INTO migration_result;
    RAISE NOTICE 'Data migration completed: %', migration_result;
    
    -- Step 4: Update progress and scores
    SELECT update_assessment_progress_and_scores() INTO progress_result;
    RAISE NOTICE 'Progress update completed: %', progress_result;
    
    -- Step 5: Create summary report
    RETURN 'MIGRATION COMPLETED SUCCESSFULLY! ' || chr(10) ||
           'Data Migration: ' || migration_result || chr(10) ||
           'Progress Update: ' || progress_result || chr(10) ||
           'Backups available for rollback if needed.';
END;
$$ LANGUAGE plpgsql;

-- Function to rollback migration (if needed)
CREATE OR REPLACE FUNCTION rollback_migration()
RETURNS TEXT AS $$
DECLARE
    assessments_count INTEGER;
    responses_count INTEGER;
BEGIN
    -- Get counts before rollback
    SELECT COUNT(*) INTO assessments_count FROM public.assessments;
    SELECT COUNT(*) INTO responses_count FROM public.assessment_responses;
    
    -- Clear new tables
    DELETE FROM public.assessment_responses;
    DELETE FROM public.assessments;
    
    -- Restore from backups (if backup tables have data)
    IF EXISTS (SELECT 1 FROM backup_couple_assessments LIMIT 1) THEN
        DELETE FROM public.couple_assessments;
        INSERT INTO public.couple_assessments SELECT * FROM backup_couple_assessments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM backup_answers LIMIT 1) THEN
        DELETE FROM public.answers;
        INSERT INTO public.answers SELECT * FROM backup_answers;
    END IF;
    
    RETURN 'Rollback completed. Removed ' || assessments_count || ' assessments and ' || 
           responses_count || ' responses. Original data restored from backup.';
END;
$$ LANGUAGE plpgsql;

-- Function to generate migration report
CREATE OR REPLACE FUNCTION generate_migration_report()
RETURNS TABLE(
    metric TEXT,
    before_migration INTEGER,
    after_migration INTEGER,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY SELECT 
        'Couple Assessments'::TEXT,
        (SELECT COUNT(*)::INTEGER FROM backup_couple_assessments),
        0::INTEGER,
        'Converted to individual assessments'::TEXT;
        
    RETURN QUERY SELECT 
        'Individual Assessments'::TEXT,
        0::INTEGER,
        (SELECT COUNT(*)::INTEGER FROM public.assessments),
        'New single-account assessments'::TEXT;
        
    RETURN QUERY SELECT 
        'Original Answers'::TEXT,
        (SELECT COUNT(*)::INTEGER FROM backup_answers),
        0::INTEGER,
        'Migrated to assessment_responses'::TEXT;
        
    RETURN QUERY SELECT 
        'Assessment Responses'::TEXT,
        0::INTEGER,
        (SELECT COUNT(*)::INTEGER FROM public.assessment_responses),
        'Individual user responses'::TEXT;
        
    RETURN QUERY SELECT 
        'Users with Assessments'::TEXT,
        (SELECT COUNT(DISTINCT partner1_email)::INTEGER + COUNT(DISTINCT partner2_email)::INTEGER FROM backup_couple_assessments),
        (SELECT COUNT(DISTINCT user_email)::INTEGER FROM public.assessments),
        'Unique users with assessment data'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- READY TO RUN - Execute these commands in order:
-- ============================================================================

SELECT 'Migration Runner created successfully!' as status;
SELECT '' as separator;
SELECT 'Execute these commands in order:' as instructions;
SELECT '' as separator;
SELECT '1. SELECT * FROM validate_migration_prerequisites();' as step_1;
SELECT '2. SELECT run_complete_migration();' as step_2; 
SELECT '3. SELECT * FROM generate_migration_report();' as step_3;
SELECT '' as separator;
SELECT 'If rollback needed: SELECT rollback_migration();' as rollback_option;