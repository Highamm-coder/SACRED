import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WhatYouExploreSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-white mb-4 md:mb-6">What You'll Explore Together</h2>
          <p className="text-lg md:text-xl text-white/70 font-sacred max-w-3xl mx-auto">These are the topics every couple needs to discuss but most never do until problems arise.</p>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-white mb-4">Sexual Knowledge & Understanding</h3>
            <ul className="space-y-3 text-white/70 font-sacred text-sm md:text-base">
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Physical intimacy expectations and realistic preparation</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Communication during intimate moments</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Understanding pleasure, satisfaction, and realistic timelines</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-white mb-4">Boundaries & Comfort Levels</h3>
            <ul className="space-y-3 text-white/70 font-sacred text-sm md:text-base">
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Physical boundaries and preferences that honor both partners</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Frequency expectations and handling differences in desire</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Navigating the learning curve together</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-white mb-4">Practical Preparation</h3>
            <ul className="space-y-3 text-white/70 font-sacred text-sm md:text-base">
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Addressing potential challenges before they become problems</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Family planning considerations and contraception decisions</span></li>
              <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 bg-[#C4756B] rounded-full mt-2 flex-shrink-0"></div><span>Building long-term intimacy patterns that grow with your marriage</span></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300 w-full md:w-auto">
            Explore These Topics <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
