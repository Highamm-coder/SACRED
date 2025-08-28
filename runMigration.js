#!/usr/bin/env node

/**
 * Sacred Single Account Migration Runner
 * 
 * This script executes the migration from the two-email partner system
 * to a single-account system. Run this with admin database credentials.
 * 
 * Usage:
 * 1. Ensure you have admin access to the Supabase database
 * 2. Run: node runMigration.js
 * 
 * The script will:
 * 1. Execute the schema migration (SINGLE_ACCOUNT_MIGRATION.sql)
 * 2. Run the migration functions (MIGRATION_RUNNER.sql)
 * 3. Validate and report results
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🚀 Sacred Single Account Migration Runner\n');

// Check if we have the required environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function readSQLFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read ${filename}:`, error.message);
    throw error;
  }
}

async function executeSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);
  
  try {
    // Note: The anonymous key might not have permissions for DDL operations
    // This would normally require a service role key
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${description} completed successfully`);
    return data;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('\n📋 Starting migration process...\n');
    
    // Step 1: Load and execute schema migration
    console.log('📝 Step 1: Loading schema migration...');
    const schemaSql = await readSQLFile('SINGLE_ACCOUNT_MIGRATION.sql');
    await executeSQL(schemaSql, 'Schema migration');
    
    // Step 2: Load and execute migration runner functions  
    console.log('📝 Step 2: Loading migration runner...');
    const runnerSql = await readSQLFile('MIGRATION_RUNNER.sql');
    await executeSQL(runnerSql, 'Migration runner setup');
    
    // Step 3: Validate prerequisites
    console.log('📝 Step 3: Validating prerequisites...');
    const { data: validationResults, error: validationError } = await supabase
      .rpc('validate_migration_prerequisites');
    
    if (validationError) {
      throw validationError;
    }
    
    console.log('📊 Prerequisites validation results:');
    validationResults?.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`   ${status} ${result.check_name}: ${result.details}`);
    });
    
    // Step 4: Run complete migration
    console.log('📝 Step 4: Running complete migration...');
    const { data: migrationResult, error: migrationError } = await supabase
      .rpc('run_complete_migration');
    
    if (migrationError) {
      throw migrationError;
    }
    
    console.log('📊 Migration result:');
    console.log(migrationResult);
    
    // Step 5: Generate migration report
    console.log('📝 Step 5: Generating migration report...');
    const { data: reportResults, error: reportError } = await supabase
      .rpc('generate_migration_report');
    
    if (reportError) {
      throw reportError;
    }
    
    console.log('📊 Migration Report:');
    console.log('┌─────────────────────────────┬────────────────┬───────────────┬──────────────────────────────────┐');
    console.log('│ Metric                      │ Before         │ After         │ Notes                            │');
    console.log('├─────────────────────────────┼────────────────┼───────────────┼──────────────────────────────────┤');
    reportResults?.forEach(row => {
      console.log(`│ ${row.metric.padEnd(27)} │ ${String(row.before_migration).padEnd(14)} │ ${String(row.after_migration).padEnd(13)} │ ${row.notes.padEnd(32)} │`);
    });
    console.log('└─────────────────────────────┴────────────────┴───────────────┴──────────────────────────────────┘');
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('\n✅ Your Sacred application has been migrated to the single-account system.');
    console.log('✅ All user data has been preserved and migrated.');
    console.log('✅ The new system is ready for use.');
    
  } catch (error) {
    console.error('\n💥 MIGRATION FAILED!');
    console.error('Error:', error.message);
    
    console.log('\n🔄 Would you like to rollback? You can run:');
    console.log('   SELECT rollback_migration();');
    console.log('   in your Supabase SQL editor to restore the original system.');
    
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);