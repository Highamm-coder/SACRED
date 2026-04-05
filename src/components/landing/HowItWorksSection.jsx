import React, { useRef, useEffect, useState } from 'react';
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

function Step({ step, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-8 md:gap-12"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${index * 0.2}s, transform 0.7s ease ${index * 0.2}s`,
      }}
    >
      {/* Number + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full border border-[#C4756B] flex items-center justify-center font-sacred-bold text-[#C4756B] text-sm flex-shrink-0">
          {step.n}
        </div>
        {index < steps.length - 1 && (
          <div
            className="w-px flex-1 mt-3"
            style={{
              background: 'linear-gradient(to bottom, rgba(196,117,107,0.4), rgba(196,117,107,0.05))',
              minHeight: '80px',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 md:pb-16 pt-1">
        <h3 className="text-xl md:text-2xl font-sacred-bold text-white mb-3">{step.title}</h3>
        <p className="text-white/70 font-sacred leading-relaxed text-base md:text-lg max-w-lg">{step.body}</p>
      </div>
    </div>
  );
}

export default function HowItWorksSection({ handleGetStarted }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-14 md:mb-18">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-white mb-5">
            How Sacred Works
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-sacred leading-relaxed max-w-xl">
            Comprehensive without being overwhelming, and completely private until you're both ready to share.
          </p>
        </div>

        <div>
          {steps.map((step, i) => (
            <Step key={step.n} step={step} index={i} />
          ))}
        </div>

        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300 mt-2"
        >
          Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
