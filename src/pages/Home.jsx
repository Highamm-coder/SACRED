import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const user = await User.me();
        // User is logged in, check payment status
        if (user.has_paid) {
          navigate(createPageUrl('Dashboard'));
        } else {
          navigate(createPageUrl('PaymentRequired'));
        }
      } catch (e) {
        console.error('Auth check error:', e);
        // User not logged in or auth error, show landing page
        navigate(createPageUrl('Landing'));
      }
    };
    
    checkAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
      `}</style>
      <div className="w-8 h-8 border-2 border-[#2F4F3F] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}