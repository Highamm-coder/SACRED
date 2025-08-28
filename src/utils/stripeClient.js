// Stripe Client Utility for SACRED Platform
// This module initializes and manages the Stripe.js client

import { loadStripe } from '@stripe/stripe-js';

// Cache for the Stripe promise to avoid multiple initializations
let stripePromise;

/**
 * Initialize Stripe with the publishable key from environment variables
 * @returns {Promise<Stripe>} Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      throw new Error(
        'VITE_STRIPE_PUBLISHABLE_KEY is not defined. Please add your Stripe publishable key to your environment variables.'
      );
    }

    // Validate that the key format is correct
    if (!publishableKey.startsWith('pk_')) {
      throw new Error(
        'Invalid Stripe publishable key format. It should start with "pk_test_" or "pk_live_"'
      );
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Check if Stripe is properly configured
 * @returns {boolean} True if Stripe configuration is valid
 */
export const isStripeConfigured = () => {
  try {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return publishableKey && publishableKey.startsWith('pk_');
  } catch (error) {
    console.error('Error checking Stripe configuration:', error);
    return false;
  }
};

/**
 * Get the current Stripe environment (test or live)
 * @returns {string} 'test' or 'live'
 */
export const getStripeEnvironment = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) return 'unknown';
  
  if (publishableKey.startsWith('pk_test_')) return 'test';
  if (publishableKey.startsWith('pk_live_')) return 'live';
  return 'unknown';
};

/**
 * Validate Stripe configuration and log helpful messages
 */
export const validateStripeConfig = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('🔴 Stripe Error: VITE_STRIPE_PUBLISHABLE_KEY is not configured');
    console.log('💡 Add your Stripe key to .env.local file');
    return false;
  }

  if (!publishableKey.startsWith('pk_')) {
    console.error('🔴 Stripe Error: Invalid publishable key format');
    console.log('💡 Key should start with "pk_test_" or "pk_live_"');
    return false;
  }

  const environment = getStripeEnvironment();
  console.log(`✅ Stripe configured for ${environment} environment`);
  
  if (environment === 'test') {
    console.log('🧪 Test mode: Use card 4242 4242 4242 4242 for testing');
  }

  return true;
};