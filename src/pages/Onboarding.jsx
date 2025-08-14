import React, { useState, useEffect } from 'react';
import { User, CoupleAssessment, PartnerInvite } from '@/api/entities';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl, getSiteUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Heart, Shield, AlertTriangle, Users, Loader2, User as UserIcon, MessageCircle, Copy, Check, Mail } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import { sendInviteEmail } from '@/api/functions';

const P1_STEPS = {
  WELCOME: 'welcome',
  USER_INFO: 'user_info',
  PARTNER_INFO: 'partner_info',
  WEDDING_DATE: 'wedding_date',
  CUSTOM_MESSAGE: 'custom_message',
  CONSENT: 'consent',
  DISCLAIMER: 'disclaimer',
  SHARE_LINK: 'share_link'
};

const P2_STEPS = {
    WELCOME: 'p2_welcome',
    USER_INFO: 'p2_user_info',
    CONSENT: 'p2_consent',
    DISCLAIMER: 'p2_disclaimer'
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(P1_STEPS.WELCOME);
  const [user, setUser] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isPartner2Flow, setIsPartner2Flow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    partnerName: '',
    partnerEmail: '',
    weddingDate: '',
    customMessage: '',
    userConsent: false,
    partnerConsent: false, // Only for P1
    disclaimerAccepted: false
  });
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const assessmentId = urlParams.get('assessmentId');

    const checkUserAndFlow = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (assessmentId) {
          // --- This is the Partner 2 Flow ---
          setIsPartner2Flow(true);
          setCurrentStep(P2_STEPS.WELCOME);
          
          let fetchedAssessment;
          try {
            fetchedAssessment = await CoupleAssessment.get(assessmentId);
          } catch (error) {
            console.error("Failed to fetch assessment during onboarding. This might be a permissions issue:", error);
            console.log("Assessment ID:", assessmentId, "User email:", currentUser.email);
            
            // If we can't fetch the assessment, it might be due to RLS policies
            // In this case, we'll proceed with minimal validation and let the Assessment page handle the full validation
            if (error.status === 403 || error.message?.includes('permission')) {
              console.log("Assuming RLS permission issue - proceeding with onboarding for invited partner");
              // Set minimal assessment data for onboarding to proceed
              setAssessment({ id: assessmentId, partner2_email: currentUser.email });
              setFormData(prev => ({ 
                ...prev, 
                userName: currentUser.full_name ? currentUser.full_name.split(' ')[0] : ''
              }));
            } else {
              navigate(createPageUrl('Dashboard?error=assessment_not_found'));
              return;
            }
          }
          
          if (fetchedAssessment) {
            // Only validate email match if we successfully fetched the assessment
            if (currentUser.email.toLowerCase() !== fetchedAssessment.partner2_email?.toLowerCase()) {
              console.error("User-invite mismatch. Logged in user is not the invited partner.");
              navigate(createPageUrl('Dashboard?error=invite_mismatch'));
              return;
            }
            
            setAssessment(fetchedAssessment);
            setFormData(prev => ({ 
              ...prev, 
              userName: fetchedAssessment.partner2_name || (currentUser.full_name ? currentUser.full_name.split(' ')[0] : '')
            }));
          }

        } else {
          // --- This is the Partner 1 Flow ---
          setIsPartner2Flow(false);
          setCurrentStep(P1_STEPS.WELCOME);
          if (currentUser.onboarding_completed) {
            navigate(createPageUrl('Dashboard'));
            return;
          }
          if (currentUser.full_name) {
            setFormData(prev => ({ 
              ...prev, 
              userName: currentUser.full_name.split(' ')[0] 
            }));
          }
        }
      } catch (error) {
        console.error('Error loading onboarding flow:', error);
        navigate(createPageUrl('Dashboard?error=onboarding_failed'));
      }
    };
    checkUserAndFlow();
  }, [navigate, location.search]);

  const handleNext = () => {
    const steps = isPartner2Flow ? Object.values(P2_STEPS) : Object.values(P1_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = isPartner2Flow ? Object.values(P2_STEPS) : Object.values(P1_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    if (isPartner2Flow) {
      // --- Partner 2 Completion Logic ---
      if (!formData.userConsent || !formData.disclaimerAccepted) {
          setIsLoading(false);
          return;
      }
      try {
        const updateData = { onboarding_completed: true };
        const currentFirstName = user.full_name ? user.full_name.split(' ')[0] : '';
        if (formData.userName && formData.userName !== currentFirstName) {
            const currentLastName = user.full_name ? user.full_name.split(' ').slice(1).join(' ') : '';
            updateData.full_name = formData.userName + (currentLastName ? ' ' + currentLastName : '');
        }
        await User.update(user.id, updateData);
        
        // Only update assessment if we have full assessment data
        // (We might only have minimal data if there was a permissions issue during fetch)
        if (assessment && assessment.partner1_email) {
          try {
            await CoupleAssessment.update(assessment.id, {
                partner2_has_accessed: true,
                partner2_last_login: new Date().toISOString()
            });
          } catch (error) {
            console.warn("Could not update assessment during onboarding completion:", error);
            // Don't fail onboarding if assessment update fails - the Assessment page can handle this
          }
        }

        navigate(createPageUrl('Dashboard'));
      } catch (error) {
        console.error("Error completing Partner 2 onboarding:", error);
        setIsLoading(false);
      }
    } else {
      // --- Partner 1 Completion Logic ---
      if (!formData.userConsent || !formData.partnerConsent || !formData.disclaimerAccepted) {
        setIsLoading(false);
        return;
      }
      try {
        console.log('🔄 Starting Partner 1 onboarding completion...');
        console.log('📝 Form data:', formData);
        console.log('👤 User:', user);
        
        await User.update(user.id, { onboarding_completed: true, full_name: formData.userName });
        console.log('✅ User profile updated');
        
        const assessmentData = {
          partner1_name: formData.userName || 'You',
          partner1_email: user.email,
          partner2_name: formData.partnerName,
          partner2_email: formData.partnerEmail,
          wedding_date: formData.weddingDate,
          status: 'pending'
        };
        console.log('📊 Creating assessment with data:', assessmentData);
        
        const newAssessment = await CoupleAssessment.create(assessmentData);
        console.log('✅ Assessment created successfully:', newAssessment);
        
        // Create secure invite token for Partner 2
        const generatedInviteLink = await PartnerInvite.createInviteLink(newAssessment.id, user.email);
        setInviteLink(generatedInviteLink);
        
        console.log('🔗 Invite link generated:', generatedInviteLink);
        
        // Move to share link step instead of sending email
        setCurrentStep(P1_STEPS.SHARE_LINK);
      } catch (error) {
        console.error('Error in onboarding completion:', error);
        alert(`Onboarding failed: ${error.message || error}. Please try again or contact support.`);
        setIsLoading(false);
      }
    }
  };

  const canProceedFromStep = (step) => {
    if (isPartner2Flow) {
        switch (step) {
            case P2_STEPS.WELCOME: return true;
            case P2_STEPS.USER_INFO: return formData.userName.trim();
            case P2_STEPS.CONSENT: return formData.userConsent;
            case P2_STEPS.DISCLAIMER: return formData.disclaimerAccepted;
            default: return false;
        }
    } else {
        switch (step) {
            case P1_STEPS.WELCOME: return true;
            case P1_STEPS.USER_INFO: return formData.userName.trim();
            case P1_STEPS.PARTNER_INFO: return formData.partnerName.trim() && formData.partnerEmail.trim();
            case P1_STEPS.WEDDING_DATE: return formData.weddingDate.trim();
            case P1_STEPS.CUSTOM_MESSAGE: return true;
            case P1_STEPS.CONSENT: return formData.userConsent && formData.partnerConsent;
            case P1_STEPS.DISCLAIMER: return formData.disclaimerAccepted;
            case P1_STEPS.SHARE_LINK: return true;
            default: return false;
        }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }
  
  const getPartner1Name = () => (assessment ? assessment.partner1_name : 'your partner');

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] p-6">
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
            .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
            .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
          `
        }} />
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-sacred tracking-widest text-[#2F4F3F] mb-2">SACRED</h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Partner 2 Flow */}
              {isPartner2Flow && (
                <>
                  {currentStep === P2_STEPS.WELCOME && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto"><Heart className="w-8 h-8 text-[#C4756B]" /></div>
                      <div>
                        <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Welcome, {formData.userName}!</h2>
                        <p className="text-[#6B5B73] font-sacred text-lg leading-relaxed">
                          {getPartner1Name()} has invited you to take the SACRED assessment together. Let's get you set up to begin.
                        </p>
                      </div>
                    </div>
                  )}
                  {currentStep === P2_STEPS.USER_INFO && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Confirm Your Name</h2>
                        <p className="text-[#6B5B73] font-sacred">Please confirm your first name for the assessment report.</p>
                      </div>
                      <div className="max-w-sm mx-auto">
                        <Label htmlFor="userName" className="text-[#2F4F3F] font-medium font-sacred">Your First Name</Label>
                        <Input id="userName" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} className="border-[#E6D7C9] focus:border-[#C4756B] text-lg p-3" />
                      </div>
                    </div>
                  )}
                  {currentStep === P2_STEPS.CONSENT && (
                     <div className="space-y-6">
                      <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Your Consent</h2></div>
                      <div className="border border-[#E6D7C9] bg-[#F5F1EB] p-4 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Checkbox id="userConsent" checked={formData.userConsent} onCheckedChange={(checked) => setFormData({...formData, userConsent: checked})} />
                          <Label htmlFor="userConsent" className="text-sm text-[#2F4F3F] font-sacred leading-relaxed">
                            <strong>Your Consent:</strong> I voluntarily agree to participate in the SACRED assessment. I understand this involves answering explicit questions about sexual intimacy and expectations for marriage. I consent to sharing my responses with {getPartner1Name()} once we both complete the assessment.
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                   {currentStep === P2_STEPS.DISCLAIMER && (
                    <div className="space-y-6">
                        <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Important Disclaimers</h2></div>
                        <p className="text-[#6B5B73] font-sacred text-center">Please read and acknowledge the following before proceeding:</p>
                        <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg text-sm text-[#6B5B73] font-sacred">SACRED is an educational tool, <strong>not</strong> professional counseling, therapy, or medical advice. If you have experienced sexual trauma or have serious relationship concerns, please seek professional help.</div>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="disclaimer" checked={formData.disclaimerAccepted} onCheckedChange={(checked) => setFormData({...formData, disclaimerAccepted: checked})} />
                            <Label htmlFor="disclaimer" className="text-sm text-[#2F4F3F] font-sacred leading-relaxed">I understand that SACRED is not professional therapy or counseling, and I acknowledge the recommendations about seeking professional help when appropriate.</Label>
                        </div>
                    </div>
                  )}
                </>
              )}

              {/* Partner 1 Flow (existing UI) */}
              {!isPartner2Flow && (
                  <>
                    {currentStep === P1_STEPS.WELCOME && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto"><Heart className="w-8 h-8 text-[#C4756B]" /></div>
                            <div>
                                <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Welcome to SACRED!</h2>
                                <p className="text-[#6B5B73] font-sacred text-lg leading-relaxed">You're about to begin the SACRED assessment with your partner. This thoughtful journey will help you both explore expectations about marital intimacy and build deeper understanding together.</p>
                            </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.USER_INFO && (
                        <div className="space-y-6">
                          <div className="text-center"><h2 className="2xl font-sacred-bold text-[#2F4F3F] mb-3">Tell Us About You</h2></div>
                          <div className="max-w-sm mx-auto">
                            <Label htmlFor="userName" className="text-[#2F4F3F] font-medium font-sacred">Your First Name</Label>
                            <Input id="userName" placeholder="Enter your first name" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} className="border-[#E6D7C9] focus:border-[#C4756B] text-lg p-3" />
                          </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.PARTNER_INFO && (
                        <div className="space-y-6">
                            <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Your Partner's Information</h2></div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="partnerName" className="text-[#2F4F3F] font-medium font-sacred">Partner's First Name</Label>
                                    <Input id="partnerName" placeholder="Enter your partner's first name" value={formData.partnerName} onChange={(e) => setFormData({...formData, partnerName: e.target.value})} className="border-[#E6D7C9] focus:border-[#C4756B] text-lg p-3"/>
                                </div>
                                <div>
                                    <Label htmlFor="partnerEmail" className="text-[#2F4F3F] font-medium font-sacred">Partner's Email Address</Label>
                                    <Input id="partnerEmail" type="email" placeholder="Enter your partner's email" value={formData.partnerEmail} onChange={(e) => setFormData({...formData, partnerEmail: e.target.value})} className="border-[#E6D7C9] focus:border-[#C4756B] text-lg p-3"/>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.WEDDING_DATE && (
                        <div className="space-y-6">
                            <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Your Wedding Date</h2></div>
                            <div className="max-w-sm mx-auto">
                                <Label htmlFor="weddingDate" className="text-[#2F4F3F] font-medium font-sacred">Wedding Date</Label>
                                <Input id="weddingDate" type="date" value={formData.weddingDate} onChange={(e) => setFormData({...formData, weddingDate: e.target.value})} className="border-[#E6D7C9] focus:border-[#C4756B] text-lg p-3"/>
                            </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.CUSTOM_MESSAGE && (
                        <div className="space-y-6">
                           <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Personal Message</h2></div>
                           <div>
                                <Label htmlFor="customMessage" className="text-[#2F4F3F] font-medium font-sacred">Your Message (Optional)</Label>
                                <Textarea id="customMessage" placeholder={`Hey ${formData.partnerName}, I'm excited for us to take this assessment together!`} value={formData.customMessage} onChange={(e) => setFormData({...formData, customMessage: e.target.value})} className="h-32 border-[#E6D7C9] focus:border-[#C4756B] text-base p-4"/>
                           </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.CONSENT && (
                        <div className="space-y-6">
                            <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Consent & Agreement</h2></div>
                            <div className="space-y-4">
                                <div className="border border-[#E6D7C9] bg-[#F5F1EB] p-4 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="userConsent" checked={formData.userConsent} onCheckedChange={(checked) => setFormData({...formData, userConsent: checked})} />
                                        <Label htmlFor="userConsent" className="text-sm text-[#2F4F3F] font-sacred leading-relaxed"><strong>Your Consent:</strong> I voluntarily agree to participate in the SACRED assessment and share my responses with my partner.</Label>
                                    </div>
                                </div>
                                <div className="border border-[#E6D7C9] bg-[#F5F1EB] p-4 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox id="partnerConsent" checked={formData.partnerConsent} onCheckedChange={(checked) => setFormData({...formData, partnerConsent: checked})} />
                                        <Label htmlFor="partnerConsent" className="text-sm text-[#2F4F3F] font-sacred leading-relaxed"><strong>Partner Consent:</strong> I confirm that {formData.partnerName || 'my partner'} has agreed to participate and has given permission for me to provide their contact info.</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === P1_STEPS.DISCLAIMER && (
                        <div className="space-y-6">
                            <div className="text-center"><h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Important Disclaimers</h2></div>
                             <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg text-sm text-[#6B5B73] font-sacred">SACRED is an educational tool, <strong>not</strong> professional counseling or therapy. If you have experienced sexual trauma or have serious relationship concerns, please seek professional help.</div>
                            <div className="flex items-start space-x-2">
                                <Checkbox id="disclaimer" checked={formData.disclaimerAccepted} onCheckedChange={(checked) => setFormData({...formData, disclaimerAccepted: checked})} />
                                <Label htmlFor="disclaimer" className="text-sm text-[#2F4F3F] font-sacred leading-relaxed">I understand and acknowledge the disclaimers.</Label>
                            </div>
                        </div>
                    )}
                    
                    {currentStep === P1_STEPS.SHARE_LINK && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-3">Share with {formData.partnerName}</h2>
                                <p className="text-[#6B5B73] font-sacred">Your assessment is ready! Share this private link with {formData.partnerName} to begin your journey together.</p>
                            </div>
                            
                            <div className="bg-[#F5F1EB] p-6 rounded-xl border border-[#E6D7C9] space-y-4">
                                <Label htmlFor="invite-link" className="text-[#2F4F3F] font-medium font-sacred">
                                    Private Invite Link for {formData.partnerName}
                                </Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="invite-link" 
                                        value={inviteLink} 
                                        readOnly 
                                        className="text-base border-[#E6D7C9] focus:border-[#7A9B8A] bg-white" 
                                    />
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={copyToClipboard} 
                                        className="border-[#E6D7C9] hover:bg-[#F5F1EB]"
                                    >
                                        {copied ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                                
                                <div className="flex items-center gap-4 pt-2">
                                    <a 
                                        href={`mailto:${formData.partnerEmail}?subject=Let's take our SACRED assessment together&body=Hi ${formData.partnerName},%0A%0AI've set up our SACRED relationship assessment. Please use this private link to join me:%0A%0A${inviteLink}%0A%0A${formData.customMessage ? encodeURIComponent(formData.customMessage) + '%0A%0A' : ''}Looking forward to growing together!%0A%0A${formData.userName}`} 
                                        className="inline-flex items-center text-[#7A9B8A] hover:underline font-sacred"
                                    >
                                        <Mail className="w-4 h-4 mr-2" /> Send via email
                                    </a>
                                </div>
                            </div>
                            
                            <div className="text-center text-sm text-[#6B5B73] font-sacred">
                                You can also find this link later in your Dashboard under "Invite Link"
                            </div>
                        </div>
                    )}
                  </>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E6D7C9]">
                <Button onClick={handleBack} variant="outline" className={`border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred ${currentStep === P1_STEPS.WELCOME || currentStep === P2_STEPS.WELCOME || currentStep === P1_STEPS.SHARE_LINK ? 'invisible' : ''}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentStep === P1_STEPS.DISCLAIMER || currentStep === P2_STEPS.DISCLAIMER ? (
                  <Button onClick={handleComplete} disabled={!canProceedFromStep(currentStep) || isLoading} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isPartner2Flow ? 'Begin Assessment' : 'Create Assessment')}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                ) : currentStep === P1_STEPS.SHARE_LINK ? (
                  <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold">
                    Continue to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!canProceedFromStep(currentStep)} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthWrapper>
  );
}