import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export default function ThisIsForYouSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F1EB] to-[#F8F4EE]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-2 md:gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-sacred-medium text-[#2F4F3F] mb-6 md:mb-8">This Is For You If:</h2>
          <ul className="space-y-4 md:space-y-6">
            <li className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl gentle-border transition-all duration-300 hover:bg-white/80">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#7A9B8A] mt-1 flex-shrink-0" />
              <span className="text-base md:text-lg text-[#6B5B73] font-sacred">You're a Christian engaged couple committed to honoring God in your sexual relationship</span>
            </li>
            <li className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl gentle-border transition-all duration-300 hover:bg-white/80">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#7A9B8A] mt-1 flex-shrink-0" />
              <span className="text-base md:text-lg text-[#6B5B73] font-sacred">You grew up hearing "don't think about sex" and now feel behind or unprepared</span>
            </li>
            <li className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl gentle-border transition-all duration-300 hover:bg-white/80">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#7A9B8A] mt-1 flex-shrink-0" />
              <span className="text-base md:text-lg text-[#6B5B73] font-sacred">You feel unprepared for the intimate side of marriage despite being ready to commit</span>
            </li>
            <li className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl gentle-border transition-all duration-300 hover:bg-white/80">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#7A9B8A] mt-1 flex-shrink-0" />
              <span className="text-base md:text-lg text-[#6B5B73] font-sacred">You want honest conversations about sexuality but don't know how to start them</span>
            </li>
            <li className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl gentle-border transition-all duration-300 hover:bg-white/80">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#7A9B8A] mt-1 flex-shrink-0" />
              <span className="text-base md:text-lg text-[#6B5B73] font-sacred">You believe thoughtful preparation honors both God and your future spouse</span>
            </li>
          </ul>
          <div className="mt-6 md:mt-8">
            <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
              Yes, This Is Us <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
        <div className="order-1 md:order-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c994f4bda_Screenshot2025-07-20at101100PM.png?quality=80&width=800" alt="Couple in a loving embrace" className="rounded-2xl md:rounded-3xl soft-shadow w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}