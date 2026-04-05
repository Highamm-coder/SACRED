import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const testimonials = [
  {
    quote: '"For the first time, we could talk about intimacy without it being awkward. Sacred gave us the framework to discuss everything openly and biblically. We actually felt prepared."',
    attribution: '— Sarah & David, married 1 year',
  },
  {
    quote: '"We thought we\'d talked about everything, but Sacred showed us how many assumptions we were making. The conversations were eye-opening and brought us so much closer."',
    attribution: '— Jennifer & Michael, engaged',
  },
  {
    quote: '"I wish every Christian couple had access to this. It\'s what we all need but no one teaches us."',
    attribution: '— Pastor James, recommending to his engaged couples',
  },
];

export default function TestimonialsSection({ handleGetStarted }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-[#2F4F3F]">
            What Couples Are Saying
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {testimonials.map((t) => (
            <div key={t.attribution}>
              <p className="text-base md:text-lg text-[#6B5B73] font-sacred mb-4 leading-relaxed italic">{t.quote}</p>
              <p className="font-sacred-bold text-[#2F4F3F]/60 text-sm">{t.attribution}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 md:mt-14">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
          >
            Join These Couples <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
