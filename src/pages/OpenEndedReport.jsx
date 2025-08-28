import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { User, Assessment, OpenEndedQuestion, OpenEndedAnswer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Users } from 'lucide-react';
import OpenEndedComparisonCard from '../components/openended/OpenEndedComparisonCard';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function OpenEndedReportPage() {
  const [partner1Assessment, setPartner1Assessment] = useState(null);
  const [partner2Assessment, setPartner2Assessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(location.search);
        const partner1Id = urlParams.get('p1');
        const partner2Id = urlParams.get('p2');
        if (!partner1Id || !partner2Id) {
          setError('Assessment IDs not provided.');
          return;
        }

        const currentUser = await User.me();
        const partner1AssessmentData = await Assessment.get(partner1Id);
        const partner2AssessmentData = await Assessment.get(partner2Id);

        // Security check
        if (currentUser.email !== partner1AssessmentData.user_email || 
            currentUser.email !== partner2AssessmentData.user_email) {
          setError('You are not authorized to view this report.');
          return;
        }
        
        setPartner1Assessment(partner1AssessmentData);
        setPartner2Assessment(partner2AssessmentData);

        const allQuestions = await OpenEndedQuestion.list();
        setQuestions(allQuestions.sort((a, b) => a.order - b.order));

        const partner1Answers = await OpenEndedAnswer.filter({ assessmentId: partner1Id, userEmail: currentUser.email });
        const partner2Answers = await OpenEndedAnswer.filter({ assessmentId: partner2Id, userEmail: currentUser.email });

        const combinedAnswers = {};
        allQuestions.forEach(q => {
          combinedAnswers[q.questionId] = {
            answer1: partner1Answers.find(a => a.questionId === q.questionId),
            answer2: partner2Answers.find(a => a.questionId === q.questionId),
          };
        });
        setAnswers(combinedAnswers);

      } catch (err) {
        console.error("Error loading report data:", err);
        setError("Could not load the report. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F5F1EB]">
        <Loader2 className="w-12 h-12 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F5F1EB] p-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="bg-[#F5F1EB] min-h-screen p-4 sm:p-6 md:p-8">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
          .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
        `}</style>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#7A9B8A]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-sacred-bold text-[#2F4F3F]">Sacred Reflections</h1>
            <p className="text-lg text-[#6B5B73] font-sacred mt-2">
              Your shared responses for {partner1Assessment?.metadata?.partnerName || 'Partner 1'} & {partner2Assessment?.metadata?.partnerName || 'Partner 2'}
            </p>
            <p className="mt-4 text-sm font-sacred text-[#6B5B73] max-w-2xl mx-auto">
              Sit together in a comfortable space. Use these reflections as a starting point for deep, meaningful conversation. Listen to understand, not to rebut.
            </p>
          </div>

          {/* Report Content */}
          <div className="space-y-8">
            {questions.map((question) => (
              <OpenEndedComparisonCard
                key={question.id}
                question={question}
                answer1={answers[question.questionId]?.answer1}
                answer2={answers[question.questionId]?.answer2}
                partner1Name={partner1Assessment?.metadata?.partnerName || 'Partner 1'}
                partner2Name={partner2Assessment?.metadata?.partnerName || 'Partner 2'}
              />
            ))}
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}