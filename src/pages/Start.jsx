import React, { useState } from 'react';
import { CoupleAssessment, User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StartPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect directly to onboarding for new users
  React.useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const user = await User.me();
        if (!user) {
          window.location.href = createPageUrl('Login');
          return;
        }
        
        // The primary purpose of this page is to get new users into onboarding
        if (!user.onboarding_completed) {
          navigate(createPageUrl('Onboarding'));
          return;
        }
        
        // If user has completed onboarding, they should be on the dashboard
        // This page is not for creating new assessments anymore
        navigate(createPageUrl('Dashboard'));
        
      } catch (error) {
        console.error("Error in start page:", error);
        // Fallback to login if anything fails
        window.location.href = createPageUrl('Login');
      }
    };
    
    checkAndRedirect();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F5F1EB]">
      <div className="w-8 h-8 border-2 border-[#2F4F3F] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}