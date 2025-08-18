import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/api/entities';
import { PartnerInvite } from '@/api/services/partnerInvite';
import { createPageUrl, getSiteUrl } from '@/utils';
import { Heart, Loader2, User2, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function PartnerInvitePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('loading'); // loading, signup, onboarding, success
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link - no token provided');
      setStep('error');
      return;
    }

    const validateToken = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = await User.me();
        if (currentUser) {
          // User is already logged in, process the invite directly
          await processInviteForLoggedInUser(currentUser);
          return;
        }
      } catch {
        // User not logged in, continue with signup flow
      }

      try {
        const tokenData = await PartnerInvite.getInviteToken(token);
        if (!tokenData) {
          setError('Invalid invite link');
          return;
        }

        if (tokenData.status === 'used') {
          setError('This invite link has already been used');
          return;
        }

        if (tokenData.status === 'expired' || new Date(tokenData.expires_at) < new Date()) {
          setError('This invite link has expired');
          return;
        }

        setInviteData(tokenData);
        setStep('signup');
      } catch (err) {
        console.error('Token validation error:', err);
        setError(err.message || 'Failed to validate invite link');
        setStep('error');
      }
    };

    validateToken();
  }, [token]);

  const processInviteForLoggedInUser = async (user) => {
    try {
      const result = await PartnerInvite.useInviteToken(token, user.email);
      
      // Mark onboarding as completed and paid since Partner 2 doesn't need full onboarding or payment
      await User.update(user.id, { 
        onboarding_completed: true,
        has_paid: true  // Partner 2 inherits payment from Partner 1
      });
      
      setStep('success');
      // Verify the update was successful before navigating
      let retries = 0;
      const maxRetries = 10; // More retries for the 2-second delay case
      const checkAndNavigate = async () => {
        try {
          const updatedUser = await User.me();
          if (updatedUser.onboarding_completed || retries >= maxRetries) {
            navigate(createPageUrl('Dashboard'));
          } else {
            retries++;
            setTimeout(checkAndNavigate, 200);
          }
        } catch (err) {
          navigate(createPageUrl('Dashboard')); // Navigate anyway if check fails
        }
      };
      setTimeout(checkAndNavigate, 2000); // Keep the 2-second delay for this success case
    } catch (err) {
      setError(err.message || 'Failed to process invite');
      setStep('error');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create account for Partner 2 (invited users)
      const signupResult = await User.signUp(email, password, { 
        full_name: fullName
      });
      
      console.log('Signup result:', signupResult);
      
      // Check if user was successfully created and authenticated immediately
      if (signupResult.user && signupResult.session) {
        // User is immediately authenticated, process the invite
        console.log('User immediately authenticated, processing invite...');
        await PartnerInvite.useInviteToken(token, email);
        
        // Mark onboarding as completed and paid since Partner 2 doesn't need full onboarding or payment
        const currentUser = await User.me();
        await User.update(currentUser.id, { 
          onboarding_completed: true,
          has_paid: true  // Partner 2 inherits payment from Partner 1
        });
        
        // Navigate directly to Dashboard
        navigate(createPageUrl('Dashboard'));
      } else if (signupResult.user && !signupResult.session) {
        // User created but not authenticated yet (needs email verification)
        console.log('User needs email verification');
        
        // Store the token in localStorage so we can process it after email verification
        localStorage.setItem('partnerInviteToken', token);
        console.log('💾 Stored partner invite token in localStorage:', token);
        
        setStep('verify-email');
      } else {
        throw new Error('Signup failed - no user created');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setFormError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOnboarding = () => {
    navigate(createPageUrl('Dashboard'));
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7A9B8A] mx-auto mb-4" />
          <p className="text-[#6B5B73] font-sacred">Validating your invite...</p>
        </div>
      </div>
    );
  }

  if (step === 'error' || error) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-2">Invite Link Issue</h1>
          <p className="text-[#6B5B73] font-sacred mb-6">{error}</p>
          <Button 
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-[#7A9B8A] hover:bg-[#6A8B7A] text-white font-sacred-bold"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
        .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
        .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0.08em; }
      `}</style>

      {step === 'signup' && (
        <div className="min-h-screen flex">
          {/* Left Column - Welcome */}
          <div className="w-2/5 bg-white p-8 pl-16 flex flex-col justify-center border-r border-[#E6D7C9]">
            <div className="max-w-md space-y-8">
              <div className="space-y-4">
                <div className="text-4xl font-sacred tracking-widest text-[#2F4F3F]">SACRED</div>
                <div className="w-16 h-px bg-[#7A9B8A]"></div>
                <h1 className="text-3xl font-sacred-bold text-[#2F4F3F] leading-tight">
                  You've Been Invited!
                </h1>
                <p className="text-[#6B5B73] text-lg font-sacred">
                  Join your partner for a sacred journey of intimacy assessment and growth.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-3 text-sm">
                  <Heart className="w-5 h-5 text-[#C4756B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#2F4F3F] mb-1">Private & Secure</p>
                    <p className="text-[#6B5B73] font-sacred">
                      Your responses are confidential and shared only with your partner.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-sm">
                  <User2 className="w-5 h-5 text-[#C4756B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#2F4F3F] mb-1">Designed for Couples</p>
                    <p className="text-[#6B5B73] font-sacred">
                      Biblical wisdom meets modern relationship science.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div className="flex-1 bg-[#F5F1EB] p-8 flex flex-col justify-center">
            <div className="max-w-lg mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-6 text-center">
                  Create Your Account
                </h2>

                {formError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6">
                    <p className="text-red-700 font-sacred text-sm text-center">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <Label htmlFor="full-name" className="text-[#2F4F3F] font-medium font-sacred">
                      Full Name
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="mt-2 border-[#E6D7C9] focus:border-[#7A9B8A]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-[#2F4F3F] font-medium font-sacred">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-2 border-[#E6D7C9] focus:border-[#7A9B8A]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-[#2F4F3F] font-medium font-sacred">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="mt-2 border-[#E6D7C9] focus:border-[#7A9B8A]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password" className="text-[#2F4F3F] font-medium font-sacred">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="mt-2 border-[#E6D7C9] focus:border-[#7A9B8A]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#7A9B8A] hover:bg-[#6A8B7A] text-white py-3 text-lg font-sacred-bold"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account & Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-center text-gray-500 font-sacred mt-4">
                  By creating an account, you agree to our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'verify-email' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-2">Check Your Email</h1>
            <p className="text-[#6B5B73] font-sacred mb-6">
              We've sent you a verification email. Please click the link in the email to verify your account, then return here.
            </p>
            <p className="text-sm text-[#6B5B73] font-sacred">
              Once verified, you'll automatically be connected to your partner's assessment.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}