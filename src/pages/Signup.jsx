import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/api/entities';
import { Eye, EyeOff, ArrowRight, Mail, CheckCircle, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';

const IMG_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg";

const included = [
  'Full sexual expectations assessment for both partners',
  'Side-by-side compatibility report',
  'Guided conversation prompts for every area of difference',
  'Sacred Reflections — 13 deeper questions for connection',
  'Lifetime access for you and your partner',
  '30-day money-back guarantee',
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user.has_paid) {
          navigate(createPageUrl('Dashboard'));
        } else {
          navigate(createPageUrl('PaymentRequired'));
        }
      } catch {
        // Not logged in — stay here
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await User.signUp(email, password);
      if (result.needsVerification) {
        setVerificationSent(true);
      } else {
        navigate(createPageUrl('PaymentRequired'));
      }
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#141E16' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0; }
        .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 600; letter-spacing: 0; }
        .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0; }
      `}</style>

      {/* ── Left — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16 bg-[#F5F1EB]">
        <Link to={createPageUrl('Landing')} className="text-2xl font-sacred tracking-widest text-[#2F4F3F] mb-12 block">
          SACRED
        </Link>

        {verificationSent ? (
          <div className="max-w-sm">
            <div className="w-12 h-12 rounded-full bg-[#2F4F3F]/10 flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 text-[#2F4F3F]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] leading-[1.1] mb-4">
              Check your email
            </h1>
            <p className="text-[#6B5B73] font-sacred leading-relaxed mb-6">
              We've sent a verification link to <strong className="font-sacred-bold">{email}</strong>. Click the link to confirm your account, then come back to complete your payment.
            </p>
            <ol className="space-y-2 mb-8">
              {['Check your inbox (and spam folder)', 'Click the verification link', 'Return here to continue'].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#6B5B73] font-sacred">
                  <span className="w-5 h-5 rounded-full border border-[#2F4F3F]/30 flex items-center justify-center text-xs text-[#2F4F3F] flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <Button
              onClick={() => navigate(createPageUrl('Login') + '?redirect=' + encodeURIComponent(createPageUrl('PaymentRequired')))}
              className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full py-6"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              I've verified — sign me in
            </Button>
          </div>
        ) : (
          <div className="max-w-sm">
            <h1 className="text-3xl md:text-4xl font-sacred-medium text-[#2F4F3F] leading-[1.1] mb-2">
              Begin your journey
            </h1>
            <p className="text-[#6B5B73] font-sacred mb-8">
              Create your account — payment comes next.
            </p>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#2F4F3F] font-sacred-bold text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  inputMode="email"
                  autoComplete="email"
                  className="border-[#E6D7C9] focus:border-[#2F4F3F] font-sacred bg-white h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#2F4F3F] font-sacred-bold text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className="border-[#E6D7C9] focus:border-[#2F4F3F] font-sacred bg-white h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5B73]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-sacred bg-red-50 border border-red-100 px-4 py-3 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full py-6 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Create account &amp; continue <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            <p className="text-xs text-[#6B5B73] font-sacred mt-6 leading-relaxed">
              Already have an account?{' '}
              <Link to={createPageUrl('Login')} className="text-[#C4756B] hover:underline">Sign in</Link>
              {' · '}
              By continuing you agree to our{' '}
              <Link to={createPageUrl('Terms')} className="text-[#C4756B] hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to={createPageUrl('Privacy')} className="text-[#C4756B] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        )}
      </div>

      {/* ── Right — details ── */}
      <div className="flex-1 relative flex flex-col justify-end overflow-hidden min-h-[50vh] md:min-h-0">
        {/* Photo */}
        <img
          src={IMG_URL}
          alt="Couple"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Content over photo */}
        <div className="relative z-10 p-8 md:p-12 lg:p-14">
          <p className="text-white/50 font-sacred-bold text-xs tracking-[0.2em] uppercase mb-4">What's included — $47 one-time</p>
          <ul className="space-y-3 mb-8">
            {included.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#C4756B] mt-0.5 flex-shrink-0" />
                <span className="text-white/85 font-sacred text-sm md:text-base leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          <blockquote className="border-l border-white/20 pl-4">
            <p className="text-white/70 font-sacred italic text-sm md:text-base leading-relaxed mb-2">
              "For the first time, we could talk about intimacy without it being awkward. We actually felt prepared."
            </p>
            <cite className="text-white/40 font-sacred text-xs">— Sarah & David, married 1 year</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
