
import React, { useState, useEffect } from 'react';
import { User, Assessment } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, Trash2, RotateCcw, User as UserIcon, LogOut } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import { deleteUserAccount } from '@/api/functions';

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setFullName(currentUser.full_name || '');

        // Load user's assessments (single-account system)
        const userAssessments = await Assessment.list();
        setAssessments(userAssessments);

      } catch (error) {
        console.error('Error loading account data:', error);
        navigate(createPageUrl('Home'));
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ full_name: fullName });
      setUser({ ...user, full_name: fullName });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAssessment = async (assessmentId) => {
    try {
      // Delete all responses for this assessment
      await Assessment.deleteResponses(assessmentId);
      
      // Reset assessment status to pending and progress to 0
      await Assessment.update(assessmentId, { 
        status: 'pending',
        progress: 0
      });

      // Refresh the page to show updated state
      window.location.reload();
    } catch (error) {
      console.error('Error resetting assessment:', error);
      // Show user-friendly error message
      alert('There was an error resetting your assessment. Please try again or contact support if the issue persists.');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      // After successful deletion, log out and redirect
      await User.logout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('There was an error deleting your account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
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
          <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-2">Account Settings</h1>
          <p className="text-lg text-[#6B5B73] font-sacred">Manage your profile and assessment data.</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled className="bg-gray-50" />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isSaving || fullName === user.full_name}
              className="bg-[#C4756B] hover:bg-[#B86761]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Assessment Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Assessment Management
            </CardTitle>
            <CardDescription>
              Manage your assessment data and progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-gray-500">No assessments found.</p>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border border-[#E6D7C9] rounded-lg">
                    <div>
                      <h3 className="font-semibold">
                        {assessment.metadata?.partnerName || assessment.metadata?.partner1Name || assessment.metadata?.partner2Name || 'Assessment'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Status: {assessment.status.replace('_', ' ')} • Progress: {assessment.progress || 0}% • Created: {new Date(assessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset My Progress
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Assessment Progress?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete all your answers for this assessment. You'll be able to start over from the beginning. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleResetAssessment(assessment.id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Reset Progress
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600">
              Irreversible actions that will affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-white">
                <h4 className="font-sacred-bold text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 font-sacred mb-4">
                  This will permanently delete your account and all associated data, including assessments and answers. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your SACRED account, your assessments, and all your answers from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  );
}
