
import React, { useState, useEffect } from 'react';
import { Assessment, User } from '@/api/entities';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle, Clock, Lock, Users, AlertCircle, User as UserIcon, Heart } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getUserDisplayName } from '@/utils';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null); // Added new state
  const navigate = useNavigate();
  const location = useLocation();

  // Function to refresh assessment data
  const refreshAssessment = async () => {
    try {
      const currentUser = await User.me();
      if (assessment) {
        // Refetch the assessment to get updated status
        const refreshedAssessment = await Assessment.get(assessment.id);
        setAssessment(refreshedAssessment);
        console.log('✅ Assessment refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh assessment:', error);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Check for specific error messages from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          switch (errorParam) {
            case 'assessment_not_found':
              setLoadingError('The assessment you\'re trying to access could not be found. It may have been deleted or the link may be incorrect.');
              break;
            case 'assessment_unauthorized':
              setLoadingError('You are not authorized to access this assessment. Please make sure you\'re logged in with the correct email address.');
              break;
            case 'assessment_permission_denied':
              setLoadingError('Permission denied. This assessment belongs to another couple.');
              break;
            case 'invite_mismatch':
              setLoadingError('This invite link was sent to a different email address. Please log in with the correct account or contact your partner.');
              break;
            case 'assessment_load_failed':
              setLoadingError('Failed to load the assessment. This might be a temporary issue - please try again.');
              break;
            case 'onboarding_failed':
              setLoadingError('There was an error during the onboarding process. Please try again.');
              break;
            default:
              setLoadingError(`An error occurred: ${errorParam.replace(/_/g, ' ')}`);
          }
          
          // Clear error from URL
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
        let userAssessments = [];
        
        console.log('Searching for assessments for user:', currentUser.email);

        try {
          userAssessments = await Assessment.list();
          console.log('Found assessments:', userAssessments);
        } catch (error) {
          console.error('Error searching for assessments:', error);
          setLoadingError('Error searching for your assessments. Please try refreshing the page.');
        }

        setAssessments(userAssessments); // Now storing array of assessments
        
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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' };
      case 'archived':
        return { text: 'Archived', icon: Lock, color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' };
      default:
        return { text: 'In Progress', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' };
    }
  };

  // Partner name logic moved to centralized utility
  
  const getActions = (assessment) => {
    const actions = [];
    
    if (assessment.status === 'completed') {
        actions.push({ text: "View Report", url: createPageUrl(`Report?id=${assessment.id}`), primary: true });
        actions.push({ text: "Start Reflections", url: createPageUrl(`OpenEndedStart`), primary: false });
    } else if (assessment.status === 'in_progress') {
        actions.push({ text: "Continue Assessment", url: createPageUrl(`Assessment?id=${assessment.id}`), primary: true });
    } else if (assessment.status === 'archived') {
        actions.push({ text: "View Archived Results", url: createPageUrl(`Report?id=${assessment.id}`), primary: false });
    }
    
    return actions;
  }

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
  
  // Helper functions for multiple assessments
  const getPartner1Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner1');
  const getPartner2Assessment = () => assessments.find(a => a.metadata?.partnerRole === 'partner2');
  
  const partner1Assessment = getPartner1Assessment();
  const partner2Assessment = getPartner2Assessment();

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="text-4xl">👋</div>
              <div>
                <h1 className="text-3xl font-sacred-bold text-[#2F4F3F]">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {userDisplayName}!
                </h1>
                <p className="text-[#6B5B73] font-sacred">
                  {assessments.length > 0 ? "Here's your assessment progress" : "Welcome to your SACRED journey."}
                </p>
              </div>
            </div>
            <Link to={createPageUrl('Account')}>
              <Button variant="outline" className="border-[#2F4F3F] text-[#2F4F3F] hover:bg-[#2F4F3F] hover:text-white font-sacred">
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>

          {/* Show error state if there's a loading error */}
          {loadingError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                Assessment Loading Error
              </h2>
              <p className="text-[#6B5B73] font-sacred mb-8 max-w-md mx-auto">
                {loadingError}
              </p>
              <div className="space-x-4">
                <Button onClick={() => window.location.reload()} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred">
                  Refresh Page
                </Button>
                <Button onClick={() => navigate(createPageUrl('Onboarding'))} variant="outline" className="font-sacred">
                  Go to Onboarding
                </Button>
              </div>
            </div>
          )}

          {/* Show assessment dashboard if assessments exist and no loading error */}
          {assessments.length > 0 && !loadingError && (
            <>
              {/* Important Actions Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-sacred-bold text-[#2F4F3F]">
                    Important Actions ({getActions(assessment).filter(a => a.primary).length})
                  </h2>
                </div>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {getActions(assessment).map((action, index) => (
                      <Card key={index} className={`border-0 shadow-sm bg-white hover:shadow-md transition-all duration-200 ${action.primary ? 'ring-1 ring-[#C4756B]/20' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-8 rounded-full ${action.primary ? 'bg-[#C4756B]' : 'bg-[#7A9B8A]'}`}></div>
                              <div>
                                <h3 className="font-sacred-bold text-[#2F4F3F] text-lg">{action.text}</h3>
                                <p className="text-sm text-[#6B5B73] font-sacred">
                                  {action.primary ? 'Ready to continue' : 'Additional option'}
                                </p>
                              </div>
                            </div>
                            {action.url ? (
                              <Link to={action.url}>
                                <Button 
                                  className={action.primary ? 
                                    "bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred" : 
                                    "bg-gray-100 hover:bg-gray-200 text-[#2F4F3F] font-sacred"
                                  }
                                >
                                  {action.text}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            ) : (
                              <Button 
                                onClick={action.action}
                                className={action.primary ? 
                                  "bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred" : 
                                  "bg-gray-100 hover:bg-gray-200 text-[#2F4F3F] font-sacred"
                                }
                              >
                                {action.text}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Assessment Status and Next Steps in Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Your Journey Card */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#C4756B]/10 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[#C4756B]" />
                      </div>
                      <div>
                        <CardTitle className="font-sacred-bold text-[#2F4F3F]">
                          Your Journey
                        </CardTitle>
                        <CardDescription className="font-sacred text-[#6B5B73]">
                          Personal Sacred Assessment
                        </CardDescription>
                      </div>
                    </div>
                    {assessment && (
                      <div className={`px-3 py-2 rounded-full border ${statusInfo.bgColor} flex items-center gap-2 w-fit`}>
                        {React.createElement(statusInfo.icon, { 
                          className: `w-4 h-4 ${statusInfo.color}`,
                          'aria-label': `Status: ${statusInfo.text}`
                        })}
                        <span className={`text-sm font-medium ${statusInfo.color} font-sacred`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {assessment ? (
                      <div className="space-y-4">
                        <p className="text-sm text-[#6B5B73] font-sacred">
                          Started on {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                        </p>
                        
                        {/* Progress Information */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-gray-500" aria-hidden="true" />
                            <p className="text-sm font-medium text-gray-700 font-sacred">Progress</p>
                          </div>
                          <p className="text-sm text-gray-600 font-sacred">
                            {assessment.progress || 0}% complete ({assessment.assessment_responses?.length || 0} questions answered)
                          </p>
                        </div>

                        {assessment.status === 'completed' ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" aria-label="Completed" />
                              <p className="font-medium text-green-800 font-sacred">Assessment Complete!</p>
                            </div>
                            <p className="text-sm text-green-700 font-sacred">
                              You have completed your assessment. Your personal report is ready to view.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-amber-600" aria-label="In Progress" />
                              <p className="font-medium text-amber-800 font-sacred">In Progress</p>
                            </div>
                            <p className="text-sm text-amber-700 font-sacred">
                              Continue where you left off to complete your assessment.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-gray-500" aria-label="No Assessment" />
                          <p className="font-medium text-gray-700 font-sacred">No Assessment Available</p>
                        </div>
                        <p className="text-sm text-gray-600 font-sacred">
                          Complete onboarding to start your assessment journey.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sacred Reflections Card */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#7A9B8A]" />
                      </div>
                      <div>
                        <CardTitle className="font-sacred-bold text-[#2F4F3F]">
                          Sacred Reflections
                        </CardTitle>
                        <CardDescription className="font-sacred text-[#6B5B73]">
                          Deep, meaningful conversations
                        </CardDescription>
                      </div>
                    </div>
                    {assessment.status !== 'completed' && (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 font-sacred">Available after assessment</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {assessment.status === 'completed' ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#F5F1EB]/50 rounded-lg">
                          <p className="text-sm text-[#6B5B73] font-sacred mb-2">Ready for deeper connection:</p>
                          <ul className="text-sm text-[#2F4F3F] font-sacred space-y-1">
                            <li>• 13 thoughtful reflection questions</li>
                            <li>• Designed for intimate conversation</li>
                            <li>• Explore the sacred nature of intimacy</li>
                          </ul>
                        </div>
                        <Link to={createPageUrl('OpenEndedStart')}>
                          <Button className="w-full bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white font-sacred-bold">
                            Start Sacred Reflections <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-500 font-sacred">Complete Assessment First</p>
                        </div>
                        <p className="text-sm text-gray-500 font-sacred">
                          Sacred Reflections will be available once you and your partner complete the expectations alignment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Show no assessment state only if no error and no assessments found */}
          {assessments.length === 0 && !loadingError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-[#C4756B]" />
              </div>
              <h2 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">
                No Assessment Found
              </h2>
              <p className="text-[#6B5B73] font-sacred mb-8 max-w-md mx-auto">
                It looks like you haven't started an assessment yet, or there was an issue loading it. You may need to complete the onboarding process.
              </p>
              <Button onClick={() => navigate(createPageUrl('Onboarding'))} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred">
                Go to Onboarding
              </Button>
            </div>
          )}
        </div>
      </div>

    </AuthWrapper>
  );
}
