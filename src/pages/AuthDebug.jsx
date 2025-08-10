import React from 'react';
import AuthDebug from '@/components/auth/AuthDebug';

export default function AuthDebugPage() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2F4F3F] mb-8 text-center">Authentication Debug</h1>
        <AuthDebug />
      </div>
    </div>
  );
}