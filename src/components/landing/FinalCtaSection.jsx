import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function FinalCtaSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#2F4F3F] via-[#2F4F3F] to-[#1e3b2e] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="max-w-4xl mx-auto text-center px-4 md:px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-sacred-medium mb-4 md:mb-6">Ready to Begin?</h2>
        <p className="text-lg md:text-xl text-[#E6D7C9] font-sacred mb-6 md:mb-8 leading-relaxed">
          Join hundreds of couples who chose comprehensive preparation over hoping for the best. Sexual intimacy is too important to leave to chance.
        </p>
        <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-110 w-full md:w-auto">
          Begin Your Sacred Assessment <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </section>
  );
}