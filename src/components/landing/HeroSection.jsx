import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const IMG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg";

export default function HeroSection({ handleGetStarted, handleSignIn }) {
  return (
    <section
      className="relative min-h-screen"
      style={{ background: '#141E16' }}
    >

      {/* ── Full-width photo ── */}
      <div className="relative w-full h-screen overflow-hidden">
        <picture>
          <source media="(max-width: 640px)" srcSet={`${IMG_URL}?quality=75&width=640`} />
          <source media="(max-width: 1024px)" srcSet={`${IMG_URL}?quality=80&width=1024`} />
          <img
            src={`${IMG_URL}?quality=80&width=1600`}
            alt="Couple"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </picture>

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Bottom-left content */}
        <div className="absolute bottom-8 left-8 md:left-10 right-8 md:right-10 z-10 max-w-[420px]">
          <h2
            className="text-white font-sacred-medium italic leading-[1.1] mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)' }}
          >
            Sexual Preparation for Christian Engaged Couples
          </h2>
          <p className="text-white/80 font-sacred text-sm md:text-base leading-relaxed mb-5">
            A comprehensive assessment for Christian engaged couples. Covering everything about sexual intimacy that no one taught you to talk about.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-7 py-3 text-base transition-all duration-300"
          >
            Begin Assessment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

    </section>
  );
}
