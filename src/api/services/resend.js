import { Resend } from 'resend';

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('Missing Resend API key. Please set VITE_RESEND_API_KEY in your environment variables.');
}

const resend = new Resend(resendApiKey);

// Email templates and content
const emailTemplates = {
  partnerInvite: (data) => ({
    from: 'SACRED <noreply@sacredonline.co>',
    to: [data.email],
    subject: `${data.partnerName} has invited you to take the SACRED assessment`,
    html: `
      <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F1EB;">
        <div style="background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(47, 79, 63, 0.1);">
          <h1 style="color: #2F4F3F; font-size: 32px; text-align: center; margin-bottom: 10px; font-weight: 300; letter-spacing: 0.08em;">
            SACRED
          </h1>
          <p style="color: #6B5B73; text-align: center; margin-bottom: 30px; font-size: 16px;">
            Sexual Intimacy Assessment for Christian Couples
          </p>
          
          <h2 style="color: #2F4F3F; font-size: 24px; margin-bottom: 20px;">
            You've been invited!
          </h2>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${data.partnerName} has invited you to take the SACRED assessment together. This comprehensive evaluation will help you both prepare for sexual intimacy in marriage.
          </p>
          
          <div style="background-color: #F5F1EB; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #2F4F3F; margin: 0 0 10px 0; font-size: 18px;">About SACRED:</h3>
            <ul style="color: #6B5B73; margin: 0; padding-left: 20px;">
              <li>Designed specifically for Christian engaged couples</li>
              <li>Private and confidential assessment</li>
              <li>Helps facilitate important conversations about intimacy</li>
              <li>Provides personalized insights and guidance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.inviteLink}" 
               style="background-color: #C4756B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 500; display: inline-block; font-size: 16px;">
              Begin Your Assessment
            </a>
          </div>
          
          <p style="color: #6B5B73; font-size: 14px; text-align: center; margin-top: 30px;">
            Have the conversations no one taught you to have.
          </p>
          
          <div style="border-top: 1px solid #E6D7C9; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6B5B73; font-size: 12px; margin: 0;">
              If you have any questions, please contact us at 
              <a href="mailto:support@sacredonline.co" style="color: #C4756B;">support@sacredonline.co</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  assessmentComplete: (data) => ({
    from: 'SACRED <noreply@sacredonline.co>',
    to: [data.email],
    subject: 'Your SACRED Assessment is Complete!',
    html: `
      <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F1EB;">
        <div style="background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(47, 79, 63, 0.1);">
          <h1 style="color: #2F4F3F; font-size: 32px; text-align: center; margin-bottom: 10px; font-weight: 300; letter-spacing: 0.08em;">
            SACRED
          </h1>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
            <h2 style="color: #2F4F3F; font-size: 28px; margin-bottom: 20px;">
              Congratulations!
            </h2>
          </div>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello ${data.userName},
          </p>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            You and ${data.partnerName} have both completed your SACRED assessments! Your personalized compatibility report is now ready for review.
          </p>
          
          <div style="background-color: #F5F1EB; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #2F4F3F; margin: 0 0 15px 0; font-size: 18px;">Your report includes:</h3>
            <ul style="color: #6B5B73; margin: 0; padding-left: 20px;">
              <li>Compatibility analysis across key intimacy areas</li>
              <li>Personalized recommendations for your relationship</li>
              <li>Discussion guides for important conversations</li>
              <li>Resources for continued growth together</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.reportLink}" 
               style="background-color: #C4756B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 500; display: inline-block; font-size: 16px;">
              View Your Report
            </a>
          </div>
          
          <p style="color: #6B5B73; font-size: 14px; text-align: center; margin-top: 30px;">
            Sacred conversations for sacred intimacy.
          </p>
        </div>
      </div>
    `
  }),

  weddingCongratulations: (data) => ({
    from: 'SACRED <noreply@sacredonline.co>',
    to: [data.email],
    subject: 'Congratulations on Your Wedding! 💒',
    html: `
      <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F1EB;">
        <div style="background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(47, 79, 63, 0.1);">
          <h1 style="color: #2F4F3F; font-size: 32px; text-align: center; margin-bottom: 10px; font-weight: 300; letter-spacing: 0.08em;">
            SACRED
          </h1>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">💒</div>
            <h2 style="color: #2F4F3F; font-size: 28px; margin-bottom: 20px;">
              Congratulations!
            </h2>
          </div>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear ${data.coupleName},
          </p>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Congratulations on your wedding! We're so honored that SACRED was part of your journey toward marriage. As you begin this beautiful new chapter together, we're celebrating with you.
          </p>
          
          <div style="background-color: #F5F1EB; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <h3 style="color: #2F4F3F; margin: 0 0 15px 0; font-size: 18px;">As you start married life:</h3>
            <ul style="color: #6B5B73; margin: 0; padding-left: 20px;">
              <li>Remember the conversations you had during your SACRED journey</li>
              <li>Continue to prioritize open, honest communication</li>
              <li>Your assessment results remain available for future reference</li>
              <li>Consider taking the assessment again on anniversaries</li>
            </ul>
          </div>
          
          <p style="color: #2F4F3F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            May your marriage be filled with love, joy, and sacred intimacy. We're praying for God's richest blessings on your union.
          </p>
          
          <p style="color: #6B5B73; font-size: 14px; text-align: center; margin-top: 30px; font-style: italic;">
            "Therefore what God has joined together, let no one separate." - Mark 10:9
          </p>
          
          <div style="border-top: 1px solid #E6D7C9; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6B5B73; font-size: 12px; margin: 0;">
              With love and blessings,<br>
              The SACRED Team
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Email sending functions
export const sendPartnerInviteEmail = async (inviteData) => {
  try {
    const emailContent = emailTemplates.partnerInvite(inviteData);
    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      throw new Error(error.message || 'Failed to send partner invite email');
    }
    
    return {
      success: true,
      message: 'Partner invite email sent successfully',
      emailId: data?.id
    };
  } catch (error) {
    console.error('Error sending partner invite email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send partner invite email'
    };
  }
};

export const sendAssessmentCompleteEmail = async (completionData) => {
  try {
    const emailContent = emailTemplates.assessmentComplete(completionData);
    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      throw new Error(error.message || 'Failed to send assessment completion email');
    }
    
    return {
      success: true,
      message: 'Assessment completion email sent successfully',
      emailId: data?.id
    };
  } catch (error) {
    console.error('Error sending assessment completion email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send assessment completion email'
    };
  }
};

export const sendWeddingCongratulationsEmail = async (congratsData) => {
  try {
    const emailContent = emailTemplates.weddingCongratulations(congratsData);
    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      throw new Error(error.message || 'Failed to send wedding congratulations email');
    }
    
    return {
      success: true,
      message: 'Wedding congratulations email sent successfully',
      emailId: data?.id
    };
  } catch (error) {
    console.error('Error sending wedding congratulations email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send wedding congratulations email'
    };
  }
};

export { resend };