import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AuthError({ error, onRetry }) {
  const handleRetryLogin = () => {
    window.location.href = createPageUrl('Login');
  };

  const handleGoHome = () => {
    window.location.href = createPageUrl('Landing');
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-[#2F4F3F]">Authentication Error</CardTitle>
          <CardDescription>
            There was an issue with signing in. This might be a temporary issue with the authentication service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 font-mono">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Button onClick={handleRetryLogin} className="w-full bg-[#C4756B] hover:bg-[#B86761]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              If this issue persists, please contact support at{' '}
              <a href="mailto:support@sacred.com" className="text-[#C4756B] hover:underline">
                support@sacred.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}