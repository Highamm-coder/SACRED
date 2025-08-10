import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageCircle } from 'lucide-react';

export default function ComparisonCard({ question, answer1, answer2, partner1Name, partner2Name }) {
  const getOptionStyle = (answer, otherAnswer, isAligned) => {
    let baseStyle = "p-3 rounded-lg text-sm font-sacred transition-colors";
    if (!isAligned) {
      return `${baseStyle} bg-amber-100 text-amber-900 border border-amber-200`;
    }
    if (answer === otherAnswer) {
      return `${baseStyle} bg-green-100 text-green-900 border border-green-200`;
    }
    return `${baseStyle} bg-gray-100 text-gray-800`;
  };

  const hasDisagreement = answer1?.answer !== answer2?.answer;
  const bothAnswered = answer1 && answer2;
  const isAligned = !hasDisagreement;

  return (
    <Card className={`transition-all duration-300 ${hasDisagreement && bothAnswered ? 'bg-amber-50/50 border-amber-200' : 'bg-white'}`}>
      <CardHeader>
        <Badge variant="outline" className="w-fit mb-2 font-sacred">{question.section}</Badge>
        <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F]">{question.text}</CardTitle>
        {question.explainer && (
          <CardDescription className="font-sacred text-base text-[#6B5B73] pt-2">{question.explainer}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-sacred-bold text-[#2F4F3F]">{partner1Name}'s Answer</h4>
            {answer1 ? (
              <div className={getOptionStyle(answer1?.answer, answer2?.answer, isAligned)}>
                {answer1?.answer}
              </div>
            ) : (
              <div className="p-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-sacred">Not yet answered</div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-sacred-bold text-[#2F4F3F]">{partner2Name}'s Answer</h4>
            {answer2 ? (
              <div className={getOptionStyle(answer2?.answer, answer1?.answer, isAligned)}>
                {answer2?.answer}
              </div>
            ) : (
              <div className="p-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-sacred">Not yet answered</div>
            )}
          </div>
        </div>

        {hasDisagreement && bothAnswered && question.discussionPrompt && (
          <div className="mt-6 border-t border-amber-200 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-sacred-bold text-[#2F4F3F]">For Discussion</h3>
            </div>
            <p className="font-sacred text-lg text-[#6B5B73]">
              {question.discussionPrompt.question_text}
            </p>
            {question.discussionPrompt.tip_text && (
                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                    <p className="font-sacred text-base text-amber-800">
                        <strong>Tip:</strong> {question.discussionPrompt.tip_text}
                    </p>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}