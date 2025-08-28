// Environment Configuration Validator for SACRED Platform
// This utility validates that all necessary environment variables are properly configured

/**
 * Configuration requirements for different environments
 */
const CONFIG_REQUIREMENTS = {
  REQUIRED_ALWAYS: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_NAME',
    'VITE_SITE_URL'
  ],
  REQUIRED_FOR_PAYMENTS: [
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ],
  REQUIRED_FOR_EMAILS: [
    'VITE_RESEND_API_KEY'
  ]
};

/**
 * Validate a single environment variable
 * @param {string} key - Environment variable key
 * @param {string} value - Environment variable value
 * @returns {object} Validation result
 */
const validateEnvVar = (key, value) => {
  const result = {
    key,
    value,
    isValid: false,
    error: null,
    warnings: []
  };

  // Check if value exists
  if (!value) {
    result.error = `${key} is not defined`;
    return result;
  }

  // Validate specific formats
  switch (key) {
    case 'VITE_SUPABASE_URL':
      if (!value.startsWith('https://') || !value.includes('supabase.co')) {
        result.error = 'Invalid Supabase URL format';
        return result;
      }
      break;

    case 'VITE_SUPABASE_ANON_KEY':
      if (!value.startsWith('eyJ')) {
        result.error = 'Invalid Supabase anon key format (should start with eyJ)';
        return result;
      }
      break;

    case 'VITE_STRIPE_PUBLISHABLE_KEY':
      if (!value.startsWith('pk_')) {
        result.error = 'Invalid Stripe key format (should start with pk_test_ or pk_live_)';
        return result;
      }
      if (value.startsWith('pk_test_')) {
        result.warnings.push('Using Stripe test mode');
      } else if (value.startsWith('pk_live_')) {
        result.warnings.push('Using Stripe live mode');
      }
      break;

    case 'VITE_RESEND_API_KEY':
      if (!value.startsWith('re_')) {
        result.error = 'Invalid Resend API key format (should start with re_)';
        return result;
      }
      break;

    case 'VITE_SITE_URL':
      if (!value.startsWith('http')) {
        result.error = 'Site URL should start with http:// or https://';
        return result;
      }
      break;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate all environment variables for a specific feature set
 * @param {Array} features - Array of features to validate ('payments', 'emails', etc.)
 * @returns {object} Complete validation result
 */
export const validateEnvironment = (features = []) => {
  const results = {
    isValid: true,
    errors: [],
    warnings: [],
    details: {},
    summary: {
      total: 0,
      valid: 0,
      invalid: 0,
      missing: 0
    }
  };

  // Always validate required variables
  let requiredVars = [...CONFIG_REQUIREMENTS.REQUIRED_ALWAYS];

  // Add feature-specific requirements
  if (features.includes('payments')) {
    requiredVars = [...requiredVars, ...CONFIG_REQUIREMENTS.REQUIRED_FOR_PAYMENTS];
  }
  if (features.includes('emails')) {
    requiredVars = [...requiredVars, ...CONFIG_REQUIREMENTS.REQUIRED_FOR_EMAILS];
  }

  // Validate each required variable
  requiredVars.forEach(key => {
    const value = import.meta.env[key];
    const validation = validateEnvVar(key, value);
    
    results.details[key] = validation;
    results.summary.total++;

    if (validation.isValid) {
      results.summary.valid++;
      if (validation.warnings.length > 0) {
        results.warnings.push(...validation.warnings);
      }
    } else {
      results.summary.invalid++;
      results.errors.push(validation.error);
      results.isValid = false;
      
      if (!value) {
        results.summary.missing++;
      }
    }
  });

  return results;
};

/**
 * Get environment summary for debugging
 * @returns {object} Environment summary
 */
export const getEnvironmentSummary = () => {
  return {
    NODE_ENV: import.meta.env.MODE,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    APP_VERSION: import.meta.env.VITE_APP_VERSION,
    APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT,
    SITE_URL: import.meta.env.VITE_SITE_URL,
    SUPABASE_CONFIGURED: !!import.meta.env.VITE_SUPABASE_URL,
    STRIPE_CONFIGURED: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    STRIPE_MODE: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? 'test' : 
                 import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') ? 'live' : 'unknown',
    EMAILS_CONFIGURED: !!import.meta.env.VITE_RESEND_API_KEY
  };
};

/**
 * Log environment validation results
 * @param {Array} features - Features to validate
 */
export const logEnvironmentStatus = (features = ['payments', 'emails']) => {
  const validation = validateEnvironment(features);
  const summary = getEnvironmentSummary();
  
  console.group('🔧 SACRED Environment Configuration');
  
  // Log summary
  console.log('📋 Summary:', summary);
  
  // Log validation results
  if (validation.isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.log('❌ Environment configuration issues found:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  // Log warnings
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Log detailed results
  console.log('📝 Detailed Results:');
  Object.entries(validation.details).forEach(([key, result]) => {
    const status = result.isValid ? '✅' : '❌';
    const message = result.isValid ? 'Valid' : result.error;
    console.log(`  ${status} ${key}: ${message}`);
  });
  
  console.groupEnd();
  
  return validation;
};

/**
 * Check if specific features are properly configured
 * @param {string} feature - Feature to check ('payments', 'emails', etc.)
 * @returns {boolean} True if feature is configured
 */
export const isFeatureConfigured = (feature) => {
  const validation = validateEnvironment([feature]);
  return validation.isValid;
};

// Export configuration requirements for reference
export { CONFIG_REQUIREMENTS };