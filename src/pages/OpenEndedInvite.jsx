import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoupleAssessment, User } from '@/api/entities';
import { PartnerInvite } from '@/api/services/partnerInvite';
import { createPageUrl, getSiteUrl } from '@/utils';
import { Copy, Check, Mail, ArrowRight, Loader2, BookOpen, Users } from 'lucide-react';

export default function OpenEndedInvitePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const assessmentId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (!assessmentId) {
      navigate(createPageUrl('Home'));
      return;
    }
    
    const loadAssessmentAndCreateInvite = async () => {
      try {
        const assessmentData = await CoupleAssessment.get(assessmentId);
        setAssessment(assessmentData);
        
        // Get current user to create invite token
        const currentUser = await User.me();
        
        // Create invite token for this assessment
        const inviteUrl = await PartnerInvite.createInviteLink(assessmentId, currentUser.email);
        setInviteLink(inviteUrl);
      } catch (error) {
        console.error('Failed to load assessment or create invite:', error);
        // Fallback to old link format
        const fallbackLink = `${getSiteUrl()}${createPageUrl(`OpenEndedAssessment?id=${assessmentId}&partner=2`)}`;
        setInviteLink(fallbackLink);
      }
    };
    
    loadAssessmentAndCreateInvite();
  }, [assessmentId, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleProceed = async (e) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    setIsLoading(true);
    try {
        await CoupleAssessment.update(assessmentId, { partner2_name: partnerName });
        navigate(createPageUrl(`OpenEndedAssessment?id=${assessmentId}&partner=1`));
    } catch(error) {
        console.error("Error updating partner name", error);
        setIsLoading(false);
    }
  }

  if (!assessment) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A9B8A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex">
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
        .font-sacred-medium {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0.08em;
        }
      `}</style>

      {/* Left Column - Information */}
      <div className="w-2/5 bg-white p-8 pl-16 flex flex-col justify-center border-r border-[#E6D7C9]">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <Link to={createPageUrl("Dashboard")} className="text-4xl font-sacred tracking-widest text-[#2F4F3F] block">
              SACRED
            </Link>
            <div className="w-16 h-px bg-[#7A9B8A]"></div>
            <h2 className="text-3xl font-sacred-bold text-[#2F4F3F] leading-tight">Ready for Sacred Reflections, {assessment.partner1_name}!</h2>
            <p className="text-[#6B5B73] text-lg font-sacred">Time to invite your partner for deep reflection.</p>
          </div>

          <div className="space-y-6">
            <p className="text-[#6B5B73] leading-relaxed font-sacred">
              Share this private link so your partner can join you in exploring the sacred nature of marital intimacy through thoughtful reflection.
            </p>
            <p className="text-[#6B5B73] leading-relaxed font-sacred">
              These open-ended questions invite deeper conversations about how God designed physical intimacy in marriage.
            </p>
          </div>

          <div className="flex items-start space-x-3 text-sm text-[#6B5B73] bg-[#F5F1EB] p-4 border border-[#E6D7C9] rounded-lg">
            <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#7A9B8A]" />
            <div>
              <p className="font-medium mb-1 text-[#2F4F3F]">Thoughtful Reflection</p>
              <p className="text-[#6B5B73] font-sacred">
                Each person reflects privately on these meaningful questions about sacred intimacy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Actions */}
      <div className="flex-1 bg-[#F5F1EB] p-8 flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full space-y-8">
          
          {/* Invite Link Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E6D7C9]">
            <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">Share Your Reflection Link</h3>
            <p className="text-[#6B5B73] font-sacred mb-6">Send this private link to your partner for Sacred Reflections.</p>
            
            <div className="space-y-4">
              <Label htmlFor="invite-link" className="text-[#2F4F3F] font-medium font-sacred">
                Your Unique Link
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="invite-link" 
                  value={inviteLink} 
                  readOnly 
                  className="text-base border-[#E6D7C9] focus:border-[#7A9B8A]" 
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard} className="border-[#E6D7C9] hover:bg-[#F5F1EB]">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <a 
                href={`mailto:?subject=Join me for Sacred Reflections&body=I'd love for you to join me in these thoughtful reflections about marital intimacy: ${inviteLink}`} 
                className="inline-flex items-center text-[#7A9B8A] hover:underline font-sacred"
              >
                <Mail className="w-4 h-4 mr-2" /> Send via email
              </a>
            </div>
          </div>

          {/* Start Your Reflections Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E6D7C9]">
            <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">Ready to Begin Your Reflections?</h3>
            <p className="text-[#6B5B73] font-sacred mb-6">
              Enter your partner's name below, then begin your sacred reflections. We need their name for the final sharing.
            </p>
            
            <form onSubmit={handleProceed} className="space-y-6">
              <div>
                <Label htmlFor="partner-name" className="text-[#2F4F3F] font-medium font-sacred mb-2 block">
                  Partner's First Name
                </Label>
                <Input
                  id="partner-name"
                  placeholder="Enter their first name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  required
                  className="text-lg p-4 border-[#E6D7C9] focus:border-[#7A9B8A]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#7A9B8A] hover:bg-[#6A8B7A] text-white py-4 text-lg font-sacred-bold flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Save & Start My Reflections
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}