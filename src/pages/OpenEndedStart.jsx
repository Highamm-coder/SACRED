
import React, { useState, useEffect } from 'react';
import { CoupleAssessment, User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OpenEndedIntroSlides from '../components/openended/OpenEndedIntroSlides';

export default function OpenEndedStartPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkForExistingAssessment = async () => {
      try {
        const user = await User.me();
        if (!user) return;
        
        // Look for existing assessments where this user is either partner
        const asPartner1 = await CoupleAssessment.filter({ partner1_email: user.email });
        const asPartner2 = await CoupleAssessment.filter({ partner2_email: user.email });
        
        const allAssessments = [...asPartner1, ...asPartner2];
        if (allAssessments.length > 0) {
          // Use the most recent assessment
          const latest = allAssessments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
          setExistingAssessment(latest);
        }
      } catch (error) {
        console.error("Error checking for existing assessments:", error);
      }
    };
    
    checkForExistingAssessment();
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (!user) {
        window.location.href = createPageUrl('Login');
        return;
      }
      
      if (existingAssessment) {
        // Check if the compatibility assessment is completed
        if (existingAssessment.status !== 'completed') {
          // Redirect to dashboard with a message or to the assessment
          navigate(createPageUrl('Dashboard'));
          return;
        }
        
        // Use existing assessment
        navigate(createPageUrl(`OpenEndedAssessment?id=${existingAssessment.id}&partner=1`));
      } else {
        // No existing assessment found, redirect to start the compatibility assessment first
        navigate(createPageUrl('Dashboard'));
        return;
      }

    } catch (error) {
      console.error("Error starting reflections:", error);
      setIsLoading(false);
    }
  };

  return <OpenEndedIntroSlides onStart={handleStart} isLoading={isLoading} existingAssessment={existingAssessment} />;
}
