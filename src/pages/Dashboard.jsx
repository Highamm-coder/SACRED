import React, { useState, useEffect } from 'react';
import { Assessment, User, assessmentService } from '@/api/entities';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, CheckCircle, AlertCircle, User as UserIcon } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';

function AssessmentCard({ assessment, name, color, to }) {
  const progress = assessment?.progress || 0;

  return (
    <Link to={to} className="block group">
      <div
        className="relative rounded-3xl overflow-hidden flex flex-col justify-between p-7 md:p-8 cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ background: color, minHeight: '280px' }}
      >
        {/* Top — name + phase */}
        <div>
          <h3 className="font-sacred-medium text-white leading-[1.05]" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)' }}>
            {name}<br />Assessment
          </h3>
        </div>

        {/* Bottom — progress + arrow */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <span className="text-3xl font-sacred-bold text-white/90">{progress}%</span>
            <span className="text-xs font-sacred-bold text-white/40 tracking-[0.18em] uppercase">Complete</span>
          </div>
          <div className="w-full h-px bg-white/20 mb-5" />
          <div className="flex justify-end">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <ArrowRight className="w-4 h-4" style={{ color }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderCard({ label, color }) {
  return (
    <div
      className="relative rounded-3xl flex flex-col justify-between p-7 md:p-8 opacity-40"
      style={{ background: color, minHeight: '280px' }}
    >
      <div>
        <h3 className="font-sacred-medium text-white leading-[1.05] mb-3" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)' }}>
          {label}<br />Assessment
        </h3>
        <p className="text-white/50 font-sacred-bold text-xs tracking-[0.2em] uppercase">Not started</p>
      </div>
      <div>
        <div className="flex items-end justify-between mb-3">
          <span className="text-3xl font-sacred-bold text-white/90">0%</span>
          <span className="text-xs font-sacred-bold text-white/40 tracking-[0.18em] uppercase">Complete</span>
        </div>
        <div className="w-full h-px bg-white/20 mb-5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [reflectionsEnabled, setReflectionsEnabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const urlParams = new URLSearchParams(location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
          setLoadingError(`An error occurred: ${errorParam.replace(/_/g, ' ')}`);
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('error');
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
          return;
        }

        if (!currentUser.has_paid) {
          navigate(createPageUrl('PaymentRequired'));
          return;
        }
        if (!currentUser.onboarding_completed) {
          navigate(createPageUrl('Onboarding'));
          return;
        }

        try {
          const config = await assessmentService.getConfig('reflections_enabled');
          setReflectionsEnabled(config?.config_value === true || config?.config_value === 'true');
        } catch {
          setReflectionsEnabled(false);
        }

        try {
          const userAssessments = await Assessment.list();
          setAssessments(userAssessments);
        } catch (error) {
          setLoadingError('Error loading your assessments. Please try refreshing.');
        }

        window.history.replaceState({}, '', createPageUrl('Dashboard'));
      } catch (error) {
        setLoadingError(`Authentication error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [navigate, location.search]);

  const partner1Assessment = assessments.find(a => a.metadata?.partnerRole === 'partner1');
  const partner2Assessment = assessments.find(a => a.metadata?.partnerRole === 'partner2');
  const bothComplete = partner1Assessment?.status === 'completed' && partner2Assessment?.status === 'completed';

  const p1Name = partner1Assessment?.metadata?.partnerName || partner1Assessment?.metadata?.partner1Name || 'Partner 1';
  const p2Name = partner2Assessment?.metadata?.partnerName || partner2Assessment?.metadata?.partner2Name || 'Partner 2';
  const userDisplayName = user?.full_name?.split(' ')[0] || 'Friend';

  const journeyTitle = partner1Assessment && partner2Assessment
    ? `${p1Name} & ${p2Name}'s Sacred Journey`
    : `${userDisplayName}'s Sacred Journey`;

  if (isLoading) {
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
      <div className="min-h-screen bg-[#F5F1EB]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
          .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0; }
          .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 600; letter-spacing: 0; }
          .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0; }
        `}</style>

        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">

          {/* Error state */}
          {loadingError && (
            <div className="text-center py-16">
              <AlertCircle className="w-10 h-10 text-[#C4756B] mx-auto mb-4" />
              <h2 className="text-2xl font-sacred-medium text-[#2F4F3F] mb-3">Something went wrong</h2>
              <p className="text-[#6B5B73] font-sacred mb-6 max-w-md mx-auto">{loadingError}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-6">Refresh</Button>
                <Button onClick={() => navigate(createPageUrl('Onboarding'))} variant="outline" className="font-sacred-bold rounded-full px-6">Onboarding</Button>
              </div>
            </div>
          )}

          {!loadingError && (
            <>
              {/* Hero text */}
              <div className="mb-12 md:mb-16">
                <h1
                  className="font-sacred-medium italic text-[#2F4F3F] leading-[1.05] mb-5"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
                >
                  {journeyTitle}
                </h1>
                <p className="text-[#6B5B73] font-sacred text-lg leading-relaxed mb-8 max-w-2xl">
                  Explore your compatibility and deepen your connection through thoughtful assessment, reflection, and meaningful conversation.
                </p>

                {/* Status CTA */}
                {assessments.length > 0 && (
                  bothComplete ? (
                    <Link to={createPageUrl(`Report?p1=${partner1Assessment.id}&p2=${partner2Assessment.id}`)}>
                      <button className="inline-flex items-center gap-3 bg-[#2F4F3F] text-white font-sacred-bold px-7 py-3 rounded-full text-sm hover:bg-[#243D30] transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        View Alignment Report
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  ) : (
                    <button className="inline-flex items-center gap-3 border border-[#2F4F3F]/25 text-[#2F4F3F] font-sacred px-7 py-3 rounded-full text-sm hover:bg-[#2F4F3F]/5 transition-colors">
                      Complete both assessments to generate report
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>

              {/* Section label */}
              {assessments.length > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-[#2F4F3F]/15" />
                    <span className="text-xs font-sacred-bold text-[#2F4F3F]/40 tracking-[0.2em] uppercase flex-shrink-0">
                      Alignments and Reflections
                    </span>
                    <div className="flex-1 h-px bg-[#2F4F3F]/15" />
                  </div>

                  {/* Assessment cards */}
                  <div className={`grid gap-5 ${reflectionsEnabled ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                    {partner1Assessment ? (
                      <AssessmentCard
                        assessment={partner1Assessment}
                        name={p1Name}
                        subtitle=""
                        color="#2B3D32"
                        to={createPageUrl(`Assessment?id=${partner1Assessment.id}`)}
                      />
                    ) : (
                      <PlaceholderCard label="Partner 1" color="#2B3D32" />
                    )}

                    {partner2Assessment ? (
                      <AssessmentCard
                        assessment={partner2Assessment}
                        name={p2Name}
                        subtitle=""
                        color="#7A5E63"
                        to={createPageUrl(`Assessment?id=${partner2Assessment.id}`)}
                      />
                    ) : (
                      <PlaceholderCard label="Partner 2" color="#7A5E63" />
                    )}

                    {reflectionsEnabled && (
                      <AssessmentCard
                        assessment={null}
                        name="Sacred"
                        subtitle=""
                        color="#6B5B7A"
                        to={createPageUrl('OpenEndedStart')}
                      />
                    )}
                  </div>
                </>
              )}

              {/* No assessments */}
              {assessments.length === 0 && (
                <div className="text-center py-16">
                  <AlertCircle className="w-10 h-10 text-[#C4756B] mx-auto mb-4" />
                  <h2 className="text-2xl font-sacred-medium text-[#2F4F3F] mb-3">No Assessment Found</h2>
                  <p className="text-[#6B5B73] font-sacred mb-6 max-w-md mx-auto leading-relaxed">
                    It looks like you haven't started an assessment yet. Complete the onboarding process to get started.
                  </p>
                  <Button onClick={() => navigate(createPageUrl('Onboarding'))} className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-7">
                    Go to Onboarding
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
