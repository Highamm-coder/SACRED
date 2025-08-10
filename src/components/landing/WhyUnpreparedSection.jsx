import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WhyUnpreparedSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-[#F8F4EE]/30">
      <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-6 md:mb-8">Why Most Christian Couples Feel Unprepared</h2>
        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border">
          <p className="text-lg md:text-xl text-[#6B5B73] font-sacred leading-relaxed mb-4 md:mb-6">
            Most Christian couples grew up hearing "don't think about sex" and are now expected to build intimate marriages without practical preparation. The gap between prohibition and expectation leaves couples feeling unprepared for one of marriage's most important aspects.
          </p>
          <p className="text-lg md:text-xl text-[#6B5B73] font-sacred leading-relaxed mb-6 md:mb-8">
            This feels overwhelming for everyone—<strong className="font-sacred-bold">you're not uniquely behind or unprepared.</strong> Every Christian couple is having this exact same realization right now. Sacred provides the comprehensive preparation and guidance you need.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
            Get Prepared Together <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}