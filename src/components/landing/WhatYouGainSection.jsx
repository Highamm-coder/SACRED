import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WhatYouGainSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F1EB] to-[#F8F4EE]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-4">What You'll Gain</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border hover:bg-white/90 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Move from Uncertainty to Confidence</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Understand exactly what to expect and how to communicate about sexual intimacy before your wedding night. Sacred focuses on preparation and expectations, not spoiling the intimate discoveries that make your relationship special.</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border hover:bg-white/90 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Prevent Problems Before They Start</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Address potential challenges and mismatched expectations while you're engaged, rather than discovering them after marriage. Most couples wish they'd had these conversations earlier.</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border hover:bg-white/90 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Build Deeper Connection Through Understanding</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Create genuine intimacy by truly knowing each other's thoughts, concerns, and desires. The conversations that feel awkward at first become the foundation for lifelong connection.</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border hover:bg-white/90 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Enter Marriage Sexually Prepared</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Feel confident and equipped rather than anxious and uninformed about this crucial aspect of marriage. Preparation is wisdom, not impurity.</p>
          </div>
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button onClick={handleGetStarted} size="lg" className="bg-[#2F4F3F] hover:bg-[#1e3b2e] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
            Gain These Benefits <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}