import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function OpenEndedComparisonCard({ question, answer1, answer2, partner1Name, partner2Name }) {

  const ResponseDisplay = ({ name, answer }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-[#6B5B73]" />
        <h4 className="font-sacred-bold text-lg text-[#2F4F3F]">{name}'s Reflection</h4>
      </div>
      <div className="prose prose-lg max-w-none text-[#6B5B73] font-sacred bg-[#F5F1EB]/60 border-l-4 border-[#C4756B] p-4 rounded-r-lg whitespace-pre-wrap">
        {answer ? answer.answerText : <span className="italic">No response provided.</span>}
      </div>
    </div>
  );

  return (
    <Card className="bg-white shadow-md border-[#E6D7C9]">
      <CardHeader>
        <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F] text-center leading-relaxed">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <ResponseDisplay name={partner1Name} answer={answer1} />
          <ResponseDisplay name={partner2Name} answer={answer2} />
        </div>
      </CardContent>
    </Card>
  );
}