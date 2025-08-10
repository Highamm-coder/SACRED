import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { CoupleAssessment, User } from '@/api/entities';
import { sendWeddingCongratulations } from '@/api/functions';
import AuthWrapper from '../components/auth/AuthWrapper';
import { format, addDays, isWithinInterval } from 'date-fns';

export default function AdminWeddingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testAssessmentId, setTestAssessmentId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [upcomingWeddings, setUpcomingWeddings] = useState([]);
    const [isLoadingWeddings, setIsLoadingWeddings] = useState(true);

    useEffect(() => {
        const fetchUpcomingWeddings = async () => {
            try {
                const allAssessments = await CoupleAssessment.list();
                const today = new Date();
                const upcoming = allAssessments.filter(a => {
                    if (!a.wedding_date) return false;
                    const weddingDate = new Date(a.wedding_date);
                    return isWithinInterval(weddingDate, { start: today, end: addDays(today, 30) });
                }).sort((a, b) => new Date(a.wedding_date) - new Date(b.wedding_date));

                setUpcomingWeddings(upcoming);
            } catch (err) {
                console.error("Failed to fetch upcoming weddings:", err);
                setError("Failed to load upcoming weddings.");
            } finally {
                setIsLoadingWeddings(false);
            }
        };

        fetchUpcomingWeddings();
    }, []);

    const handleSendTodaysEmails = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const { data } = await sendWeddingCongratulations({});
            setResult(data);
        } catch (err) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testAssessmentId) {
            setError("Please enter an Assessment ID.");
            return;
        }
        setIsTesting(true);
        setError(null);
        setResult(null);
        try {
            const { data } = await sendWeddingCongratulations({ assessmentId: testAssessmentId });
            setResult(data);
        } catch (err) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AuthWrapper requireAuth={true}>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl font-bold text-gray-800 font-sacred-bold">Wedding Email Management</h1>
                        <p className="text-xl text-gray-500 mt-2 font-sacred">Trigger and test wedding congratulations emails.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Automated Trigger */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-sacred-bold text-[#2F4F3F]">Automated Trigger</CardTitle>
                                <CardDescription className="font-sacred">Send emails to all couples whose wedding date is today.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={handleSendTodaysEmails} disabled={isLoading} className="w-full bg-[#2F4F3F] hover:bg-[#1F3F2F]">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Send Today's Emails
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Manual Trigger */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-sacred-bold text-[#2F4F3F]">Manual Test</CardTitle>
                                <CardDescription className="font-sacred">Send a test email to a specific assessment ID.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="assessmentId" className="font-sacred">Assessment ID</Label>
                                    <Input
                                        id="assessmentId"
                                        value={testAssessmentId}
                                        onChange={(e) => setTestAssessmentId(e.target.value)}
                                        placeholder="Enter assessment ID"
                                    />
                                </div>
                                <Button onClick={handleSendTestEmail} disabled={isTesting} className="w-full bg-[#C4756B] hover:bg-[#B86761]">
                                    {isTesting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Send Test Email
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Result Display */}
                    {(result || error) && (
                        <div className="mt-8">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="font-sacred-bold">Trigger Result</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {error && (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                                            <AlertCircle className="w-5 h-5" />
                                            <div>
                                                <h4 className="font-bold">Error</h4>
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    )}
                                    {result && (
                                        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                                            <CheckCircle className="w-5 h-5" />
                                            <div>
                                                <h4 className="font-bold">Success</h4>
                                                <p>Found {result.assessmentsFound} assessment(s). Sent {result.emailsSent} email(s).</p>
                                                <pre className="text-xs mt-2 bg-green-100 p-2 rounded overflow-auto">{JSON.stringify(result.results, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    
                    {/* Upcoming Weddings */}
                    <div className="mt-8">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-sacred-bold text-[#2F4F3F] flex items-center gap-2"><Calendar className="w-5 h-5" />Upcoming Weddings (Next 30 Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoadingWeddings ? (
                                    <div className="flex justify-center items-center h-24">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                ) : upcomingWeddings.length > 0 ? (
                                    <ul className="space-y-2">
                                        {upcomingWeddings.map(a => (
                                            <li key={a.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                                <div className="font-sacred">
                                                    <p className="font-semibold text-gray-800">{a.partner1_name} & {a.partner2_name}</p>
                                                    <p className="text-sm text-gray-500">{a.id}</p>
                                                </div>
                                                <p className="font-bold text-[#2F4F3F]">{format(new Date(a.wedding_date), 'MMMM d, yyyy')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 font-sacred">No upcoming weddings in the next 30 days.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthWrapper>
    );
}