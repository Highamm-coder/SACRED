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
        navigate(createPageUrl('Dashboard?error=report_generation_failed'));
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
      if (score >= 8) return 'text-green-600';
      if (score >= 6) return 'text-yellow-600';
      return 'text-red-500';
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
                  '--tw-bg-primary': data.averageScore >= 8 ? '#10B981' : data.averageScore >= 6 ? '#F59E0B' : '#EF4444'
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
        return partner1Response && partner2Response && partner1Response.response_value === partner2Response.response_value;
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
        fill: data.averageScore >= 8 ? '#10B981' : data.averageScore >= 6 ? '#F59E0B' : '#EF4444'
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
                  overallAverage >= 8 ? 'text-green-600' : 
                  overallAverage >= 6 ? 'text-yellow-600' : 'text-red-500'
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
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-xl font-sacred-bold text-yellow-600">
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
                       partner1Response.response_value === partner2Response.response_value;
      const hasBothResponses = partner1Response && partner2Response;
      
      return {
        ...question,
        partner1Response,
        partner2Response,
        isAligned,
        hasBothResponses,
        hasDiscussion: !isAligned && question.discussion_question
      };
    }).filter(q => q.hasBothResponses); // Only show questions with both responses

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
                <Badge className="bg-green-100 text-green-700 border-green-200">Aligned</Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">Discussion Needed</Badge>
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
            {questionData.question_text}
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
                  {questionData.partner1Response ? questionData.partner1Response.response_value : 'No response'}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#7A9B8A]">
                <h5 className="font-sacred-bold text-[#7A9B8A] mb-2">{partner2Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {questionData.partner2Response ? questionData.partner2Response.response_value : 'No response'}
                </p>
              </div>
            </div>
            
            {questionData.isAligned && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                <span className="text-sm text-green-700 font-sacred">✓ Matching responses</span>
              </div>
            )}
            
            {questionData.hasDiscussion && (
              <div className="mt-3 p-4 bg-[#F5F1EB] border border-[#E6D7C9] rounded">
                <h6 className="font-sacred-bold text-[#C4756B] mb-2 flex items-center">
                  💬 Discussion Opportunity
                </h6>
                <p className="text-sm font-sacred text-[#6B5B73] leading-relaxed">
                  {questionData.discussion_question}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
                <Badge className="bg-green-100 text-green-700 border-green-200">Aligned</Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">Discussion Needed</Badge>
              )}
            </div>
            
            <h4 className="font-sacred-bold text-[#2F4F3F] mb-4">
              {questionData.question_text}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#C4756B]">
                <h5 className="font-sacred-bold text-[#C4756B] mb-2">{partner1Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {questionData.partner1Response ? questionData.partner1Response.response_value : 'No response'}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-l-4 border-[#7A9B8A]">
                <h5 className="font-sacred-bold text-[#7A9B8A] mb-2">{partner2Name}</h5>
                <p className="text-sm font-sacred text-[#6B5B73]">
                  {questionData.partner2Response ? questionData.partner2Response.response_value : 'No response'}
                </p>
              </div>
            </div>
            
            {questionData.isAligned && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                <span className="text-sm text-green-700 font-sacred">✓ Matching responses</span>
              </div>
            )}
            
            {questionData.hasDiscussion && (
              <div className="mt-3 p-4 bg-[#F5F1EB] border border-[#E6D7C9] rounded">
                <h6 className="font-sacred-bold text-[#C4756B] mb-2 flex items-center">
                  💬 Discussion Opportunity
                </h6>
                <p className="text-sm font-sacred text-[#6B5B73] leading-relaxed">
                  {questionData.discussion_question}
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
                <div className={`p-6 rounded-xl border-2 ${partner1Complete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {partner1Complete ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <h3 className="font-sacred-bold text-[#2F4F3F]">{partner1Name} Assessment</h3>
                  </div>
                  <p className={`text-sm font-sacred ${partner1Complete ? 'text-green-700' : 'text-gray-600'}`}>
                    {partner1Complete ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl border-2 ${partner2Complete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {partner2Complete ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                    <h3 className="font-sacred-bold text-[#2F4F3F]">{partner2Name} Assessment</h3>
                  </div>
                  <p className={`text-sm font-sacred ${partner2Complete ? 'text-green-700' : 'text-gray-600'}`}>
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

  if (!reportData) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#2F4F3F] font-sacred">Unable to generate report. Please try again.</p>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="mt-4 bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred"
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
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#EAE6E1] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                {getUserDisplayName(reportData.assessment, user)}
              </div>
              <Button
                variant="outline"
                className="border-[#C4756B] text-[#C4756B] hover:bg-[#C4756B] hover:text-white font-sacred"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Overall Summary */}
          {renderOverallSummary()}

          {/* Report Content */}
          <div className="space-y-6">
            {reportData.isAlignmentReport ? (
              <>
                {/* View Controls */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="font-sacred-bold text-[#2F4F3F]">
                          Response Comparison
                        </CardTitle>
                        <CardDescription className="font-sacred text-[#6B5B73]">
                          See how both partners answered the same questions
                          {viewMode === 'card' && (
                            <span className="block text-xs text-[#6B5B73] mt-1 opacity-75">
                              💡 Use arrow keys or buttons to navigate between questions
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <div className="flex items-center border rounded-lg p-1 bg-gray-50">
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-8 px-3"
                          >
                            <List className="w-4 h-4 mr-1" />
                            List
                          </Button>
                          <Button
                            variant={viewMode === 'card' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => {
                              setViewMode('card');
                              setCurrentCardIndex(0);
                            }}
                            className="h-8 px-3"
                          >
                            <Grid3X3 className="w-4 h-4 mr-1" />
                            Card
                          </Button>
                        </div>
                        
                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-[#6B5B73]" />
                          <Select value={sortBy} onValueChange={(value) => {
                            setSortBy(value);
                            setCurrentCardIndex(0); // Reset to first card when sorting changes
                          }}>
                            <SelectTrigger className="w-40 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="order">Question Order</SelectItem>
                              <SelectItem value="alignment">Aligned First</SelectItem>
                              <SelectItem value="misalignment">Discuss First</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Render Questions Based on View Mode */}
                {(() => {
                  const sortedQuestions = getSortedQuestions();
                  
                  if (viewMode === 'card') {
                    // Card view - show one question at a time
                    if (sortedQuestions.length === 0) {
                      return (
                        <Card className="border-0 shadow-lg bg-white">
                          <CardContent className="p-12 text-center">
                            <p className="text-[#6B5B73] font-sacred">No questions to display</p>
                          </CardContent>
                        </Card>
                      );
                    }
                    
                    return renderQuestionCard(sortedQuestions[currentCardIndex], currentCardIndex, sortedQuestions.length);
                  } else {
                    // List view - show all questions
                    return (
                      <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                          {sortedQuestions.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-[#6B5B73] font-sacred">No questions to display</p>
                            </div>
                          ) : (
                            renderQuestionsList(sortedQuestions)
                          )}
                        </CardContent>
                      </Card>
                    );
                  }
                })()}
              </>
            ) : (
              // Single assessment view
              Object.entries(reportData.sectionData).map(([sectionId, data]) =>
                renderSectionSummary(sectionId, data)
              )
            )}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}