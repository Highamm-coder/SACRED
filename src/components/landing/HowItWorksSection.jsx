import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    n: '1',
    title: 'Individual Assessment',
    body: 'Each partner completes a thorough evaluation privately. This ensures honest responses about expectations, concerns, and desires without pressure or judgment.',
  },
  {
    n: '2',
    title: 'Personalized Comparison',
    body: 'Receive a detailed analysis highlighting where you align and where you need discussion. Most couples are surprised by both their similarities and differences.',
  },
  {
    n: '3',
    title: 'Guided Conversations',
    body: 'Use your results as a roadmap for meaningful conversations about your future intimate relationship. No more awkward silences or not knowing where to start.',
  },
];

export default function HowItWorksSection({ handleGetStarted }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-white mb-5">
            How Sacred Works
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-sacred max-w-2xl mx-auto leading-relaxed">
            The assessment covers everything you need to discuss but probably don't know how to bring up. Comprehensive without being overwhelming, and completely private until you're both ready to share.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12 text-center">
          {steps.map((step) => (
            <div key={step.n}>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#C4756B] text-white rounded-full flex items-center justify-center font-sacred-bold text-lg md:text-xl mx-auto mb-5">
                {step.n}
              </div>
              <h3 className="text-lg md:text-xl font-sacred-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/70 font-sacred leading-relaxed text-sm md:text-base">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 md:mt-14">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
          >
            Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
