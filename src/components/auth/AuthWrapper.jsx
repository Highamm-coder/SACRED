import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import AuthError from './AuthError';

export default function AuthWrapper({ children, requireAuth = false }) {
  const [authState, setAuthState] = useState('checking');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthState('checking');
        const currentUser = await User.me();
        setUser(currentUser);
        setAuthState('authenticated');
      } catch (error) {
        console.error('Auth check error:', error);
        setError(error.message);
        
        if (requireAuth) {
          setAuthState('unauthenticated');
        } else {
          setAuthState('public');
        }
      }
    };

    checkAuth();
  }, [requireAuth]);

  const handleRetry = () => {
    setError(null);
    setAuthState('checking');
    // Trigger re-check
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F] mx-auto mb-4" />
          <p className="text-[#6B5B73] font-sacred">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated' && requireAuth) {
    return <AuthError error={error} onRetry={handleRetry} />;
  }

  return children;
}