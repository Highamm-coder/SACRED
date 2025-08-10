import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PrivacySection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-[#F8F4EE]/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl md:rounded-3xl soft-shadow gentle-border">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-4 md:mb-6">Designed for Your Privacy</h2>
          <p className="text-lg md:text-xl text-[#6B5B73] font-sacred leading-relaxed mb-4 md:mb-6">Your responses remain completely confidential until both partners complete their assessments. No pressure, no judgment—just thorough preparation.</p>
          <p className="text-lg md:text-xl text-[#6B5B73] font-sacred leading-relaxed mb-6 md:mb-8">Created by relationship experts specifically for Christian couples who want to honor God while preparing comprehensively for intimate marriage.</p>
          <Button onClick={handleGetStarted} size="lg" className="bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
            Start Privately <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}