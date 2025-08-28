import React, { useState, useEffect } from 'react';
import { Assessment, User } from '@/api/entities';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle, Clock, Lock, Users, AlertCircle, User as UserIcon, Heart } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Check for specific error messages from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          setLoadingError(`An error occurred: ${errorParam.replace(/_/g, ' ')}`);
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('error');
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
          return;
        }
        
        // Paywall check
        if (!currentUser.has_paid) {
            navigate(createPageUrl('PaymentRequired'));
            return;
        }

        // Check if user has completed onboarding
        if (!currentUser.onboarding_completed) {
          navigate(createPageUrl('Onboarding'));
          return;
        }

        // Get all user's assessments (parallel assessment system)
        try {
          const userAssessments = await Assessment.list();
          console.log('Found assessments:', userAssessments);
          setAssessments(userAssessments);
        } catch (error) {
          console.error('Error searching for assessments:', error);
          setLoadingError('Error searching for your assessments. Please try refreshing the page.');
        }

        // Clean up URL parameters
        window.history.replaceState({}, '', createPageUrl('Dashboard'));
        
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setLoadingError(`Authentication or data loading error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [navigate, location.search]);

  // Helper functions for multiple assessments
  const getPartner1Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner1');
  const getPartner2Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner2');
  
  const partner1Assessment = getPartner1Assessment();
  const partner2Assessment = getPartner2Assessment();

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
        </div>
      </AuthWrapper>
    );
  }

  // Determine user's display name
  const userDisplayName = user?.full_name?.split(' ')[0] || 'Friend';

  return (
    <AuthWrapper requireAuth={true}>
      <div>
        {/* Hero Section */}
        <div className="relative min-h-[50vh] sm:min-h-[60vh] lg:h-96 bg-gradient-to-r from-[#C4756B] to-[#7A9B8A] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[url('/Header.jpg')] bg-cover bg-center opacity-80"></div>
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Profile Links - Top Right */}
          <div className="absolute top-4 right-4 z-20 hidden lg:block">
            <Link 
              to={createPageUrl('Account')} 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/90 hover:bg-white/20 hover:text-white font-sacred text-sm transition-all duration-200 touch-manipulation"
            >
              <UserIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start pt-20 sm:pt-16 lg:pt-0">
            <div className="text-left text-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-full sm:max-w-2xl lg:max-w-4xl w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sacred-bold mb-4 sm:mb-6 lg:mb-8 drop-shadow-2xl leading-tight">
                {partner1Assessment && partner2Assessment ? (
                  <>
                    {partner1Assessment?.metadata?.partnerName || userDisplayName} & {partner2Assessment?.metadata?.partnerName || 'Your Partner'}'s
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>Sacred Journey
                  </>
                ) : (
                  <>
                    Welcome {userDisplayName},
                    <br className="hidden sm:block" />
                    <span className="sm:hidden"> </span>Begin Your Sacred Journey
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-sacred opacity-95 drop-shadow-lg leading-relaxed mb-6 sm:mb-8 lg:mb-10 max-w-lg sm:max-w-xl lg:max-w-2xl">
                {partner1Assessment && partner2Assessment ? (
                  "Explore your compatibility and deepen your connection through thoughtful assessment, reflection, and meaningful conversation"
                ) : (
                  "Prepare for the sacred nature of marital intimacy through thoughtful assessment, deep reflection, and meaningful conversation"
                )}
              </p>
              
              {/* Report Button in Hero - White Pill Style */}
              {assessments.length > 0 && !loadingError && (
                <div className="mt-2 sm:mt-4 lg:mt-6">
                  {partner1Assessment?.status === 'completed' && partner2Assessment?.status === 'completed' ? (
                    <Link to={createPageUrl(`Report?p1=${partner1Assessment.id}&p2=${partner2Assessment.id}`)}>
                      <button className="inline-flex items-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 text-[#2F4F3F] font-sacred-bold px-5 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-sm lg:text-base touch-manipulation min-h-[48px] sm:min-h-[44px]">
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap">View Alignment Report</span>
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                      </button>
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/20 text-white/90 font-sacred-bold px-5 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 rounded-full border-2 border-dashed border-white/40 text-sm sm:text-sm lg:text-base min-h-[48px] sm:min-h-[44px]">
                      <Clock className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                      <span className="text-center leading-tight">Complete both assessments to generate report</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">

          {/* Show error state if there's a loading error */}
          {loadingError && (
            <div className="text-center py-6 sm:py-8 lg:py-12 px-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                Assessment Loading Error
              </h2>
              <p className="text-[#6B5B73] font-sacred mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                {loadingError}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                <Button onClick={() => window.location.reload()} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred h-12 px-6 text-base touch-manipulation">
                  Refresh Page
                </Button>
                <Button onClick={() => navigate(createPageUrl('Onboarding'))} variant="outline" className="font-sacred h-12 px-6 text-base touch-manipulation">
                  Go to Onboarding
                </Button>
              </div>
            </div>
          )}

            {/* Show assessment dashboard if assessments exist and no loading error */}
            {assessments.length > 0 && !loadingError && (
              <>

                {/* Assessment Feature Cards */}
                <div className="space-y-4 sm:space-y-6 mb-8">
                  <h3 className="text-xs sm:text-sm font-sacred text-gray-500 uppercase tracking-wider px-2">ALIGNMENTS AND REFLECTIONS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Partner 1 Assessment Card */}
                    {partner1Assessment ? (
                      <Link to={createPageUrl(`Assessment?id=${partner1Assessment.id}`)} className="block">
                        <div className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] xl:h-48 bg-gradient-to-br from-[#C4756B] to-[#B86761] rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation active:scale-[0.98]">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                            <div className="flex items-start sm:items-center gap-2 mb-2 flex-col sm:flex-row">
                              <div className="flex items-center gap-2 flex-1">
                                <h3 className="text-white font-sacred-bold text-sm sm:text-base lg:text-lg leading-tight">
                                  {partner1Assessment?.metadata?.partnerName || partner1Assessment?.metadata?.partner1Name || 'Partner 1'} Assessment
                                </h3>
                              </div>
                              <div className="mt-2 sm:mt-0 sm:ml-auto">
                                <div className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 bg-white/20 group-hover:bg-white/30 text-white rounded-lg transition-colors min-h-[44px] sm:min-h-[32px]">
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <p className="text-white/90 text-xs sm:text-sm font-sacred mb-2 sm:mb-3">
                              {partner1Assessment ? `${partner1Assessment.progress || 0}% Complete` : 'Start your personal assessment journey'}
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5">
                              <div 
                                className="bg-white h-1 sm:h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${partner1Assessment.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] xl:h-48 bg-gradient-to-br from-[#C4756B] to-[#B86761] rounded-xl overflow-hidden opacity-60">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                          <h3 className="text-white font-sacred-bold text-sm sm:text-base lg:text-lg leading-tight mb-2">
                            Partner 1 Assessment
                          </h3>
                          <p className="text-white/90 text-xs sm:text-sm font-sacred">
                            Complete onboarding to start
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Partner 2 Assessment Card */}
                    {partner2Assessment ? (
                      <Link to={createPageUrl(`Assessment?id=${partner2Assessment.id}`)} className="block">
                        <div className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] xl:h-48 bg-gradient-to-br from-[#7A9B8A] to-[#6B8B7A] rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation active:scale-[0.98]">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                            <div className="flex items-start sm:items-center gap-2 mb-2 flex-col sm:flex-row">
                              <div className="flex items-center gap-2 flex-1">
                                <h3 className="text-white font-sacred-bold text-sm sm:text-base lg:text-lg leading-tight">
                                  {partner2Assessment?.metadata?.partnerName || partner2Assessment?.metadata?.partner2Name || 'Partner 2'} Assessment
                                </h3>
                              </div>
                              <div className="mt-2 sm:mt-0 sm:ml-auto">
                                <div className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 bg-white/20 group-hover:bg-white/30 text-white rounded-lg transition-colors min-h-[44px] sm:min-h-[32px]">
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            <p className="text-white/90 text-xs sm:text-sm font-sacred mb-2 sm:mb-3">
                              {partner2Assessment ? `${partner2Assessment.progress || 0}% Complete` : 'Capture your partner\'s perspective'}
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5">
                              <div 
                                className="bg-white h-1 sm:h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${partner2Assessment.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] xl:h-48 bg-gradient-to-br from-[#7A9B8A] to-[#6B8B7A] rounded-xl overflow-hidden opacity-60">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                          <h3 className="text-white font-sacred-bold text-sm sm:text-base lg:text-lg leading-tight mb-2">
                            Partner 2 Assessment
                          </h3>
                          <p className="text-white/90 text-xs sm:text-sm font-sacred">
                            Complete onboarding to start
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sacred Reflections Card */}
                    <Link to={createPageUrl('OpenEndedStart')} className="block">
                      <div className="relative min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] xl:h-48 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation active:scale-[0.98]">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                          <div className="flex items-start sm:items-center gap-2 mb-2 flex-col sm:flex-row">
                            <div className="flex items-center gap-2 flex-1">
                              <h3 className="text-white font-sacred-bold text-sm sm:text-base lg:text-lg leading-tight">Sacred Reflections</h3>
                            </div>
                            <div className="mt-2 sm:mt-0 sm:ml-auto">
                              <div className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 bg-white/20 group-hover:bg-white/30 text-white rounded-lg transition-colors min-h-[44px] sm:min-h-[32px]">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          <p className="text-white/90 text-xs sm:text-sm font-sacred">
                            13 thoughtful questions for deeper connection
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

              </>
            )}

            {/* Show no assessment state only if no error and no assessments found */}
            {assessments.length === 0 && !loadingError && (
              <div className="text-center py-6 sm:py-8 lg:py-12 px-4">
                <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-[#C4756B]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                  No Assessment Found
                </h2>
                <p className="text-[#6B5B73] font-sacred mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  It looks like you haven't started an assessment yet, or there was an issue loading it. You may need to complete the onboarding process.
                </p>
                <Button onClick={() => navigate(createPageUrl('Onboarding'))} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred h-12 px-6 text-base touch-manipulation">
                  Go to Onboarding
                </Button>
              </div>
            )}
        </div>
      </div>

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
    </AuthWrapper>
  );
}