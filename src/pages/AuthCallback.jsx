import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureUserProfile } from '@/api/supabaseClient';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your account…');
  const handled = useRef(false); // prevent double-redirect

  const redirect = async (session) => {
    if (handled.current) return;
    handled.current = true;

    try {
      setMessage('Setting up your account…');
      const profile = await ensureUserProfile(session.user);
      if (profile?.has_paid) {
        navigate(createPageUrl('Dashboard'), { replace: true });
      } else {
        navigate(createPageUrl('PaymentRequired'), { replace: true });
      }
    } catch (err) {
      console.error('AuthCallback: profile setup failed', err);
      navigate(createPageUrl('PaymentRequired'), { replace: true });
    }
  };

  useEffect(() => {
    // 1. Check if the session is already available (Supabase may have processed
    //    the URL hash before this component mounted)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirect(session);
      }
    });

    // 2. Also listen for SIGNED_IN, which fires when detectSessionInUrl
    //    finishes exchanging the token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        redirect(session);
      }
    });

    // 3. Safety net: if nothing happens in 8 seconds, send them to login
    const timeout = setTimeout(() => {
      if (!handled.current) {
        navigate(createPageUrl('Login'), { replace: true });
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F1EB]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.05em; }
      `}</style>
      <p className="text-3xl font-sacred text-[#2F4F3F] tracking-widest mb-8">SACRED</p>
      <Loader2 className="w-8 h-8 animate-spin text-[#C4756B] mb-4" />
      <p className="font-sacred text-[#6B5B73] text-lg">{message}</p>
    </div>
  );
}
