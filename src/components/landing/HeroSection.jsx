import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ handleGetStarted }) {
  return (
    <section className="relative bg-gradient-to-b from-white via-white to-[#F5F1EB]/30 min-h-screen flex flex-col pt-16 md:pt-20">
      <div className="flex-1 flex items-center justify-center text-center px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#6B5B73] mb-3 md:mb-4 text-sm md:text-base lg:text-xl font-sacred-bold">For Christian Engaged Couples Who Want to Enter Marriage Sexually Prepared</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-sacred-medium text-[#2F4F3F] leading-tight mb-4 md:mb-6">Sacred Conversations for Sacred Intimacy</h1>
          <p className="text-base md:text-lg lg:text-xl text-[#6B5B73] font-sacred leading-relaxed mb-6 md:mb-8 max-w-3xl mx-auto">
            A comprehensive assessment helping you prepare for sexual intimacy in marriage—the conversations no one taught you to have.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105">
            Begin Assessment <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 px-4 pb-4 md:px-6 md:pb-6">
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg?quality=75&width=640"
          />
          <source
            media="(max-width: 1024px)"
            srcSet="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg?quality=80&width=1024"
          />
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg?quality=80&width=1600"
            alt="Couple holding hands across a table"
            className="rounded-2xl md:rounded-3xl soft-shadow w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </section>
  );
}