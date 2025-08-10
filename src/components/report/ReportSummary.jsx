
import React from 'react';
import { Heart, GitMerge } from 'lucide-react';

export default function ReportSummary({ total, aligned }) {
  const percentage = total > 0 ? Math.round((aligned / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Alignment Score</h2>
        <p className="text-gray-600">This score reflects how many questions you and your partner answered identically. Remember, differences are opportunities for growth, not signs of trouble.</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-[#EAE6E1]"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-[#A8D5BA]"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
            {percentage}%
          </div>
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <Heart className="w-5 h-5 text-green-500 mr-2" />
                <div>
                    <span className="font-bold text-xl">{aligned}</span>
                    <span className="text-gray-600"> Aligned</span>
                </div>
            </div>
            <div className="flex items-center">
                <GitMerge className="w-5 h-5 text-amber-500 mr-2" />
                <div>
                    <span className="font-bold text-xl">{total - aligned}</span>
                    <span className="text-gray-600"> To Discuss</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
