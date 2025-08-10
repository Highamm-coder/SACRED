import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        .font-sacred {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        .font-sacred-bold {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          letter-spacing: 0.08em;
        }
      `}</style>
      
      <div className="bg-white rounded-xl shadow-sm border border-[#E6D7C9] p-8 md:p-12">
        <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-[#6B5B73] font-sacred leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using SACRED (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the terms of this agreement, you are not authorized to use or access this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">2. Purpose and Intended Use</h2>
              <p>
                SACRED is designed specifically for engaged couples preparing for marriage. The assessment contains explicit content 
                about sexual intimacy and is intended for educational and relationship preparation purposes only.
              </p>
              <p>
                You must be at least 18 years old to use this service. By using SACRED, you confirm that you are an adult 
                and are using this service as part of preparation for marriage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2F4F3F] mb-4">3. Privacy and Confidentiality</h2>
              <p>
                We take your privacy seriously. Your assessment responses are private and confidential. Results are only 
                shared between assessment partners after both have completed their portions.
              </p>
              <p>
                For detailed information about how we collect, use, and protect your data, please review our{' '}
                <Link to={createPageUrl('Privacy')} className="text-[#C4756B] hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">4. Appropriate Use</h2>
              <p>You agree to use SACRED only for its intended purpose. You will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any unlawful purpose</li>
                <li>Share assessment content or questions outside of your partnership</li>
                <li>Attempt to circumvent privacy or security measures</li>
                <li>Use the service in a way that could harm or exploit others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">5. Limitations and Disclaimers</h2>
              <p>
                SACRED is an educational tool designed to facilitate conversation between engaged couples. It is not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Professional counseling, therapy, or medical advice</li>
                <li>A substitute for professional relationship counseling</li>
                <li>Designed to address trauma, abuse, or serious relationship issues</li>
              </ul>
              <p>
                If you have experienced sexual trauma or have serious relationship concerns, we strongly encourage 
                you to seek professional help from qualified therapists or counselors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">6. Account Responsibility</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and for all activities 
                that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">7. Modifications to Service</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time. We will provide 
                reasonable notice of significant changes when possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, SACRED and its creators shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">9. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:support@base44.co" className="text-[#C4756B] hover:underline">
                  support@base44.co
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">10. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. We will notify you of any changes by 
                posting the new Terms of Service on this page. Changes are effective immediately upon posting.
              </p>
            </section>

            <div className="border-t border-[#E6D7C9] pt-6 mt-8">
              <p className="text-sm text-[#6B5B73]">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}