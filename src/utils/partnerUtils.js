/**
 * User Utilities - Simplified utilities for single-account system
 * Updated during migration from partner system to single-account system
 */

/**
 * Get user's display name from assessment or user object
 * @param {Object} assessment - Assessment object
 * @param {Object} currentUser - Current user object with email and name
 * @returns {string} User's display name or fallback
 */
export const getUserDisplayName = (assessment, currentUser) => {
  if (!currentUser) {
    return 'User';
  }
  
  // Try to get name from user profile first
  if (currentUser.full_name) {
    return currentUser.full_name.split(' ')[0]; // First name only
  }
  
  // Fallback to email username
  if (currentUser.email) {
    return currentUser.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Validate that user has access to assessment (single account)
 * @param {Object} assessment - Assessment object
 * @param {Object} currentUser - Current user object with email
 * @returns {boolean} True if user should have access
 */
export const hasAssessmentAccess = (assessment, currentUser) => {
  if (!assessment || !currentUser) {
    return false;
  }
  
  // In single account system, user only has access to their own assessments
  return assessment.user_email === currentUser.email || assessment.user_id === currentUser.id;
};

/**
 * Get assessment ownership status for current user
 * @param {Object} assessment - Assessment object
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if user owns this assessment
 */
export const isAssessmentOwner = (assessment, currentUser) => {
  return hasAssessmentAccess(assessment, currentUser);
};

// Legacy compatibility functions - these return fallback values for backwards compatibility
// TODO: Remove these after all components are updated to single account system

/**
 * @deprecated Use getUserDisplayName instead
 */
export const getPartnerName = (assessment, currentUser) => {
  console.warn('getPartnerName is deprecated - use getUserDisplayName instead');
  return 'Your Partner'; // Static fallback for backward compatibility
};

/**
 * @deprecated No longer applicable in single account system
 */
export const isPartner1 = (assessment, currentUser) => {
  console.warn('isPartner1 is deprecated - use isAssessmentOwner instead');
  return isAssessmentOwner(assessment, currentUser);
};

/**
 * @deprecated No longer applicable in single account system
 */
export const isPartner2 = (assessment, currentUser) => {
  console.warn('isPartner2 is deprecated - not applicable in single account system');
  return false;
};

/**
 * @deprecated No longer applicable in single account system
 */
export const getPartnerNumber = (assessment, currentUser) => {
  console.warn('getPartnerNumber is deprecated - not applicable in single account system');
  return null;
};