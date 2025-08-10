import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function TaglineSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#7A9B8A] to-[#6B8B7A] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center text-white relative z-10">
        <h2 className="text-3xl md:text-4xl font-sacred-medium mb-4 md:mb-6">Sacred = Exclusive, Consensual, Dignifying</h2>
        <p className="text-lg md:text-xl font-sacred leading-relaxed opacity-90 mb-6 md:mb-8">Sacred equips engaged Christian couples with the knowledge and biblical framework to enter marriage sexually confident and prepared.</p>
        <Button onClick={handleGetStarted} size="lg" className="bg-white hover:bg-gray-100 text-[#2F4F3F] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
          Begin Your Sacred Journey <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </section>
  );
}