import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-[#6B5B73] font-sacred leading-relaxed">
            
            <p className="text-lg mb-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <strong>SACRED's Commitment:</strong> We understand that sexual intimacy assessments contain some of the most private 
              information you could share. This privacy policy explains exactly how we protect your data with the highest standards 
              of security and confidentiality.
            </p>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">1. Information We Collect</h2>
              <p>
                SACRED collects only the information necessary to provide our assessment service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name and email address through secure Google OAuth authentication</li>
                <li><strong>Assessment Responses:</strong> Your confidential answers to questions about sexual expectations, intimacy, and relationship preparation</li>
                <li><strong>Partner Information:</strong> Names you provide for your assessment partner (stored securely within your account only)</li>
                <li><strong>Usage Data:</strong> Minimal technical information including timestamps, completion status, and basic system logs for security purposes</li>
              </ul>
              <p className="mt-4 text-sm bg-gray-50 border-l-4 border-[#C4756B] p-4">
                <strong>What We Don't Collect:</strong> We never collect location data, device information, browsing history, 
                or any information not directly related to providing the assessment service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">2. How We Use Your Information</h2>
              <p>We use your information solely to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide the SACRED assessment service</li>
                <li>Generate compatibility reports for you and your partner</li>
                <li>Enable secure sharing of results between assessment partners</li>
                <li>Maintain your account and assessment history</li>
                <li>Provide customer support when requested</li>
              </ul>
              <p className="mt-4">
                <strong>We do not use your assessment responses for any other purpose, including research, marketing, or analytics.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">3. Data Storage and Security</h2>
              <p>
                SACRED takes the security of your sensitive information seriously and implements comprehensive protection measures:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your data is stored securely on Supabase's enterprise-grade cloud infrastructure with end-to-end encryption</li>
                <li>All data transmission uses industry-standard SSL/TLS encryption</li>
                <li>Access to your assessment responses is strictly limited to you and your assessment partner only</li>
                <li>Our database is protected with row-level security policies ensuring users can only access their own data</li>
                <li>We employ regular security audits and monitoring to protect against unauthorized access</li>
                <li>Passwords are never stored - we use secure OAuth authentication through Google</li>
              </ul>
              <p className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <strong>Important Security Note:</strong> While we implement strong security measures to protect your data, 
                system administrators may have technical access to information stored in the database for maintenance and support purposes. 
                This is standard with most cloud-based services, but we want you to understand this given the sensitive nature of our content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">4. Data Sharing and Privacy</h2>
              <p>Your assessment responses are handled with extreme care:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Partner Sharing:</strong> Results are only shared between assessment partners after both complete their assessments</li>
                <li><strong>No Third Parties:</strong> We never share, sell, or provide your assessment data to third parties</li>
                <li><strong>No Marketing Use:</strong> Your responses are never used for marketing, advertising, or promotional purposes</li>
                <li><strong>No Research Use:</strong> We do not use individual responses for research or aggregate analysis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">5. Your Rights and Control</h2>
              <p>You have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> You can view all your assessment data through your dashboard</li>
                <li><strong>Correction:</strong> Contact us to correct any inaccurate personal information</li>
                <li><strong>Deletion:</strong> You may request deletion of your account and all associated data</li>
                <li><strong>Export:</strong> You can request a copy of your data in a portable format</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:support@sacredassessment.com" className="text-[#C4756B] hover:underline">
                  support@sacredassessment.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">6. Authentication and Account Security</h2>
              <p>
                SACRED uses Google OAuth for authentication, which means:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We don't store your password - Google handles authentication securely</li>
                <li>You can revoke SACRED's access through your Google account settings at any time</li>
                <li>Account security is enhanced by Google's security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">7. Data Retention</h2>
              <p>
                We retain your data for as long as your account remains active. If you request account deletion, 
                we will remove your personal data from our systems within 30 days, except where we're required 
                to retain certain information for legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">8. Children's Privacy</h2>
              <p>
                SACRED is intended for adults aged 18 and over. We do not knowingly collect personal information 
                from individuals under 18. If we become aware that we have collected personal information from 
                someone under 18, we will delete that information immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">9. International Users</h2>
              <p>
                SACRED is hosted on Supabase's cloud infrastructure, which stores data in secure data centers 
                primarily located in the United States. By using our service, you consent to the transfer and 
                processing of your information in these locations, which may have different privacy laws than 
                your country of residence. We ensure that all data transfers comply with applicable privacy regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy to reflect changes in our practices or for legal reasons. 
                We will notify users of significant changes by email or through the service. Your continued 
                use of SACRED after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">11. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or how we handle your data, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: <a href="mailto:support@sacredassessment.com" className="text-[#C4756B] hover:underline">support@sacredassessment.com</a></li>
                <li>Mailing Address: SACRED Assessment, PO Box 12345, Your City, ST 12345</li>
                <li>Response Time: We aim to respond to all privacy inquiries within 48 hours</li>
              </ul>
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