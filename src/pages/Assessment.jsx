
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, CoupleAssessment, Question, Answer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import ProgressBar from '../components/assessment/ProgressBar';
import QuestionCard from '../components/assessment/QuestionCard';

export default function AssessmentPage() {
    const [user, setUser] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const assessmentId = urlParams.get('id');
    const partnerNumber = urlParams.get('partner');

    useEffect(() => {
        const initializeAssessment = async () => {
            if (!assessmentId || !partnerNumber) {
                navigate(createPageUrl('Dashboard'));
                return;
            }

            try {
                const currentUser = await User.me();
                setUser(currentUser);

                // If user hasn't completed any onboarding, redirect them.
                // This is crucial for invited partners (Partner 2).
                if (!currentUser.onboarding_completed) {
                    navigate(createPageUrl(`Onboarding?assessmentId=${assessmentId}`));
                    return; // Stop further execution until onboarding is done.
                }

                const [fetchedAssessment, allQuestions, userAnswers] = await Promise.all([
                    CoupleAssessment.get(assessmentId),
                    Question.list(),
                    Answer.filter({ assessmentId, userEmail: currentUser.email })
                ]);
                
                // Validate that the current user is one of the partners in this assessment
                const userEmail = currentUser.email.toLowerCase();
                const partner1Email = fetchedAssessment.partner1_email?.toLowerCase();
                const partner2Email = fetchedAssessment.partner2_email?.toLowerCase();
                
                if (userEmail !== partner1Email && userEmail !== partner2Email) {
                    console.error('Authorization failed: User is not a partner in this assessment', {
                        userEmail,
                        partner1Email,
                        partner2Email
                    });
                    navigate(createPageUrl('Dashboard?error=assessment_unauthorized'));
                    return;
                }
                
                console.log('✅ User authorized for assessment:', {
                    userEmail,
                    isPartner1: userEmail === partner1Email,
                    isPartner2: userEmail === partner2Email
                });
                
                setAssessment(fetchedAssessment);
                // Sort questions by order field (questions service now provides consistent ordering)
                console.log('📊 Questions loaded:', allQuestions.length, 'questions');
                console.log('📊 Sample question:', allQuestions[0]);
                setQuestions(allQuestions);
                
                console.log('✅ User answers loaded:', userAnswers);
                const answersMap = userAnswers.reduce((acc, ans) => {
                    console.log('📝 Processing answer for question:', ans.question_id, 'Answer:', ans.answer);
                    acc[ans.question_id] = ans.answer; // Use the string `question_id` as the key
                    return acc;
                }, {});
                console.log('📝 Final answers map:', answersMap);
                setAnswers(answersMap);

            } catch (error) {
                console.error("Error initializing assessment:", error);
                
                // Provide more specific error messages
                if (error.message?.includes('not found') || error.status === 404) {
                    navigate(createPageUrl('Dashboard?error=assessment_not_found'));
                } else if (error.message?.includes('permission') || error.status === 403) {
                    navigate(createPageUrl('Dashboard?error=assessment_permission_denied'));
                } else {
                    navigate(createPageUrl('Dashboard?error=assessment_load_failed'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeAssessment();
    }, [assessmentId, partnerNumber, navigate]);

    const handleAnswerSelect = async (questionId, answer) => {
        console.log('🎯 Answer selected for question:', questionId, 'Answer:', answer);
        const newAnswers = { ...answers, [questionId]: answer };
        console.log('🎯 Updated answers state:', newAnswers);
        
        // Update state immediately for UI responsiveness
        setAnswers(newAnswers);
        
        // Save to database in background
        setIsSaving(true);
        try {
            // Find the question by its string ID now
            const question = questions.find(q => q.questionId === questionId);
            // Check if an answer already exists to update it, otherwise create a new one
            const existingAnswer = (await Answer.filter({ assessmentId, questionId, userEmail: user.email }))[0];

            if (existingAnswer) {
                await Answer.update(existingAnswer.id, { answer });
            } else {
                await Answer.create({
                    assessment_id: assessmentId,
                    question_id: questionId,
                    user_email: user.email,
                    answer,
                    section: question.section
                });
            }
        } catch (error) {
            console.error("Error saving answer:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question, finish assessment
            finishAssessment();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const finishAssessment = async () => {
        setIsLoading(true); // Set loading while finishing assessment
        try {
            let newStatus = assessment.status;
            if (partnerNumber === '1' && assessment.status === 'pending') {
                newStatus = 'partner1_completed';
            } else if (partnerNumber === '2' && assessment.status === 'pending') {
                newStatus = 'partner2_completed';
            } else if (partnerNumber === '1' && assessment.status === 'partner2_completed') {
                newStatus = 'completed';
            } else if (partnerNumber === '2' && assessment.status === 'partner1_completed') {
                newStatus = 'completed';
            }

            if (newStatus !== assessment.status) {
                await CoupleAssessment.update(assessment.id, { status: newStatus });
            }
            
            if (newStatus === 'completed') {
                navigate(createPageUrl(`Report?id=${assessmentId}`));
            } else {
                navigate(createPageUrl(`Waiting?id=${assessmentId}`));
            }
        } catch (error) {
            console.error("Error finishing assessment:", error);
            setIsLoading(false); // Revert loading state on error
        }
    };

    const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

    if (isLoading) {
        return (
            <AuthWrapper requireAuth={true}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
                </div>
            </AuthWrapper>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    console.log('🔄 Rendering Assessment - Current Question Index:', currentQuestionIndex);
    console.log('🔄 Current Question:', currentQuestion);
    console.log('🔄 Current Answer:', currentQuestion ? answers[currentQuestion.questionId] : 'No question');
    console.log('🔄 All Answers:', answers);

    return (
        <AuthWrapper requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Pass all necessary props to the ProgressBar */}
                    <ProgressBar 
                        progress={progress} 
                        current={currentQuestionIndex + 1} 
                        total={questions.length} 
                    />
                    
                    <div className="mt-8">
                        {currentQuestion && (
                            <QuestionCard 
                                question={currentQuestion}
                                selectedAnswer={answers[currentQuestion.questionId]}
                                onAnswer={(answer) => {
                                    console.log('🔗 QuestionCard callback triggered with answer:', answer);
                                    handleAnswerSelect(currentQuestion.questionId, answer);
                                }}
                            />
                        )}
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        <button onClick={handleBack} disabled={currentQuestionIndex === 0} className="font-sacred text-[#6B5B73] hover:text-[#2F4F3F] disabled:opacity-50 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button 
                                onClick={() => {
                                    console.log('▶️ Next button clicked');
                                    handleNext();
                                }} 
                                disabled={!answers[currentQuestion?.questionId] || isSaving} 
                                className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 py-2 rounded-lg font-sacred flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Next'} <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    console.log('🏁 Finish button clicked');
                                    finishAssessment();
                                }} 
                                disabled={!answers[currentQuestion?.questionId] || isSaving} 
                                className="bg-[#2F4F3F] hover:bg-[#1F3F2F] text-white px-6 py-2 rounded-lg font-sacred flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Finish Assessment'} <Save className="w-4 h-4" />
                            </button>
                        )}
                        {/* Debug info moved to console logs */}
                        {currentQuestion && console.log('🔧 Navigation Debug:', {
                            questionId: currentQuestion.questionId,
                            answer: answers[currentQuestion.questionId],
                            disabled: !answers[currentQuestion.questionId] || isSaving,
                            isSaving: isSaving
                        })}
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}
