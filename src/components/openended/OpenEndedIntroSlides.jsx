import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OpenEndedIntroSlides({ onStart, isLoading, existingAssessment }) {
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
        try {
            const currentUser = await User.me();
            setUserState(currentUser);
        } catch (e) {
            // User not logged in, redirect to login
            window.location.href = createPageUrl('Login');
            return;
        } finally {
            setIsCheckingUser(false);
        }
    }
    checkUser();
  }, [])

  if (isCheckingUser) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-[#F5F1EB]">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
        </div>
    )
  }

  const partnerNames = existingAssessment ? 
    `${existingAssessment.partner1_name} & ${existingAssessment.partner2_name || 'Partner'}` : 
    'You & Your Partner';

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-6">
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
      
      <div className="max-w-2xl mx-auto text-center">
        <Link to={createPageUrl("Dashboard")} className="text-4xl font-sacred tracking-widest text-[#2F4F3F] block mb-8">
          SACRED
        </Link>
        
        <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-4">
          Sacred Reflections
        </h1>
        
        <p className="text-xl text-[#6B5B73] font-sacred mb-8 leading-relaxed">
          13 thoughtful questions designed to deepen your connection through meaningful conversation about marital intimacy.
        </p>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E6D7C9] mb-8">
          <p className="text-[#6B5B73] font-sacred leading-relaxed">
            Sit together in a comfortable space. Take turns sharing your hearts on each question. 
            Listen deeply and let these prompts guide you into deeper understanding.
          </p>
        </div>

        {existingAssessment && (
          <div className="bg-[#E8F5E8] p-4 rounded-lg border border-[#7A9B8A]/30 mb-8">
            <p className="text-sm text-[#2F4F3F] font-sacred">
              <strong>Continuing your journey:</strong> {partnerNames}
            </p>
          </div>
        )}

        <Button
          onClick={onStart}
          disabled={isLoading}
          size="lg"
          className="bg-[#2F4F3F] hover:bg-[#1F3F2F] text-white px-8 py-4 text-lg font-sacred-bold"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Begin Your Reflections"}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}