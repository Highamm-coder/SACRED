import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { verifyCheckoutSession } from '@/api/functions';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No payment session ID found. Please contact support if you have been charged.');
        return;
      }

      try {
        const { data, error } = await verifyCheckoutSession({ sessionId });
        
        if (error || !data.success) {
          throw new Error(data?.error || 'Verification failed. Please do not attempt to pay again and contact support.');
        }

        setStatus('success');
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 3000); // Redirect to dashboard after 3 seconds

      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'An unknown error occurred during verification.');
      }
    };

    verifyPayment();
  }, [location, navigate]);
  
  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Loader2 className="w-12 h-12 text-[#2F4F3F] animate-spin" />
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mt-6">Verifying your payment...</h1>
            <p className="text-[#6B5B73] font-sacred mt-2">Please wait, this will only take a moment.</p>
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
            <h1 className="text-2xl font-sacred-bold text-red-700 mt-6">Payment Verification Failed</h1>
            <p className="text-red-600 font-sacred mt-2">{errorMessage}</p>
            <p className="text-sm text-gray-500 font-sacred mt-4">Please contact support for assistance.</p>
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