// Test file for Resend integration
// This file can be used for testing email functionality during development

import { sendInviteEmail, sendCompletionNotification, sendWeddingCongratulations } from './functions';

// Test data
const testInviteData = {
  email: 'test@example.com',
  partnerName: 'John Doe',
  inviteLink: 'https://sacred.co/assessment?invite=test123'
};

const testCompletionData = {
  email: 'test@example.com',
  userName: 'Jane Doe',
  partnerName: 'John Doe',
  reportLink: 'https://sacred.co/report?id=test123'
};

const testWeddingData = {
  email: 'test@example.com',
  coupleName: 'John & Jane Doe'
};

// Test functions
export const testPartnerInviteEmail = async () => {
  console.log('🧪 Testing partner invite email...');
  const result = await sendInviteEmail(testInviteData);
  console.log('Result:', result);
  return result;
};

export const testCompletionEmail = async () => {
  console.log('🧪 Testing completion notification email...');
  const result = await sendCompletionNotification(testCompletionData);
  console.log('Result:', result);
  return result;
};

export const testWeddingEmail = async () => {
  console.log('🧪 Testing wedding congratulations email...');
  const result = await sendWeddingCongratulations(testWeddingData);
  console.log('Result:', result);
  return result;
};

export const testAllEmails = async () => {
  console.log('🧪 Testing all email functions...');
  
  const results = {
    invite: await testPartnerInviteEmail(),
    completion: await testCompletionEmail(),
    wedding: await testWeddingEmail()
  };
  
  console.log('📊 All test results:', results);
  return results;
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  window.testEmails = {
    testPartnerInviteEmail,
    testCompletionEmail,
    testWeddingEmail,
    testAllEmails
  };
  console.log('💡 Email test functions available in console: window.testEmails');
}