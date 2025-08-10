import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export default function QuestionCard({ question, selectedAnswer, onAnswer }) {
  if (!question) return null;
  
  // Debug logging for question structure
  console.log('🧐 QuestionCard received question:', question);
  console.log('🧐 Question options type:', typeof question.options, 'Value:', question.options);

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="outline" className="text-[#7A9B8A] border-[#7A9B8A]">
            {question.section}
          </Badge>
        </div>
        
        <CardTitle className="text-2xl font-sacred-bold text-[#2F4F3F] leading-tight">
          {question.text}
        </CardTitle>
        
        {question.explainer && (
          <CardDescription className="text-[#6B5B73] font-sacred text-base leading-relaxed mt-3">
            {question.explainer}
          </CardDescription>
        )}
        
        {question.definition && (
          <div className="mt-4 p-4 bg-[#F5F1EB]/50 border border-[#E6D7C9] rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#7A9B8A] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#2F4F3F] font-sacred">
                <strong>Definition:</strong> {question.definition}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {question.options && Array.isArray(question.options) ? question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => {
                console.log('🖱️ Option clicked:', option, 'for question:', question.questionId || question.question_id);
                onAnswer(option);
              }}
              variant="outline"
              className={`w-full text-left justify-start p-4 h-auto font-sacred text-base leading-relaxed transition-all duration-200 ${
                selectedAnswer === option
                  ? 'bg-[#7A9B8A] text-white border-[#7A9B8A] hover:bg-[#6B8B7A] hover:border-[#6B8B7A] shadow-md'
                  : 'bg-white border-[#E6D7C9] text-[#2F4F3F] hover:bg-[#F5F1EB] hover:border-[#C4756B]'
              }`}
            >
              {option}
            </Button>
          )) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-sacred">
                Error loading question options. Please refresh the page.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}