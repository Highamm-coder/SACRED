import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Assessment, Question } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, ArrowRight, Save, CheckCircle, RotateCcw } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import ProgressBar from '../components/assessment/ProgressBar';
import QuestionCard from '../components/assessment/QuestionCard';
import { 
    getAssessmentProgress, 
    saveAssessmentProgress, 
    clearAssessmentProgress, 
    hasAssessmentProgress,
    getResumePrompt,
    generateAnonymousSessionId 
} from '@/utils/assessmentStorage';

export default function AssessmentPage() {
    const [user, setUser] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const assessmentId = urlParams.get('id');

    useEffect(() => {
        const initializeAssessment = async () => {
            if (!assessmentId) {
                navigate(createPageUrl('Dashboard'));
                return;
            }

            try {
                const currentUser = await User.me();
                setUser(currentUser);

                // If user hasn't completed onboarding, redirect them
                if (!currentUser.onboarding_completed) {
                    navigate(createPageUrl('Onboarding'));
                    return;
                }

                // Load assessment
                const assessmentData = await Assessment.get(assessmentId);
                if (!assessmentData) {
                    navigate(createPageUrl('Dashboard?error=assessment_not_found'));
                    return;
                }

                // Verify user owns this assessment
                if (assessmentData.user_email !== currentUser.email) {
                    navigate(createPageUrl('Dashboard?error=assessment_unauthorized'));
                    return;
                }

                setAssessment(assessmentData);

                // Load questions
                const questionData = await Question.list();
                setQuestions(questionData);

                // Check for existing progress in localStorage
                const savedProgress = getAssessmentProgress(assessmentId);
                if (savedProgress && hasAssessmentProgress(assessmentId)) {
                    const resumeInfo = getResumePrompt(assessmentId);
                    setResumeData(resumeInfo);
                    setShowResumePrompt(true);
                } else {
                    // Generate new session ID for fresh start
                    setSessionId(generateAnonymousSessionId());
                }

                // Load existing responses from server (backup)
                if (assessmentData.assessment_responses) {
                    const responseMap = {};
                    assessmentData.assessment_responses.forEach(response => {
                        responseMap[response.question_id] = response.response_value;
                    });
                    setResponses(responseMap);
                }

            } catch (error) {
                console.error('Error loading assessment:', error);
                navigate(createPageUrl('Dashboard?error=assessment_load_failed'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeAssessment();
    }, [assessmentId, navigate]);

    const saveResponse = async (questionId, value) => {
        if (!assessment) return;

        setIsSaving(true);
        setSaveStatus(null);
        
        try {
            const question = questions.find(q => q.question_id === questionId);
            
            await Assessment.saveResponse(assessment.id, questionId, {
                value: value,
                questionText: question?.question_text,
                section: question?.section,
                type: 'text'
            });

            // Update local state
            setResponses(prev => ({
                ...prev,
                [questionId]: value
            }));

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);

        } catch (error) {
            console.error('Error saving response:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        const currentResponse = responses[currentQuestion?.question_id];
        
        // Save current response if it exists
        if (currentResponse && currentQuestion) {
            await saveResponse(currentQuestion.question_id, currentResponse);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Assessment complete
            await handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    // Save progress to localStorage
    const saveProgressToStorage = () => {
        if (!assessmentId || !questions.length) return;

        const progressData = {
            sessionId: sessionId,
            currentQuestionIndex,
            responses,
            totalQuestions: questions.length,
            startedAt: sessionId ? new Date().toISOString() : undefined
        };

        saveAssessmentProgress(assessmentId, progressData);
    };

    // Auto-save progress whenever responses or current question changes
    useEffect(() => {
        if (questions.length > 0 && sessionId) {
            saveProgressToStorage();
        }
    }, [responses, currentQuestionIndex, questions, sessionId]);

    // Resume from saved progress
    const handleResumeProgress = () => {
        const savedProgress = getAssessmentProgress(assessmentId);
        if (savedProgress) {
            setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
            setResponses(savedProgress.responses || {});
            setSessionId(savedProgress.sessionId);
            console.log('📂 Resumed from saved progress:', savedProgress);
        }
        setShowResumePrompt(false);
    };

    // Start fresh (clear saved progress)
    const handleStartFresh = () => {
        clearAssessmentProgress(assessmentId);
        setCurrentQuestionIndex(0);
        setResponses({});
        setSessionId(generateAnonymousSessionId());
        setShowResumePrompt(false);
        console.log('🆕 Starting fresh assessment');
    };

    const handleComplete = async () => {
        try {
            await Assessment.complete(assessment.id);
            // Clear saved progress since assessment is complete
            clearAssessmentProgress(assessmentId);
            navigate(createPageUrl(`Report?id=${assessment.id}`));
        } catch (error) {
            console.error('Error completing assessment:', error);
            alert('Error completing assessment. Please try again.');
        }
    };

    const getProgress = () => {
        return questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    };

    const getResponseCount = () => {
        return Object.keys(responses).length;
    };

    if (isLoading) {
        return (
            <AuthWrapper requireAuth={true}>
                <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#C4756B] mx-auto mb-4" />
                        <p className="text-[#2F4F3F] font-sacred">Loading your assessment...</p>
                    </div>
                </div>
            </AuthWrapper>
        );
    }

    if (!questions.length) {
        return (
            <AuthWrapper requireAuth={true}>
                <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-[#2F4F3F] font-sacred">No questions available. Please contact support.</p>
                    </div>
                </div>
            </AuthWrapper>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // Show resume prompt if we have saved progress
    if (showResumePrompt && resumeData) {
        return (
            <AuthWrapper requireAuth={true}>
                <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center py-6 px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-xl p-8 border border-[#E6D7C9]">
                            <div className="text-center mb-6">
                                <RotateCcw className="w-12 h-12 text-[#C4756B] mx-auto mb-4" />
                                <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-2">
                                    Resume Assessment?
                                </h2>
                                <p className="text-[#6B5B73] font-sacred">
                                    We found your previous progress from {new Date(resumeData.lastUpdated).toLocaleDateString()}.
                                </p>
                            </div>

                            <div className="bg-[#F5F1EB] rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm font-sacred">
                                    <div>
                                        <div className="text-[#6B5B73]">Progress</div>
                                        <div className="text-[#2F4F3F] font-sacred-bold">
                                            Question {resumeData.currentQuestion} of {resumeData.totalQuestions}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[#6B5B73]">Answered</div>
                                        <div className="text-[#2F4F3F] font-sacred-bold">
                                            {resumeData.answeredQuestions} questions
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleResumeProgress}
                                    className="w-full px-6 py-3 bg-[#C4756B] text-white rounded-lg hover:bg-[#B86761] transition-colors font-sacred"
                                >
                                    Continue Where I Left Off
                                </button>
                                <button
                                    onClick={handleStartFresh}
                                    className="w-full px-6 py-3 border border-[#6B5B73] text-[#6B5B73] rounded-lg hover:bg-[#6B5B73] hover:text-white transition-colors font-sacred"
                                >
                                    Start Over
                                </button>
                            </div>

                            <p className="text-xs text-[#6B5B73] text-center mt-4 font-sacred">
                                Your progress is saved locally in your browser for privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </AuthWrapper>
        );
    }

    return (
        <AuthWrapper requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate(createPageUrl('Dashboard'))}
                                className="flex items-center text-[#6B5B73] hover:text-[#2F4F3F] font-sacred transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </button>
                            <div className="flex items-center gap-2">
                                {saveStatus === 'saved' && (
                                    <div className="flex items-center text-green-600 text-sm font-sacred">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Saved
                                    </div>
                                )}
                                {saveStatus === 'error' && (
                                    <div className="text-red-600 text-sm font-sacred">
                                        Save failed
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-2">
                            Sacred Assessment
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-[#6B5B73] font-sacred">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                            <div className="flex items-center text-xs text-[#6B5B73] font-sacred">
                                <Save className="w-3 h-3 mr-1" />
                                Auto-saving progress
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar 
                        current={currentQuestionIndex + 1}
                        total={questions.length}
                        className="mb-8"
                    />

                    {/* Question */}
                    <div className="mb-8">
                        <QuestionCard
                            question={currentQuestion}
                            selectedAnswer={responses[currentQuestion?.question_id] || ''}
                            onAnswer={(value) => {
                                console.log('📝 Answer selected:', value, 'for question:', currentQuestion?.question_id);
                                // Update local state immediately
                                setResponses(prev => ({
                                    ...prev,
                                    [currentQuestion.question_id]: value
                                }));
                                // Auto-save the response
                                saveResponse(currentQuestion.question_id, value);
                            }}
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center px-6 py-3 text-[#6B5B73] border border-[#6B5B73] rounded-lg hover:bg-[#6B5B73] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sacred"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>

                        <div className="text-center font-sacred text-[#6B5B73]">
                            {getResponseCount()} of {questions.length} questions answered
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={isSaving}
                            className="flex items-center px-6 py-3 bg-[#C4756B] text-white rounded-lg hover:bg-[#B86761] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sacred"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : isLastQuestion ? (
                                <>
                                    Complete Assessment
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}