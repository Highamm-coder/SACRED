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
            
            <p className="text-lg mb-8 bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <strong>Welcome to SACRED:</strong> These terms govern your use of our intimate relationship assessment platform. 
              By using SACRED, you're joining a community committed to preparing for the sacred nature of marital intimacy 
              through thoughtful dialogue and mutual understanding.
            </p>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using SACRED (the "Service"), you accept and agree to be bound by these Terms of Service. 
                These terms form a legally binding agreement between you and SACRED Assessment. If you do not agree to 
                these terms, you may not use our service.
              </p>
              <p className="mt-4">
                Your continued use of the service following any changes to these terms constitutes acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">2. Purpose and Intended Use</h2>
              <p>
                SACRED is designed specifically for couples preparing for marriage, particularly those from Christian backgrounds 
                seeking to approach sexual intimacy with intentionality and wisdom. Our assessment contains explicit content about 
                sexual expectations, intimacy, and physical relationships within marriage.
              </p>
              <p>
                The service is intended for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Educational and relationship preparation purposes</li>
                <li>Facilitating healthy communication between partners</li>
                <li>Identifying areas where couples may need additional guidance or counseling</li>
                <li>Supporting pre-marital preparation programs and counseling</li>
              </ul>
              <p>
                <strong>Age Requirement:</strong> You must be at least 18 years old to use this service. By using SACRED, 
                you confirm that you are an adult and understand the intimate nature of the assessment content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">3. Privacy and Confidentiality</h2>
              <p>
                SACRED is built with privacy as our foundational principle. We understand the deeply personal nature of 
                sexual intimacy discussions and have designed our platform to protect your confidentiality at every level.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your assessment responses remain completely confidential between you and your partner</li>
                <li>Results are only shared after both partners complete their assessments</li>
                <li>We never share, sell, or use your intimate responses for any other purpose</li>
                <li>Your data is encrypted and protected with enterprise-level security measures</li>
              </ul>
              <p>
                For comprehensive information about our data practices, please review our{' '}
                <Link to={createPageUrl('Privacy')} className="text-[#C4756B] hover:underline font-bold">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">4. Acceptable Use Policy</h2>
              <p>
                To maintain the integrity and safety of our platform, you agree to use SACRED responsibly and only for its intended purpose. 
              </p>
              <p className="mt-4 mb-4"><strong>You agree to:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Use the service solely for legitimate pre-marital preparation and education</li>
                <li>Provide honest and thoughtful responses to assessment questions</li>
                <li>Respect the confidential nature of your partner's responses</li>
                <li>Engage with the content in a spirit of mutual growth and understanding</li>
              </ul>
              <p className="mt-4 mb-4"><strong>You agree not to:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any unlawful or inappropriate purpose</li>
                <li>Share assessment content, questions, or proprietary materials outside your partnership</li>
                <li>Attempt to circumvent security measures or access unauthorized data</li>
                <li>Use the service to harm, harass, or exploit others</li>
                <li>Create false accounts or misrepresent your identity or relationship status</li>
                <li>Attempt to reverse engineer or copy our assessment methodology</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">5. Important Limitations and Disclaimers</h2>
              <p>
                <strong>SACRED is an educational and communication tool</strong> designed to facilitate healthy conversations 
                between engaged couples. It is important that you understand what our service is and is not:
              </p>
              
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mt-4 mb-6">
                <h3 className="font-sacred-bold text-[#2F4F3F] mb-3">SACRED Is NOT:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Professional counseling, therapy, or medical advice</li>
                  <li>A substitute for professional relationship or sexual counseling</li>
                  <li>Designed to address trauma, abuse, or serious psychological issues</li>
                  <li>A diagnostic tool for relationship or sexual dysfunction</li>
                  <li>Qualified to provide therapeutic intervention or crisis support</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
                <h3 className="font-sacred-bold text-[#2F4F3F] mb-3">SACRED IS:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>An educational resource for healthy couples preparing for marriage</li>
                  <li>A structured way to discuss important topics that many couples avoid</li>
                  <li>A starting point for deeper conversations with professional counselors</li>
                  <li>A tool to help identify areas where you may benefit from professional guidance</li>
                </ul>
              </div>

              <p className="font-bold text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg">
                <strong>Important:</strong> If you or your partner have experienced sexual trauma, abuse, or have serious 
                relationship concerns, please seek professional help from qualified therapists or counselors before or 
                alongside using SACRED. Our assessment is not appropriate for addressing these serious issues.
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
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">8. Intellectual Property</h2>
              <p>
                SACRED's content, including but not limited to assessment questions, methodology, reports, and educational 
                materials, are proprietary and protected by intellectual property laws.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Your Content:</strong> You retain ownership of your assessment responses and personal information</li>
                <li><strong>Our Content:</strong> All questions, analysis, and platform content remain the property of SACRED</li>
                <li><strong>Limited License:</strong> We grant you a personal, non-commercial license to use our service</li>
                <li><strong>Restrictions:</strong> You may not copy, distribute, or create derivative works from our content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, SACRED and its creators shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
              <p className="mt-4">
                Our maximum liability for any claims related to the service shall not exceed the amount you paid 
                for the service in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">10. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service or need support with our platform, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Email: <a href="mailto:support@sacredassessment.com" className="text-[#C4756B] hover:underline font-bold">support@sacredassessment.com</a></li>
                <li>Response Time: We typically respond within 24 hours</li>
                <li>For urgent privacy or security concerns: Mark your email as "URGENT" in the subject line</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">11. Changes to Terms</h2>
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