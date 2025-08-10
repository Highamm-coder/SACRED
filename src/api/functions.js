// SACRED Functions - Email Integration via Resend
// These functions handle server-side operations like emails, payments, etc.

import { supabase } from './supabaseClient';
import { 
  sendPartnerInviteEmail, 
  sendAssessmentCompleteEmail, 
  sendWeddingCongratulationsEmail 
} from './services/resend';

// Email functions using Resend
export const sendInviteEmail = async (inviteData) => {
  try {
    console.log('Sending invite email via Resend:', inviteData);
    
    // Validate required data
    if (!inviteData.email || !inviteData.partnerName || !inviteData.inviteLink) {
      return { 
        success: false, 
        error: 'Missing required data: email, partnerName, and inviteLink are required' 
      };
    }
    
    const result = await sendPartnerInviteEmail(inviteData);
    
    if (result.success) {
      console.log('Invite email sent successfully:', result.emailId);
    } else {
      console.error('Failed to send invite email:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in sendInviteEmail:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send invite email' 
    };
  }
};

export const sendCompletionNotification = async (notificationData) => {
  try {
    console.log('Sending completion notification via Resend:', notificationData);
    
    // Validate required data
    if (!notificationData.email || !notificationData.userName || !notificationData.reportLink) {
      return { 
        success: false, 
        error: 'Missing required data: email, userName, and reportLink are required' 
      };
    }
    
    const result = await sendAssessmentCompleteEmail(notificationData);
    
    if (result.success) {
      console.log('Completion notification sent successfully:', result.emailId);
    } else {
      console.error('Failed to send completion notification:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in sendCompletionNotification:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send completion notification' 
    };
  }
};

export const sendWeddingCongratulations = async (congratsData) => {
  try {
    console.log('Sending wedding congratulations via Resend:', congratsData);
    
    // Validate required data
    if (!congratsData.email || !congratsData.coupleName) {
      return { 
        success: false, 
        error: 'Missing required data: email and coupleName are required' 
      };
    }
    
    const result = await sendWeddingCongratulationsEmail(congratsData);
    
    if (result.success) {
      console.log('Wedding congratulations sent successfully:', result.emailId);
    } else {
      console.error('Failed to send wedding congratulations:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in sendWeddingCongratulations:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send wedding congratulations' 
    };
  }
};

export const deleteUserAccount = async (userId) => {
  // TODO: Implement user account deletion
  console.log('Delete user account:', userId);
  
  return { success: true, message: 'User account deleted (placeholder)' };
};

export const checkWeddingDates = async (userId) => {
  // TODO: Implement wedding date checking
  console.log('Check wedding dates for user:', userId);
  
  return { success: true, data: null, message: 'Wedding dates checked (placeholder)' };
};

export const createStripeCheckoutSession = async (sessionData) => {
  // TODO: Implement Stripe checkout session creation
  console.log('Create Stripe checkout session:', sessionData);
  
  return { 
    success: true, 
    checkoutUrl: 'https://checkout.stripe.com/placeholder',
    message: 'Stripe checkout session created (placeholder)' 
  };
};

export const verifyCheckoutSession = async (sessionId) => {
  // TODO: Implement Stripe session verification
  console.log('Verify checkout session:', sessionId);
  
  return { 
    success: true, 
    verified: true,
    message: 'Checkout session verified (placeholder)' 
  };
};

// Helper function for future Supabase Edge Function calls
export const callSupabaseFunction = async (functionName, params) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error calling Supabase function ${functionName}:`, error);
    return { success: false, error: error.message };
  }
};