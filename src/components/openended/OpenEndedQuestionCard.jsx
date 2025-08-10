import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Heart, Loader2 } from 'lucide-react';

export default function OpenEndedQuestionCard({
  question,
  answer,
  onAnswerChange,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  currentIndex,
  totalQuestions,
  isSaving
}) {
  const [localAnswer, setLocalAnswer] = React.useState(answer || '');

  // Update local answer when answer prop changes
  React.useEffect(() => {
    setLocalAnswer(answer || '');
  }, [answer]);

  const handleSave = () => {
    onAnswerChange(localAnswer);
    onSave(localAnswer);
  };

  const handleNext = () => {
    if (localAnswer !== answer) {
      onAnswerChange(localAnswer);
      onSave(localAnswer);
    }
    onNext();
  };

  const handlePrevious = () => {
    if (localAnswer !== answer) {
      onAnswerChange(localAnswer);
      onSave(localAnswer);
    }
    onPrevious();
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-[#E6D7C9]">
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

      <CardHeader className="text-center pb-6">
        <div className="w-12 h-12 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-[#7A9B8A]" />
        </div>
        <Badge variant="outline" className="mb-4 font-sacred border-[#7A9B8A] text-[#7A9B8A]">
          Question {currentIndex + 1} of {totalQuestions} • {question.section}
        </Badge>
        <CardTitle className="text-2xl font-sacred-bold text-[#2F4F3F] leading-relaxed">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-[#F5F1EB]/50 p-4 rounded-lg">
          <p className="text-sm text-[#6B5B73] font-sacred text-center">
            Take your time to reflect deeply. This is your private space to explore your thoughts and feelings.
          </p>
        </div>
        
        <div className="space-y-2">
          <Textarea
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Share your thoughts and reflections..."
            className="min-h-[200px] text-base border-[#E6D7C9] focus:border-[#7A9B8A] font-sacred resize-none"
          />
          <p className="text-xs text-[#6B5B73] text-right font-sacred">
            {localAnswer.length} characters
          </p>
        </div>

        {/* Auto-save indicator */}
        {localAnswer !== answer && (
          <div className="text-center">
            <p className="text-sm text-amber-600 font-sacred">
              Changes not saved yet
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-[#E6D7C9]">
          <Button
            onClick={handlePrevious}
            disabled={isFirst}
            variant="outline"
            className="border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || localAnswer === answer}
              variant="outline"
              className="border-[#7A9B8A] text-[#7A9B8A] hover:bg-[#7A9B8A] hover:text-white font-sacred"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLast && localAnswer === ''}
              className="bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white font-sacred"
            >
              {isLast ? 'Complete' : 'Next'}
              {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}