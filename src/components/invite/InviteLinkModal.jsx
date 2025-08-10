import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Mail, X } from 'lucide-react';
import SendInviteModal from './SendInviteModal';

export default function InviteLinkModal({ isOpen, onClose, assessment }) {
  const [copied, setCopied] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  
  if (!assessment) return null;
  
  const inviteLink = `${window.location.origin}/Assessment?id=${assessment.id}&partner=2`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
            .font-sacred {
              font-family: 'Cormorant Garamond', serif;
              font-weight: 300;
              letter-spacing: 0.08em;
            }
            .font-sacred-bold {
              font-family: 'Cormorant Garamond', serif;
              font-weight: 400;
              letter-spacing: 0.08em;
            }
          `}</style>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-sacred-bold text-[#2F4F3F]">
              Share Your Invite Link
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <p className="text-[#6B5B73] font-sacred">
              Send this private link to your partner.
            </p>
            
            <div className="space-y-4">
              <Label htmlFor="invite-link" className="text-[#2F4F3F] font-medium font-sacred">
                Your Unique Link
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="invite-link" 
                  value={inviteLink} 
                  readOnly 
                  className="text-base border-[#E6D7C9] focus:border-[#C4756B]" 
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard} 
                  className="border-[#E6D7C9] hover:bg-[#F5F1EB]"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <a 
                  href={`mailto:${assessment?.partner2_email}?subject=Let's take this compatibility assessment&body=Here's the link to the assessment we talked about: ${inviteLink}`} 
                  className="inline-flex items-center text-[#C4756B] hover:underline font-sacred"
                >
                  <Mail className="w-4 h-4 mr-2" /> Send via email
                </a>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="inline-flex items-center text-[#7A9B8A] hover:underline font-sacred"
                >
                  <Mail className="w-4 h-4 mr-2" /> Send via SACRED
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SendInviteModal 
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        assessment={assessment}
        inviteLink={inviteLink}
      />
    </>
  );
}