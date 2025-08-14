import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/api/entities';
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for redirect parameter
  const urlParams = new URLSearchParams(location.search);
  const redirectTo = urlParams.get('redirect');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        await User.me();
        // If user is already logged in, redirect to intended destination or Dashboard
        const destination = redirectTo ? decodeURIComponent(redirectTo) : createPageUrl('Dashboard');
        navigate(destination);
      } catch (error) {
        // User not logged in, stay on login page
      }
    };
    checkAuth();
  }, [navigate, redirectTo]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Auth attempt:', { isLogin, email, password: '***' });
    
    try {
      if (isLogin) {
        console.log('Attempting login...');
        await User.signIn(email, password);
        console.log('Login successful, redirecting...');
        const destination = redirectTo ? decodeURIComponent(redirectTo) : createPageUrl('Dashboard');
        navigate(destination);
      } else {
        console.log('Attempting signup...');
        const result = await User.signUp(email, password);
        
        if (result.needsVerification) {
          console.log('Signup successful, verification needed');
          setVerificationSent(true);
          setError(''); // Clear any previous errors
        } else {
          console.log('Signup successful, redirecting...');
          const destination = redirectTo ? decodeURIComponent(redirectTo) : createPageUrl('Dashboard');
          navigate(destination);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#F8F4EE] to-[#F2EDE7] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Link to={createPageUrl('Landing')} className="inline-flex items-center text-[#2F4F3F] hover:text-[#1F3F2F] mb-6 font-sacred">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="text-3xl font-sacred tracking-widest text-[#2F4F3F]">
              SACRED
            </div>
            <div>
              <CardTitle className="text-xl text-[#2F4F3F] font-sacred-bold">
                {redirectTo ? 'Complete Your Invite' : (isLogin ? 'Welcome Back' : 'Join SACRED')}
              </CardTitle>
              <CardDescription className="font-sacred text-[#6B5B73]">
                {redirectTo 
                  ? 'Sign in to access your partner\'s assessment invitation'
                  : (isLogin ? 'Sign in to continue your journey' : 'Create your account to get started')
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {verificationSent ? (
              <div className="text-center space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">
                      Check Your Email!
                    </h3>
                    <p className="text-[#6B5B73] font-sacred text-sm leading-relaxed">
                      We've sent a verification link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="bg-[#F5F1EB] p-4 rounded-lg text-left">
                  <h4 className="font-sacred-bold text-[#2F4F3F] text-sm mb-2">Next steps:</h4>
                  <ol className="text-sm text-[#6B5B73] font-sacred space-y-1 list-decimal list-inside">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>Return here to sign in with your new account</li>
                  </ol>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setVerificationSent(false);
                      setIsLogin(true);
                      setEmail('');
                      setPassword('');
                    }}
                    className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold py-6 rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I've Verified My Email
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setVerificationSent(false)}
                    className="text-[#C4756B] hover:text-[#B86761] font-sacred text-sm hover:underline"
                  >
                    Back to signup form
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2F4F3F] font-sacred">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@gmail.com"
                  inputMode="email"
                  autoComplete="email"
                  className="border-[#E6D7C9]/50 focus:border-[#C4756B] font-sacred"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2F4F3F] font-sacred">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="border-[#E6D7C9]/50 focus:border-[#C4756B] font-sacred pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B5B73] hover:text-[#2F4F3F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B5B73] font-sacred">
                      Password should be at least 6 characters
                    </p>
                    <p className="text-xs text-[#6B5B73] font-sacred">
                      Please use a real email address (not example.com)
                    </p>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-sacred">{error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold py-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-[#C4756B] hover:text-[#B86761] font-sacred text-sm hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
                </div>
              </form>

              <div className="text-center pt-4 border-t border-[#E6D7C9]/30">
                <p className="text-xs text-[#6B5B73] font-sacred">
                  By continuing, you agree to our{' '}
                  <Link to={createPageUrl('Terms')} className="text-[#C4756B] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to={createPageUrl('Privacy')} className="text-[#C4756B] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}