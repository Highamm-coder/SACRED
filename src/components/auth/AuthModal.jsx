import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onAuthSuccess }) {

  const handleLogin = () => {
    window.location.href = createPageUrl('Login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-3xl font-sacred tracking-widest text-[#2F4F3F]">SACRED</DialogTitle>
          <p className="text-[#6B5B73] font-sacred mt-2">
            {defaultMode === 'login' ? 'Welcome back' : 'Join the community'}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-[#C4756B] hover:bg-[#B86761] text-white py-3 font-sacred-bold"
          >
            {defaultMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-[#6B5B73] font-sacred">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#C4756B] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-[#C4756B] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}