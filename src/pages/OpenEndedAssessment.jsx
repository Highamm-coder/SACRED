
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OpenEndedQuestion, OpenEndedAnswer, Assessment, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import OpenEndedQuestionCard from '../components/openended/OpenEndedQuestionCard';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function OpenEndedAssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Now stores only the text: { questionId: answerText }
  const [partner1Assessment, setPartner1Assessment] = useState(null);
  const [partner2Assessment, setPartner2Assessment] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const urlParams = new URLSearchParams(location.search);
        const partner1Id = urlParams.get('p1');
        const partner2Id = urlParams.get('p2');

        if (!partner1Id || !partner2Id) {
          setError('Assessment IDs not provided. Please return to the dashboard.');
          return;
        }

        // Load both assessment details
        const partner1AssessmentData = await Assessment.get(partner1Id);
        const partner2AssessmentData = await Assessment.get(partner2Id);
        
        // Verify user has access to these assessments
        if (partner1AssessmentData.user_email !== currentUser.email || 
            partner2AssessmentData.user_email !== currentUser.email) {
          setError('You do not have access to these assessments. Please check your dashboard.');
          return;
        }

        // Verify both assessments are completed
        if (partner1AssessmentData.status !== 'completed' || partner2AssessmentData.status !== 'completed') {
          navigate(createPageUrl('Dashboard'));
          return;
        }

        setPartner1Assessment(partner1AssessmentData);
        setPartner2Assessment(partner2AssessmentData);

        // Load all open-ended questions
        const questionsData = await OpenEndedQuestion.list('order');
        setQuestions(questionsData);

        // Load existing answers for this user (using partner1 assessment ID as reference)
        const existingAnswers = await OpenEndedAnswer.filter({
          assessmentId: partner1Id,
          userEmail: currentUser.email
        });

        const answersMap = {};
        existingAnswers.forEach(answer => {
          answersMap[answer.questionId] = answer.answerText;
        });
        setAnswers(answersMap);

        // Check if all questions are answered by the current user
        const allAnswered = questionsData.every(q => answersMap[q.questionId] && answersMap[q.questionId].trim());
        setIsCompleted(allAnswered);

      } catch (err) {
        console.error('Error loading open-ended assessment:', err);
        setError('Failed to load assessment. Please try again later.');
        // Handle authentication errors specifically
        if (err.statusCode === 401) {
          window.location.href = createPageUrl('Login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [location.search, navigate]); // Depend on location.search to re-run if ID changes

  const handleAnswerChange = (answerText) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.questionId]: answerText
      }));
    }
  };

  const handleSaveAnswer = async (answerText) => {
    if (!partner1Assessment || !user || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const trimmedAnswerText = answerText.trim();
    
    setIsSaving(true);
    try {
      // Check if answer already exists for this specific user and question (using partner1 ID as reference)
      const existingAnswers = await OpenEndedAnswer.filter({
        assessmentId: partner1Assessment.id,
        questionId: currentQuestion.questionId,
        userEmail: user.email
      });

      if (existingAnswers.length > 0) {
        // Update existing answer
        await OpenEndedAnswer.update(existingAnswers[0].id, {
          answerText: trimmedAnswerText
        });
      } else if (trimmedAnswerText) { // Only create if there's actual text to save
        // Create new answer
        await OpenEndedAnswer.create({
          assessmentId: partner1Assessment.id,
          questionId: currentQuestion.questionId,
          userEmail: user.email,
          answerText: trimmedAnswerText
        });
      }

      // Update local state to reflect the saved answer. If the answer was
      // cleared (empty string), it should also be reflected locally.
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.questionId]: trimmedAnswerText
      }));

      // Re-evaluate if all questions are now answered
      const allAnswered = questions.every(q => {
        // Use the just-saved answer for the current question, otherwise use existing from state
        const answerToCheck = (q.questionId === currentQuestion.questionId) ? trimmedAnswerText : answers[q.questionId];
        return answerToCheck && answerToCheck.trim();
      });
      setIsCompleted(allAnswered);

    } catch (err) {
      console.error('Error saving answer:', err);
      // Optionally set an error state to display to the user
      // setError('Failed to save your answer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (isSaving) return;
    
    // Save current answer before moving
    await handleSaveAnswer(answers[questions[currentQuestionIndex]?.questionId] || '');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question completed, navigate to report
      navigate(createPageUrl(`OpenEndedReport?p1=${partner1Assessment.id}&p2=${partner2Assessment.id}`));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await handleSaveAnswer(answers[questions[currentQuestionIndex]?.questionId] || '');
    navigate(createPageUrl(`OpenEndedReport?p1=${partner1Assessment.id}&p2=${partner2Assessment.id}`));
  };

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
          <p className="ml-4 text-lg text-[#2F4F3F]">Loading your reflection questions...</p>
        </div>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="bg-[#2F4F3F] hover:bg-[#1E3E2E] text-white font-sacred"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // This check is important if questions data hasn't loaded yet but isLoading is false
  if (!currentQuestion) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
          <p className="ml-4 text-lg text-[#2F4F3F]">Preparing questions...</p>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] p-6">
        {/* Using global styles for fonts as inline <style jsx> is Next.js specific */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
            .font-sacred {
              font-family: 'Cormorant Garamond', serif;
              font-weight: 300;
              letter-spacing: 0.08em;
            }
            .font-sacred-bold {
              font-family: 'Cormorant Garamond', serif;
              font-weight: 400;
              letter-spacing: 0.08em;
            }
          `}
        </style>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
          <Button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            variant="outline"
            className="border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F]">Sacred Reflections</h1>
            <p className="text-sm text-[#6B5B73] font-sacred">
              {assessment?.partner1_name} & {assessment?.partner2_name}
            </p>
          </div>

          {isCompleted && (
            <Button
              onClick={handleComplete}
              className="bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white font-sacred"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Report
            </Button>
          )}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <OpenEndedQuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.questionId] || ''} // Pass the current user's answer text
            onAnswerChange={handleAnswerChange}
            onSave={handleSaveAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentQuestionIndex === 0}
            isLast={currentQuestionIndex === questions.length - 1}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            isSaving={isSaving}
          />
        )}

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white p-4 rounded-lg border border-[#E6D7C9] text-center shadow-sm">
            <p className="text-sm text-[#6B5B73] font-sacred">
              Progress: {Object.keys(answers).filter(key => answers[key]?.trim()).length} of {questions.length} questions answered
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-[#7A9B8A] h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(Object.keys(answers).filter(key => answers[key]?.trim()).length / questions.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
