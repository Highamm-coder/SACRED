// Assessment progress storage utility using localStorage
// Provides anonymous, browser-only persistence for assessment progress

const STORAGE_KEY = 'sacred_assessment_progress';
const STORAGE_VERSION = '1.0';

// Generate a random anonymous session ID
export const generateAnonymousSessionId = () => {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Get current assessment progress from localStorage
export const getAssessmentProgress = (assessmentId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    // Check version compatibility
    if (data.version !== STORAGE_VERSION) {
      console.log('Assessment storage version mismatch, clearing old data');
      clearAssessmentProgress(assessmentId);
      return null;
    }

    // Return progress for specific assessment
    return data.assessments?.[assessmentId] || null;
  } catch (error) {
    console.error('Error reading assessment progress from localStorage:', error);
    return null;
  }
};

// Save assessment progress to localStorage
export const saveAssessmentProgress = (assessmentId, progressData) => {
  try {
    // Get existing storage
    let stored = {};
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
      stored = JSON.parse(existingData);
    }

    // Initialize structure if needed
    if (!stored.version) stored.version = STORAGE_VERSION;
    if (!stored.assessments) stored.assessments = {};

    // Update progress for this assessment
    stored.assessments[assessmentId] = {
      ...progressData,
      lastUpdated: new Date().toISOString(),
      sessionId: progressData.sessionId || generateAnonymousSessionId()
    };

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    
    console.log('✅ Assessment progress saved to localStorage');
    return true;
  } catch (error) {
    console.error('Error saving assessment progress to localStorage:', error);
    return false;
  }
};

// Clear progress for specific assessment
export const clearAssessmentProgress = (assessmentId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data = JSON.parse(stored);
    if (data.assessments && data.assessments[assessmentId]) {
      delete data.assessments[assessmentId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('🗑️ Assessment progress cleared from localStorage');
    }
  } catch (error) {
    console.error('Error clearing assessment progress:', error);
  }
};

// Clear all assessment progress (emergency cleanup)
export const clearAllProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All assessment progress cleared');
  } catch (error) {
    console.error('Error clearing all progress:', error);
  }
};

// Get assessment session info (for final submission)
export const getSessionInfo = (assessmentId) => {
  const progress = getAssessmentProgress(assessmentId);
  return progress ? {
    sessionId: progress.sessionId,
    startedAt: progress.startedAt,
    lastUpdated: progress.lastUpdated
  } : null;
};

// Check if assessment has any saved progress
export const hasAssessmentProgress = (assessmentId) => {
  const progress = getAssessmentProgress(assessmentId);
  return progress && (
    progress.currentQuestionIndex > 0 || 
    Object.keys(progress.responses || {}).length > 0
  );
};

// Get resume prompt data for UI
export const getResumePrompt = (assessmentId) => {
  const progress = getAssessmentProgress(assessmentId);
  if (!progress) return null;

  return {
    currentQuestion: progress.currentQuestionIndex + 1,
    totalQuestions: progress.totalQuestions,
    answeredQuestions: Object.keys(progress.responses || {}).length,
    lastUpdated: progress.lastUpdated,
    canResume: progress.currentQuestionIndex > 0 || Object.keys(progress.responses || {}).length > 0
  };
};