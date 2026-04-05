import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const IMG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg";

export default function FinalCtaSection({ handleGetStarted }) {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ backgroundImage: `url(${IMG_URL}?quality=80&width=1600)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#2F4F3F]/65" />
      <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-sacred-medium italic text-white leading-[1.15] mb-6">
          Ready to Begin?
        </h2>
        <p className="text-lg md:text-xl text-white/80 font-sacred mb-10 leading-relaxed max-w-2xl mx-auto">
          Join hundreds of couples who chose comprehensive preparation over hoping for the best. Sexual intimacy is too important to leave to chance.
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
        >
          Begin Your Sacred Assessment <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
