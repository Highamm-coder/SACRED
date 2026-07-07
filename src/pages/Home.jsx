import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';

export default function HomePage() {
  const navigate = useNavigate();
  const [devNotice, setDevNotice] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // Check if environment variables are set
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.warn('Supabase environment variables not set, redirecting to landing page');
          window.location.href = '/';
          return;
        }

        const user = await User.me();
        // User is logged in, check payment status
        if (user.has_paid) {
          navigate(createPageUrl('Dashboard'));
        } else {
          navigate(createPageUrl('PaymentRequired'));
        }
      } catch (e) {
        console.error('Auth check error:', e);
        // User not logged in or auth error → the landing page.
        // In production '/' is the static server-rendered landing (api/landing.js).
        // In dev, the serverless function doesn't run under Vite, so there's no
        // landing to show here — send them to the blog (a real SPA route) and
        // note that the landing is previewable via `vercel dev`.
        if (import.meta.env.DEV) {
          setDevNotice(true);
        } else {
          window.location.href = '/';
        }
      }
    };

    checkAndRedirect();
  }, [navigate]);

  if (devNotice) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <p className="text-3xl font-serif text-[#2F4F3F] mb-3 tracking-widest">SACRED</p>
          <p className="text-[#6B5B73] mb-6">
            The landing page is server-rendered (<code>api/landing.js</code>) and doesn&rsquo;t run under
            the Vite dev server. Preview it with <code>vercel dev</code>, or jump into the app:
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/blog" className="px-5 py-2 rounded-full bg-[#2F4F3F] text-[#F5F1EB]">Blog</a>
            <a href="/guides" className="px-5 py-2 rounded-full bg-[#C4756B] text-white">Free Guides</a>
            <a href="/login" className="px-5 py-2 rounded-full border border-[#2F4F3F] text-[#2F4F3F]">Sign in</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2F4F3F] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}