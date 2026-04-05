import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const gains = [
  {
    title: 'Move from Uncertainty to Confidence',
    body: 'Understand exactly what to expect and how to communicate about sexual intimacy before your wedding night. Sacred focuses on preparation and expectations, not spoiling the intimate discoveries that make your relationship special.',
  },
  {
    title: 'Prevent Problems Before They Start',
    body: 'Address potential challenges and mismatched expectations while you\'re engaged, rather than discovering them after marriage. Most couples wish they\'d had these conversations earlier.',
  },
  {
    title: 'Build Deeper Connection Through Understanding',
    body: 'Create genuine intimacy by truly knowing each other\'s thoughts, concerns, and desires. The conversations that feel awkward at first become the foundation for lifelong connection.',
  },
  {
    title: 'Enter Marriage Sexually Prepared',
    body: 'Feel confident and equipped rather than anxious and uninformed about this crucial aspect of marriage. Preparation is wisdom, not impurity.',
  },
];

export default function WhatYouGainSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-white mb-4">What You'll Gain</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-10">
          {gains.map((g) => (
            <div key={g.title}>
              <h3 className="text-lg md:text-xl font-sacred-bold text-white mb-3">{g.title}</h3>
              <p className="text-white/70 font-sacred leading-relaxed text-sm md:text-base">{g.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300 w-full md:w-auto">
            Gain These Benefits <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
