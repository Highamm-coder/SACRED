
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Question, Answer, CoupleAssessment, User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2, Download, Heart } from 'lucide-react';
import ReportSummary from '../components/report/ReportSummary';
import ComparisonCard from '../components/report/ComparisonCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import AuthWrapper from '@/components/AuthWrapper'; // Assuming AuthWrapper path

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const assessmentId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const generateReport = async () => {
      try {
        const user = await User.me();

        if (!assessmentId) {
          navigate(createPageUrl('Home'));
          return;
        }

        const assessment = await CoupleAssessment.get(assessmentId);
        
        // Security check
        if (user.email !== assessment.partner1_email && user.email !== assessment.partner2_email) {
            navigate(createPageUrl('Home'));
            return;
        }
        
        if (assessment.status !== 'completed') {
            navigate(createPageUrl(`Waiting?id=${assessmentId}`));
            return;
        }

        const allQuestions = await Question.list();
        const allAnswers = await Answer.filter({ assessmentId });

        const partner1Answers = allAnswers.filter(a => a.user_email === assessment.partner1_email);
        const partner2Answers = allAnswers.filter(a => a.user_email === assessment.partner2_email);

        const comparisons = allQuestions.map(q => {
          const p1Answer = partner1Answers.find(a => a.question_id === q.question_id);
          const p2Answer = partner2Answers.find(a => a.question_id === q.question_id);
          
          return {
            question: q,
            partner1_answer: p1Answer ? p1Answer.answer : 'Not Answered',
            partner2_answer: p2Answer ? p2Answer.answer : 'Not Answered',
            isAligned: p1Answer && p2Answer && p1Answer.answer === p2Answer.answer,
            discussionPrompt: q.discussionPrompt || null, // Changed from discussionQuestion to discussionPrompt
          };
        });

        const sections = [...new Set(allQuestions.map(q => q.section))];
        const report = {
          assessment,
          sections: sections.map(sectionName => ({
              name: sectionName,
              description: allQuestions.find(q => q.section === sectionName)?.sectionDescription || '',
              comparisons: comparisons.filter(c => c.question.section === sectionName)
          })),
        };
        
        setReportData(report);
        setIsLoading(false);

      } catch (error) {
        console.error("Error generating report:", error);
        // If user not authenticated or any critical error, redirect to login
        window.location.href = createPageUrl('Login');
      }
    };

    generateReport();
  }, [assessmentId, navigate]);

  const generatePrintableReport = () => {
    // Create a new window with the printable report
    const printWindow = window.open('', '_blank');
    
    if (!reportData) {
      if (printWindow) printWindow.close(); // Close if opened but no data
      return;
    }

    const allComparisons = reportData.sections.flatMap(s => s.comparisons);
    const alignedCount = allComparisons.filter(c => c.isAligned).length;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SACRED Alignment Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
            
            body { 
              font-family: 'Cormorant Garamond', serif; 
              margin: 40px; 
              color: #2F4F3F; 
              line-height: 1.6;
            }
            
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 2px solid #C4756B; 
              padding-bottom: 20px; 
            }
            
            .title { 
              font-size: 28px; 
              font-weight: 600; 
              margin-bottom: 10px; 
            }
            
            .subtitle { 
              font-size: 18px; 
              color: #6B5B73; 
            }
            
            .date-generated { 
              font-size: 14px; 
              margin-top: 10px; 
            }
            
            .summary { 
              background: #F5F1EB; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 30px 0; 
              border-left: 4px solid #C4756B;
            }
            
            .section { 
              margin: 30px 0; 
              break-inside: avoid;
            }
            
            .section-title { 
              font-size: 20px; 
              font-weight: 600; 
              margin-bottom: 15px; 
              border-bottom: 1px solid #E6D7C9; 
              padding-bottom: 5px; 
            }
            
            .question { 
              margin: 20px 0; 
              padding: 15px; 
              border-left: 4px solid #C4756B; 
              background: #F8F5F2;
              break-inside: avoid;
            }
            
            .question-title { 
              font-weight: 600; 
              margin-bottom: 10px; 
            }
            
            .question-explainer {
              font-style: italic; 
              margin: 5px 0; 
              font-size: 14px;
              color: #6B5B73;
            }
            
            .answers { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin: 10px 0; 
            }
            
            .answer { 
              padding: 10px; 
              background: white; 
              border-radius: 4px; 
              border: 1px solid #E6D7C9;
            }
            
            .answer-label { 
              font-weight: 600; 
              font-size: 12px; 
              color: #6B5B73; 
              margin-bottom: 5px;
            }
            
            .aligned { 
              border-left-color: #7A9B8A; 
            }
            
            .discussion { 
              background: #FFF8E1; 
              padding: 10px; 
              margin-top: 10px; 
              border-radius: 4px; 
              border-left: 3px solid #F59E0B;
            }

            .discussion-question-text {
              font-weight: 600;
              margin-bottom: 5px;
            }

            .discussion-question-tip {
              font-style: italic;
              font-size: 14px;
            }
            
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              font-size: 12px; 
              color: #6B5B73; 
              border-top: 1px solid #E6D7C9;
              padding-top: 20px;
            }
            
            @media print {
              body { margin: 30px; }
              .question { break-inside: avoid; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SACRED Alignment Report</div>
            <div class="subtitle">For ${reportData.assessment.partner1_name} & ${reportData.assessment.partner2_name}</div>
            <div class="date-generated">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="summary">
            <h2>Your Alignment Summary</h2>
            <p>You aligned on <strong>${alignedCount} out of ${allComparisons.length}</strong> questions (${Math.round((alignedCount / allComparisons.length) * 100)}%).</p>
            <p>Remember, differences are opportunities for meaningful conversations and growth together.</p>
          </div>

          ${reportData.sections.map(section => `
            <div class="section">
              <h2 class="section-title">${section.name}</h2>
              ${section.comparisons.map(comp => `
                <div class="question ${comp.isAligned ? 'aligned' : ''}">
                  <div class="question-title">${comp.question.text}</div>
                  ${comp.question.explainer ? `<p class="question-explainer">${comp.question.explainer}</p>` : ''}
                  <div class="answers">
                    <div class="answer">
                      <div class="answer-label">${reportData.assessment.partner1_name}'s Answer</div>
                      <div>${comp.partner1_answer}</div>
                    </div>
                    <div class="answer">
                      <div class="answer-label">${reportData.assessment.partner2_name}'s Answer</div>
                      <div>${comp.partner2_answer}</div>
                    </div>
                  </div>
                  ${!comp.isAligned && comp.discussionPrompt && comp.discussionPrompt.question_text ? `
                    <div class="discussion">
                      <strong>Conversation Starter:</strong>
                      <p class="discussion-question-text">${comp.discussionPrompt.question_text}</p>
                      ${comp.discussionPrompt.tip_text ? `<p class="discussion-question-tip">${comp.discussionPrompt.tip_text}</p>` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="footer">
            <p><strong>SACRED</strong> - Sexual Expectations Assessment for Engaged Couples</p>
            <p>This report is private and confidential. Keep it between you and your partner.</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print(); // Trigger print dialog
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#7D9D9C]" />
            <p className="ml-4 text-lg mt-4">Generating your compatibility report...</p>
        </div>
    );
  }

  if (!reportData) return null;

  const allComparisons = reportData.sections.flatMap(s => s.comparisons);
  const alignedCount = allComparisons.filter(c => c.isAligned).length;
  const misalignedComparisons = allComparisons.filter(c => !c.isAligned);
  const alignedComparisons = allComparisons.filter(c => c.isAligned);

  return (
    <AuthWrapper requireAuth={true}>
      <div className="bg-[#F5F1EB] min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              {/* Empty div for spacing on the left, to center the title block */}
              <div></div> 
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Alignment Report</h1>
                <p className="text-lg text-gray-600">
                  For {reportData.assessment.partner1_name} &amp; {reportData.assessment.partner2_name}
                </p>
              </div>
              <Button 
                onClick={generatePrintableReport}
                variant="outline" 
                className="flex items-center gap-2 border-[#C4756B] text-[#C4756B] hover:bg-[#C4756B] hover:text-white"
              >
                <Download className="w-4 h-4" />
                Print Report
              </Button>
            </div>
          </div>

          {/* Main Report Content */}
          <div className="mt-8">
            <ReportSummary total={allComparisons.length} aligned={alignedCount} />
            
            <Tabs defaultValue="misaligned" className="w-full mt-12">
              <TabsList className="grid w-full grid-cols-2 bg-[#EAE6E1] h-12 rounded-xl">
                <TabsTrigger value="misaligned" className="text-base h-10">Areas to Discuss ({misalignedComparisons.length})</TabsTrigger>
                <TabsTrigger value="aligned" className="text-base h-10">Areas of Alignment ({alignedComparisons.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="misaligned" className="mt-8">
                  <div className="space-y-8">
                      {reportData.sections.map(section => {
                          const sectionMisaligned = section.comparisons.filter(c => !c.isAligned);
                          if (sectionMisaligned.length === 0) return null;
                          return (
                              <div key={section.name}>
                                  <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-[#EAE6E1]">{section.name}</h2>
                                  <div className="space-y-4">
                                      {sectionMisaligned.map(comp => 
                                          <ComparisonCard 
                                              key={comp.question.id} 
                                              comparison={comp} 
                                              assessment={reportData.assessment}
                                          />
                                      )}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </TabsContent>
              <TabsContent value="aligned" className="mt-8">
                   <div className="space-y-8">
                      {reportData.sections.map(section => {
                          const sectionAligned = section.comparisons.filter(c => c.isAligned);
                          if (sectionAligned.length === 0) return null;
                          return (
                              <div key={section.name}>
                                  <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-[#EAE6E1]">{section.name}</h2>
                                  <div className="space-y-4">
                                      {sectionAligned.map(comp => 
                                          <ComparisonCard 
                                              key={comp.question.id} 
                                              comparison={comp} 
                                              assessment={reportData.assessment}
                                          />
                                      )}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* CTA to Sacred Reflections */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
             <div className="w-16 h-16 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#7A9B8A]" />
              </div>
            <h2 className="text-2xl font-sacred-bold text-[#2F4F3F]">Ready for the Next Step?</h2>
            <p className="mt-2 text-lg text-[#6B5B73] font-sacred max-w-xl mx-auto">
              Your report is a starting point. Deepen your connection with Sacred Reflections—a series of open-ended questions designed for intimate conversation.
            </p>
            <div className="mt-6">
              <Link to={createPageUrl('OpenEndedStart')}>
                <Button size="lg" className="bg-[#7A9B8A] hover:bg-[#6B8B7A] text-white font-sacred-bold">
                  Start Sacred Reflections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
