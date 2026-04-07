import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Question, Assessment, User } from '@/api/entities';
import { createPageUrl, getUserDisplayName } from '@/utils';
import { Loader2, Download, Heart, ArrowLeft, User as UserIcon, CheckCircle, ArrowRight, Clock, TrendingUp, Target, BookOpen, Users, Star, BarChart3, PieChart, Activity, Grid3X3, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadialBarChart, RadialBar } from 'recharts';
import AuthWrapper from '../components/auth/AuthWrapper';

// Question options in the DB can be objects like {tip_text, question_text}.
// These helpers safely extract a display string from whatever shape we receive.
const getQuestionText = (q) => {
  if (!q) return '';
  const raw = q.question_text ?? q.text ?? '';
  if (typeof raw === 'object' && raw !== null) {
    return raw.question_text ?? raw.text ?? JSON.stringify(raw);
  }
  return String(raw);
};

const getResponseText = (response) => {
  if (!response) return 'No response';
  const v = response.response_value;
  if (v === null || v === undefined) return 'No response';
  if (typeof v === 'object') {
    // option was saved as {tip_text, question_text} — extract display text
    return v.question_text ?? v.text ?? v.value ?? JSON.stringify(v);
  }
  return String(v);
};

const getDiscussionText = (q) => {
  if (!q) return '';
  const raw = q.discussion_question ?? '';
  if (typeof raw === 'object' && raw !== null) {
    return raw.question_text ?? raw.text ?? JSON.stringify(raw);
  }
  return String(raw);
};

