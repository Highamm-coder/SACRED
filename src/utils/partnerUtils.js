/**
 * Partner Utilities - Centralized logic for partner operations
 * Created by SCUBBR during enterprise code cleanup
 */

/**
 * Get the partner's display name based on current user's role in assessment
 * @param {Object} assessment - Assessment object with partner emails and names
 * @param {Object} currentUser - Current user object with email
 * @returns {string} Partner's display name or fallback
 */
export const getPartnerName = (assessment, currentUser) => {
  console.log('🤝 getPartnerName() - User:', currentUser?.email, 'Partner1:', assessment.partner1_email, 'Partner2:', assessment.partner2_email);
  
  if (!currentUser || !assessment) {
    return 'Your Partner';
  }
  
  if (currentUser.email === assessment.partner1_email) {
    // Current user is Partner 1, so their partner is Partner 2
    console.log('👤 User is Partner 1, returning Partner 2 name:', assessment.partner2_name);
    return assessment.partner2_name || 'Your Partner';
  } else if (currentUser.email === assessment.partner2_email) {
    // Current user is Partner 2, so their partner is Partner 1  
    console.log('👤 User is Partner 2, returning Partner 1 name:', assessment.partner1_name);
    return assessment.partner1_name || 'Your Partner';
  } else {
    // User doesn't match either partner - shouldn't happen in normal flow
    console.warn('⚠️ User email does not match either partner in assessment');
    return 'Your Partner';
  }
};

/**
 * Determine if current user is Partner 1 in the assessment
 * @param {Object} assessment - Assessment object with partner emails
 * @param {Object} currentUser - Current user object with email
 * @returns {boolean} True if user is Partner 1
 */
export const isPartner1 = (assessment, currentUser) => {
  return currentUser?.email === assessment?.partner1_email;
};

/**
 * Determine if current user is Partner 2 in the assessment
 * @param {Object} assessment - Assessment object with partner emails
 * @param {Object} currentUser - Current user object with email
 * @returns {boolean} True if user is Partner 2
 */
export const isPartner2 = (assessment, currentUser) => {
  return currentUser?.email === assessment?.partner2_email;
};

/**
 * Get partner number (1 or 2) for current user
 * @param {Object} assessment - Assessment object with partner emails
 * @param {Object} currentUser - Current user object with email
 * @returns {number|null} 1, 2, or null if not found
 */
export const getPartnerNumber = (assessment, currentUser) => {
  if (isPartner1(assessment, currentUser)) return 1;
  if (isPartner2(assessment, currentUser)) return 2;
  return null;
};

/**
 * Validate that user has access to assessment
 * @param {Object} assessment - Assessment object with partner emails
 * @param {Object} currentUser - Current user object with email
 * @returns {boolean} True if user should have access
 */
export const hasAssessmentAccess = (assessment, currentUser) => {
  return isPartner1(assessment, currentUser) || isPartner2(assessment, currentUser);
};