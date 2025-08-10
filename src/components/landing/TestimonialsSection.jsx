import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function TestimonialsSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F1EB] to-[#F8F4EE]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-4">What Couples Are Saying</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border text-center hover:bg-white transition-all duration-300 hover:scale-105">
            <p className="text-base md:text-lg text-[#6B5B73] font-sacred mb-4 md:mb-6 leading-relaxed italic">"For the first time, we could talk about intimacy without it being awkward. Sacred gave us the framework to discuss everything openly and biblically. We actually felt prepared."</p>
            <p className="font-sacred-bold text-[#2F4F3F] text-sm md:text-base">— Sarah & David, married 1 year</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border text-center hover:bg-white transition-all duration-300 hover:scale-105">
            <p className="text-base md:text-lg text-[#6B5B73] font-sacred mb-4 md:mb-6 leading-relaxed italic">"We thought we'd talked about everything, but Sacred showed us how many assumptions we were making. The conversations were eye-opening and brought us so much closer."</p>
            <p className="font-sacred-bold text-[#2F4F3F] text-sm md:text-base">— Jennifer & Michael, engaged</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border text-center hover:bg-white transition-all duration-300 hover:scale-105">
            <p className="text-base md:text-lg text-[#6B5B73] font-sacred mb-4 md:mb-6 leading-relaxed italic">"I wish every Christian couple had access to this. It's what we all need but no one teaches us."</p>
            <p className="font-sacred-bold text-[#2F4F3F] text-sm md:text-base">— Pastor James, recommending to his engaged couples</p>
          </div>
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
            Join These Couples <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}