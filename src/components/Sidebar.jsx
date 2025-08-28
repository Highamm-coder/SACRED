import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Assessment, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Users, Heart, CheckCircle, ArrowRight, Lock, User as UserIcon, Menu, X } from 'lucide-react';

export default function Sidebar({ user, isLoading, mobileMenuOpen, setMobileMenuOpen }) {
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const location = useLocation();


  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  useEffect(() => {
    const loadAssessments = async () => {
      if (!user || !user.onboarding_completed) {
        setAssessmentsLoading(false);
        return;
      }

      try {
        const userAssessments = await Assessment.list();
        setAssessments(userAssessments);
      } catch (error) {
        console.error('Error loading assessments for sidebar:', error);
      } finally {
        setAssessmentsLoading(false);
      }
    };

    loadAssessments();
  }, [user]);

  // Helper functions for multiple assessments
  const getPartner1Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner1');
  const getPartner2Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner2');
  
  const partner1Assessment = getPartner1Assessment();
  const partner2Assessment = getPartner2Assessment();

  // Determine user's display name
  const userDisplayName = user?.full_name?.split(' ')[0] || 'Friend';

  // Don't show sidebar if we're still loading auth or user isn't paid
  if (isLoading) {
    return null; // Still loading auth state
  }
  
  if (!user || !user.has_paid) {
    return null; // User not authenticated or not paid
  }

  const isActivePage = (pageName) => {
    const currentPath = location.pathname;
    return currentPath.includes(pageName.toLowerCase());
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[9999]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked, current state:', mobileMenuOpen);
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="flex items-center justify-center w-12 h-12 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95"
          style={{ zIndex: 9999 }}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-[#2F4F3F]" />
          ) : (
            <Menu className="w-6 h-6 text-[#2F4F3F]" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-[9998]" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        mobile-sidebar
        fixed
        top-0 left-0
        w-[280px] h-screen
        bg-white border-r border-[#E6D7C9]
        flex flex-col
        z-[9999]
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:w-[280px] lg:flex-shrink-0 lg:h-screen
        lg:z-auto
        shadow-lg lg:shadow-none
      `}>
      <div className="p-4 sm:p-6 border-b border-[#E6D7C9]">
        <Link to={createPageUrl('Dashboard')} className="flex items-center touch-manipulation">
          <h2 className="text-2xl font-sacred tracking-widest text-[#2F4F3F]">SACRED</h2>
        </Link>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {/* Main Navigation */}
          <Link
            to={createPageUrl('Dashboard')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
              isActivePage('Dashboard') 
                ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          {partner1Assessment?.status === 'completed' && partner2Assessment?.status === 'completed' ? (
            <Link 
              to={createPageUrl(`Report?p1=${partner1Assessment.id}&p2=${partner2Assessment.id}`)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
                isActivePage('Report') && location.search.includes('p1=')
                  ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Alignment Report</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-3 py-3 text-gray-400 rounded-lg font-sacred">
              <CheckCircle className="w-5 h-5" />
              <span>Alignment Report</span>
              <Lock className="w-4 h-4 ml-auto" />
            </div>
          )}
          
          <Link 
            to={createPageUrl('OpenEndedStart')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
              isActivePage('OpenEndedStart')
                ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Reflections</span>
          </Link>
          
          <Link 
            to={createPageUrl('Education')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
              isActivePage('Education')
                ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Education</span>
          </Link>
          
          <Link 
            to={createPageUrl('Shop')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
              isActivePage('Shop')
                ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Shop</span>
          </Link>
          
          <Link 
            to={createPageUrl('Account')} 
            className={`flex items-center gap-3 px-3 py-3 rounded-lg font-sacred transition-colors touch-manipulation ${
              isActivePage('Account')
                ? 'bg-[#C4756B]/10 text-[#C4756B]' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 border-t border-[#E6D7C9] flex-shrink-0">
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              await User.signOut();
              window.location.href = createPageUrl('Home');
            } catch (error) {
              console.error('Error during logout:', error);
              // Still try to redirect even if logout fails
              window.location.href = createPageUrl('Home');
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-sacred transition-colors touch-manipulation group"
        >
          <svg className="w-5 h-5 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
    </>
  );
}