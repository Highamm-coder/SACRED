import React from 'react';
import { Button } from '@/components/ui/button';

export default function InvestmentSection({ handleGetStarted }) {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] mb-4 md:mb-6">The Investment in Your Marriage</h2>
        <div className="mb-6">
          <div className="text-5xl md:text-6xl font-sacred-bold text-[#C4756B]">
            $47
          </div>
          <p className="text-sm text-[#6B5B73]/70 font-sacred mt-2">
            The average cost of a wedding in the United States is around $33,000
          </p>
        </div>
        <Button onClick={handleGetStarted} size="lg" className="bg-[#C4756B] hover:bg-[#B86761] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-sacred-bold rounded-full transition-all duration-300 mb-4 md:mb-6 w-full md:w-auto">
          Start Your Assessment
        </Button>
        <p className="text-[#6B5B73]/70 font-sacred text-sm md:text-base">
          30-day money-back guarantee. If these conversations don't help you feel more prepared and confident about intimate marriage, we'll refund your investment completely.
        </p>
      </div>
    </section>
  );
}
