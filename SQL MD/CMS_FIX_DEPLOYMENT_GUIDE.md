# CMS Database Schema Fix - Deployment Guide

## Problem Summary

The SACRED CMS was experiencing these critical issues:
1. **Missing Table**: `reflection_questions` table was completely missing
2. **Column Mismatches**: Several tables had incorrect column names that didn't match CMS component expectations
3. **Schema Inconsistencies**: Education resources expected columns like `author`, `external_url`, `featured_image` but database had `author_id`, `video_url`, `thumbnail`

## Root Cause

The original database schema (`database/cms_schema.sql`) was created before the CMS components were finalized, leading to a mismatch between what the UI expected and what existed in the database.

## Solution Overview

I've created a comprehensive fix with three key files:

### 1. `CORRECTED_CMS_SCHEMA.sql`
- Complete corrected schema for new installations
- Includes all required tables with proper column mappings
- Adds missing `reflection_questions` table
- Maintains backward compatibility

### 2. `CMS_SCHEMA_MIGRATION.sql`
- Safe migration script for existing databases
- Adds missing columns without losing data
- Migrates existing data to new column structure
- Handles slug generation and duplicate prevention

### 3. Updated `src/api/services/cms.js`
- Enhanced services with automatic slug generation
- Better error handling
- Backward compatibility for mixed schema states

## Deployment Steps

### Option A: New Installation
If you're setting up a fresh database:

```sql
-- Run this in your Supabase SQL editor
\i CORRECTED_CMS_SCHEMA.sql
```

### Option B: Existing Database Migration
If you have existing data you want to preserve:

1. **BACKUP YOUR DATABASE FIRST!**

2. Run the migration script:
```sql
-- Run this in your Supabase SQL editor
\i CMS_SCHEMA_MIGRATION.sql
```

3. Verify the migration with these queries:
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('education_resources', 'product_recommendations', 'reflection_questions', 'blog_posts', 'page_content', 'media_library');

-- Verify education_resources has required columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'education_resources' 
AND column_name IN ('author', 'external_url', 'featured_image', 'slug');

-- Test sample data exists
SELECT COUNT(*) FROM reflection_questions;
SELECT id, title, author, external_url FROM education_resources LIMIT 3;
```

## What the Fix Addresses

### ✅ Fixed Issues

1. **"Could not find the 'author' column"**
   - Added `author` column to `education_resources`
   - Populated with data from `author_id` references

2. **Missing reflection_questions table**
   - Created complete table with proper structure
   - Added sample questions for testing

3. **Column mapping mismatches**
   - `external_url` column added (mapped from `video_url`)
   - `featured_image` column added (mapped from `thumbnail`)
   - `slug` columns added to all content tables

4. **Missing database indexes**
   - Added performance indexes for slug columns
   - Added indexes for status filters

5. **RLS Policy gaps**
   - Added proper Row Level Security for new table
   - Updated existing policies for consistency

### ✅ Enhanced Features

1. **Automatic Slug Generation**
   - Services now auto-generate slugs from titles
   - Handles duplicates gracefully

2. **Better Error Handling**
   - Services handle both old and new column structures
   - Graceful fallbacks for missing data

3. **Improved Performance**
   - Added database indexes for common queries
   - Optimized RLS policies

## Testing the Fix

After deployment, test these operations:

1. **Create Education Resource**:
   ```javascript
   // This should now work without the "author column" error
   await educationResourceService.create({
     title: "Test Resource",
     description: "Test description",
     resource_type: "article",
     author: "Test Author",
     external_url: "https://example.com",
     status: "draft"
   });
   ```

2. **Create Reflection Question**:
   ```javascript
   // This should work with the new table
   await reflectionQuestionsService.create({
     title: "Test Question?",
     content: "Test question content",
     status: "draft"
   });
   ```

3. **Verify CMS UI**:
   - Go to `/admin` in your app
   - Try creating resources in each CMS section
   - Verify all form fields save correctly

## Rollback Plan

If something goes wrong, you can rollback:

1. Restore from your database backup
2. Or manually remove the new columns:
```sql
-- Only if needed - removes new columns
ALTER TABLE education_resources 
DROP COLUMN IF EXISTS author,
DROP COLUMN IF EXISTS external_url,
DROP COLUMN IF EXISTS featured_image,
DROP COLUMN IF EXISTS slug;

DROP TABLE IF EXISTS reflection_questions;
```

## File Structure After Fix

```
/Users/matthewhigham/Documents/Ai/SACRED/
├── CORRECTED_CMS_SCHEMA.sql       # Complete new schema
├── CMS_SCHEMA_MIGRATION.sql       # Migration for existing DBs
├── CMS_FIX_DEPLOYMENT_GUIDE.md    # This guide
├── src/api/services/cms.js         # Updated CMS services
└── database/cms_schema.sql         # Original (don't use)
```

## Production Deployment Checklist

- [ ] Database backed up
- [ ] Migration script tested in staging
- [ ] Updated CMS services deployed
- [ ] All CMS functionality tested
- [ ] Error monitoring active
- [ ] Rollback plan ready

## Support

If you encounter issues after deployment:

1. Check browser console for specific error messages
2. Verify database schema with the provided queries
3. Test individual service operations
4. Check Supabase RLS policies are active

The fix is designed to be enterprise-grade and production-ready with comprehensive error handling and backward compatibility.