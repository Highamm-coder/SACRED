import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendInviteEmail } from '@/api/functions';
import { Loader2, Mail, Check, AlertCircle } from 'lucide-react';

export default function SendInviteModal({ isOpen, onClose, assessment, inviteLink, onInviteSent }) {
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  const handleSend = async () => {
    if (!assessment?.partner2_name || !assessment?.partner2_email) {
      setStatus('error');
      return;
    }

    try {
      setIsLoading(true);
      setStatus(null);
      
      const response = await sendInviteEmail({
        partnerEmail: assessment.partner2_email,
        partnerName: assessment.partner2_name,
        senderName: assessment.partner1_name,
        assessmentId: assessment.id,
        inviteLink: inviteLink,
        customMessage: customMessage
      });
      
      if (response.data?.success) {
        setStatus('success');
        // Call the callback to refresh assessment data
        if (onInviteSent) {
          onInviteSent();
        }
        setTimeout(() => {
          onClose();
          setStatus(null);
          setCustomMessage('');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStatus(null);
      setCustomMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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
        
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-sacred-bold text-[#2F4F3F] flex items-center justify-center gap-2">
            <Mail className="w-6 h-6 text-[#C4756B]" />
            Send Invitation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-[#F5F1EB] p-4 rounded-lg border border-[#E6D7C9]">
            <div className="text-sm font-sacred">
              <p className="font-medium text-[#2F4F3F] mb-1">Sending to:</p>
              <p className="text-[#6B5B73]">{assessment?.partner2_name} ({assessment?.partner2_email})</p>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message" className="text-[#2F4F3F] font-medium font-sacred mb-2 block">
              Personal Message (Optional)
            </Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal note to include with the invitation..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="h-24 border-[#E6D7C9] focus:border-[#C4756B] font-sacred"
            />
            <p className="text-xs text-[#6B5B73] mt-1 font-sacred">
              This will be included in the email along with the standard invitation.
            </p>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-sacred">Invitation sent successfully!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800 font-sacred">Failed to send invitation. Please try again.</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-[#E6D7C9] text-[#2F4F3F] hover:bg-[#F5F1EB] font-sacred"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={isLoading || status === 'success'}
              className="flex-1 bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}