
import React, { useState, useEffect } from 'react';
import { ReflectionQuestion, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Heart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function OpenEndedStartPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Load all reflection questions from CMS
        const questionsData = await ReflectionQuestion.list();
        setQuestions(questionsData);

      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#C4756B] mx-auto mb-4" />
            <p className="text-[#2F4F3F] font-sacred">Loading your reflections...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  const userDisplayName = user?.full_name?.split(' ')[0] || 'Friend';

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-8 px-4">
        <style jsx>{`
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
        `}</style>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={createPageUrl('Dashboard')}
              className="flex items-center text-[#6B5B73] hover:text-[#2F4F3F] font-sacred transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-sacred-bold text-[#2F4F3F] mb-4">
              Sacred Reflections
            </h1>
            <p className="text-lg text-[#6B5B73] font-sacred leading-relaxed max-w-2xl mx-auto mb-4">
              Thoughtful questions to guide meaningful conversations about intimacy, 
              expectations, and the sacred nature of your relationship.
            </p>
            {totalQuestions > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#6B5B73] font-sacred">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>
            )}
          </div>

          {totalQuestions === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">No Questions Available</h2>
              <p className="text-[#6B5B73] font-sacred">
                Reflection questions will appear here once they've been added to the system.
              </p>
            </div>
          ) : (
            <>
              {/* Instructions - shown only on first question */}
              {currentQuestionIndex === 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-sacred-bold text-[#2F4F3F] mb-3">How to Use These Reflections</h2>
                  <ul className="space-y-2 text-[#6B5B73] font-sacred">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C4756B] mt-1">•</span>
                      <span>Set aside uninterrupted time together in a comfortable, private space</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C4756B] mt-1">•</span>
                      <span>Take turns reading questions aloud and sharing your thoughts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C4756B] mt-1">•</span>
                      <span>Listen with an open heart - the goal is understanding, not agreement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C4756B] mt-1">•</span>
                      <span>Remember that these conversations are sacred - treat them with reverence</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Current Question Card */}
              {currentQuestion && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-lg border border-[#E6D7C9] p-8 md:p-12 mb-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-[#C4756B] font-sacred-bold text-2xl">{currentQuestionIndex + 1}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-sacred-bold text-[#2F4F3F] mb-6 leading-tight">
                        {currentQuestion.title || currentQuestion.question_text}
                      </h2>
                      {(currentQuestion.content || currentQuestion.description) && (
                        <div className="max-w-2xl mx-auto">
                          <p className="text-lg text-[#6B5B73] font-sacred leading-relaxed">
                            {currentQuestion.content || currentQuestion.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 font-sacred"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-2">
                      {questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-[#C4756B]'
                              : 'bg-[#C4756B]/20 hover:bg-[#C4756B]/40'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-2 font-sacred"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer CTA - only show when there are questions */}
          {totalQuestions > 0 && (
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-[#C4756B]/10 to-[#7A9B8A]/10 rounded-xl p-8">
                <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                  Take Your Time
                </h2>
                <p className="text-[#6B5B73] font-sacred leading-relaxed max-w-2xl mx-auto">
                  These conversations don't need to happen all at once. Consider revisiting these 
                  questions periodically as your relationship grows and deepens. Each conversation 
                  is a step toward greater intimacy and understanding.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
