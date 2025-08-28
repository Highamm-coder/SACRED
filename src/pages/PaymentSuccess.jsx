import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { verifyCheckoutSession } from '@/api/functions';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error, retrying
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const verifyPayment = async (currentSessionId, currentAttempts = 0) => {
    try {
      setStatus('verifying');
      console.log(`[PaymentSuccess] Attempt ${currentAttempts + 1} - Verifying session: ${currentSessionId}`);
      
      // Give the webhook some time to process (up to 15 seconds with exponential backoff)
      const maxAttempts = 15;
      let verified = false;

      while (currentAttempts < maxAttempts && !verified) {
        const result = await verifyCheckoutSession({ sessionId: currentSessionId });
        
        if (result.error) {
          throw new Error(result.error);
        }

        if (result.verified) {
          verified = true;
          setStatus('success');
          console.log('[PaymentSuccess] Payment verified successfully');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 3000);
          break;
        }

        // Exponential backoff: wait longer between each attempt
        const waitTime = Math.min(1000 * Math.pow(1.5, currentAttempts), 3000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        currentAttempts++;
        setAttempts(currentAttempts);
      }

      if (!verified) {
        throw new Error('Payment verification timed out. Your payment may still be processing. Please check your dashboard in a few minutes or contact support if the issue persists.');
      }

    } catch (err) {
      console.error('[PaymentSuccess] Verification error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unknown error occurred during verification.');
    }
  };

  const handleRetry = () => {
    setStatus('retrying');
    setAttempts(0);
    setTimeout(() => {
      verifyPayment(sessionId, 0);
    }, 1000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentSessionId = params.get('session_id');

    if (!currentSessionId) {
      setStatus('error');
      setErrorMessage('No payment session ID found. Please contact support if you have been charged.');
      return;
    }

    setSessionId(currentSessionId);
    verifyPayment(currentSessionId, 0);
  }, [location, navigate]);
  
  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Loader2 className="w-12 h-12 text-[#2F4F3F] animate-spin" />
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mt-6">Verifying your payment...</h1>
            <p className="text-[#6B5B73] font-sacred mt-2">Please wait, this will only take a moment.</p>
            {attempts > 0 && (
              <p className="text-sm text-gray-500 font-sacred mt-2">Attempt {attempts + 1} of 15</p>
            )}
          </>
        );
      case 'retrying':
        return (
          <>
            <RefreshCw className="w-12 h-12 text-[#2F4F3F] animate-spin" />
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mt-6">Retrying verification...</h1>
            <p className="text-[#6B5B73] font-sacred mt-2">Checking your payment status again.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-12 h-12 text-green-600" />
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mt-6">Payment Successful!</h1>
            <p className="text-[#6B5B73] font-sacred mt-2">Thank you for your purchase. You now have full access to SACRED.</p>
            <p className="text-sm text-gray-500 font-sacred mt-4">Redirecting you to the dashboard...</p>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-12 h-12 text-red-600" />
            <h1 className="text-2xl font-sacred-bold text-red-700 mt-6">Payment Verification Issue</h1>
            <p className="text-red-600 font-sacred mt-2 text-center">{errorMessage}</p>
            <div className="mt-6 space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full bg-[#2F4F3F] hover:bg-[#1e3b2e] text-white font-sacred-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate(createPageUrl('Dashboard'))}
                variant="outline"
                className="w-full font-sacred border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white"
              >
                Go to Dashboard
              </Button>
            </div>
            <p className="text-xs text-gray-500 font-sacred mt-4 text-center">
              If the issue persists, contact support with session ID: {sessionId}
            </p>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center p-6">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
        .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
      `}</style>
      <div className="max-w-md w-full mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-[#E6D7C9] p-8 text-center">
        {renderContent()}
      </div>
    </div>
  );
}