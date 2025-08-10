
import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm text-gray-600">
        <span>Progress</span>
        <span>Question {current} of {total}</span>
      </div>
      <div className="w-full bg-[#EAE6E1] rounded-full h-2.5">
        <div
          className="bg-[#7D9D9C] h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
