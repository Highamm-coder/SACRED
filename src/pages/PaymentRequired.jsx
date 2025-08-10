import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Star, ArrowLeft } from 'lucide-react';
import { createStripeCheckoutSession } from '@/api/functions';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function PaymentRequiredPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.has_paid) {
          navigate(createPageUrl('Dashboard'));
        }
      } catch (err) {
        // User not logged in, AuthWrapper will handle it
      }
    };
    checkUser();
  }, [navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const { data } = await createStripeCheckoutSession({ appUrl: window.location.origin });
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not create a payment session.');
      }
    } catch (err) {
      console.error('[PaymentRequired.js] Payment error:', err);
      if (err.response && err.response.data) {
        console.error('[PaymentRequired.js] Server response:', err.response.data);
        setError(`Error: ${err.response.data.error || 'Could not initiate payment.'}`);
      } else {
        setError('Could not initiate payment. Please try again or contact support.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-[#F5F1EB] flex flex-col items-center justify-center p-4">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
          .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
          .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0.08em; }
        `}</style>

        <div className="w-full max-w-4xl absolute top-0 left-0 p-4 sm:p-6 md:p-8 flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))} className="font-sacred text-[#6B5B73] hover:bg-black/5">
                <ArrowLeft className="w-4 h-4 mr-2"/>
                Back to Dashboard
            </Button>
            <div className="text-2xl font-sacred tracking-widest text-[#2F4F3F]">
                SACRED
            </div>
        </div>

        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
            {/* Left Content Column */}
            <div className="p-8 md:p-12 flex flex-col">
                <div>
                    <h1 className="text-3xl font-sacred-medium text-[#2F4F3F] mb-3">
                        Unlock Full Access
                    </h1>
                    <p className="text-base text-[#6B5B73] font-sacred leading-relaxed mb-8">
                        This one-time payment gives you and your partner lifetime access to all assessments and resources.
                    </p>

                    <div className="bg-[#F5F1EB]/80 p-6 rounded-xl border border-[#E6D7C9] mb-8">
                        <h3 className="font-sacred-bold text-[#2F4F3F] mb-4">What's included:</h3>
                        <ul className="space-y-3 text-[#6B5B73] font-sacred">
                            <li className="flex items-start"><Star className="w-4 h-4 text-[#C4756B] mr-3 mt-1 flex-shrink-0" /><div><strong>Expectations Alignment</strong> assessment</div></li>
                            <li className="flex items-start"><Star className="w-4 h-4 text-[#C4756B] mr-3 mt-1 flex-shrink-0" /><div><strong>Sacred Reflections</strong> module</div></li>
                            <li className="flex items-start"><Star className="w-4 h-4 text-[#C4756B] mr-3 mt-1 flex-shrink-0" /><div>Full access to the <strong>Education Center</strong></div></li>
                            <li className="flex items-start"><Star className="w-4 h-4 text-[#C4756B] mr-3 mt-1 flex-shrink-0" /><div><strong>Lifetime access</strong> for you and your partner</div></li>
                        </ul>
                    </div>

                    <div className="flex justify-between items-center border-t border-b border-[#E6D7C9] py-4 mb-8">
                        <span className="font-sacred-bold text-lg text-[#2F4F3F]">Total</span>
                        <span className="font-sacred-bold text-2xl text-[#2F4F3F]">$47</span>
                    </div>
                </div>

                <div className="mt-auto">
                    {error && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-center">
                        <p className="text-red-700 font-sacred text-sm">{error}</p>
                      </div>
                    )}
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      size="lg"
                      className="w-full bg-[#2F4F3F] hover:bg-[#1e3b2e] text-white py-4 text-base font-sacred-bold"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Upgrade and Pay
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 font-sacred mt-3">
                        By confirming, you agree to the <a href="/Terms" className="underline hover:text-[#C4756B]">Terms & Conditions</a>.
                    </p>
                </div>
            </div>
            
            {/* Right Image Column */}
            <div className="hidden md:block">
                <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c994f4bda_Screenshot2025-07-20at101100PM.png"
                    alt="An intimate moment between a couple"
                    className="w-full h-full object-cover object-center"
                />
            </div>
        </div>
        
        <div className="w-full max-w-4xl text-center p-4 mt-4">
            <a href="mailto:support@base44.co" className="text-sm font-sacred text-gray-500 hover:underline">Need help? Contact Support</a>
        </div>
      </div>
    </AuthWrapper>
  );
}