const getSectionLabel = (sectionId) => {
  if (!sectionId) return 'General';
  const known = {
    sexual_knowledge: 'Sexual Knowledge',
    knowledge: 'Sexual Knowledge',
    boundaries: 'Boundaries & Comfort',
    comfort: 'Boundaries & Comfort',
    practical: 'Practical Preparation',
    practical_prep: 'Practical Preparation',
    expectations: 'Expectations',
    communication: 'Communication',
    intimacy: 'Physical Intimacy',
    history: 'Personal History',
    faith: 'Faith & Values',
    general: 'General',
  };
  const id = String(sectionId).toLowerCase().replace(/[\s-]/g, '_');
  return known[id] || sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getSectionNarrative = (sectionId, pct) => {
  const label = getSectionLabel(sectionId).toLowerCase();
  if (pct >= 75) {
    return `You're well-aligned on ${label}. Your shared understanding here will be a genuine strength as you start your marriage.`;
  } else if (pct >= 50) {
    return `You have solid alignment on ${label}, with a few areas worth exploring together. These differences are normal and very workable.`;
  } else if (pct >= 25) {
    return `${getSectionLabel(sectionId)} is an area with meaningful differences between you. This is exactly the kind of conversation SACRED is designed to help you have.`;
  } else {
    return `You have quite different responses on ${label}. Dedicate unhurried time to this section — working through it before your wedding will serve you both well.`;
  }
};

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // View and sorting state
  const [viewMode, setViewMode] = useState('list'); // 'card' or 'list'
  const [sortBy, setSortBy] = useState('order'); // 'alignment', 'order', 'misalignment'
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handlePrint = () => {
    // Ensure list view is active so all questions appear in print
    setViewMode('list');
    setTimeout(() => window.print(), 150);
  };

  const urlParams = new URLSearchParams(location.search);
  const assessmentId = urlParams.get('id');
  const partner1Id = urlParams.get('p1');
  const partner2Id = urlParams.get('p2');
  
  // Determine if this is a alignment report (two assessments) or single assessment report
  const isAlignmentReport = partner1Id && partner2Id;

  useEffect(() => {
    const generateReport = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Check if we have the required parameters
        if (!assessmentId && !isAlignmentReport) {
          navigate(createPageUrl('Dashboard'));
          return;
        }

        if (isAlignmentReport) {
          // Handle alignment report with two assessments
          const partner1Assessment = await Assessment.get(partner1Id);
          const partner2Assessment = await Assessment.get(partner2Id);
          
          // Security check - ensure user owns both assessments
          if (currentUser.email !== partner1Assessment.user_email || 
              currentUser.email !== partner2Assessment.user_email) {
            navigate(createPageUrl('Dashboard?error=assessment_unauthorized'));
            return;
          }
          
          // Check if both assessments are completed
          if (partner1Assessment.status !== 'completed' || partner2Assessment.status !== 'completed') {
            // Show empty state instead of redirecting
            setReportData({
              isEmpty: true,
              partner1Assessment,
              partner2Assessment
            });
            setIsLoading(false);
            return;
          }

          const allQuestions = await Question.list();
          const partner1Responses = await Assessment.getResponses(partner1Id);
          const partner2Responses = await Assessment.getResponses(partner2Id);

          // Generate alignment report data
          setReportData({
            isAlignmentReport: true,
            partner1Assessment,
            partner2Assessment,
            partner1Responses,
            partner2Responses,
            allQuestions,
            completionDate: new Date(Math.max(
              new Date(partner1Assessment.completed_at),
              new Date(partner2Assessment.completed_at)
            ))
          });

        } else {
          // Handle single assessment report
          const assessment = await Assessment.get(assessmentId);
          
          // Security check - ensure user owns this assessment
          if (currentUser.email !== assessment.user_email) {
            navigate(createPageUrl('Dashboard?error=assessment_unauthorized'));
            return;
          }
          
          if (assessment.status !== 'completed') {
            navigate(createPageUrl(`Dashboard?error=assessment_not_completed`));
            return;
          }

          const allQuestions = await Question.list();
          const responses = await Assessment.getResponses(assessmentId);

          // Group responses by section
          const sectionData = {};
          responses.forEach(response => {
            const section = response.section || 'general';
            if (!sectionData[section]) {
              sectionData[section] = {
                responses: [],
                questions: [],
                totalScore: 0,
                averageScore: 0
              };
            }
            
            sectionData[section].responses.push(response);
            const question = allQuestions.find(q => q.question_id === response.question_id);
            if (question) {
              sectionData[section].questions.push(question);
            }
            
            if (response.score !== null) {
              sectionData[section].totalScore += response.score;
            }
          });

          // Calculate averages
          Object.keys(sectionData).forEach(section => {
            const data = sectionData[section];
            const scoredResponses = data.responses.filter(r => r.score !== null);
            if (scoredResponses.length > 0) {
              data.averageScore = Math.round(data.totalScore / scoredResponses.length);
            }
          });

          setReportData({
            isAlignmentReport: false,
            assessment,
            allQuestions,
            responses,
            sectionData,
            totalResponses: responses.length,
            completionDate: new Date(assessment.completed_at)
          });
        }

      } catch (error) {
        console.error('Error generating report:', error);
        setReportData({ loadError: error?.message || 'Unknown error' });
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [assessmentId, partner1Id, partner2Id, navigate, isAlignmentReport]);

  // Keyboard navigation for card view
  useEffect(() => {
    if (viewMode !== 'card' || !reportData?.isAlignmentReport) return;
    
    const handleKeyPress = (e) => {
      const sortedQuestions = getSortedQuestions();
      if (sortedQuestions.length === 0) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentCardIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentCardIndex(prev => Math.min(sortedQuestions.length - 1, prev + 1));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, reportData, sortBy]);

  const renderSectionSummary = (sectionId, data) => {
    const sectionTitle = sectionId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const progressPercentage = data.averageScore ? (data.averageScore / 10) * 100 : 0;
    const getScoreColor = (score) => {
      if (score >= 8) return 'text-[#5A9CB3]'; // Soft blue for high scores
      if (score >= 6) return 'text-[#B8956A]'; // Warm gold for medium scores  
      return 'text-[#C4756B]'; // SACRED coral for low scores
    };
    const getSectionIcon = (section) => {
      const iconMap = {
        communication: Activity,
        intimacy: Heart,
        values: Star,
        finances: TrendingUp,
        future: Target,
        general: Users
      };
      return iconMap[section.toLowerCase()] || Users;
    };
    const IconComponent = getSectionIcon(sectionId);
    
    return (
      <Card key={sectionId} className="border-0 shadow-lg bg-white mb-6 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#C4756B]/10">
              <IconComponent className="w-5 h-5 text-[#C4756B]" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-sacred-bold text-[#2F4F3F] text-xl">
                {sectionTitle}
              </CardTitle>
              <CardDescription className="font-sacred text-[#6B5B73] text-base mt-1">
                {data.responses.length} responses completed
              </CardDescription>
            </div>
            {data.averageScore && (
              <div className="text-right">
                <div className={`text-2xl font-sacred-bold ${getScoreColor(data.averageScore)}`}>
                  {data.averageScore}/10
                </div>
                <div className="text-sm text-[#6B5B73] font-sacred">Average</div>
              </div>
            )}
          </div>
          {data.averageScore && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-sacred text-[#6B5B73]">Section Progress</span>
                <span className="text-sm font-sacred-bold text-[#2F4F3F]">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-[#E6D7C9]" 
                style={{
                  '--tw-bg-primary': data.averageScore >= 8 ? '#5A9CB3' : data.averageScore >= 6 ? '#B8956A' : '#C4756B'
                }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.responses.slice(0, 3).map(response => (
              <div key={response.id} className="p-4 bg-gradient-to-r from-[#F5F1EB] to-[#E6D7C9]/50 rounded-lg border border-[#E6D7C9]/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-sacred-bold text-[#2F4F3F] text-base flex-1 pr-4">
                    {response.question_text || response.question_id}
                  </h4>
                  {response.score && (
                    <Badge variant="outline" className={`${getScoreColor(response.score)} border-current`}>
                      {response.score}/10
                    </Badge>
                  )}
                </div>
                <p className="font-sacred text-[#6B5B73] text-sm leading-relaxed">
                  {response.response_value}
                </p>
              </div>
            ))}
            {data.responses.length > 3 && (
              <div className="text-center pt-2">
                <Badge variant="secondary" className="font-sacred text-[#6B5B73]">
                  +{data.responses.length - 3} more responses
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverallSummary = () => {
    if (reportData.isAlignmentReport) {
      // Alignment report summary
      const partner1Name = reportData.partner1Assessment.metadata?.partnerName || 
                           reportData.partner1Assessment.metadata?.partner1Name || 'Partner 1';
      const partner2Name = reportData.partner2Assessment.metadata?.partnerName || 
                           reportData.partner2Assessment.metadata?.partner2Name || 'Partner 2';

      // Calculate alignment percentage
      const matchingAnswers = reportData.allQuestions.filter(question => {
        const partner1Response = reportData.partner1Responses.find(r => r.question_id === question.question_id);
        const partner2Response = reportData.partner2Responses.find(r => r.question_id === question.question_id);
        return partner1Response && partner2Response && getResponseText(partner1Response) === getResponseText(partner2Response);
      }).length;
      
      const totalComparableQuestions = reportData.allQuestions.filter(question => {
        const partner1Response = reportData.partner1Responses.find(r => r.question_id === question.question_id);
        const partner2Response = reportData.partner2Responses.find(r => r.question_id === question.question_id);
        return partner1Response && partner2Response;
      }).length;
      
      const alignmentPercentage = totalComparableQuestions > 0 ? Math.round((matchingAnswers / totalComparableQuestions) * 100) : 0;
      
      return (
        <div className="mb-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-1">
                    {partner1Name} & {partner2Name}
                  </h1>
                  <p className="text-sm font-sacred text-[#6B5B73]">
                    Relationship Alignment Report
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-sacred-bold text-[#C4756B] mb-1">
                    {alignmentPercentage}%
                  </div>
                  <div className="text-sm font-sacred text-[#6B5B73]">
                    Aligned
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      // Single assessment summary with enhanced visualization
      const totalScore = Object.values(reportData.sectionData)
        .reduce((sum, section) => sum + section.totalScore, 0);
      const totalScoredResponses = Object.values(reportData.sectionData)
        .reduce((sum, section) => sum + section.responses.filter(r => r.score !== null).length, 0);
      const overallAverage = totalScoredResponses > 0 ? Math.round(totalScore / totalScoredResponses) : 0;
      
      // Prepare data for section visualization
      const sectionChartData = Object.entries(reportData.sectionData).map(([sectionId, data]) => ({
        name: sectionId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: data.averageScore || 0,
        responses: data.responses.length,
        fill: data.averageScore >= 8 ? '#5A9CB3' : data.averageScore >= 6 ? '#B8956A' : '#C4756B'
      }));

      return (
        <div className="space-y-6 mb-8">
          {/* Hero Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[#C4756B]/10 via-white to-[#6B5B73]/10 overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C4756B] to-[#6B5B73] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-sacred-bold text-[#2F4F3F] mb-2">
                Your Sacred Assessment Results
              </CardTitle>
              <CardDescription className="text-lg font-sacred text-[#6B5B73] mb-4">
                Completed on {reportData.completionDate.toLocaleDateString()}
              </CardDescription>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <div className={`text-2xl font-sacred-bold ${
                  overallAverage >= 8 ? 'text-[#5A9CB3]' : 
                  overallAverage >= 6 ? 'text-[#B8956A]' : 'text-[#C4756B]'
                }`}>
                  {overallAverage}/10
                </div>
                <div className="text-sm font-sacred text-[#6B5B73]">Overall Score</div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-[#E6D7C9]/50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#C4756B]" />
                    <div>
                      <div className="text-xl font-sacred-bold text-[#C4756B]">{reportData.totalResponses}</div>
                      <div className="text-xs font-sacred text-[#6B5B73]">Questions Answered</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-[#E6D7C9]/50">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#6B5B73]" />
                    <div>
                      <div className="text-xl font-sacred-bold text-[#6B5B73]">{Object.keys(reportData.sectionData).length}</div>
                      <div className="text-xs font-sacred text-[#6B5B73]">Sections Completed</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-[#E6D7C9]/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#2F4F3F]" />
                    <div>
                      <div className="text-xl font-sacred-bold text-[#2F4F3F]">{Math.round((overallAverage/10)*100)}%</div>
                      <div className="text-xs font-sacred text-[#6B5B73]">Completion Rate</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-[#E6D7C9]/50">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-[#B8956A]" />
                    <div>
                      <div className="text-xl font-sacred-bold text-[#B8956A]">
                        {sectionChartData.filter(s => s.score >= 8).length}
                      </div>
                      <div className="text-xs font-sacred text-[#6B5B73]">Strong Areas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Performance Chart */}
              {sectionChartData.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E6D7C9]/50">
                  <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-4">Section Performance</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sectionChartData}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#6B5B73' }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B5B73' }} 
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 10]}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        cursor={{ fill: '#F5F1EB' }}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  // Sort and filter questions for alignment report
  const getSortedQuestions = () => {
    if (!reportData?.isAlignmentReport) return [];
    
    const questionsWithStatus = reportData.allQuestions.map(question => {
      const partner1Response = reportData.partner1Responses.find(r => r.question_id === question.question_id);
      const partner2Response = reportData.partner2Responses.find(r => r.question_id === question.question_id);
      
      const isAligned = partner1Response && partner2Response && 
                       getResponseText(partner1Response) === getResponseText(partner2Response);
      const hasBothResponses = partner1Response && partner2Response;
      
      return {
        ...question,
        partner1Response,
        partner2Response,
        isAligned,
        hasBothResponses,
        hasDiscussion: !isAligned && question.discussion_question
      };
    }).filter(q => q.partner1Response || q.partner2Response); // Show any question with at least one response

    // Sort based on selected option
    switch (sortBy) {
      case 'alignment':
        return questionsWithStatus.sort((a, b) => {
          if (a.isAligned && !b.isAligned) return -1;
          if (!a.isAligned && b.isAligned) return 1;
          return a.order_index - b.order_index;
        });
      case 'misalignment':
        return questionsWithStatus.sort((a, b) => {
          if (!a.isAligned && b.isAligned) return -1;
          if (a.isAligned && !b.isAligned) return 1;
          return a.order_index - b.order_index;
        });
      case 'order':
      default:
        return questionsWithStatus.sort((a, b) => a.order_index - b.order_index);
    }
  };

  // Render single question card
  const renderQuestionCard = (questionData, index, total) => {
    const partner1Name = reportData.partner1Assessment.metadata?.partnerName || 
                        reportData.partner1Assessment.metadata?.partner1Name || 'Partner 1';
    const partner2Name = reportData.partner2Assessment.metadata?.partnerName || 
                        reportData.partner2Assessment.metadata?.partner2Name || 'Partner 2';
    
    return (
      <Card key={questionData.question_id} className="border-0 shadow-lg bg-white min-h-[400px]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Question {index + 1} of {total}
              </Badge>
              {questionData.isAligned ? (
                <Badge className="bg-[#E6F3F7] text-[#5A9CB3] border-[#B8D9E3]">Aligned</Badge>
              ) : (
                <Badge className="bg-[#F5F1EB] text-[#C4756B] border-[#E6D7C9]">Discussion Needed</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-sacred text-[#6B5B73] px-2">
                {index + 1}/{total}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentCardIndex(Math.min(total - 1, currentCardIndex + 1))}
                disabled={currentCardIndex === total - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <Progress 
              value={(index + 1) / total * 100} 
              className="h-2 bg-[#E6D7C9]" 
              style={{
                '--tw-bg-primary': '#C4756B'
              }}
            />
          </div>
          
          <CardTitle className="font-sacred-bold text-[#2F4F3F] text-lg mb-2">
            {getQuestionText(questionData)}
          </CardTitle>
          
          {questionData.section && (
            <Badge variant="secondary" className="w-fit mb-4">
              {questionData.section}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#C4756B]">
                <h5 className="font-sacred-bold text-[#C4756B] mb-2">{partner1Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {getResponseText(questionData.partner1Response)}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#7A9B8A]">
                <h5 className="font-sacred-bold text-[#7A9B8A] mb-2">{partner2Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {getResponseText(questionData.partner2Response)}
                </p>
              </div>
            </div>
            
            {questionData.isAligned && (
              <div className="mt-3 p-2 bg-[#E6F3F7] border border-[#B8D9E3] rounded text-center">
                <span className="text-sm text-[#5A9CB3] font-sacred">✓ Matching responses</span>
              </div>
            )}
            
            {questionData.hasDiscussion && (
              <div className="mt-3 p-4 bg-[#F5F1EB] border border-[#E6D7C9] rounded">
                <h6 className="font-sacred-bold text-[#C4756B] mb-2 flex items-center">
                  💬 Discussion Opportunity
                </h6>
                <p className="text-sm font-sacred text-[#6B5B73] leading-relaxed">
                  {getDiscussionText(questionData)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHowToUse = () => {
    if (!reportData.isAlignmentReport) return null;
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-[#2F4F3F] to-[#3d6b55] mb-6 print:shadow-none print:border print:border-[#2F4F3F]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-sacred-bold text-white mb-2">How to Use This Report</h2>
              <p className="font-sacred text-white/85 leading-relaxed mb-3">
                This report shows how you and your partner answered each question. Questions where you gave the same answer are marked <strong>Aligned</strong>. Those with different answers are marked <strong>Discussion Needed</strong> — these are not problems, they are conversations waiting to happen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#7A9B8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-sacred text-white/80">Review each section together, not alone</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#7A9B8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-sacred text-white/80">Use the discussion questions as conversation starters</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#7A9B8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-sacred text-white/80">Focus on understanding, not winning — differences are normal</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSectionSummaries = () => {
    if (!reportData.isAlignmentReport) return null;

    // Group questions by section, count aligned vs total
    const sections = {};
    reportData.allQuestions.forEach(question => {
      const section = question.section || 'general';
      if (!sections[section]) sections[section] = { total: 0, aligned: 0 };
      const p1 = reportData.partner1Responses.find(r => r.question_id === question.question_id);
      const p2 = reportData.partner2Responses.find(r => r.question_id === question.question_id);
      if (p1 && p2) {
        sections[section].total++;
        if (getResponseText(p1) === getResponseText(p2)) sections[section].aligned++;
      }
    });

    const sectionEntries = Object.entries(sections).filter(([, d]) => d.total > 0);
    if (sectionEntries.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-sacred-bold text-[#2F4F3F] mb-4">Section by Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionEntries.map(([sectionId, data]) => {
            const pct = data.total > 0 ? Math.round((data.aligned / data.total) * 100) : 0;
            const barColor = pct >= 75 ? '#7A9B8A' : pct >= 50 ? '#B8956A' : '#C4756B';
            return (
              <Card key={sectionId} className="border-0 shadow-md bg-white print:shadow-none print:border print:border-[#E6D7C9]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-sacred-bold text-[#2F4F3F] text-base">{getSectionLabel(sectionId)}</h3>
                    <span className="text-2xl font-sacred-bold" style={{ color: barColor }}>{pct}%</span>
                  </div>
                  <div className="w-full bg-[#E6D7C9] rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-sm font-sacred text-[#6B5B73] leading-relaxed">
                    {getSectionNarrative(sectionId, pct)}
                  </p>
                  <p className="text-xs font-sacred text-[#6B5B73]/70 mt-2">
                    {data.aligned} of {data.total} questions aligned
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Document page renders (alignment report) ────────────────────────────

  const computeAlignmentData = () => {
    const sections = {};
    reportData.allQuestions.forEach(q => {
      const section = q.section || 'general';
      if (!sections[section]) sections[section] = { total: 0, aligned: 0 };
      const p1 = reportData.partner1Responses.find(r => r.question_id === q.question_id);
      const p2 = reportData.partner2Responses.find(r => r.question_id === q.question_id);
      if (p1 || p2) {
        sections[section].total++;
        if (p1 && p2 && getResponseText(p1) === getResponseText(p2)) sections[section].aligned++;
      }
    });
    const totalAnswered = Object.values(sections).reduce((s, d) => s + d.total, 0);
    const totalAligned = Object.values(sections).reduce((s, d) => s + d.aligned, 0);
    const alignmentPct = totalAnswered > 0 ? Math.round((totalAligned / totalAnswered) * 100) : 0;
    return { sections, totalAnswered, alignmentPct };
  };

  const renderCoverPage = (p1Name, p2Name) => (
    <div className="bg-gradient-to-br from-[#2F4F3F] to-[#1e3b2e] rounded-lg shadow-xl p-16 min-h-[1056px] flex flex-col justify-between break-after-page print:rounded-none print:shadow-none">
      <div>
        <p className="text-[#7A9B8A] font-sacred text-sm tracking-widest uppercase mb-3">Sacred</p>
        <div className="w-10 h-px bg-[#7A9B8A]" />
      </div>
      <div>
        <h1 className="text-6xl font-sacred-bold text-white leading-tight mb-6">
          Pre-Marriage<br/>Assessment<br/>Report
        </h1>
        <div className="w-10 h-px bg-[#C4756B] mb-8" />
        <p className="text-2xl font-sacred text-white/80 mb-2">{p1Name} &amp; {p2Name}</p>
        <p className="font-sacred text-white/50">
          {reportData.completionDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <p className="text-xs font-sacred text-white/30 tracking-widest uppercase">Confidential · For your eyes only</p>
    </div>
  );

  const renderIntroPage = (p1Name, p2Name, alignmentPct, totalAnswered) => (
    <div className="bg-white rounded-lg shadow-lg p-16 min-h-[1056px] flex flex-col break-after-page print:rounded-none print:shadow-none">
      <div className="mb-12">
        <p className="text-[#C4756B] font-sacred text-sm tracking-widest uppercase mb-2">Introduction</p>
        <h2 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-4">About This Report</h2>
        <div className="w-10 h-px bg-[#C4756B]" />
      </div>
      <div className="space-y-5 mb-12 flex-1">
        <p className="font-sacred text-[#6B5B73] text-lg leading-relaxed">
          This report is the result of both of you independently completing the Sacred Pre-Marriage Assessment. It is designed to be read <em>together</em> — slowly, and with curiosity.
        </p>
        <p className="font-sacred text-[#6B5B73] text-lg leading-relaxed">
          Each page that follows covers a single question from the assessment. You will see both of your answers, and where you differ, a guided conversation to help you explore those differences well.
        </p>
        <p className="font-sacred text-[#6B5B73] text-lg leading-relaxed">
          Differences are not failures. They are the material of good marriage conversations. The goal is not to agree on everything — it is to understand each other more fully.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-[#F5F1EB] rounded-lg text-center">
          <div className="text-4xl font-sacred-bold text-[#C4756B] mb-1">{alignmentPct}%</div>
          <div className="text-sm font-sacred text-[#6B5B73]">Overall Alignment</div>
        </div>
        <div className="p-6 bg-[#F5F1EB] rounded-lg text-center">
          <div className="text-4xl font-sacred-bold text-[#2F4F3F] mb-1">{totalAnswered}</div>
          <div className="text-sm font-sacred text-[#6B5B73]">Questions Answered</div>
        </div>
        <div className="p-6 bg-[#F5F1EB] rounded-lg text-center">
          <div className="text-4xl font-sacred-bold text-[#7A9B8A] mb-1">{reportData.allQuestions.length}</div>
          <div className="text-sm font-sacred text-[#6B5B73]">Total Questions</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-4">How to Use This Report</h3>
        <div className="space-y-3">
          {[
            'Set aside dedicated time — an evening or a quiet afternoon',
            'Read each question page together, not alone in advance',
            'Use the conversation guides to go deeper on areas of difference',
            'There are no right answers — only honest ones',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[#C4756B] font-sacred-bold text-lg leading-none mt-0.5">{i + 1}.</span>
              <p className="font-sacred text-[#6B5B73]">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentsPage = (sections) => {
    const sectionEntries = Object.entries(sections);
    return (
      <div className="bg-white rounded-lg shadow-lg p-16 min-h-[1056px] flex flex-col break-after-page print:rounded-none print:shadow-none">
        <div className="mb-12">
          <p className="text-[#C4756B] font-sacred text-sm tracking-widest uppercase mb-2">Contents</p>
          <h2 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-4">What's Inside</h2>
          <div className="w-10 h-px bg-[#C4756B]" />
        </div>
        <div className="space-y-1">
          {sectionEntries.map(([sectionId, data], i) => {
            const pct = data.total > 0 ? Math.round((data.aligned / data.total) * 100) : 0;
            const barColor = pct >= 75 ? '#7A9B8A' : pct >= 50 ? '#B8956A' : '#C4756B';
            return (
              <div key={sectionId} className="flex items-center gap-6 py-5 border-b border-[#E6D7C9]">
                <span className="text-2xl font-sacred-bold text-[#E6D7C9] w-10 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <div className="font-sacred-bold text-[#2F4F3F] text-lg mb-1">{getSectionLabel(sectionId)}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#E6D7C9] rounded-full max-w-[200px]">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                    <span className="text-sm font-sacred" style={{ color: barColor }}>{pct}% aligned</span>
                  </div>
                </div>
                <span className="text-sm font-sacred text-[#6B5B73] flex-shrink-0">{data.total} questions</span>
              </div>
            );
          })}
        </div>
        <div className="mt-auto pt-8">
          <p className="font-sacred text-[#6B5B73]/50 text-sm italic">
            Sections with lower alignment are not cause for concern — they are invitations to deeper conversation.
          </p>
        </div>
      </div>
    );
  };

  const renderQuestionPage = (questionData, index, total, p1Name, p2Name) => {
    const isAligned = questionData.isAligned;
    return (
      <div key={questionData.question_id} className="bg-white rounded-lg shadow-lg p-12 min-h-[1056px] flex flex-col break-after-page print:rounded-none print:shadow-none">
        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6D7C9] mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm font-sacred text-[#6B5B73]">{getSectionLabel(questionData.section)}</span>
            <span className="text-[#E6D7C9]">·</span>
            <span className="text-sm font-sacred text-[#6B5B73]">Question {index + 1} of {total}</span>
          </div>
          {isAligned ? (
            <span className="text-xs font-sacred text-[#7A9B8A] bg-[#7A9B8A]/10 px-3 py-1 rounded-full">Aligned</span>
          ) : (
            <span className="text-xs font-sacred text-[#C4756B] bg-[#C4756B]/10 px-3 py-1 rounded-full">Discussion Needed</span>
          )}
        </div>

        {/* Question */}
        <h2 className="text-3xl font-sacred-bold text-[#2F4F3F] leading-tight mb-10">
          {getQuestionText(questionData)}
        </h2>

        {/* Answers */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-[#F5F1EB] rounded-lg border-l-4 border-[#C4756B]">
            <p className="text-xs font-sacred text-[#C4756B] uppercase tracking-widest mb-3">{p1Name}</p>
            <p className="font-sacred text-[#2F4F3F] text-lg leading-relaxed">
              {getResponseText(questionData.partner1Response)}
            </p>
          </div>
          <div className="p-6 bg-[#F5F1EB] rounded-lg border-l-4 border-[#7A9B8A]">
            <p className="text-xs font-sacred text-[#7A9B8A] uppercase tracking-widest mb-3">{p2Name}</p>
            <p className="font-sacred text-[#2F4F3F] text-lg leading-relaxed">
              {getResponseText(questionData.partner2Response)}
            </p>
          </div>
        </div>

        {/* Aligned note */}
        {isAligned && (
          <div className="mb-6 p-4 bg-[#7A9B8A]/10 border border-[#7A9B8A]/20 rounded-lg">
            <p className="text-sm font-sacred text-[#7A9B8A]">
              You both gave the same answer. This is a genuine point of common ground — reflect together on what it means for your marriage.
            </p>
          </div>
        )}

        {/* Conversation Guide */}
        <div className="flex-1 space-y-6">
          {questionData.conversation_guide ? (
            <div>
              <h3 className="text-xs font-sacred text-[#C4756B] uppercase tracking-widest mb-3">Conversation Guide</h3>
              <p className="font-sacred text-[#6B5B73] leading-relaxed">{questionData.conversation_guide}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#E6D7C9] rounded-lg p-8 print:hidden">
              <p className="text-sm font-sacred text-[#6B5B73]/40 text-center">Conversation guide coming soon</p>
            </div>
          )}

          {/* Discussion starter from DB */}
          {!isAligned && questionData.discussion_question && (
            <div>
              <h3 className="text-xs font-sacred text-[#6B5B73] uppercase tracking-widest mb-3">Starter Question</h3>
              <p className="font-sacred text-[#6B5B73] italic leading-relaxed">
                &ldquo;{getDiscussionText(questionData)}&rdquo;
              </p>
            </div>
          )}

          {/* Helpful Facts */}
          {questionData.helpful_facts && (
            <div className="p-6 bg-[#2F4F3F]/5 border-l-4 border-[#2F4F3F]/20 rounded-lg">
              <h3 className="text-xs font-sacred text-[#2F4F3F] uppercase tracking-widest mb-3">Good to Know</h3>
              <p className="font-sacred text-[#2F4F3F]/80 leading-relaxed text-sm">{questionData.helpful_facts}</p>
            </div>
          )}
        </div>

        {/* Page footer */}
        <div className="mt-8 pt-4 border-t border-[#E6D7C9] flex items-center justify-between">
          <span className="text-xs font-sacred text-[#6B5B73]/30 uppercase tracking-widest">Sacred</span>
          <span className="text-xs font-sacred text-[#6B5B73]/30">{index + 1}</span>
        </div>
      </div>
    );
  };

  // Render questions list
  const renderQuestionsList = (sortedQuestions) => {
    const partner1Name = reportData.partner1Assessment.metadata?.partnerName || 
                        reportData.partner1Assessment.metadata?.partner1Name || 'Partner 1';
    const partner2Name = reportData.partner2Assessment.metadata?.partnerName || 
                        reportData.partner2Assessment.metadata?.partner2Name || 'Partner 2';
    
    return (
      <div className="space-y-6">
        {sortedQuestions.map(questionData => (
          <div key={questionData.question_id} className="p-6 bg-[#F5F1EB] rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {questionData.section}
              </Badge>
              {questionData.isAligned ? (
                <Badge className="bg-[#E6F3F7] text-[#5A9CB3] border-[#B8D9E3]">Aligned</Badge>
              ) : (
                <Badge className="bg-[#F5F1EB] text-[#C4756B] border-[#E6D7C9]">Discussion Needed</Badge>
              )}
            </div>
            
            <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">
              {getQuestionText(questionData)}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#C4756B]">
                <h5 className="font-sacred-bold text-[#C4756B] mb-2">{partner1Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {getResponseText(questionData.partner1Response)}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#7A9B8A]">
                <h5 className="font-sacred-bold text-[#7A9B8A] mb-2">{partner2Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {getResponseText(questionData.partner2Response)}
                </p>
              </div>
            </div>
            
            {questionData.isAligned && (
              <div className="mt-3 p-2 bg-[#E6F3F7] border border-[#B8D9E3] rounded text-center">
                <span className="text-sm text-[#5A9CB3] font-sacred">✓ Matching responses</span>
              </div>
            )}
            
            {questionData.hasDiscussion && (
              <div className="mt-3 p-4 bg-[#F5F1EB] border border-[#E6D7C9] rounded">
                <h6 className="font-sacred-bold text-[#C4756B] mb-2 flex items-center">
                  💬 Discussion Opportunity
                </h6>
                <p className="text-sm font-sacred text-[#6B5B73] leading-relaxed">
                  {getDiscussionText(questionData)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#C4756B] mx-auto mb-4" />
            <p className="text-[#2F4F3F] font-sacred">Generating your report...</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  // Handle empty state (assessments not completed)
  if (reportData?.isEmpty) {
    const partner1Name = reportData.partner1Assessment?.metadata?.partnerName || 'Partner 1';
    const partner2Name = reportData.partner2Assessment?.metadata?.partnerName || 'Partner 2';
    const partner1Complete = reportData.partner1Assessment?.status === 'completed';
    const partner2Complete = reportData.partner2Assessment?.status === 'completed';
    
    return (
      <AuthWrapper requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#C4756B]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12 text-[#C4756B]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-sacred-bold text-[#2F4F3F] mb-6">
                Alignment Report Not Ready
              </h1>
              <p className="text-lg text-[#6B5B73] font-sacred mb-8 max-w-2xl mx-auto leading-relaxed">
                Your alignment report will be available once both assessments are completed.
              </p>
              
              {/* Progress Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                <div className={`p-6 rounded-xl border-2 ${partner1Complete ? 'border-[#B8D9E3] bg-[#E6F3F7]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {partner1Complete ? (
                      <CheckCircle className="w-6 h-6 text-[#5A9CB3]" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <h3 className="font-sacred-bold text-[#2F4F3F]">{partner1Name} Assessment</h3>
                  </div>
                  <p className={`text-sm font-sacred ${partner1Complete ? 'text-[#5A9CB3]' : 'text-gray-600'}`}>
                    {partner1Complete ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl border-2 ${partner2Complete ? 'border-[#B8D9E3] bg-[#E6F3F7]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {partner2Complete ? (
                      <CheckCircle className="w-6 h-6 text-[#5A9CB3]" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <h3 className="font-sacred-bold text-[#2F4F3F]">{partner2Name} Assessment</h3>
                  </div>
                  <p className={`text-sm font-sacred ${partner2Complete ? 'text-[#5A9CB3]' : 'text-gray-600'}`}>
                    {partner2Complete ? 'Completed' : 'In Progress'}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred px-8 py-3 text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  if (!reportData || reportData.loadError) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <p className="text-[#2F4F3F] font-sacred mb-2">Unable to generate report. Please try again.</p>
            {reportData?.loadError && (
              <p className="text-sm text-[#C4756B] font-sacred mb-4 bg-white/60 rounded p-2">{reportData.loadError}</p>
            )}
            <Button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <style>{`
        @media print {
          @page { margin: 0; size: letter; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          nav, aside, footer, [data-sidebar] { display: none !important; }
          .min-h-screen { min-height: unset !important; }
          .bg-gradient-to-br { background: white !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .shadow-lg, .shadow-xl, .shadow-md { box-shadow: none !important; }
          .break-after-page { break-after: page; page-break-after: always; }
          .space-y-4 > * + * { margin-top: 0 !important; }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="flex items-center text-[#6B5B73] hover:text-[#2F4F3F] font-sacred transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[#2F4F3F] font-sacred">
                <UserIcon className="w-5 h-5" />
                {getUserDisplayName(reportData.assessment || reportData.partner1Assessment, user)}
              </div>
              <Button
                variant="outline"
                className="border-[#C4756B] text-[#C4756B] hover:bg-[#C4756B] hover:text-white font-sacred print:hidden"
                onClick={handlePrint}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Report document */}
          <div className="space-y-4 max-w-[816px] mx-auto">
            {reportData.isAlignmentReport ? (() => {
              const p1Name = reportData.partner1Assessment.metadata?.partnerName ||
                             reportData.partner1Assessment.metadata?.partner1Name || 'Partner 1';
              const p2Name = reportData.partner2Assessment.metadata?.partnerName ||
                             reportData.partner2Assessment.metadata?.partner2Name || 'Partner 2';
              const sortedQuestions = getSortedQuestions();
              const { sections, totalAnswered, alignmentPct } = computeAlignmentData();
              return (
                <>
                  {renderCoverPage(p1Name, p2Name)}
                  {renderIntroPage(p1Name, p2Name, alignmentPct, totalAnswered)}
                  {renderContentsPage(sections)}
                  {sortedQuestions.map((q, i) =>
                    renderQuestionPage(q, i, sortedQuestions.length, p1Name, p2Name)
                  )}
                </>
              );
            })() : (
              <>
                {renderOverallSummary()}
                {Object.entries(reportData.sectionData).map(([sectionId, data]) =>
                  renderSectionSummary(sectionId, data)
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}