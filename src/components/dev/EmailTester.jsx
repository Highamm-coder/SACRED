import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { sendInviteEmail, sendCompletionNotification, sendWeddingCongratulations } from '@/api/functions';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailTester() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});

  const testEmail = async (type, testData) => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(type);
    
    try {
      let result;
      const emailData = { ...testData, email };
      
      switch (type) {
        case 'invite':
          result = await sendInviteEmail(emailData);
          break;
        case 'completion':
          result = await sendCompletionNotification(emailData);
          break;
        case 'wedding':
          result = await sendWeddingCongratulations(emailData);
          break;
      }
      
      setResults(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [type]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(null);
    }
  };

  const getResultBadge = (result) => {
    if (!result) return null;
    return result.success ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  };

  // Only show in development
  if (import.meta.env.VITE_APP_ENVIRONMENT !== 'development') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Testing (Development Only)
          </CardTitle>
          <CardDescription>
            Test the Resend email integration with sample emails
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          {/* Test Buttons */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Partner Invite Test */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Partner Invite</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Test the partner invitation email
                </p>
                <Button
                  onClick={() => testEmail('invite', {
                    partnerName: 'John Doe',
                    inviteLink: 'https://sacred.co/assessment?invite=test123'
                  })}
                  disabled={loading === 'invite'}
                  className="w-full mb-2"
                >
                  {loading === 'invite' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test
                </Button>
                {getResultBadge(results.invite)}
                {results.invite && !results.invite.success && (
                  <p className="text-xs text-red-600 mt-1">{results.invite.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Completion Notification Test */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Assessment Complete</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Test the completion notification email
                </p>
                <Button
                  onClick={() => testEmail('completion', {
                    userName: 'Jane Doe',
                    partnerName: 'John Doe',
                    reportLink: 'https://sacred.co/report?id=test123'
                  })}
                  disabled={loading === 'completion'}
                  className="w-full mb-2"
                >
                  {loading === 'completion' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test
                </Button>
                {getResultBadge(results.completion)}
                {results.completion && !results.completion.success && (
                  <p className="text-xs text-red-600 mt-1">{results.completion.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Wedding Congratulations Test */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Wedding Congrats</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Test the wedding congratulations email
                </p>
                <Button
                  onClick={() => testEmail('wedding', {
                    coupleName: 'John & Jane Doe'
                  })}
                  disabled={loading === 'wedding'}
                  className="w-full mb-2"
                >
                  {loading === 'wedding' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test
                </Button>
                {getResultBadge(results.wedding)}
                {results.wedding && !results.wedding.success && (
                  <p className="text-xs text-red-600 mt-1">{results.wedding.error}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enter your email address above</li>
              <li>Click any test button to send a sample email</li>
              <li>Check your inbox for the test emails</li>
              <li>Verify the email content and styling looks correct</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}