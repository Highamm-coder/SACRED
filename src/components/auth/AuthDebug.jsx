import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, User as UserIcon } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AuthDebug() {
  const [authState, setAuthState] = useState('checking');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const checkAuthState = async () => {
    setAuthState('checking');
    setError(null);
    
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setAuthState('authenticated');
    } catch (error) {
      setUser(null);
      setError(error.message || 'Authentication check failed');
      setAuthState('unauthenticated');
    }
  };

  const handleForceLogin = () => {
    window.location.href = createPageUrl('Login');
  };

  const handleLoginWithRedirect = () => {
    window.location.href = createPageUrl('Login');
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Authentication Debug
          </CardTitle>
          <CardDescription>
            Debug authentication issues and check current state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Auth State:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              authState === 'authenticated' ? 'bg-green-100 text-green-800' :
              authState === 'unauthenticated' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {authState}
            </span>
          </div>

          {user && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.full_name || 'Not set'}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={checkAuthState} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Auth
            </Button>
            <Button onClick={handleForceLogin} variant="outline" size="sm">
              Force Login
            </Button>
            <Button onClick={handleLoginWithRedirect} variant="outline" size="sm">
              Login with Redirect
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}