import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Does SACRED cover what to expect on our wedding night?',
    a: 'Yes — specifically. The assessment covers physical expectations, pain, arousal, orgasm timelines, and what first-time sex actually looks like in practice. It\'s the preparation most premarital resources skip.',
  },
  {
    q: 'Is it explicit or graphic?',
    a: 'No. The questions are direct and specific — because vague questions lead to vague conversations — but they\'re not pornographic. Think honest and plain, not explicit.',
  },
  {
    q: 'Does this replace premarital counselling?',
    a: 'No. SACRED covers the sexual preparation that most premarital counselling doesn\'t touch. They work well together — most counsellors don\'t go where SACRED goes.',
  },
  {
    q: 'What if we disagree on our results?',
    a: 'That\'s the point. Finding a difference in the assessment is far better than discovering it on your wedding night. Every area of difference comes with a guided discussion prompt to help you work through it.',
  },
  {
    q: 'Is this theologically conservative?',
    a: 'Yes. SACRED was built by a Christian couple for couples who are waiting until marriage. The framework is biblically grounded throughout.',
  },
  {
    q: 'What if one of us has a sexual history and the other doesn\'t?',
    a: 'The assessment addresses this directly. It\'s one of the most important conversations to have before marriage, and one of the most commonly avoided. SACRED creates the structure to have it honestly.',
  },
  {
    q: 'How long does it take?',
    a: 'Most people finish in 20–30 minutes. You each complete it privately, then review your results together.',
  },
];

export default function FaqSection({ handleGetStarted }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-sacred-medium italic text-white mb-4">
            Common Questions
          </h2>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10">
              <button
                className="w-full flex items-start justify-between gap-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-sacred-bold text-white text-base md:text-lg leading-snug">
                  {faq.q}
                </span>
                <span className="flex-shrink-0 mt-0.5 text-white/40">
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: open === i ? '300px' : '0px' }}
              >
                <p className="pb-5 text-white/70 font-sacred text-sm md:text-base leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-[#C4756B] hover:bg-[#B86761] text-white px-8 py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300"
          >
            Begin Assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
