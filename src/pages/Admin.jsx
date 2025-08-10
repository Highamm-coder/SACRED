
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, CheckCircle, AlertCircle, Settings, Database } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role !== 'admin') {
          // If not admin, redirect away
          navigate(createPageUrl('Dashboard'));
        }
      } catch (e) {
        // Not logged in, redirect
        navigate(createPageUrl('Home'));
      }
    };
    verifyAdmin();
  }, [navigate]);

  const handleUpdatePaymentStatus = async (hasPaidStatus) => {
    if (!targetEmail) {
      setMessage({ type: 'error', text: 'Please enter a user email.' });
      return;
    }
    
    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const users = await User.filter({ email: targetEmail });
      if (users.length === 0) {
        throw new Error('User not found with that email address.');
      }
      
      const userToUpdate = users[0];
      const updateData = { has_paid: hasPaidStatus };
      
      // If granting access, also initialize processed_stripe_sessions as empty array or preserve existing
      // If revoking access, clear the processed_stripe_sessions array
      if (hasPaidStatus) {
        updateData.processed_stripe_sessions = userToUpdate.processed_stripe_sessions || [];
      } else {
        updateData.processed_stripe_sessions = [];
      }
      
      await User.update(userToUpdate.id, updateData);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully ${hasPaidStatus ? 'granted' : 'revoked'} access for ${targetEmail}. Payment sessions ${hasPaidStatus ? 'preserved' : 'cleared'}.` 
      });

    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-2">Admin Panel</h1>
          <p className="text-lg text-[#6B5B73] font-sacred">User Management Tools</p>
          
          <div className="flex gap-4 mt-4">
            <Button 
              onClick={() => navigate(createPageUrl('AdminCMS'))}
              className="bg-[#C4756B] hover:bg-[#B86761]"
            >
              <Database className="w-4 h-4 mr-2" />
              Full CMS Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Update User Payment Status
            </CardTitle>
            <CardDescription>
              Grant or revoke access to the paid features of the application for a specific user.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetEmail">User Email Address</Label>
              <Input
                id="targetEmail"
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Enter user's email to modify access"
              />
            </div>
            
            {message.text && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                onClick={() => handleUpdatePaymentStatus(true)} 
                disabled={isProcessing}
                className="bg-[#2F4F3F] hover:bg-[#1e3b2e]"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Grant Access (has_paid = true)
              </Button>
              <Button 
                onClick={() => handleUpdatePaymentStatus(false)} 
                disabled={isProcessing}
                variant="destructive"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Revoke Access (has_paid = false)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  );
}
