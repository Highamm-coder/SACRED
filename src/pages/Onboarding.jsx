import React, { useState, useEffect } from 'react';
import { User, Assessment } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Heart, Shield, AlertTriangle, Loader2, User as UserIcon } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';

const STEPS = {
  WELCOME: 'welcome',
  USER_INFO: 'user_info',
  WEDDING_DATE: 'wedding_date',
  CONSENT: 'consent',
  DISCLAIMER: 'disclaimer',
  COMPLETE: 'complete'
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    weddingDate: '',
    userConsent: false,
    disclaimerAccepted: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Pre-populate partner1 name if available
        if (currentUser.full_name) {
          setFormData(prev => ({
            ...prev,
            partner1Name: currentUser.full_name
          }));
        }
        
        if (currentUser.onboarding_completed) {
          navigate(createPageUrl('Dashboard'));
        }
        
      } catch (error) {
        console.error('Error initializing onboarding:', error);
        navigate(createPageUrl('Dashboard?error=onboarding_failed'));
      }
    };
    
    initializeOnboarding();
  }, [navigate]);

  const handleNext = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting parallel assessment creation...');
      
      // Create both partner assessments for the user
      const partner1Assessment = await Assessment.create({
        title: `${formData.partner1Name}'s Assessment - Sacred Pre-Marriage`,
        description: `${formData.partner1Name}'s perspective`,
        metadata: {
          partnerName: formData.partner1Name,
          partner1Name: formData.partner1Name,
          partner2Name: formData.partner2Name,
          weddingDate: formData.weddingDate,
          partnerRole: 'partner1',
          onboardingCompleted: true
        }
      });
      console.log('✅ Partner 1 assessment created:', partner1Assessment);

      const partner2Assessment = await Assessment.create({
        title: `${formData.partner2Name}'s Assessment - Sacred Pre-Marriage`, 
        description: `${formData.partner2Name}'s perspective`,
        metadata: {
          partnerName: formData.partner2Name,
          partner1Name: formData.partner1Name,
          partner2Name: formData.partner2Name,
          weddingDate: formData.weddingDate,
          partnerRole: 'partner2',
          onboardingCompleted: true
        }
      });
      console.log('✅ Partner 2 assessment created:', partner2Assessment);

      // Mark onboarding as completed
      await User.update(user.id, { 
        onboarding_completed: true,
        full_name: formData.partner1Name
      });
      console.log('✅ User profile updated');

      // Redirect to dashboard to show both assessments
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      alert('Error completing onboarding: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return true;
      case STEPS.USER_INFO:
        return formData.partner1Name.trim().length > 0 && formData.partner2Name.trim().length > 0;
      case STEPS.WEDDING_DATE:
        return formData.weddingDate.trim().length > 0;
      case STEPS.CONSENT:
        return formData.userConsent;
      case STEPS.DISCLAIMER:
        return formData.disclaimerAccepted;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#C4756B]" />
              </div>
              <CardTitle className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                Welcome to Sacred
              </CardTitle>
              <CardDescription className="text-lg text-[#6B5B73] font-sacred max-w-md mx-auto">
                Your personal journey to understand your expectations and prepare for a sacred marriage begins here.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-[#F5F1EB] rounded-lg text-left">
                  <h4 className="font-sacred-bold text-[#2F4F3F] mb-2">What You'll Do:</h4>
                  <ul className="text-sm text-[#6B5B73] font-sacred space-y-1">
                    <li>• Complete a personal assessment about marriage expectations</li>
                    <li>• Reflect on your values, communication, and relationship goals</li>
                    <li>• Get personalized insights about your readiness for marriage</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#EAE6E1] rounded-lg text-left">
                  <h4 className="font-sacred-bold text-[#2F4F3F] mb-2">This Takes About:</h4>
                  <p className="text-sm text-[#6B5B73] font-sacred">
                    15-20 minutes to complete the assessment questions
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold py-6 text-lg"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case STEPS.USER_INFO:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-6 h-6 text-[#C4756B]" />
              </div>
              <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F] text-center">
                Tell Us About Both Partners
              </CardTitle>
              <CardDescription className="text-center font-sacred text-[#6B5B73]">
                We'll create personalized assessments for each of you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="partner1Name" className="text-sm font-sacred text-[#2F4F3F] mb-2 block">
                  Partner 1 Name (You) *
                </Label>
                <Input
                  id="partner1Name"
                  value={formData.partner1Name}
                  onChange={(e) => handleInputChange('partner1Name', e.target.value)}
                  placeholder="Enter your full name"
                  className="font-sacred"
                />
              </div>
              <div>
                <Label htmlFor="partner2Name" className="text-sm font-sacred text-[#2F4F3F] mb-2 block">
                  Partner 2 Name *
                </Label>
                <Input
                  id="partner2Name"
                  value={formData.partner2Name}
                  onChange={(e) => handleInputChange('partner2Name', e.target.value)}
                  placeholder="Enter your partner's full name"
                  className="font-sacred"
                />
              </div>
              <div className="bg-[#F5F1EB] p-4 rounded-lg">
                <p className="text-sm text-[#6B5B73] font-sacred">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Your information is private and secure. We'll create separate assessments for each partner to compare perspectives.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case STEPS.WEDDING_DATE:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-[#7A9B8A]" />
              </div>
              <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F] text-center">
                When's the Big Day?
              </CardTitle>
              <CardDescription className="text-center font-sacred text-[#6B5B73]">
                Your wedding date helps us tailor your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="weddingDate" className="text-sm font-sacred text-[#2F4F3F] mb-2 block">
                  Wedding Date *
                </Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  className="font-sacred"
                />
              </div>
              <div className="bg-[#F5F1EB] p-4 rounded-lg">
                <p className="text-sm text-[#6B5B73] font-sacred">
                  💡 Don't worry if your date changes - you can update this anytime in your profile.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case STEPS.CONSENT:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-[#6B5B73]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-[#6B5B73]" />
              </div>
              <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F] text-center">
                Privacy & Consent
              </CardTitle>
              <CardDescription className="text-center font-sacred text-[#6B5B73]">
                Your data privacy is important to us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#F5F1EB] p-6 rounded-lg">
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">We Promise:</h4>
                <ul className="text-sm text-[#6B5B73] font-sacred space-y-2">
                  <li>✓ Your assessment responses are completely private</li>
                  <li>✓ We never sell or share your personal data</li>
                  <li>✓ You can delete your account and data at any time</li>
                  <li>✓ All data is encrypted and securely stored</li>
                </ul>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="userConsent"
                  checked={formData.userConsent}
                  onCheckedChange={(checked) => handleInputChange('userConsent', checked)}
                />
                <div>
                  <Label htmlFor="userConsent" className="text-sm font-sacred text-[#2F4F3F] leading-relaxed">
                    I consent to Sacred storing my assessment responses and profile information securely. 
                    I understand I can delete my data at any time.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case STEPS.DISCLAIMER:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-[#C4756B]" />
              </div>
              <CardTitle className="text-xl font-sacred-bold text-[#2F4F3F] text-center">
                Important Disclaimer
              </CardTitle>
              <CardDescription className="text-center font-sacred text-[#6B5B73]">
                Please read and acknowledge before continuing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-sacred leading-relaxed mb-4">
                  <strong>Sacred is an educational assessment tool</strong> designed to help you explore your expectations 
                  about marriage. It is not a substitute for professional counseling, therapy, or medical advice.
                </p>
                <p className="text-sm text-amber-800 font-sacred leading-relaxed">
                  For relationship concerns, please consult qualified professionals such as licensed therapists, 
                  counselors, or religious advisors.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="disclaimerAccepted"
                  checked={formData.disclaimerAccepted}
                  onCheckedChange={(checked) => handleInputChange('disclaimerAccepted', checked)}
                />
                <div>
                  <Label htmlFor="disclaimerAccepted" className="text-sm font-sacred text-[#2F4F3F] leading-relaxed">
                    I understand that Sacred is an educational tool and not professional counseling. 
                    I will seek professional help for any serious relationship concerns.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case STEPS.COMPLETE:
        return (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                You're All Set!
              </CardTitle>
              <CardDescription className="text-lg text-[#6B5B73] font-sacred max-w-md mx-auto">
                Your personal Sacred assessment has been created. Ready to begin?
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h4 className="font-sacred-bold text-green-800 mb-2">Next Steps:</h4>
                <ul className="text-sm text-green-700 font-sacred space-y-1 text-left max-w-md mx-auto">
                  <li>✓ Complete your assessment questions</li>
                  <li>✓ Get your personalized report</li>
                  <li>✓ Explore Sacred Reflections when ready</li>
                </ul>
              </div>
              {isLoading ? (
                <Button disabled className="w-full bg-[#C4756B] text-white font-sacred-bold py-6 text-lg">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Your Assessment...
                </Button>
              ) : (
                <Button 
                  onClick={completeOnboarding} 
                  className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold py-6 text-lg"
                >
                  Start Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getStepNumber = () => {
    const steps = Object.values(STEPS);
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => {
    return Object.values(STEPS).length;
  };

  if (!user) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-sacred text-[#6B5B73]">Step {getStepNumber()} of {getTotalSteps()}</span>
              <span className="text-sm font-sacred text-[#6B5B73]">{Math.round((getStepNumber() / getTotalSteps()) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#C4756B] h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep !== STEPS.COMPLETE && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === STEPS.WELCOME}
                className="font-sacred"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={currentStep === STEPS.DISCLAIMER ? () => setCurrentStep(STEPS.COMPLETE) : handleNext}
                disabled={!canProceed()}
                className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred"
              >
                {currentStep === STEPS.DISCLAIMER ? 'Complete Setup' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}