import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function TaglineSection({ handleGetStarted }) {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-white leading-[1.2] mb-6">
          Sacred = Exclusive, Consensual, Dignifying
        </h2>
        <p className="text-lg md:text-xl font-sacred leading-relaxed text-white/70 mb-10">
          Sacred equips engaged Christian couples with the knowledge and biblical framework to enter marriage sexually confident and prepared.
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
        >
          Begin Your Sacred Journey <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
