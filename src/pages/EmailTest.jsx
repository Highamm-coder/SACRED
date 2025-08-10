import React from 'react';
import EmailTester from '../components/dev/EmailTester';

export default function EmailTestPage() {
  // Only show in development
  if (import.meta.env.VITE_APP_ENVIRONMENT !== 'development') {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2F4F3F] mb-4">
            Page Not Found
          </h1>
          <p className="text-[#6B5B73]">
            This page is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] py-8">
      <EmailTester />
    </div>
  );
}