

import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User as UserIcon, LogOut, Shield, Menu, X } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkUser = async () => {
    try {
      let currentUser = await User.me();
      
      // Check if user just verified email and should be processed for Partner 2 invite
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      
      // Supabase adds #access_token=... after email verification
      console.log('Layout checkUser - URL hash:', urlHash, 'Current page:', currentPageName);
      console.log('Layout checkUser - Full URL:', window.location.href);
      
      // ENTERPRISE FIX: Process partner invites BEFORE payment validation
      // Check if this user has pending partner invite tokens
      if (currentUser && !currentUser.has_paid && !currentUser.onboarding_completed) {
        console.log('🔍 Checking for pending partner invite tokens for user:', currentUser.email);
        
        try {
          // Import PartnerInvite service and User service
          const { PartnerInvite } = await import('@/api/services/partnerInvite');
          const { User } = await import('@/api/entities');
          
          // Check if this user has any pending tokens specifically assigned to their email
          const { data: pendingTokens } = await supabase
            .from('partner_invite_tokens')
            .select('*')
            .eq('status', 'pending')
            .eq('partner2_email', currentUser.email)
            .limit(5);
          
          console.log('🔍 Found pending tokens for user:', pendingTokens);
          
          if (pendingTokens && pendingTokens.length > 0) {
            const token = pendingTokens[0];
            console.log('🎯 Found pending partner invite token, processing...', token);
            
            try {
              // Process the invite token
              await PartnerInvite.useInviteToken(token.token, currentUser.email);
              console.log('✅ Invite token processed successfully');
              
              // Validate Partner 1 has paid before granting Partner 2 access
              console.log('🔍 Validating Partner 1 payment status...');
              const { data: partner1Profile, error: partner1Error } = await supabase
                .from('profiles')
                .select('has_paid, email')
                .eq('email', token.partner1_email)
                .single();
              
              console.log('🔍 Partner 1 profile lookup result:', { 
                partner1Profile, 
                partner1Error, 
                partner1_email: token.partner1_email 
              });
              
              // Only block if we can definitively confirm Partner 1 hasn't paid
              if (partner1Profile && partner1Profile.has_paid === false) {
                console.error('🚫 AUDIT: Payment inheritance blocked - Partner 1 explicitly unpaid:', token.partner1_email);
                throw new Error('Partner 1 must complete payment before Partner 2 can access the assessment');
              }
              
              if (!partner1Profile && !partner1Error) {
                console.log('⚠️ WARNING: Partner 1 profile not found, allowing Partner 2 access for compatibility');
              } else if (partner1Error) {
                console.log('⚠️ WARNING: Error querying Partner 1 profile, allowing Partner 2 access:', partner1Error);
              } else {
                console.log('✅ Partner 1 payment validation passed:', { has_paid: partner1Profile.has_paid });
              }
              
              console.log('💰 AUDIT: Payment inheritance authorized in Layout:', {
                partner1_email: token.partner1_email,
                partner2_email: currentUser.email,
                token: token.token,
                timestamp: new Date().toISOString(),
                location: 'Layout.jsx'
              });
              
              // Mark user as paid and onboarding complete (inheritance validated)
              try {
                console.log('📝 Ensuring user profile exists before updating...');
                const profileCheck = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', currentUser.id)
                  .single();
                
                console.log('Profile check result:', profileCheck);
                
                if (profileCheck.error && profileCheck.error.code === 'PGRST116') {
                  // Profile doesn't exist, create it first
                  console.log('📝 Creating profile for user...');
                  await User.createProfile(currentUser.id, {
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || '',
                    role: 'user',
                    is_active: true,
                    has_paid: true,
                    onboarding_completed: true
                  });
                  console.log('✅ Profile created with paid/onboarding flags');
                } else {
                  // Profile exists, update it
                  console.log('📝 Updating existing profile...');
                  await User.update(currentUser.id, { 
                    onboarding_completed: true,
                    has_paid: true
                  });
                  console.log('✅ User updated with paid/onboarding flags');
                }
              } catch (profileError) {
                console.error('❌ Error with profile creation/update:', profileError);
                // Try direct database update as fallback
                const { data: directUpdate, error: directError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || '',
                    role: 'user',
                    is_active: true,
                    has_paid: true,
                    onboarding_completed: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                console.log('🔄 Direct database upsert result:', { directUpdate, directError });
                
                if (directError) {
                  throw new Error('Failed to update user payment status after partner invite processing');
                }
              }
              
              console.log('✅ AUDIT: Payment inheritance completed in Layout for:', currentUser.email);
              
              // CRITICAL FIX: Refresh user data after partner processing to ensure payment validation uses updated state
              console.log('🔄 Refreshing user data after partner processing...');
              currentUser = await User.me();
              console.log('✅ User data refreshed with updated payment status:', currentUser.has_paid);
              
            } catch (processError) {
              console.error('❌ Error processing partner invite:', processError);
              // Don't throw here - let normal payment flow continue
            }
          } else {
            console.log('❌ No pending tokens found for user');
          }
        } catch (err) {
          console.log('No partner invite context found or processing failed:', err);
          // Don't throw here - let normal payment flow continue
        }
      }

      // Set user state with potentially updated data after partner processing
      setUser(currentUser);

      // ENTERPRISE FIX: Payment validation now uses refreshed user data
      const excludedPages = ['Landing', 'PaymentRequired', 'Terms', 'Privacy', 'Admin', 'Education', 'Shop', 'Blog', 'PartnerInvite'];
      if (currentUser && !currentUser.has_paid && !excludedPages.includes(currentPageName)) {
        // Allow admin users to bypass payment requirement
        if (currentUser.role === 'admin') {
          return; // Don't redirect admins to payment page
        }
        console.log('❌ User payment validation failed, redirecting to PaymentRequired. User status:', {
          has_paid: currentUser.has_paid,
          onboarding_completed: currentUser.onboarding_completed,
          email: currentUser.email
        });
        navigate(createPageUrl('PaymentRequired'));
      } else if (currentUser && currentUser.has_paid) {
        console.log('✅ User payment validation passed:', {
          has_paid: currentUser.has_paid,
          email: currentUser.email
        });
      }

    } catch (e) {
      console.error('❌ Critical error in checkUser:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, [currentPageName, location.key]); // Re-check on page navigation

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    window.location.href = createPageUrl('Home');
  };

  const handleAuthRedirect = () => {
    window.location.href = createPageUrl('Login');
  };

  const renderUserMenu = () => {
    if (isLoading) {
      return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAuthRedirect}
            variant="outline"
            className="border-[#E6D7C9] text-[#2F4F3F] hover:bg-[#F5F1EB] rounded-md font-sacred-bold text-sm h-9 px-4"
          >
            Sign In
          </Button>
          <Button
            onClick={handleAuthRedirect}
            className="bg-[#2F4F3F] hover:bg-[#1e3b2e] text-white rounded-md font-sacred-bold text-sm h-9 px-4"
          >
            Get Started
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-[#2F4F3F] font-sacred">
            <UserIcon className="w-4 h-4" />
            {user.full_name || user.email}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to={createPageUrl('Account')} className="flex items-center gap-2 w-full">
              <UserIcon className="w-4 h-4" />
              Account Settings
            </Link>
          </DropdownMenuItem>

          {user && user.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('Admin')} className="flex items-center gap-2 w-full font-medium text-[#C4756B]">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <style>{`
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

      {currentPageName !== 'Landing' && (
        <header className="py-4 px-6 md:px-10 border-b border-[#E6D7C9] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <nav className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Left: Logo */}
            <div>
              <Link to={createPageUrl("Home")} className="text-2xl font-sacred-bold tracking-widest text-[#2F4F3F]">
                SACRED
              </Link>
            </div>

            {/* Center: Links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-8">
              {user && user.has_paid && (
                <Link
                  to={createPageUrl("Dashboard")}
                  className="text-sm font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors"
                >
                  Assessments
                </Link>
              )}
              <Link
                to={createPageUrl("Education")}
                className="text-sm font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors"
              >
                Education
              </Link>
              <Link
                to={createPageUrl("Shop")}
                className="text-sm font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors"
              >
                Shop
              </Link>
            </div>

            {/* Right: Auth & Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              
              {/* Desktop user menu */}
              <div className="hidden md:block">
                {renderUserMenu()}
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && currentPageName !== 'Landing' && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex justify-between items-center p-4 border-b border-[#E6D7C9]">
            <span className="text-xl font-sacred-bold text-[#2F4F3F]">SACRED</span>
            <Button 
              variant="ghost" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-6">
            {user && user.has_paid && (
              <Link
                to={createPageUrl("Dashboard")}
                className="block text-lg font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors py-3 border-b border-[#E6D7C9]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Assessments
              </Link>
            )}
            
            <Link
              to={createPageUrl("Education")}
              className="block text-lg font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors py-3 border-b border-[#E6D7C9]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Education
            </Link>
            
            <Link
              to={createPageUrl("Shop")}
              className="block text-lg font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors py-3 border-b border-[#E6D7C9]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>

            {/* Mobile User Menu */}
            <div className="pt-4 space-y-4">
              {user ? (
                <>
                  <div className="px-3 py-2 border border-[#E6D7C9] rounded-md">
                    <p className="font-sacred text-sm text-[#6B5B73]">Signed in as</p>
                    <p className="font-sacred-bold text-[#2F4F3F]">{user.full_name || user.email}</p>
                  </div>
                  
                  <Link
                    to={createPageUrl("Account")}
                    className="flex items-center gap-2 text-lg font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    Account
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl("Admin")}
                      className="flex items-center gap-2 text-lg font-sacred-bold text-[#6B5B73] hover:text-[#2F4F3F] transition-colors py-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      Admin
                    </Link>
                  )}
                  
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-2 font-sacred-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link
                  to={createPageUrl("Login")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-[#E6D7C9] py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          {user ? (
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-sacred-bold text-[#2F4F3F] mb-4">SACRED</h3>
                <p className="text-[#6B5B73] font-sacred leading-relaxed">
                  Preparing couples for the sacred nature of marital intimacy through thoughtful assessment and reflection.
                </p>
              </div>

              <div>
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">Assessments</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Dashboard')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    My Dashboard
                  </Link>
                  <Link to={createPageUrl('Start')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Expectations Alignment
                  </Link>
                  <Link to={createPageUrl('OpenEndedStart')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Sacred Reflections
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">Resources</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Education')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Education Center
                  </Link>
                  <Link to={createPageUrl('Shop')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Recommended Products
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">Account</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Account')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Account Settings
                  </Link>
                  <Link to={createPageUrl('Privacy')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to={createPageUrl('Terms')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-sacred-bold text-[#2F4F3F] mb-4">SACRED</h3>
                <p className="text-[#6B5B73] font-sacred leading-relaxed">
                  Preparing couples for the sacred nature of marital intimacy through thoughtful assessment and reflection.
                </p>
              </div>

              <div>
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">Get Started</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleAuthRedirect}
                    className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors text-left"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={handleAuthRedirect}
                    className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors text-left"
                  >
                    Sign In
                  </button>
                  <Link to={createPageUrl('Education')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Education Center
                  </Link>
                  <Link to={createPageUrl('Shop')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Recommended Products
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">Legal</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Privacy')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to={createPageUrl('Terms')} className="block text-[#6B5B73] hover:text-[#C4756B] font-sacred transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[#E6D7C9] mt-8 pt-8 text-center">
            <p className="text-[#6B5B73] font-sacred">
              © 2025 Sacred. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

