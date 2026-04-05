import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

function DecorativeArc() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M -100 500 A 900 900 0 0 1 1300 500"
        stroke="white"
        strokeOpacity="0.07"
        strokeWidth="1"
      />
      <path
        d="M -100 600 A 1000 1000 0 0 1 1300 600"
        stroke="white"
        strokeOpacity="0.04"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function WhyUnpreparedSection({ handleGetStarted }) {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <DecorativeArc />
      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-white leading-[1.2] mb-8">
          Why Most Christian Couples Feel Unprepared
        </h2>
        <p className="text-lg md:text-xl text-white/80 font-sacred leading-relaxed mb-6">
          Most Christian couples grew up hearing "don't think about sex" and are now expected to build intimate marriages without practical preparation. The gap between prohibition and expectation leaves couples feeling unprepared for one of marriage's most important aspects.
        </p>
        <p className="text-lg md:text-xl text-white/80 font-sacred leading-relaxed mb-10">
          This feels overwhelming for everyone—<strong className="text-white font-sacred-bold">you're not uniquely behind or unprepared.</strong> Every Christian couple is having this exact same realization right now. Sacred provides the comprehensive preparation and guidance you need.
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
        >
          Get Prepared Together <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
