import React, { useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight, Check } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';

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

  const handleGetStarted = () => {
    window.location.href = createPageUrl('Login');
  };

  const handleSignIn = () => {
    window.location.href = createPageUrl('Login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#F8F4EE] to-[#F2EDE7]">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        .font-sacred {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        .font-sacred-bold {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          letter-spacing: 0.08em;
        }
        .font-sacred-medium {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0.08em;
        }
        .soft-shadow {
          box-shadow: 0 10px 40px -10px rgba(47, 79, 63, 0.1);
        }
        .gentle-border {
          border: 1px solid rgba(230, 215, 201, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-20 py-4 px-4 md:py-6 md:px-10">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl md:text-4xl font-sacred tracking-widest text-[#2F4F3F]">
            SACRED
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex gap-2 md:gap-3">
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="border-[#2F4F3F]/20 text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred-bold rounded-full px-3 md:px-6 text-sm md:text-base transition-all duration-300">
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-3 md:px-6 text-sm md:text-base soft-shadow transition-all duration-300 hover:scale-105">
                Begin Assessment
              </Button>
            </div>
          </div>
        </nav>
      </header>
      
      <main>
        <HeroSection handleGetStarted={handleGetStarted} />
        
        <Suspense fallback={<SectionLoader />}>
          <HowItWorksSection handleGetStarted={handleGetStarted} />
          <ThisIsForYouSection handleGetStarted={handleGetStarted} />
          <WhyUnpreparedSection handleGetStarted={handleGetStarted} />
          <WhatYouGainSection handleGetStarted={handleGetStarted} />
          <WhatYouExploreSection handleGetStarted={handleGetStarted} />
          <PrivacySection handleGetStarted={handleGetStarted} />
          <TaglineSection handleGetStarted={handleGetStarted} />
          <TestimonialsSection handleGetStarted={handleGetStarted} />
          <InvestmentSection handleGetStarted={handleGetStarted} />
          <FinalCtaSection handleGetStarted={handleGetStarted} />
        </Suspense>
      </main>
    </div>
  );
}