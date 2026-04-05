import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight, Check } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import ConvergingLines from '../components/landing/ConvergingLines';

const HowItWorksSection = lazy(() => import('../components/landing/HowItWorksSection'));
const ThisIsForYouSection = lazy(() => import('../components/landing/ThisIsForYouSection'));
const WhyUnpreparedSection = lazy(() => import('../components/landing/WhyUnpreparedSection'));
const WhatYouGainSection = lazy(() => import('../components/landing/WhatYouGainSection'));
const WhatYouExploreSection = lazy(() => import('../components/landing/WhatYouExploreSection'));
const PrivacySection = lazy(() => import('../components/landing/PrivacySection'));
const TaglineSection = lazy(() => import('../components/landing/TaglineSection'));
const TestimonialsSection = lazy(() => import('../components/landing/TestimonialsSection'));
const InvestmentSection = lazy(() => import('../components/landing/InvestmentSection'));
const FinalCtaSection = lazy(() => import('../components/landing/FinalCtaSection'));
const FaqSection = lazy(() => import('../components/landing/FaqSection'));

const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center" />
);

export default function LandingPage() {
  useEffect(() => {
    document.title = "SACRED | Sexual Intimacy Assessment for Christian Couples";

    const setMetaTag = (attr, value, content) => {
      let element = document.querySelector(`meta[${attr}='${value}']`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const title = "SACRED | Sexual Intimacy Assessment for Christian Couples";
    const description = "A comprehensive assessment helping Christian engaged couples prepare for sexual intimacy in marriage. Have the conversations no one taught you to have.";
    const imageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg";
    const pageUrl = window.location.href;

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', 'christian couples, sexual intimacy, marriage preparation, engagement, christian sexuality, sacred, relationship assessment');
    setMetaTag('name', 'author', 'SACRED');
    setMetaTag('name', 'robots', 'index, follow');
    
    // Application Info
    setMetaTag('name', 'application-name', 'SACRED');
    setMetaTag('name', 'apple-mobile-web-app-title', 'SACRED');
    setMetaTag('name', 'theme-color', '#2F4F3F');
    
    // Open Graph / Facebook
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', imageUrl);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:site_name', 'SACRED');

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:url', pageUrl);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);
    setMetaTag('name', 'twitter:site', '@sacred');
    setMetaTag('name', 'twitter:creator', '@sacred');

  }, []);

  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) {
        const scrolled = window.scrollY > window.innerHeight * 0.7;
        headerRef.current.classList.toggle('nav-scrolled', scrolled);
        headerRef.current.classList.toggle('nav-at-top', !scrolled);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleGetStarted = () => {
    window.location.href = createPageUrl('Signup');
  };

  const handleSignIn = () => {
    window.location.href = createPageUrl('Login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#141E16' }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-sacred {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0;
        }
        .font-sacred-bold {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          letter-spacing: 0;
        }
        .font-sacred-medium {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0;
        }
        .soft-shadow {
          box-shadow: 0 10px 40px -10px rgba(47, 79, 63, 0.1);
        }
        .gentle-border {
          border: 1px solid rgba(230, 215, 201, 0.3);
        }
        .nav-at-top {
          background: transparent;
          box-shadow: none;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-at-top .nav-logo { color: rgba(255,255,255,0.9); }
        .nav-at-top .nav-link { color: rgba(255,255,255,0.75); }
        .nav-at-top .nav-link:hover { color: rgba(255,255,255,1); }

        .nav-scrolled {
          background: rgba(245,241,235,0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 1px 12px rgba(0,0,0,0.08);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-scrolled .nav-logo { color: #2F4F3F; }
        .nav-scrolled .nav-link { color: #2F4F3F; opacity: 0.75; }
        .nav-scrolled .nav-link:hover { opacity: 1; color: #C4756B; }
      `}</style>

      {/* Sticky nav — appears after scrolling past hero */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-20 py-4 px-6 md:px-10 nav-at-top"
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="nav-logo text-2xl font-sacred tracking-widest transition-colors duration-300">SACRED</div>
          <div className="flex items-center gap-6">
            <a
              href="/blog"
              className="nav-link font-sacred text-sm transition-colors duration-300"
            >
              Blog
            </a>
            <button
              onClick={handleSignIn}
              className="nav-link font-sacred text-sm transition-colors duration-300"
            >
              Sign in
            </button>
            <Button
              onClick={handleGetStarted}
              className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-6 text-sm transition-all duration-300"
            >
              Begin Assessment
            </Button>
          </div>
        </nav>
      </header>
      
      <main>
        <HeroSection handleGetStarted={handleGetStarted} handleSignIn={handleSignIn} />

        {/* Dark mode — continuous dark background below hero */}
        <div style={{ background: '#141E16' }}>
          {/* Two lives beginning their journey — converge after the hero */}
          <ConvergingLines className="mt-2" />

          <Suspense fallback={<SectionLoader />}>
            <WhyUnpreparedSection handleGetStarted={handleGetStarted} />

            {/* Light break #1 */}
            <div style={{ background: '#F5F1EB' }}>
              <ThisIsForYouSection handleGetStarted={handleGetStarted} />
            </div>

            <HowItWorksSection handleGetStarted={handleGetStarted} />
            <WhatYouGainSection handleGetStarted={handleGetStarted} />
            <WhatYouExploreSection handleGetStarted={handleGetStarted} />

            {/* Dark lines before light break #2 */}
            <ConvergingLines opacity={0.3} />

            {/* Light break #2 */}
            <div style={{ background: '#F5F1EB' }}>
              <ConvergingLines color="#2F4F3F" opacity={0.18} />
              <TestimonialsSection handleGetStarted={handleGetStarted} />
            </div>

            <PrivacySection handleGetStarted={handleGetStarted} />
            <FaqSection handleGetStarted={handleGetStarted} />

            {/* Lines meet before the core statement */}
            <ConvergingLines opacity={0.3} />
            <TaglineSection handleGetStarted={handleGetStarted} />

            {/* Light break #3 */}
            <div style={{ background: '#F5F1EB' }}>
              <InvestmentSection handleGetStarted={handleGetStarted} />
            </div>
          </Suspense>
        </div>

        <FinalCtaSection handleGetStarted={handleGetStarted} />
      </main>
    </div>
  );
}