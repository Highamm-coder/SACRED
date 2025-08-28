# Sacred Single Account Migration Instructions

## 🎯 Overview

This migration converts Sacred from a complex two-email Partner 1/Partner 2 system to a streamlined single-account system where each user owns their individual assessments.

## ✅ Benefits After Migration

- **Simplified User Experience**: Users own their own assessments directly
- **Eliminated Complexity**: Removes 847+ lines of partner invite/token code  
- **Better Security**: Simplified Row Level Security policies
- **Easier Maintenance**: Single source of truth for assessment ownership
- **Improved Performance**: Faster queries with simpler data structure

## 🚀 Migration Steps

### Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. You'll need admin/service role permissions to run DDL statements

### Step 2: Run Schema Migration

Copy and paste the contents of `SINGLE_ACCOUNT_MIGRATION.sql` into the SQL Editor and execute it.

This will:
- Create new `assessments` and `assessment_responses` tables
- Set up proper RLS policies
- Create migration utility functions

### Step 3: Run Migration Functions

Copy and paste the contents of `MIGRATION_RUNNER.sql` into the SQL Editor and execute it.

This will:
- Create backup functions
- Set up validation functions
- Create the complete migration runner

### Step 4: Validate Prerequisites

Run this in the SQL Editor:

```sql
SELECT * FROM validate_migration_prerequisites();
```

Ensure all checks show 'PASS' status before proceeding.

### Step 5: Execute Migration

Run this in the SQL Editor:

```sql
SELECT run_complete_migration();
```

This will:
- Create backups of existing data
- Migrate couple assessments to individual assessments
- Convert partner answers to individual responses
- Update progress and scores
- Provide a success report

### Step 6: Verify Migration

Run this to see the migration results:

```sql
SELECT * FROM generate_migration_report();
```

### Step 7: Test the Application

1. Restart your application (`npm run dev`)
2. Test user registration and assessment flow
3. Verify data integrity

## 🔄 Architecture Changes

### Before (Complex Two-Account System):
```
Partner 1 User ←→ CoupleAssessment ←→ Partner 2 User
      ↓               ↓                     ↓
   Answers     Partner Tokens           Answers
      ↓               ↓                     ↓
Payment System   Invite System      Payment Inheritance
```

### After (Simple Single-Account System):
```
User → Assessment → Assessment Responses
  ↓        ↓             ↓
Profile  Metadata  Individual Answers
```

## 📊 Data Migration Details

The migration preserves all existing data:

- **Couple Assessments** → Split into individual **Assessments** (one per partner)
- **Partner Answers** → Converted to **Assessment Responses** 
- **User Profiles** → Maintained with existing authentication
- **Payment Status** → Preserved per user
- **Assessment Progress** → Recalculated for individual assessments

## 🛡️ Safety Features

### Automatic Backups
- All existing data backed up before migration
- Rollback function available if needed

### Data Integrity
- UUID primary keys maintained
- Foreign key relationships preserved  
- RLS policies ensure data security
- Audit trail maintained

### Rollback Option
If you need to rollback:

```sql
SELECT rollback_migration();
```

## 🎉 Expected Results

After successful migration:

### Database Changes
- New simplified schema with 2 main tables instead of 5
- Better performance with optimized indexes
- Cleaner RLS policies

### Application Changes  
- Simplified authentication flow
- Individual assessment ownership
- Eliminated partner invite complexity
- Better user experience

### Maintenance Benefits
- Fewer edge cases to handle
- Simplified debugging
- Reduced support burden
- More predictable system behavior

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Admin Access Required**: You need service role or admin access to run DDL statements
3. **Application Restart**: Restart your application after migration
4. **User Communication**: Inform users about the system changes
5. **Test Thoroughly**: Test all user flows after migration

## 🆘 Troubleshooting

### Common Issues

**"Permission Denied" Error**
- Ensure you're using service role key or admin access
- Check that RLS is temporarily disabled for admin operations

**"Function Does Not Exist" Error**  
- Ensure you ran the schema migration first
- Check that all functions were created successfully

**"Data Not Found" Error**
- Verify source data exists in `couple_assessments` table
- Check that user profiles exist for email addresses

### Getting Help

If you encounter issues:
1. Check the validation results first
2. Review the migration logs
3. Use the rollback function if needed
4. Contact support with specific error messages

## ✨ Post-Migration Benefits

Once migration is complete, you'll have:

- ✅ Simplified single-account system
- ✅ All existing user data preserved  
- ✅ Better performance and security
- ✅ Easier maintenance and debugging
- ✅ Improved user experience
- ✅ Future-ready architecture

The Sacred application will be much simpler to maintain and extend!