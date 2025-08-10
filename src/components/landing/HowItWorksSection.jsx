import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HowItWorksSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-[#F5F1EB] to-[#F8F4EE]/30 mt-8 md:mt-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-4 md:mb-6">How Sacred Works</h2>
          <p className="text-lg md:text-xl text-[#6B5B73] font-sacred max-w-3xl mx-auto">The assessment covers everything you need to discuss but probably don't know how to bring up. It's comprehensive without being overwhelming, and completely private until you're both ready to share.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border transition-all duration-300 hover:bg-white hover:scale-105">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#C4756B] to-[#B86761] text-white rounded-full flex items-center justify-center font-sacred-bold text-xl md:text-2xl mx-auto mb-4 md:mb-6 soft-shadow">1</div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Individual Assessment</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Each partner completes a thorough evaluation privately. This ensures honest responses about expectations, concerns, and desires without pressure or judgment.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border transition-all duration-300 hover:bg-white hover:scale-105">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#7A9B8A] to-[#6B8B7A] text-white rounded-full flex items-center justify-center font-sacred-bold text-xl md:text-2xl mx-auto mb-4 md:mb-6 soft-shadow">2</div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Personalized Comparison</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Receive a detailed analysis highlighting where you align and where you need discussion. Most couples are surprised by both their similarities and differences.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl soft-shadow gentle-border transition-all duration-300 hover:bg-white hover:scale-105">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#C4756B] to-[#B86761] text-white rounded-full flex items-center justify-center font-sacred-bold text-xl md:text-2xl mx-auto mb-4 md:mb-6 soft-shadow">3</div>
            <h3 className="text-lg md:text-xl font-sacred-bold text-[#2F4F3F] mb-3 md:mb-4">Guided Conversations</h3>
            <p className="text-[#6B5B73] font-sacred leading-relaxed text-sm md:text-base">Use your results as a roadmap for meaningful conversations about your future intimate relationship. No more awkward silences or not knowing where to start.</p>
          </div>
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button onClick={handleGetStarted} size="lg" className="bg-[#2F4F3F] hover:bg-[#1e3b2e] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full soft-shadow transition-all duration-300 hover:scale-105 w-full md:w-auto">
            Start Your Assessment <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}