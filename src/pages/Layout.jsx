

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
import Sidebar from '@/components/Sidebar';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const checkUser = async () => {
    try {
      let currentUser = await User.me();
      
      // Check if user just verified email and should be processed for Partner 2 invite
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = window.location.hash;
      
      // Supabase adds #access_token=... after email verification
      console.log('Layout checkUser - URL hash:', urlHash, 'Current page:', currentPageName);
      console.log('Layout checkUser - Full URL:', window.location.href);
      
      // SINGLE ACCOUNT SYSTEM: No partner invite processing needed
      // Users now own their individual assessments directly

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
    await User.signOut();
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
    <div className="min-h-screen bg-gray-50">
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

      {/* Sidebar - Only show for authenticated paid users */}
      <Sidebar 
        user={user}
        isLoading={isLoading}
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area - Properly aligned with sidebar */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        user && user.has_paid 
          ? 'lg:ml-[280px]' // Account for fixed sidebar width on desktop
          : ''
      }`}>
        <main className="flex-1">
          {children}
        </main>

        {/* Footer - Now properly aligned with content area */}
        <footer className="bg-white border-t border-[#E6D7C9] py-12 px-6 md:px-10 mt-auto relative z-10">
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
    </div>
  );
}

